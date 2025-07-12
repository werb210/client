import { API_BASE_URL } from '../constants';
import { LenderProduct } from '../../../shared/lenderProductSchema';
import { normalizeProducts } from '../lib/lenderProductNormalizer';
import { isAllowedToFetchNow, getFetchWindowInfo, formatMSTTime } from '../utils/fetchWindow';

// Cache for lender products with metadata
let cachedProducts: LenderProduct[] | null = null;
let lastFetchTime: Date | null = null;
let cacheSource: string = 'none';

/**
 * Fetch lender products with scheduled window control (12:00 PM and 12:00 AM MST only)
 * Uses cached data outside of allowed fetch windows
 * Fails fast on invalid data to surface staff API issues immediately
 */
export async function fetchLenderProducts(): Promise<LenderProduct[]> {
  const windowInfo = getFetchWindowInfo();
  
  // Use cached data if outside fetch window and cache exists
  if (!windowInfo.isAllowed && cachedProducts) {
    console.log(`[CLIENT] 📦 Using cached lender products (${cachedProducts.length} products)`);
    console.log(`[CLIENT] 🕒 ${windowInfo.reason}`);
    console.log(`[CLIENT] ⏰ Next fetch window: ${formatMSTTime(windowInfo.nextWindow)}`);
    console.log(`[CLIENT] 💾 Cache source: ${cacheSource} at ${lastFetchTime ? formatMSTTime(lastFetchTime) : 'unknown'}`);
    return cachedProducts;
  }
  
  // If within fetch window OR no cache exists, fetch from API
  console.log('[CLIENT] 🔄 Fetching fresh lender products from staff API...');
  if (windowInfo.isAllowed) {
    console.log(`[CLIENT] ✅ ${windowInfo.reason}`);
  } else {
    console.log(`[CLIENT] ⚠️ No cache available, forcing API fetch despite being outside window`);
  }
  
  try {
    // Use the comprehensive fetcher
    const { fetchLenderProducts: fetchData } = await import('./lenderDataFetcher');
    const result = await fetchData();
    
    // Update cache
    cachedProducts = result.products;
    lastFetchTime = new Date();
    cacheSource = result.source;
    
    console.log(`✅ [CLIENT] Successfully fetched ${result.count} products from ${result.source}`);
    console.log(`[CLIENT] 💾 Updated cache at ${formatMSTTime(lastFetchTime)}`);
    return cachedProducts;
    
  } catch (error) {
    console.error('❌ [CLIENT] All data sources failed:', error);
    
    // If fetch fails but we have cached data, use it as fallback
    if (cachedProducts) {
      console.log(`[CLIENT] 🔄 API fetch failed, falling back to cached data (${cachedProducts.length} products)`);
      return cachedProducts;
    }
    
    throw error;
  }
}

/**
 * Get cache information for debugging
 */
export function getCacheInfo() {
  return {
    hasCache: cachedProducts !== null,
    productCount: cachedProducts?.length || 0,
    lastFetchTime,
    cacheSource
  };
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