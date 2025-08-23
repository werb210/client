import { API_BASE_URL } from '../constants';
import { LenderProduct } from '../types/lenderProduct';
import { normalizeProducts } from '../lib/lenderProductNormalizer';
import { isAllowedToFetchNow, getFetchWindowInfo, formatMSTTime } from '../utils/fetchWindow';
import {
  saveLenderProducts,
  loadLenderProducts,
  loadLastFetchTime,
  loadCacheSource,
  hasCachedData,
  getCacheStats
} from '../utils/lenderCache';

/**
 * Fetch lender products with cache-first strategy and fallback to API
 * Priority: Cache -> API -> Empty array
 */
export async function fetchLenderProducts(): Promise<LenderProduct[]> {
  try {
    // First, try to load from cache
    const cached = await loadLenderProducts();
    if (cached && cached.length > 0) {
      console.log(`[LENDER-PRODUCTS] ✅ Using cached data: ${cached.length} products`);
      return cached;
    }

    // If no cache, try to fetch from API
    console.log('[LENDER-PRODUCTS] 📡 No cache found, attempting API fetch...');
    const response = await fetch('/api/public/lenders', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log(`[LENDER-PRODUCTS] Response status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`[LENDER-PRODUCTS] Raw response:`, typeof data, Object.keys(data || {}));
      
      // Handle different response formats
      let products = [];
      if (Array.isArray(data)) {
        products = data;
      } else if (data && typeof data === 'object') {
        if (data.products && Array.isArray(data.products)) {
          products = data.products;
        } else if (data.data && Array.isArray(data.data)) {
          products = data.data;
        }
      }
      
      if (products.length > 0) {
        console.log(`[LENDER-PRODUCTS] ✅ API returned ${products.length} products, caching...`);
        await saveLenderProducts(products, 'staff-api');
        return products;
      } else {
        console.log(`[LENDER-PRODUCTS] ⚠️ No products found in response:`, data);
      }
    } else {
      const errorText = await response.text();
      console.error(`[LENDER-PRODUCTS] API error: ${response.status} - ${errorText}`);
    }

    console.log('[LENDER-PRODUCTS] ❌ No products available from cache or API');
    return [];
  } catch (error) {
    console.error('[LENDER-PRODUCTS] ❌ Error fetching products:', error);
    const err = error as Error;
    console.error('[LENDER-PRODUCTS] Error details:', err.message, err.stack);
    return [];
  }
}

/**
 * Get cache information for debugging (uses persistent cache)
 */
export async function getCacheInfo() {
  return await getCacheStats();
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