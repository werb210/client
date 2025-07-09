/**
 * Lender Product Sync System
 * Production-ready sync with retry logic, background updates, and data preservation
 */

import { get, set } from 'idb-keyval';

// Storage keys
const CACHE_KEY = 'lender_products_cache';
const TIMESTAMP_KEY = 'lender_products_cache_ts';
const HASH_KEY = 'lender_products_hash';
const RETRY_COUNT_KEY = 'lender_products_retry_count';

// Configuration
const SYNC_RETRY_INTERVAL = 30 * 60 * 1000; // 30 minutes
const MAX_RETRY_ATTEMPTS = 10;

interface SyncResult {
  success: boolean;
  data?: any[];
  error?: string;
  fromCache: boolean;
  needsRetry: boolean;
}

/**
 * Calculate hash of product IDs for change detection
 */
function calculateProductHash(products: any[]): string {
  const productIds = products.map(p => p.id || p.productId || p.name).sort();
  return btoa(JSON.stringify(productIds));
}

/**
 * Fetch lender products from staff API with comprehensive error handling
 */
async function fetchFromStaffAPI(): Promise<{ data: any[]; hash: string } | null> {
  try {
    console.log('[SYNC] Fetching from staff API: GET /api/public/lenders');
    
    const response = await fetch('/api/public/lenders', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }).catch(fetchError => {
      // Handle fetch failures gracefully
      console.warn('[SYNC] Network error during fetch:', fetchError.message);
      throw new Error(`Network error: ${fetchError.message}`);
    });

    // Handle RBAC/401 errors gracefully
    if (response.status === 401 || response.status === 403) {
      console.warn('[SYNC] Authentication error - using cached data');
      return null;
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json().catch(jsonError => {
      throw new Error(`Invalid JSON response: ${jsonError.message}`);
    });
    
    // Validate response structure
    if (!data || (!Array.isArray(data) && !data.products)) {
      throw new Error('Invalid API response format');
    }

    const products = Array.isArray(data) ? data : data.products;
    const hash = calculateProductHash(products);
    
    console.log(`[SYNC] ✅ Fetched ${products.length} products from staff API`);
    return { data: products, hash };
    
  } catch (error) {
    console.warn('[SYNC] ❌ Staff API failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Store products in IndexedDB with metadata
 */
async function storeProducts(products: any[], hash: string): Promise<void> {
  try {
    await set(CACHE_KEY, products);
    await set(TIMESTAMP_KEY, new Date().toISOString());
    await set(HASH_KEY, hash);
    await set(RETRY_COUNT_KEY, 0); // Reset retry count on successful sync
    
    console.log(`[SYNC] ✅ Stored ${products.length} products in IndexedDB`);
  } catch (error) {
    console.error('[SYNC] Failed to store products:', error);
  }
}

/**
 * Get cached products from IndexedDB
 */
async function getCachedProducts(): Promise<{ data: any[]; timestamp: string; hash: string } | null> {
  try {
    const data = await get(CACHE_KEY);
    const timestamp = await get(TIMESTAMP_KEY);
    const hash = await get(HASH_KEY);
    
    if (data && Array.isArray(data) && data.length > 0) {
      return { data, timestamp, hash };
    }
  } catch (error) {
    console.warn('[SYNC] Failed to read cache:', error);
  }
  
  return null;
}

/**
 * Main sync function with retry logic
 */
export async function syncLenderProducts(): Promise<SyncResult> {
  console.log('[SYNC] Starting lender product sync...');
  
  // Get current cache state
  const cached = await getCachedProducts();
  const retryCount = await get(RETRY_COUNT_KEY) || 0;
  
  // Attempt to fetch from API
  const apiResult = await fetchFromStaffAPI();
  
  if (apiResult) {
    const { data: newProducts, hash: newHash } = apiResult;
    
    // Check if data has changed
    if (cached && cached.hash === newHash) {
      console.log('[SYNC] ✅ No changes detected - using cached data');
      return {
        success: true,
        data: cached.data,
        fromCache: true,
        needsRetry: false
      };
    }
    
    // Store new data (merge or replace)
    await storeProducts(newProducts, newHash);
    
    return {
      success: true,
      data: newProducts,
      fromCache: false,
      needsRetry: false
    };
  }
  
  // API failed - use cached data if available
  if (cached) {
    // Increment retry count
    const newRetryCount = retryCount + 1;
    await set(RETRY_COUNT_KEY, newRetryCount);
    
    console.warn(`[SYNC] API unavailable (retry ${newRetryCount}/${MAX_RETRY_ATTEMPTS}) - using cached data`);
    
    return {
      success: true,
      data: cached.data,
      fromCache: true,
      needsRetry: newRetryCount < MAX_RETRY_ATTEMPTS,
      error: `API unavailable - using cached data from ${cached.timestamp}`
    };
  }
  
  // No API and no cache - fallback to minimal dataset
  console.error('[SYNC] ❌ No API and no cache available - using fallback data');
  
  const { FALLBACK_LENDER_PRODUCTS } = await import('./fallbackData');
  const fallbackData = FALLBACK_LENDER_PRODUCTS;
  const fallbackHash = calculateProductHash(fallbackData);
  
  await storeProducts(fallbackData, fallbackHash);
  
  return {
    success: false,
    data: fallbackData,
    fromCache: false,
    needsRetry: true,
    error: 'API unavailable and no cache - using fallback data'
  };
}

/**
 * Background retry scheduler
 */
class SyncScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('[SYNC] Background retry scheduler started (30-minute intervals)');
    
    // Initial sync
    this.performSync();
    
    // Schedule periodic retries
    this.intervalId = setInterval(() => {
      this.performSync();
    }, SYNC_RETRY_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[SYNC] Background retry scheduler stopped');
  }

  private async performSync() {
    try {
      const result = await syncLenderProducts();
      
      if (result.success && !result.needsRetry) {
        console.log('[SYNC] ✅ Background sync successful');
      } else if (result.needsRetry) {
        console.log('[SYNC] ⏳ Background sync scheduled for retry');
      }
      
      // Broadcast update to React Query
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('lender-products-updated', {
          detail: result
        }));
      }
      
    } catch (error) {
      console.error('[SYNC] Background sync error:', error);
    }
  }
}

// Global scheduler instance
export const syncScheduler = new SyncScheduler();

/**
 * Initialize sync system on app start
 */
export async function initializeSyncSystem(): Promise<SyncResult> {
  console.log('[SYNC] Initializing lender product sync system...');
  
  // Start background scheduler
  syncScheduler.start();
  
  // Perform initial sync
  return await syncLenderProducts();
}

/**
 * Manual sync trigger for user-initiated refresh
 */
export async function forceSyncLenderProducts(): Promise<SyncResult> {
  console.log('[SYNC] Manual sync triggered...');
  return await syncLenderProducts();
}

/**
 * Get sync status and metadata
 */
export async function getSyncStatus() {
  const cached = await getCachedProducts();
  const retryCount = await get(RETRY_COUNT_KEY) || 0;
  
  return {
    hasCache: Boolean(cached),
    productCount: cached?.data.length || 0,
    lastSync: cached?.timestamp,
    retryCount,
    isHealthy: retryCount < MAX_RETRY_ATTEMPTS
  };
}