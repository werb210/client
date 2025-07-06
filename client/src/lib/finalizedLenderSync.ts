/**
 * FINALIZED LENDER SYNC SYSTEM (JULY 2025)
 * Production-ready sync implementation per client application instructions
 */

import { get, set, clear } from 'idb-keyval';

// Production configuration
const STAFF_API_URL = import.meta.env.VITE_API_BASE_URL || 'https://app.boreal.financial/api';
const LENDERS_ENDPOINT = `${STAFF_API_URL}/public/lenders`;
const MIN_PRODUCT_COUNT = 40; // Minimum viable product count
const CACHE_KEY = 'lender_products_cache';
const CACHE_TIMESTAMP_KEY = 'lender_products_cache_ts';

export interface ProductSyncResult {
  success: boolean;
  productCount: number;
  source: 'staff_api' | 'fallback_cache';
  errors: string[];
  syncTimestamp: number;
  categories: string[];
}

/**
 * Validates product structure to ensure compatibility
 */
function validateProduct(product: any): boolean {
  return (
    product &&
    typeof product.id === 'string' &&
    typeof product.category === 'string' &&
    (typeof product.lenderName === 'string' || typeof product.lender === 'string') &&
    (typeof product.productName === 'string' || typeof product.name === 'string')
  );
}

/**
 * Fetches lender products from Staff API with fallback to cache
 */
export async function syncLenderProducts(): Promise<ProductSyncResult> {
  const syncTimestamp = Date.now();
  const errors: string[] = [];
  
  try {
    console.log(`[SYNC] Fetching from Staff API: ${LENDERS_ENDPOINT}`);
    
    // C-2: Guard API errors gracefully with try/catch + C-6: Mobile network resilience
    const { fetchWithTimeout } = await import('./apiTimeout');
    const response = await fetchWithTimeout(LENDERS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.products)) {
      throw new Error('Invalid API response structure');
    }
    
    const products = data.products.filter(validateProduct);
    
    if (products.length < MIN_PRODUCT_COUNT) {
      throw new Error(`Insufficient products: ${products.length} < ${MIN_PRODUCT_COUNT}`);
    }
    
    // Extract categories
    const categories: string[] = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)));
    
    // Store in IndexedDB
    await set(CACHE_KEY, products);
    await set(CACHE_TIMESTAMP_KEY, syncTimestamp);
    
    console.log(`[SYNC] ✅ Synced ${products.length} products from Staff API`);
    
    return {
      success: true,
      productCount: products.length,
      source: 'staff_api',
      errors: [],
      syncTimestamp,
      categories
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMessage);
    
    console.warn(`[SYNC] ❌ Staff API failed: ${errorMessage}`);
    console.log('[SYNC] Attempting fallback to IndexedDB cache...');
    
    // Fallback to cache
    try {
      const cachedProducts = await get(CACHE_KEY);
      const cacheTimestamp = await get(CACHE_TIMESTAMP_KEY);
      
      if (cachedProducts && Array.isArray(cachedProducts) && cachedProducts.length >= MIN_PRODUCT_COUNT) {
        const categories: string[] = Array.from(new Set(cachedProducts.map((p: any) => p.category).filter(Boolean)));
        
        console.log(`[SYNC] 📦 Using cached data: ${cachedProducts.length} products`);
        
        return {
          success: true,
          productCount: cachedProducts.length,
          source: 'fallback_cache',
          errors,
          syncTimestamp: cacheTimestamp || 0,
          categories
        };
      } else {
        errors.push('No valid cache available');
      }
    } catch (cacheError) {
      errors.push(`Cache access failed: ${cacheError instanceof Error ? cacheError.message : 'Unknown'}`);
    }
    
    console.error('[SYNC] ❌ Both Staff API and cache failed');
    
    return {
      success: false,
      productCount: 0,
      source: 'fallback_cache',
      errors,
      syncTimestamp,
      categories: []
    };
  }
}

/**
 * Gets cached lender products (for immediate use)
 */
export async function getCachedLenderProducts(): Promise<any[]> {
  try {
    const cachedProducts = await get(CACHE_KEY);
    return Array.isArray(cachedProducts) ? cachedProducts : [];
  } catch (error) {
    console.warn('[CACHE] Failed to access IndexedDB:', error);
    return [];
  }
}

/**
 * Forces a fresh sync and clears cache
 */
export async function forceFreshSync(): Promise<ProductSyncResult> {
  try {
    // Clear existing cache
    await clear();
    console.log('[SYNC] Cache cleared, forcing fresh sync...');
    
    // Perform fresh sync
    return await syncLenderProducts();
  } catch (error) {
    console.error('[SYNC] Force fresh sync failed:', error);
    
    return {
      success: false,
      productCount: 0,
      source: 'fallback_cache',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      syncTimestamp: Date.now(),
      categories: []
    };
  }
}

/**
 * Checks if we're using live data vs fallback cache
 */
export async function isUsingLiveData(): Promise<boolean> {
  try {
    const response = await fetch(LENDERS_ENDPOINT, {
      method: 'HEAD',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Gets sync status for diagnostics
 */
export async function getSyncStatus(): Promise<{
  isOnline: boolean;
  cacheCount: number;
  lastSync: number;
  isUsingLive: boolean;
}> {
  const cachedProducts = await getCachedLenderProducts();
  const cacheTimestamp = await get(CACHE_TIMESTAMP_KEY);
  const isOnline = await isUsingLiveData();
  
  return {
    isOnline,
    cacheCount: cachedProducts.length,
    lastSync: cacheTimestamp || 0,
    isUsingLive: isOnline && cachedProducts.length >= MIN_PRODUCT_COUNT
  };
}