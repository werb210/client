/**
 * Check Local Database Status
 * Run this in browser console to check IndexedDB cache
 */

async function checkLocalDB() {
  try {
    // Import idb-keyval for IndexedDB access
    const { get } = await import('idb-keyval');
    
    const products = await get('lender_products_cache');
    const timestamp = await get('lender_products_cache_ts');
    
    console.log('=== LOCAL INDEXEDDB STATUS ===');
    console.log('Products in cache:', products?.length || 0);
    console.log('Cache timestamp:', timestamp ? new Date(timestamp).toISOString() : 'None');
    
    if (products && products.length > 0) {
      const categories = [...new Set(products.map(p => p.category))];
      console.log('\n=== PRODUCT CATEGORIES ===');
      console.log('Total categories:', categories.length);
      categories.forEach((cat, i) => {
        const count = products.filter(p => p.category === cat).length;
        console.log(`${i + 1}. ${cat} (${count} products)`);
      });
      
      // Show geographic distribution
      const countries = [...new Set(products.map(p => p.country))];
      console.log('\n=== GEOGRAPHIC DISTRIBUTION ===');
      countries.forEach(country => {
        const count = products.filter(p => p.country === country).length;
        console.log(`${country}: ${count} products`);
      });
    } else {
      console.log('\n❌ No products in local cache');
    }
  } catch (error) {
    console.log('❌ Error accessing IndexedDB:', error.message);
  }
}

// Run the check
checkLocalDB();