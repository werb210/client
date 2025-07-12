import { API_BASE_URL } from '../constants';
import { LenderProduct } from '../../../shared/lenderProductSchema';
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
 * Fetch lender products with scheduled window control (12:00 PM and 12:00 AM MST only)
 * Uses persistent IndexedDB cache outside of allowed fetch windows
 * Fails fast on invalid data to surface staff API issues immediately
 */
export async function fetchLenderProducts(): Promise<LenderProduct[]> {
  const windowInfo = getFetchWindowInfo();
  const lastFetched = await loadLastFetchTime();
  
  // Use persistent cache if outside fetch window and cache exists
  if (!windowInfo.isAllowed && lastFetched) {
    const cached = await loadLenderProducts();
    if (cached && cached.length > 0) {
      const source = await loadCacheSource();
      console.log(`[CLIENT] 📦 Using persistent cache (${cached.length} products)`);
      console.log(`[CLIENT] 🕒 ${windowInfo.reason}`);
      console.log(`[CLIENT] ⏰ Next fetch window: ${formatMSTTime(windowInfo.nextWindow)}`);
      console.log(`[CLIENT] 💾 Cache from: ${source} at ${formatMSTTime(new Date(lastFetched))}`);
      return cached;
    }
  }
  
  // If within fetch window OR no cache exists, fetch from API
  console.log('[CLIENT] 🔄 Fetching fresh lender products from staff API...');
  if (windowInfo.isAllowed) {
    console.log(`[CLIENT] ✅ ${windowInfo.reason}`);
  } else {
    console.log(`[CLIENT] ⚠️ No persistent cache available, forcing API fetch despite being outside window`);
  }
  
  try {
    // Use the comprehensive fetcher
    const { fetchLenderProducts: fetchData } = await import('./lenderDataFetcher');
    const result = await fetchData();
    
    // Save to persistent cache
    await saveLenderProducts(result.products, result.source);
    
    console.log(`✅ [CLIENT] Successfully fetched ${result.count} products from ${result.source}`);
    console.log(`[CLIENT] 💾 Saved to persistent IndexedDB cache`);
    return result.products;
    
  } catch (error) {
    console.error('❌ [CLIENT] All data sources failed:', error);
    
    // If fetch fails but we have persistent cache, use it as fallback
    const fallbackCache = await loadLenderProducts();
    if (fallbackCache && fallbackCache.length > 0) {
      console.log(`[CLIENT] 🔄 API fetch failed, falling back to persistent cache (${fallbackCache.length} products)`);
      return fallbackCache;
    }
    
    throw error;
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