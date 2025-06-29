import { LenderProduct } from '@/hooks/usePublicLenders';
import { API_BASE_URL } from '@/constants';

interface CacheMetadata {
  lastFetched: number;
  version: string;
  totalProducts: number;
}

const CACHE_KEYS = {
  PRODUCTS: 'lender_products_cache',
  METADATA: 'lender_products_metadata',
  LAST_FETCHED: 'lender_products_last_fetched',
} as const;

const TWELVE_HOURS = 12 * 60 * 60 * 1000;

async function getDB(): Promise<IDBPDatabase<LenderProductsDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<LenderProductsDB>('LenderProductsDB', 1, {
    upgrade(db) {
      // Create lender products store
      const lenderStore = db.createObjectStore('lenderProducts', {
        keyPath: 'id',
      });
      
      // Create indexes for efficient querying
      lenderStore.createIndex('geography', 'geography', { multiEntry: true });
      lenderStore.createIndex('product_type', 'product_type');
      lenderStore.createIndex('min_amount', 'min_amount');
      lenderStore.createIndex('max_amount', 'max_amount');
      lenderStore.createIndex('industries', 'industries', { multiEntry: true });
      lenderStore.createIndex('lender_name', 'lender_name');

      // Create metadata store
      db.createObjectStore('metadata', {
        keyPath: 'key',
      });
    },
  });

  return dbInstance;
}

export async function syncLenderProducts(): Promise<boolean> {
  try {
    const db = await getDB();
    
    // Check if we need to fetch new data
    const metadata = await db.get('metadata', 'sync_info');
    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;
    
    if (metadata && (now - metadata.lastFetched) < twelveHours) {
      console.log('Lender products cache is still fresh, skipping sync');
      return true;
    }

    console.log('Syncing lender products from staff backend...');
    
    // Fetch fresh data from staff backend
    const response = await fetch(`${API_BASE_URL}/public/lenders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lender products: ${response.status} ${response.statusText}`);
    }

    const lenders: LenderProduct[] = await response.json();
    
    if (!Array.isArray(lenders) || lenders.length === 0) {
      console.warn('Received empty or invalid lender products data');
      return false;
    }

    // Clear existing data and save new data
    const tx = db.transaction(['lenderProducts', 'metadata'], 'readwrite');
    
    // Clear old products
    await tx.objectStore('lenderProducts').clear();
    
    // Save new products
    const lenderStore = tx.objectStore('lenderProducts');
    for (const lender of lenders) {
      await lenderStore.add(lender);
    }
    
    // Update metadata
    await tx.objectStore('metadata').put({
      key: 'sync_info',
      lastFetched: now,
      version: '1.0',
      totalProducts: lenders.length,
    });
    
    await tx.done;
    
    console.log(`Successfully synced ${lenders.length} lender products to IndexedDB`);
    return true;
    
  } catch (error) {
    console.error('Failed to sync lender products:', error);
    
    // Fallback to localStorage if IndexedDB fails
    try {
      const fallbackData = localStorage.getItem('lender_products_fallback');
      if (!fallbackData) {
        // If no fallback data exists, try to fetch and store in localStorage
        const response = await fetch(`${API_BASE_URL}/public/lenders`);
        if (response.ok) {
          const lenders = await response.json();
          localStorage.setItem('lender_products_fallback', JSON.stringify(lenders));
          localStorage.setItem('lender_products_fallback_fetched', Date.now().toString());
          console.log('Stored lender products in localStorage fallback');
          return true;
        }
      }
    } catch (fallbackError) {
      console.error('Fallback to localStorage also failed:', fallbackError);
    }
    
    return false;
  }
}

export async function getCachedLenderProducts(): Promise<LenderProduct[]> {
  try {
    const db = await getDB();
    const products = await db.getAll('lenderProducts');
    
    if (products.length > 0) {
      return products;
    }
    
    // If IndexedDB is empty, try to sync first
    const syncSuccess = await syncLenderProducts();
    if (syncSuccess) {
      return await db.getAll('lenderProducts');
    }
    
    // Fallback to localStorage
    console.log('Falling back to localStorage for lender products');
    const fallbackData = localStorage.getItem('lender_products_fallback');
    return fallbackData ? JSON.parse(fallbackData) : [];
    
  } catch (error) {
    console.error('Failed to get cached lender products:', error);
    
    // Final fallback to localStorage
    const fallbackData = localStorage.getItem('lender_products_fallback');
    return fallbackData ? JSON.parse(fallbackData) : [];
  }
}

export async function getCachedLenderProductsByFilter(filters: {
  geography?: string[];
  product_type?: string;
  min_amount?: number;
  max_amount?: number;
  industries?: string[];
  lender_name?: string;
}): Promise<LenderProduct[]> {
  try {
    const db = await getDB();
    let products = await db.getAll('lenderProducts');
    
    // Apply filters
    if (filters.geography?.length) {
      products = products.filter(p => 
        p.geography.some(geo => filters.geography!.includes(geo))
      );
    }
    
    if (filters.product_type) {
      products = products.filter(p => p.product_type === filters.product_type);
    }
    
    if (filters.min_amount !== undefined) {
      products = products.filter(p => p.max_amount >= filters.min_amount!);
    }
    
    if (filters.max_amount !== undefined) {
      products = products.filter(p => p.min_amount <= filters.max_amount!);
    }
    
    if (filters.industries?.length) {
      products = products.filter(p => 
        p.industries?.some(industry => filters.industries!.includes(industry))
      );
    }
    
    if (filters.lender_name) {
      products = products.filter(p => 
        p.lender_name.toLowerCase().includes(filters.lender_name!.toLowerCase())
      );
    }
    
    return products;
    
  } catch (error) {
    console.error('Failed to get filtered lender products:', error);
    
    // Fallback to unfiltered cached products
    const allProducts = await getCachedLenderProducts();
    
    // Apply basic filtering on fallback data
    return allProducts.filter(product => {
      if (filters.geography?.length && !product.geography.some(geo => filters.geography!.includes(geo))) {
        return false;
      }
      if (filters.product_type && product.product_type !== filters.product_type) {
        return false;
      }
      if (filters.min_amount !== undefined && product.max_amount < filters.min_amount) {
        return false;
      }
      if (filters.max_amount !== undefined && product.min_amount > filters.max_amount) {
        return false;
      }
      return true;
    });
  }
}

export async function getCacheMetadata(): Promise<{
  lastFetched: number | null;
  totalProducts: number;
  isStale: boolean;
} | null> {
  try {
    const db = await getDB();
    const metadata = await db.get('metadata', 'sync_info');
    const productCount = await db.count('lenderProducts');
    
    if (!metadata) {
      return {
        lastFetched: null,
        totalProducts: productCount,
        isStale: true,
      };
    }
    
    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;
    const isStale = (now - metadata.lastFetched) > twelveHours;
    
    return {
      lastFetched: metadata.lastFetched,
      totalProducts: productCount,
      isStale,
    };
    
  } catch (error) {
    console.error('Failed to get cache metadata:', error);
    return null;
  }
}

// Initialize sync on module load
let initPromise: Promise<boolean> | null = null;

export function initializeLenderProductsCache(): Promise<boolean> {
  if (!initPromise) {
    initPromise = syncLenderProducts();
  }
  return initPromise;
}

// Auto-sync on app startup
if (typeof window !== 'undefined') {
  // Defer initialization to avoid blocking app startup
  setTimeout(() => {
    initializeLenderProductsCache().catch(error => {
      console.error('Failed to initialize lender products cache:', error);
    });
  }, 1000);
}