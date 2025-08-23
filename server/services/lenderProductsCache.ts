import axios from "axios";

// In-memory cache for lender products
let lenderProductsCache: any[] = [];
let lastCacheUpdate: string | null = null;

const STAFF_API_URL = process.env.STAFF_API_URL || "https://staff.boreal.financial";
const CLIENT_TOKEN = process.env.CLIENT_TOKEN || process.env.VITE_CLIENT_TOKEN;

// Health check for production API
async function checkProductionApiHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${STAFF_API_URL}/api/health`, { timeout: 5000 });
    return response.data?.status === "ok";
  } catch {
    return false;
  }
}

// ✅ Refresh lender products cache from PRODUCTION API
export async function refreshLenderProductsCache(): Promise<any[]> {
  try {
    console.log(`🔄 Refreshing lender products cache from PRODUCTION API: ${STAFF_API_URL}`);
    
    // Use PRODUCTION API endpoint instead of local
    const response = await axios.get(`${STAFF_API_URL}/api/lender-products`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Authorization': CLIENT_TOKEN ? `Bearer ${CLIENT_TOKEN}` : undefined,
        'User-Agent': 'client-app-cache-sync'
      }
    });
    
    if (response.data.success) {
      lenderProductsCache = response.data.products;
      lastCacheUpdate = new Date().toISOString();
      
      console.log(`✅ Cache refreshed: ${lenderProductsCache.length} lender products loaded`);
      console.log(`📅 Last updated: ${lastCacheUpdate}`);
      
      return lenderProductsCache;
    } else {
      throw new Error(`Local API returned error: ${response.data.error}`);
    }
    
  } catch (error) {
    console.error("❌ Failed to refresh lender products cache:", error.message);
    
    // Return cached data if available, otherwise empty array
    if (lenderProductsCache.length > 0) {
      console.log(`⚠️  Using stale cache data: ${lenderProductsCache.length} products`);
      return lenderProductsCache;
    }
    
    return [];
  }
}

// ✅ Get cached lender products (with auto-refresh if stale)
export async function getLenderProducts(forceRefresh = false): Promise<any[]> {
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const isCacheStale = !lastCacheUpdate || 
    (Date.now() - new Date(lastCacheUpdate).getTime() > CACHE_TTL);
  
  if (forceRefresh || isCacheStale || lenderProductsCache.length === 0) {
    return await refreshLenderProductsCache();
  }
  
  return lenderProductsCache;
}

// ✅ Get cache statistics
export function getCacheStats() {
  return {
    productsCount: lenderProductsCache.length,
    lastUpdated: lastCacheUpdate,
    isStale: !lastCacheUpdate || 
      (Date.now() - new Date(lastCacheUpdate).getTime() > 5 * 60 * 1000)
  };
}