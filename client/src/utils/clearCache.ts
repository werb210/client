/**
 * Clear cached lender product data to force fresh fetch from staff API
 */
export async function clearProductCache() {
  try {
    // Clear IndexedDB
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      await new Promise<void>((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase('lenderProducts');
        deleteRequest.onsuccess = () => {
          console.log('✅ IndexedDB cleared: lenderProducts database deleted');
          resolve();
        };
        deleteRequest.onerror = () => {
          console.log('❌ Error clearing IndexedDB');
          reject(new Error('Failed to clear IndexedDB'));
        };
        deleteRequest.onblocked = () => {
          console.log('⚠️ IndexedDB deletion blocked - close other tabs and try again');
          reject(new Error('IndexedDB deletion blocked'));
        };
      });
    }

    // Clear localStorage
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      const keys = Object.keys(localStorage);
      const productKeys = keys.filter(key => key.includes('lender') || key.includes('product'));
      productKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`✅ Cleared localStorage: ${key}`);
      });
    }

    // Clear sessionStorage
    if (typeof window !== 'undefined' && 'sessionStorage' in window) {
      const keys = Object.keys(sessionStorage);
      const productKeys = keys.filter(key => key.includes('lender') || key.includes('product'));
      productKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`✅ Cleared sessionStorage: ${key}`);
      });
    }

    console.log('✅ All product caches cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    return false;
  }
}

export function clearCacheAndReload() {
  clearProductCache().then(() => {
    console.log('🔄 Reloading page to fetch fresh data...');
    window.location.reload();
  });
}