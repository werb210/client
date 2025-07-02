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
    });

    if (!response.ok) {
      throw new Error(`Staff API error: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log('[API] Raw staff response received, normalizing...');
    
    // Use strict validation and normalization
    const normalizedProducts = normalizeProducts(rawData);
    
    console.log(`✅ [API] Successfully fetched and validated ${normalizedProducts.length} lender products`);
    return normalizedProducts;
    
  } catch (error) {
    console.error('❌ [API] Error fetching lender products:', error);
    
    // In development, provide more detailed error info
    if (process.env.NODE_ENV === 'development') {
      console.error('[API] This indicates either:');
      console.error('1. Staff backend is unreachable');
      console.error('2. Staff API returned invalid data structure');
      console.error('3. Data validation failed due to schema mismatch');
    }
    
    throw error;
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