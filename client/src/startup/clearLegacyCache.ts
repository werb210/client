/**
 * Clear legacy cached data to force use of staff database
 * This ensures we never fall back to the old 8-product dataset
 */
export function clearLegacyCache(): void {
  console.log('[CACHE CLEANUP] Checking for legacy cached data...');

  // Clear localStorage items that might contain old product data
  const legacyKeys = [
    'legacyProducts',
    'lenderProducts',
    'cachedLenders',
    'localLenders',
    'productCache'
  ];

  let clearedItems = 0;
  legacyKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      clearedItems++;
      console.log(`[CACHE CLEANUP] Removed localStorage: ${key}`);
    }
  });

  // Clear IndexedDB databases that might contain old product data
  const legacyDatabases = [
    'lenderProducts',
    'lenderCache',
    'productDatabase',
    'localProducts'
  ];

  legacyDatabases.forEach(dbName => {
    try {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      deleteRequest.onsuccess = () => {
        console.log(`[CACHE CLEANUP] Deleted IndexedDB: ${dbName}`);
      };
      deleteRequest.onerror = () => {
        console.warn(`[CACHE CLEANUP] Failed to delete IndexedDB: ${dbName}`);
      };
    } catch (error) {
      console.warn(`[CACHE CLEANUP] Error deleting IndexedDB ${dbName}:`, error);
    }
  });

  // Clear any React Query cache keys related to old endpoints
  if (typeof window !== 'undefined' && (window as any).queryClient) {
    const queryClient = (window as any).queryClient;
    queryClient.removeQueries({ queryKey: ['/api/local/lenders'] });
    queryClient.removeQueries({ queryKey: ['lenders'] });
    console.log('[CACHE CLEANUP] Cleared React Query cache');
  }

  // Mark cache cleanup as completed
  localStorage.setItem('cacheCleanupCompleted', new Date().toISOString());
  
  if (clearedItems > 0) {
    console.log(`[CACHE CLEANUP] Completed: ${clearedItems} legacy items removed`);
  } else {
    console.log('[CACHE CLEANUP] No legacy cache found');
  }
}

/**
 * Check if cache cleanup has already been performed
 */
export function shouldClearCache(): boolean {
  const cleanupCompleted = localStorage.getItem('cacheCleanupCompleted');
  
  // Clear cache if it's never been done, or if it's been more than 7 days
  if (!cleanupCompleted) {
    return true;
  }
  
  const lastCleanup = new Date(cleanupCompleted);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return lastCleanup < sevenDaysAgo;
}