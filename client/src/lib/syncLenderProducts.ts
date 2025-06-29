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

export async function syncLenderProducts(): Promise<boolean> {
  try {
    // Check if we need to fetch new data
    const lastFetched = localStorage.getItem(CACHE_KEYS.LAST_FETCHED);
    const now = Date.now();
    
    if (lastFetched && (now - Number(lastFetched)) < TWELVE_HOURS) {
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
      credentials: 'include',
      // Add timeout handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lender products: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const lenders: LenderProduct[] = data.products || data;
    
    if (!Array.isArray(lenders) || lenders.length === 0) {
      console.warn('Received empty or invalid lender products data');
      return false;
    }

    // Store in localStorage
    localStorage.setItem(CACHE_KEYS.PRODUCTS, JSON.stringify(lenders));
    localStorage.setItem(CACHE_KEYS.LAST_FETCHED, now.toString());
    localStorage.setItem(CACHE_KEYS.METADATA, JSON.stringify({
      lastFetched: now,
      version: '1.0',
      totalProducts: lenders.length,
    }));
    
    console.log(`Successfully synced ${lenders.length} lender products to cache`);
    return true;
    
  } catch (error) {
    console.error('Failed to sync lender products:', error);
    return false;
  }
}

export async function getCachedLenderProducts(): Promise<LenderProduct[]> {
  try {
    // Get cached data from localStorage
    const cachedData = localStorage.getItem(CACHE_KEYS.PRODUCTS);
    
    if (cachedData) {
      const products = JSON.parse(cachedData);
      if (Array.isArray(products) && products.length > 0) {
        return products;
      }
    }
    
    // If no cached data, try to sync first
    const syncSuccess = await syncLenderProducts();
    if (syncSuccess) {
      const newCachedData = localStorage.getItem(CACHE_KEYS.PRODUCTS);
      return newCachedData ? JSON.parse(newCachedData) : [];
    }
    
    return [];
    
  } catch (error) {
    console.error('Failed to get cached lender products:', error);
    return [];
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
    let products = await getCachedLenderProducts();
    
    // Apply filters
    if (filters.geography?.length) {
      products = products.filter((p: LenderProduct) => 
        p.geography.some((geo: string) => filters.geography!.includes(geo))
      );
    }
    
    if (filters.product_type) {
      products = products.filter((p: LenderProduct) => p.product_type === filters.product_type);
    }
    
    if (filters.min_amount !== undefined) {
      products = products.filter((p: LenderProduct) => p.max_amount >= filters.min_amount!);
    }
    
    if (filters.max_amount !== undefined) {
      products = products.filter((p: LenderProduct) => p.min_amount <= filters.max_amount!);
    }
    
    if (filters.industries?.length) {
      products = products.filter((p: LenderProduct) => 
        p.industries?.some((industry: string) => filters.industries!.includes(industry))
      );
    }
    
    if (filters.lender_name) {
      products = products.filter((p: LenderProduct) => 
        p.lender_name.toLowerCase().includes(filters.lender_name!.toLowerCase())
      );
    }
    
    return products;
    
  } catch (error) {
    console.error('Failed to get filtered lender products:', error);
    return [];
  }
}

export async function getCacheMetadata(): Promise<{
  lastFetched: number | null;
  totalProducts: number;
  isStale: boolean;
} | null> {
  try {
    const lastFetched = localStorage.getItem(CACHE_KEYS.LAST_FETCHED);
    const metadataStr = localStorage.getItem(CACHE_KEYS.METADATA);
    const productsStr = localStorage.getItem(CACHE_KEYS.PRODUCTS);
    
    let totalProducts = 0;
    if (productsStr) {
      try {
        const products = JSON.parse(productsStr);
        totalProducts = Array.isArray(products) ? products.length : 0;
      } catch {
        totalProducts = 0;
      }
    }
    
    if (!lastFetched) {
      return {
        lastFetched: null,
        totalProducts,
        isStale: true,
      };
    }
    
    const now = Date.now();
    const isStale = (now - Number(lastFetched)) > TWELVE_HOURS;
    
    return {
      lastFetched: Number(lastFetched),
      totalProducts,
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