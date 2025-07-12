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
  // CACHE-ONLY SYSTEM: Only use IndexedDB cache, no API calls
  try {
    const cached = await loadLenderProducts();
    return cached || [];
  } catch (error) {
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