/**
 * Query US Working Capital Products
 * Run this in browser console to count US-based working capital products
 */

(async () => {
  try {
    console.log('🔍 QUERYING US WORKING CAPITAL PRODUCTS');
    console.log('=====================================');
    
    // Get cached products from IndexedDB
    const db = await window.idb.openDB('lenderCache', 1);
    const products = await db.get('products', 'lenderProducts');
    
    if (!products || !products.data) {
      console.log('❌ No cached products found');
      return;
    }
    
    console.log('📊 Total cached products:', products.data.length);
    
    // Filter for US-based working capital products
    const usWorkingCapital = products.data.filter(product => {
      const country = product.country || product.geography;
      const category = product.category || product.productCategory || '';
      
      // Check if US-based
      const isUS = country === 'US' || 
                  country === 'United States' || 
                  (Array.isArray(country) && country.includes('US'));
      
      // Check if working capital related
      const isWorkingCapital = category.toLowerCase().includes('working capital') ||
                              category.toLowerCase().includes('working_capital') ||
                              category === 'Working Capital' ||
                              category === 'working_capital';
      
      return isUS && isWorkingCapital;
    });
    
    console.log('🎯 US Working Capital Products Found:', usWorkingCapital.length);
    
    if (usWorkingCapital.length > 0) {
      console.log('\n📋 Product Details:');
      usWorkingCapital.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name || product.lenderName}`);
        console.log(`      Category: ${product.category || product.productCategory}`);
        console.log(`      Country: ${product.country || product.geography}`);
        console.log(`      Max Amount: $${(product.max_amount || product.maxAmount || 0).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('\n❌ No US Working Capital products found');
      console.log('\nAvailable categories:');
      const categories = [...new Set(products.data.map(p => p.category || p.productCategory))];
      categories.forEach(cat => console.log('   -', cat));
      
      console.log('\nAvailable countries:');
      const countries = [...new Set(products.data.map(p => p.country || p.geography))];
      countries.forEach(country => console.log('   -', country));
    }
    
  } catch (error) {
    console.error('❌ Error querying products:', error);
  }
})();