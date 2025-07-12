/**
 * Debug Cache Fields - Check exact structure in IndexedDB
 * Run this in browser console to see what fields exist
 */

async function debugCacheFields() {
  console.log('=== CACHE FIELD DEBUGGING ===');
  
  try {
    // Check IndexedDB directly
    const request = indexedDB.open('keyval-store', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['keyval'], 'readonly');
      const store = transaction.objectStore('keyval');
      
      // Check lenderProducts key (new cache system)
      const getRequest1 = store.get('lenderProducts');
      getRequest1.onsuccess = () => {
        const lenderProducts = getRequest1.result;
        if (lenderProducts && Array.isArray(lenderProducts) && lenderProducts.length > 0) {
          console.log('✅ Found lenderProducts cache:', lenderProducts.length, 'products');
          const sample = lenderProducts[0];
          console.log('Sample product fields:', Object.keys(sample));
          console.log('Amount fields check:', {
            minAmount: sample.minAmount,
            maxAmount: sample.maxAmount,
            amountMin: sample.amountMin,
            amountMax: sample.amountMax,
            minAmountUsd: sample.minAmountUsd,
            maxAmountUsd: sample.maxAmountUsd
          });
        } else {
          console.log('❌ No lenderProducts found');
        }
      };
      
      // Check old cache key
      const getRequest2 = store.get('lender_products_cache');
      getRequest2.onsuccess = () => {
        const oldCache = getRequest2.result;
        if (oldCache && Array.isArray(oldCache) && oldCache.length > 0) {
          console.log('✅ Found old cache:', oldCache.length, 'products');
          const sample = oldCache[0];
          console.log('Old cache sample fields:', Object.keys(sample));
          console.log('Old cache amount fields:', {
            minAmount: sample.minAmount,
            maxAmount: sample.maxAmount,
            amountMin: sample.amountMin,
            amountMax: sample.amountMax
          });
        } else {
          console.log('❌ No old cache found');
        }
      };
    };
    
    request.onerror = () => {
      console.log('❌ Error accessing IndexedDB');
    };
    
  } catch (error) {
    console.log('❌ Script error:', error.message);
  }
}

debugCacheFields();