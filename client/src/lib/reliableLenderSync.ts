/**
 * CLIENT INSTRUCTIONS – Sync, Store, and Update Lender Products Reliably
 * Implements comprehensive sync system with fallback and validation
 */

import { get, set } from 'idb-keyval';
import { FALLBACK_LENDER_PRODUCTS } from './fallbackData';

// LenderProduct interface for sync system
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
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://staffportal.replit.app/api';

  static getInstance(): ReliableLenderSync {
    if (!ReliableLenderSync.instance) {
      ReliableLenderSync.instance = new ReliableLenderSync();
    }
    return ReliableLenderSync.instance;
  }

  /**
   * 1. Pull Lender Product List from Staff API
   * On app load (or background interval), fetch from staff API
   */
  async pullLenderProducts(): Promise<SyncResult> {
    const fetchUrl = `${this.apiBaseUrl}/public/lenders`;
    console.log(`🌐 Fetching lender products from: ${fetchUrl}`);
    
    try {
      // Attempt to fetch from staff API
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log(`📡 Staff API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiData = await response.json();
      console.log('🔍 Raw API Response:', apiData);
      
      // Handle new API response structure: {products: [], count: 0} or direct array
      const productArray = Array.isArray(apiData) ? apiData : (apiData.products || []);
      const productCount = productArray.length;
      
      console.log(`📊 Staff API returned ${productCount} products`);
      
      // Check if API returned 0 products or invalid data
      if (productCount === 0) {
        console.warn('⚠️ Staff API returned 0 products. Falling back to IndexedDB cache');
        return await this.useFallbackCache('Staff API returned 0 products - staff database may be empty');
      }

      // 4. Product Matching Requirements - Validate required fields
      const validProducts = this.validateProductFields(productArray);
      
      if (validProducts.length === 0) {
        console.warn('⚠️ Staff API returned products with missing required fields. Falling back to cache.');
        return await this.useFallbackCache('Invalid product data structure');
      }

      // 3. Watch for Changes in Product List - Compare timestamps
      const currentTimestamp = new Date().toISOString();
      const lastSync = await get(TIMESTAMP_KEY);
      
      // Store successful API data
      await this.storeValidData(validProducts, currentTimestamp);
      
      console.log(`✅ Sync Success - ${validProducts.length} products stored`);
      const categories = Array.from(new Set(validProducts.map(p => p.category)));
      console.log(`📋 Categories found: ${categories.join(', ')}`);
      
      return {
        success: true,
        data: validProducts,
        source: 'staff_api',
        productCount: validProducts.length,
        timestamp: currentTimestamp
      };
      
    } catch (error) {
      console.error('[SYNC] Staff API fetch failed:', error);
      
      // If fetch fails, use fallback cache
      return await this.useFallbackCache(`Network error: ${error}`);
    }
  }

  /**
   * 4. Product Matching Requirements
   * Validate required fields for recommendation engine
   */
  private validateProductFields(products: any[]): LenderProduct[] {
    const validProducts: LenderProduct[] = [];
    
    for (const product of products) {
      // Check required fields
      const hasRequiredFields = 
        product.category &&
        typeof product.minAmount === 'number' &&
        typeof product.maxAmount === 'number' &&
        product.country &&
        product.name &&
        product.lenderName;

      if (hasRequiredFields) {
        // Normalize product to expected format
        validProducts.push({
          id: product.id || product.productId || `${product.lenderName}-${product.category}`,
          name: product.name,
          lenderName: product.lenderName,
          category: product.category,
          country: product.country,
          minAmount: product.minAmount || product.min_amount,
          maxAmount: product.maxAmount || product.max_amount,
          interestRateMin: product.interestRateMin || product.interest_rate_min || 0,
          interestRateMax: product.interestRateMax || product.interest_rate_max || 0,
          termMin: product.termMin || product.min_term || 12,
          termMax: product.termMax || product.max_term || 60,
          description: product.description || '',
          requiredDocuments: product.requiredDocuments || product.required_documents || [],
          minCreditScore: product.minCreditScore || product.min_credit_score,
          minRevenue: product.minRevenue || product.min_revenue,
          lastSynced: Date.now()
        });
      } else {
        console.warn('[SYNC] Skipping product with missing required fields:', product.name || 'Unknown');
      }
    }
    
    return validProducts;
  }

  /**
   * 2. Store Fallback Data Locally & Use when API unavailable
   */
  private async useFallbackCache(reason: string): Promise<SyncResult> {
    // First try to get cached data from previous successful sync
    const cachedProducts = await get(CACHE_KEY);
    const cachedTimestamp = await get(TIMESTAMP_KEY);
    
    if (cachedProducts && Array.isArray(cachedProducts) && cachedProducts.length > 0) {
      console.log(`[SYNC] Using cached data from ${cachedTimestamp} (${cachedProducts.length} products)`);
      
      // Update status to indicate using cache
      await this.updateSyncStatus({
        lastSync: cachedTimestamp,
        productCount: cachedProducts.length,
        usingFallback: false,
        apiHealthy: false,
        lastError: reason
      });
      
      return {
        success: true,
        data: cachedProducts,
        source: 'cached_data',
        warning: `Using cached product list – may not include latest offers (${reason})`,
        productCount: cachedProducts.length,
        timestamp: cachedTimestamp || new Date().toISOString()
      };
    }
    
    // No cache available, use fallback data
    console.log('[SYNC] No cache available, using fallback products');
    
    // Store fallback data for future use
    await set(CACHE_KEY, FALLBACK_LENDER_PRODUCTS);
    await set(TIMESTAMP_KEY, new Date().toISOString());
    
    // Update status
    await this.updateSyncStatus({
      lastSync: new Date().toISOString(),
      productCount: FALLBACK_LENDER_PRODUCTS.length,
      usingFallback: true,
      apiHealthy: false,
      lastError: reason
    });
    
    return {
      success: true,
      data: FALLBACK_LENDER_PRODUCTS,
      source: 'fallback_data',
      warning: `Using cached product list – may not include latest offers (${reason})`,
      productCount: FALLBACK_LENDER_PRODUCTS.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Store successful API data with timestamp
   */
  private async storeValidData(products: LenderProduct[], timestamp: string): Promise<void> {
    await set(CACHE_KEY, products);
    await set(TIMESTAMP_KEY, timestamp);
    
    // Update sync status
    await this.updateSyncStatus({
      lastSync: timestamp,
      productCount: products.length,
      usingFallback: false,
      apiHealthy: true,
      lastError: undefined
    });
  }

  /**
   * Update sync status for monitoring
   */
  private async updateSyncStatus(status: SyncStatus): Promise<void> {
    await set(STATUS_KEY, status);
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const status = await get(STATUS_KEY);
    return status || {
      lastSync: null,
      productCount: 0,
      usingFallback: true,
      apiHealthy: false
    };
  }

  /**
   * Manual sync trigger for testing
   */
  async forcSync(): Promise<SyncResult> {
    console.log('[SYNC] Manual sync triggered...');
    return await this.pullLenderProducts();
  }
}

// Export singleton instance
export const reliableLenderSync = ReliableLenderSync.getInstance();

// Export functions for compatibility
export async function pullLiveData(): Promise<SyncResult> {
  return await reliableLenderSync.pullLenderProducts();
}

export async function getSyncStatus(): Promise<SyncStatus> {
  return await reliableLenderSync.getSyncStatus();
}

export async function forceSync(): Promise<SyncResult> {
  return await reliableLenderSync.forcSync();
}