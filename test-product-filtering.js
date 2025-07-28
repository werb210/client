/**
 * TEST: Product Filtering Logic Debug
 * Run this in browser console to test why no products are showing for user's criteria
 */

async function testProductFiltering() {
  console.log('=== TESTING PRODUCT FILTERING LOGIC ===\n');
  
  // User's exact Step 1 data from console logs
  const userCriteria = {
    headquarters: 'US',
    lookingFor: 'capital',
    fundingAmount: 45000,
    accountsReceivableBalance: 0,
    fundsPurpose: 'working_capital'
  };
  
  console.log('User criteria:', userCriteria);
  
  try {
    // Get products from IndexedDB (same as the app uses)
    const { get } = await import('idb-keyval');
    const cachedProducts = await get('lender-products');
    
    if (!cachedProducts || cachedProducts.length === 0) {
      console.log('❌ No products found in IndexedDB cache');
      return;
    }
    
    console.log(`✅ Found ${cachedProducts.length} products in cache`);
    
    // Test basic filtering criteria
    const usProducts = cachedProducts.filter(p => p.country === 'US');
    console.log(`🇺🇸 US products: ${usProducts.length}`);
    
    const amountMatches = cachedProducts.filter(p => {
      const min = p.min_amount || 0;
      const max = p.max_amount || Infinity;
      return 45000 >= min && 45000 <= max;
    });
    console.log(`💰 Amount matches (≥${userCriteria.fundingAmount}): ${amountMatches.length}`);
    
    const bothCriteria = cachedProducts.filter(p => {
      const min = p.min_amount || 0;
      const max = p.max_amount || Infinity;
      const amountMatch = 45000 >= min && 45000 <= max;
      const countryMatch = p.country === 'US';
      return amountMatch && countryMatch;
    });
    console.log(`🎯 Both amount + country matches: ${bothCriteria.length}`);
    
    if (bothCriteria.length > 0) {
      console.log('\n📋 Sample products that should match:');
      bothCriteria.slice(0, 3).forEach(p => {
        console.log(`- ${p.name}: $${p.min_amount}-$${p.max_amount}, Country: ${p.country}, Category: ${p.category}`);
      });
    }
    
    // Test category filtering for 'capital' vs equipment
    const capitalProducts = bothCriteria.filter(p => {
      const categoryLower = p.category?.toLowerCase() || '';
      return !categoryLower.includes('equipment'); // 'capital' excludes equipment
    });
    console.log(`💼 Capital products (non-equipment): ${capitalProducts.length}`);
    
    // Test factoring exclusion (accountsReceivableBalance = 0)
    const nonFactoringProducts = capitalProducts.filter(p => {
      const categoryLower = p.category?.toLowerCase() || '';
      return !(categoryLower.includes('factoring') || categoryLower.includes('invoice'));
    });
    console.log(`🚫 Non-factoring products: ${nonFactoringProducts.length}`);
    
    if (nonFactoringProducts.length > 0) {
      console.log('\n✅ FINAL MATCHES:');
      nonFactoringProducts.slice(0, 5).forEach(p => {
        console.log(`- ${p.name}: $${p.min_amount}-$${p.max_amount}, Category: ${p.category}`);
      });
    } else {
      console.log('\n❌ NO FINAL MATCHES - Debugging further...');
      
      // Check what's filtering out the products
      console.log('\nDEBUG BREAKDOWN:');
      console.log(`1. Total products: ${cachedProducts.length}`);
      console.log(`2. US products: ${usProducts.length}`);
      console.log(`3. Amount range matches: ${amountMatches.length}`);
      console.log(`4. Both criteria: ${bothCriteria.length}`);
      console.log(`5. Capital (non-equipment): ${capitalProducts.length}`);
      console.log(`6. Non-factoring: ${nonFactoringProducts.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing product filtering:', error);
  }
}

// Run the test
testProductFiltering();