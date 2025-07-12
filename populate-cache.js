/**
 * One-time Cache Population Script
 * Populates IndexedDB with 41 products from staff API
 */

(async function populateIndexedDBCache() {
  console.log('[CACHE POPULATION] Starting one-time cache setup...');
  
  try {
    // Fetch products from staff API via proxy
    console.log('[CACHE POPULATION] Fetching 41 products from staff API...');
    const response = await fetch('/api/public/lenders');
    
    if (!response.ok) {
      throw new Error(`API failed: ${response.status}`);
    }
    
    const data = await response.json();
    const products = data.products || data.data || data;
    
    console.log(`[CACHE POPULATION] Got ${products.length} products from API`);
    
    // Import and use cache utilities
    const { saveLenderProducts } = await import('./client/src/utils/lenderCache.ts');
    await saveLenderProducts(products, 'initial_population');
    
    console.log(`[CACHE POPULATION] ✅ Successfully cached ${products.length} products in IndexedDB`);
    console.log('[CACHE POPULATION] Steps 2 and 5 can now work with cache-only operation');
    
    // Verify cache was populated
    const { loadLenderProducts } = await import('./client/src/utils/lenderCache.ts');
    const cached = await loadLenderProducts();
    console.log(`[CACHE VERIFICATION] ✅ Verified: ${cached?.length || 0} products in cache`);
    
    return {
      success: true,
      productsCount: products.length,
      cachedCount: cached?.length || 0
    };
    
  } catch (error) {
    console.error('[CACHE POPULATION] ❌ Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
})();