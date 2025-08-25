/**
 * LEGACY RELIABLE LENDER SYNC - DISABLED
 * Replaced by IndexedDB cache-only system
 * This file is kept for compatibility but all network operations are disabled
 */

interface LenderProduct {
  id: string;
  name: string;
  lenderName: string;
  category: string;
  country: string;
  minAmount: number;
  maxAmount: number;
  interestRateMin?: number;
  interestRateMax?: number;
  termMin?: number;
  termMax?: number;
  description?: string;
  requiredDocuments?: string[];
  minCreditScore?: number;
  minRevenue?: number;
  lastSynced: number;
}

// Storage keys
const CACHE_KEY = 'lender_products_cache';
const TIMESTAMP_KEY = 'lender_products_cache_ts';
const STATUS_KEY = 'lender_products_status';

interface SyncResult {
  success: boolean;
  data: LenderProduct[];
  source: 'staff_api' | 'cached_data' | 'fallback_data';
  warning?: string;
  productCount: number;
  timestamp: string;
}

interface SyncStatus {
  lastSync: string | null;
  productCount: number;
  usingFallback: boolean;
  apiHealthy: boolean;
  lastError?: string;
}

class ReliableLenderSync {
  private static instance: ReliableLenderSync;
  private apiBaseUrl = '/api';

  static getInstance(): ReliableLenderSync {
    if (!ReliableLenderSync.instance) {
      ReliableLenderSync.instance = new ReliableLenderSync();
    }
    return ReliableLenderSync.instance;
  }

  /**
   * LEGACY SYNC DISABLED - Replaced by IndexedDB cache-only system
   */
  async pullLenderProducts(): Promise<SyncResult> {
    // console.log('[RELIABLE_SYNC] LEGACY SYNC DISABLED - Using cache-only system');
    // console.log('[RELIABLE_SYNC] Cache should be populated manually at /cache-setup');
    
    // Return cached data only, no network operations
    try {
      return await this.useFallbackCache('Legacy sync disabled - using cache-only system');
    } catch (error) {
      console.warn('[RELIABLE_SYNC] Cache read failed:', error);
      return {
        success: false,
        data: [],
        source: 'fallback_data',
        productCount: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Use cached fallback data when staff API is unavailable
   */
  private async useFallbackCache(error: string): Promise<SyncResult> {
    console.warn('[RELIABLE_SYNC] Using fallback cache:', error);
    
    try {
      // Try to load from localStorage cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        // console.log(`[RELIABLE_SYNC] Loaded ${data.length} products from fallback cache`);
        return {
          success: true,
          data: data,
          source: 'cached_data',
          productCount: data.length,
          timestamp: new Date().toISOString()
        };
      }
    } catch (cacheError) {
      console.warn('[RELIABLE_SYNC] Cache read failed:', cacheError);
    }
    
    // Return empty result if no cache available
    return {
      success: false,
      data: [],
      source: 'fallback_data',
      productCount: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Store sync status for monitoring
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const lastSync = localStorage.getItem(TIMESTAMP_KEY);
    const cached = localStorage.getItem(CACHE_KEY);
    const status = localStorage.getItem(STATUS_KEY);
    
    const parsedStatus = status ? JSON.parse(status) : null;
    
    return {
      lastSync: lastSync || null,
      productCount: cached ? JSON.parse(cached).length : 0,
      usingFallback: true, // Always using fallback in cache-only mode
      apiHealthy: false, // API disabled in cache-only mode
      lastError: parsedStatus?.lastError || 'Legacy sync disabled'
    };
  }
}

// Export singleton instance
export const reliableLenderSync = ReliableLenderSync.getInstance();

// Export main function for compatibility
export async function syncLenderProducts(): Promise<SyncResult> {
  return await reliableLenderSync.pullLenderProducts();
}

// Export status function for compatibility
export async function getSyncStatus(): Promise<SyncStatus> {
  return await reliableLenderSync.getSyncStatus();
}

// Export legacy function name for compatibility
export async function pullLiveData(): Promise<SyncResult> {
  // console.log('[RELIABLE_SYNC] Legacy pullLiveData() called - redirecting to cache-only system');
  return await reliableLenderSync.pullLenderProducts();
}