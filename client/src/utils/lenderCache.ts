/**
 * Persistent Lender Product Cache
 * Uses IndexedDB via idb-keyval for reliable data persistence across sessions
 */

import { get, set, clear } from 'idb-keyval';
import type { LenderProduct } from '../types/lenderProduct';

// Cache keys
const CACHE_KEY = 'lenderProducts';
const TIMESTAMP_KEY = 'lenderProductsLastFetched';
const SOURCE_KEY = 'lenderProductsSource';
const METADATA_KEY = 'lenderProductsMetadata';

export interface CacheMetadata {
  productCount: number;
  source: string;
  fetchTime: number;
  windowInfo?: any;
}

/**
 * Save lender products to persistent cache
 */
export async function saveLenderProducts(
  products: LenderProduct[], 
  source: string = 'unknown'
): Promise<void> {
  try {
    const timestamp = Date.now();
    const metadata: CacheMetadata = {
      productCount: products.length,
      source,
      fetchTime: timestamp
    };
    
    await Promise.all([
      set(CACHE_KEY, products),
      set(TIMESTAMP_KEY, timestamp),
      set(SOURCE_KEY, source),
      set(METADATA_KEY, metadata)
    ]);
    
    // console.log(`[CACHE] 💾 Saved ${products.length} products to IndexedDB from ${source}`);
  } catch (error) {
    console.error('[CACHE] ❌ Failed to save to IndexedDB:', error);
    throw error;
  }
}

/**
 * Load lender products from persistent cache
 */
export async function loadLenderProducts(): Promise<LenderProduct[] | null> {
  try {
    const products = await get(CACHE_KEY);
    if (products && Array.isArray(products) && products.length > 0) {
      // console.log(`[CACHE] 📦 Loaded ${products.length} products from IndexedDB`);
      return products;
    }
    return null;
  } catch (error) {
    console.error('[CACHE] ❌ Failed to load from IndexedDB:', error);
    return null;
  }
}

/**
 * Get last fetch timestamp
 */
export async function loadLastFetchTime(): Promise<number | null> {
  try {
    return await get(TIMESTAMP_KEY);
  } catch (error) {
    console.error('[CACHE] ❌ Failed to load timestamp:', error);
    return null;
  }
}

/**
 * Get cache source information
 */
export async function loadCacheSource(): Promise<string | null> {
  try {
    return await get(SOURCE_KEY);
  } catch (error) {
    console.error('[CACHE] ❌ Failed to load source:', error);
    return null;
  }
}

/**
 * Get complete cache metadata
 */
export async function loadCacheMetadata(): Promise<CacheMetadata | null> {
  try {
    return await get(METADATA_KEY);
  } catch (error) {
    console.error('[CACHE] ❌ Failed to load metadata:', error);
    return null;
  }
}

/**
 * Check if cache exists and is valid
 */
export async function hasCachedData(): Promise<boolean> {
  try {
    const products = await loadLenderProducts();
    return products !== null && products.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Clear all cached data
 */
export async function clearLenderCache(): Promise<void> {
  try {
    await Promise.all([
      set(CACHE_KEY, null),
      set(TIMESTAMP_KEY, null),
      set(SOURCE_KEY, null),
      set(METADATA_KEY, null)
    ]);
    // console.log('[CACHE] 🗑️ Cleared all cached lender product data');
  } catch (error) {
    console.error('[CACHE] ❌ Failed to clear cache:', error);
    throw error;
  }
}

/**
 * Get cache statistics for debugging
 */
export async function getCacheStats() {
  try {
    const [products, timestamp, source, metadata] = await Promise.all([
      loadLenderProducts(),
      loadLastFetchTime(),
      loadCacheSource(),
      loadCacheMetadata()
    ]);
    
    return {
      hasCache: products !== null,
      productCount: products?.length || 0,
      lastFetchTime: timestamp ? new Date(timestamp) : null,
      source: source || 'unknown',
      metadata: metadata || null,
      cacheAge: timestamp ? Date.now() - timestamp : null
    };
  } catch (error) {
    console.error('[CACHE] ❌ Failed to get cache stats:', error);
    return {
      hasCache: false,
      productCount: 0,
      lastFetchTime: null,
      source: 'unknown',
      metadata: null,
      cacheAge: null,
      error: error.message
    };
  }
}