/**
 * Sync Manager - Live Data Synchronization
 * Handles pulling live data from staff API and normalizing to local schema
 */

import { openDB, DBSchema } from 'idb';

interface LenderProductDB extends DBSchema {
  products: {
    key: string;
    value: {
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
      videoUrl?: string;
      lastSynced: number;
    };
  };
  sync_metadata: {
    key: string;
    value: {
      lastSyncTime: number;
      productCount: number;
      syncStatus: 'success' | 'error' | 'pending';
      errorMessage?: string;
    };
  };
}

class SyncManager {
  private dbName = 'boreal-lender-products';
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://staffportal.replit.app/api';
  
  async initializeDB() {
    return openDB<LenderProductDB>(this.dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_metadata')) {
          db.createObjectStore('sync_metadata', { keyPath: 'key' });
        }
      },
    });
  }

  async pullLiveData(): Promise<{ success: boolean; productCount: number; message: string }> {
    console.log(`[SYNC] Starting live data pull from ${this.apiBaseUrl}/public/lenders`);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/public/lenders`, {
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
      console.log('[SYNC] Raw API response received, processing...');
      
      // Handle different response formats
      let products = [];
      if (Array.isArray(rawData)) {
        products = rawData;
      } else if (rawData.success && rawData.products) {
        products = rawData.products;
      } else if (rawData.products) {
        products = rawData.products;
      } else if (rawData.data) {
        products = rawData.data;
      } else {
        throw new Error('Invalid API response format - no products array found');
      }

      console.log(`[SYNC] Found ${products.length} products to process`);
      
      if (products.length === 0) {
        throw new Error('Staff API returned empty product list');
      }

      // Normalize and import to IndexedDB
      const normalizedCount = await this.importToLocalIndexedDB(products);
      
      // Update sync metadata
      await this.updateSyncMetadata({
        lastSyncTime: Date.now(),
        productCount: normalizedCount,
        syncStatus: 'success'
      });

      const message = `Successfully synced ${normalizedCount} products from staff API`;
      console.log(`[SYNC] ${message}`);
      
      return {
        success: true,
        productCount: normalizedCount,
        message
      };

    } catch (error) {
      const errorMessage = `Sync failed: ${(error as Error).message}`;
      console.error('[SYNC]', errorMessage);
      
      // Update sync metadata with error
      await this.updateSyncMetadata({
        lastSyncTime: Date.now(),
        productCount: 0,
        syncStatus: 'error',
        errorMessage: (error as Error).message
      });

      return {
        success: false,
        productCount: 0,
        message: errorMessage
      };
    }
  }

  private async importToLocalIndexedDB(products: any[]): Promise<number> {
    const db = await this.initializeDB();
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    
    // Clear existing products
    await store.clear();
    
    let importedCount = 0;
    const timestamp = Date.now();
    
    for (const product of products) {
      try {
        // Normalize product data to local schema
        const normalized = {
          id: product.id || `${product.lender}-${product.product}`.replace(/\s+/g, '-').toLowerCase(),
          name: product.product || product.productName || product.name || 'Unknown Product',
          lenderName: product.lender || product.lenderName || 'Unknown Lender',
          category: this.normalizeCategory(product.productCategory || product.category || product.type),
          country: this.normalizeCountry(product.geography || product.country),
          minAmount: parseFloat(product.minAmountUsd || product.minAmount || product.min_amount) || 0,
          maxAmount: parseFloat(product.maxAmountUsd || product.maxAmount || product.max_amount) || 0,
          interestRateMin: parseFloat(product.interestRateMin || product.rate_min) || undefined,
          interestRateMax: parseFloat(product.interestRateMax || product.rate_max) || undefined,
          termMin: parseInt(product.termMinMonths || product.term_min) || undefined,
          termMax: parseInt(product.termMaxMonths || product.term_max) || undefined,
          description: product.description || undefined,
          videoUrl: product.videoUrl || product.video || undefined,
          lastSynced: timestamp
        };

        await store.add(normalized);
        importedCount++;
        
      } catch (error) {
        console.warn('[SYNC] Failed to import product:', product, error);
      }
    }
    
    await tx.done;
    console.log(`[SYNC] Imported ${importedCount} products to IndexedDB`);
    
    return importedCount;
  }

  private normalizeCategory(category: string): string {
    if (!category) return 'other';
    
    const normalized = category.toLowerCase().replace(/\s+/g, '_');
    const categoryMap: Record<string, string> = {
      'term_loan': 'term_loan',
      'equipment_financing': 'equipment_financing',
      'line_of_credit': 'line_of_credit',
      'invoice_factoring': 'invoice_factoring',
      'working_capital': 'working_capital',
      'purchase_order_financing': 'purchase_order_financing',
      'asset_based_lending': 'asset_based_lending',
      'sba_loan': 'sba_loan'
    };
    
    return categoryMap[normalized] || 'other';
  }

  private normalizeCountry(geography: any): string {
    if (Array.isArray(geography)) {
      return geography.includes('US') ? 'US' : geography.includes('CA') ? 'CA' : 'US';
    }
    if (typeof geography === 'string') {
      return geography.toUpperCase().includes('CA') ? 'CA' : 'US';
    }
    return 'US'; // Default
  }

  private async updateSyncMetadata(metadata: any) {
    try {
      const db = await this.initializeDB();
      const tx = db.transaction('sync_metadata', 'readwrite');
      await tx.objectStore('sync_metadata').put({
        key: 'last_sync',
        ...metadata
      });
      await tx.done;
    } catch (error) {
      console.warn('[SYNC] Failed to update metadata:', error);
    }
  }

  async getSyncStatus() {
    try {
      const db = await this.initializeDB();
      const metadata = await db.get('sync_metadata', 'last_sync');
      const productCount = await db.count('products');
      
      return {
        lastSyncTime: metadata?.lastSyncTime || 0,
        productCount,
        syncStatus: metadata?.syncStatus || 'never',
        errorMessage: metadata?.errorMessage
      };
    } catch (error) {
      console.warn('[SYNC] Failed to get sync status:', error);
      return {
        lastSyncTime: 0,
        productCount: 0,
        syncStatus: 'error' as const,
        errorMessage: 'Failed to read sync status'
      };
    }
  }

  async getProducts() {
    try {
      const db = await this.initializeDB();
      return await db.getAll('products');
    } catch (error) {
      console.warn('[SYNC] Failed to get products:', error);
      return [];
    }
  }
}

export const syncManager = new SyncManager();