import { API_BASE_URL } from '../constants';
import { LenderProduct } from '../../../shared/lenderProductSchema';
import { normalizeProducts } from '../lib/lenderProductNormalizer';

/**
 * Fetch lender products with strict validation and normalization
 * Fails fast on invalid data to surface staff API issues immediately
 */
export async function fetchLenderProducts(): Promise<LenderProduct[]> {
  console.log('[API] Fetching lender products from staff backend...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/public/lenders`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).catch(fetchError => {
      console.warn('[LENDER_PRODUCTS] Network error:', fetchError.message);
      throw new Error(`Network error: ${fetchError.message}`);
    });

    if (!response.ok) {
      console.warn('[LENDER_PRODUCTS] API error:', response.status, response.statusText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json().catch(jsonError => {
      throw new Error(`Invalid JSON response: ${jsonError.message}`);
    });
    
    console.log('[API] Raw staff response received, normalizing...');
    
    // Use strict validation and normalization
    const normalizedProducts = normalizeProducts(rawData);
    
    console.log(`✅ [API] Successfully fetched and validated ${normalizedProducts.length} lender products`);
    return normalizedProducts;
    
  } catch (error) {
    console.warn('❌ [API] Error fetching lender products:', error instanceof Error ? error.message : error);
    console.warn('⚠️ [API] Staff API failed, attempting fallback data...');
    
    // Fallback to local JSON file
    try {
      const fallbackResponse = await fetch('/fallback/lenders.json');
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback fetch failed: ${fallbackResponse.statusText}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log('📦 [API] Using fallback lender data:', fallbackData.data.length, 'products');
      
      // Normalize fallback data through the same validation process
      const normalizedProducts = normalizeProducts(fallbackData);
      console.log(`✅ [API] Successfully validated ${normalizedProducts.length} fallback products`);
      return normalizedProducts;
    } catch (fallbackError) {
      console.error('❌ [API] Fallback also failed:', fallbackError);
      
      // In development, provide more detailed error info
      if (process.env.NODE_ENV === 'development') {
        console.warn('[API] This indicates either:');
        console.warn('1. Staff backend is unreachable');
        console.warn('2. Staff API returned invalid data structure');
        console.warn('3. Data validation failed due to schema mismatch');
        console.warn('4. Fallback data is also unavailable');
      }
      
      throw new Error('Both staff API and fallback data unavailable');
    }
  }
}

/**
 * Fetch products filtered by category with validation
 */
export async function fetchProductsByCategory(category: LenderProduct['category']): Promise<LenderProduct[]> {
  const allProducts = await fetchLenderProducts();
  return allProducts.filter(product => product.category === category);
}

/**
 * Fetch products for a specific country with validation
 */
export async function fetchProductsByCountry(country: LenderProduct['country']): Promise<LenderProduct[]> {
  const allProducts = await fetchLenderProducts();
  return allProducts.filter(product => product.country === country);
}

/**
 * Get available categories from validated products
 */
export async function getAvailableCategories(): Promise<LenderProduct['category'][]> {
  const allProducts = await fetchLenderProducts();
  const categories = new Set(allProducts.map(product => product.category));
  return Array.from(categories);
}

/**
 * Get available countries from validated products
 */
export async function getAvailableCountries(): Promise<LenderProduct['country'][]> {
  const allProducts = await fetchLenderProducts();
  const countries = new Set(allProducts.map(product => product.country));
  return Array.from(countries);
}

// Export the type for backward compatibility
export type { LenderProduct };