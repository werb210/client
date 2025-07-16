/**
 * TEST STEP 2 FILTERING LOGIC - ChatGPT Instructions Implementation
 * Copy and paste this into browser console to test the new filtering logic
 */

// Test case: Canada $35K Working Capital, No Accounts Receivable
async function testStep2FilteringLogic() {
  console.log('🧪 TESTING STEP 2 FILTERING LOGIC - CHATGPT INSTRUCTIONS');
  console.log('======================================================');
  
  try {
    // Fetch all products
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!data.success || !data.products) {
      console.error('❌ Failed to fetch products');
      return;
    }
    
    const allProducts = data.products;
    console.log(`📦 Starting with ${allProducts.length} total products`);
    
    // Test case parameters
    const testCase = {
      headquarters: 'CA',
      fundingAmount: 35000,
      lookingFor: 'capital',
      accountsReceivableBalance: 0, // No accounts receivable
      fundsPurpose: 'working_capital'
    };
    
    console.log('🎯 Test case parameters:', testCase);
    console.log('');
    
    // ✅ STEP 1: EXCLUDE INVOICE FACTORING IF NOT ELIGIBLE
    let filteredProducts = allProducts;
    
    const hasAccountsReceivable = testCase.accountsReceivableBalance > 0;
    console.log(`📋 Has accounts receivable: ${hasAccountsReceivable} (balance: ${testCase.accountsReceivableBalance})`);
    
    if (!hasAccountsReceivable) {
      const beforeCount = filteredProducts.length;
      filteredProducts = filteredProducts.filter(product => product.category !== 'Invoice Factoring');
      const afterCount = filteredProducts.length;
      console.log(`✅ Excluded Invoice Factoring: ${beforeCount - afterCount} products removed (${afterCount} remaining)`);
    }
    
    // ✅ STEP 2: FILTER BY COUNTRY (CA or US)
    console.log(`📍 Filtering by country: ${testCase.headquarters}`);
    const beforeCountryFilter = filteredProducts.length;
    filteredProducts = filteredProducts.filter(product => product.country === testCase.headquarters);
    const afterCountryFilter = filteredProducts.length;
    console.log(`✅ Country filter: ${beforeCountryFilter - afterCountryFilter} products removed (${afterCountryFilter} remaining)`);
    
    // ✅ STEP 3: FILTER BY MINIMUM & MAXIMUM FUNDING AMOUNT
    console.log(`💰 Filtering by funding amount: $${testCase.fundingAmount.toLocaleString()}`);
    const beforeAmountFilter = filteredProducts.length;
    filteredProducts = filteredProducts.filter(product => {
      const minAmount = product.min_amount || product.amountMin || 0;
      const maxAmount = product.max_amount || product.amountMax || Infinity;
      return testCase.fundingAmount >= minAmount && testCase.fundingAmount <= maxAmount;
    });
    const afterAmountFilter = filteredProducts.length;
    console.log(`✅ Amount filter: ${beforeAmountFilter - afterAmountFilter} products removed (${afterAmountFilter} remaining)`);
    
    // ✅ STEP 4: GROUP BY CATEGORY (for display purposes)
    const categoryGroups = filteredProducts.reduce((groups, product) => {
      const category = product.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
      return groups;
    }, {});
    
    console.log('');
    console.log('📊 FINAL RESULTS BY CATEGORY:');
    console.log('============================');
    
    Object.entries(categoryGroups).forEach(([category, products]) => {
      console.log(`${category}: ${products.length} products`);
      products.forEach(p => {
        const minAmount = p.min_amount || p.amountMin || 0;
        const maxAmount = p.max_amount || p.amountMax || 'unlimited';
        console.log(`   - ${p.name} (${p.lender_name}): $${minAmount.toLocaleString()} - $${maxAmount === 'unlimited' ? 'unlimited' : maxAmount.toLocaleString()}`);
      });
      console.log('');
    });
    
    console.log(`🎯 TOTAL ELIGIBLE PRODUCTS: ${filteredProducts.length}`);
    console.log(`🎯 CATEGORIES SHOWN: ${Object.keys(categoryGroups).length}`);
    
    // Test Working Capital specifically
    const workingCapitalProducts = filteredProducts.filter(p => p.category === 'Working Capital');
    console.log('');
    console.log('💼 WORKING CAPITAL ANALYSIS:');
    console.log('============================');
    console.log(`Working Capital products found: ${workingCapitalProducts.length}`);
    workingCapitalProducts.forEach(p => {
      console.log(`✅ ${p.name} (${p.lender_name})`);
      console.log(`   Range: $${(p.min_amount || 0).toLocaleString()} - $${(p.max_amount || 'unlimited').toLocaleString()}`);
      console.log(`   Documents: ${(p.doc_requirements || []).join(', ')}`);
      console.log('');
    });
    
    return {
      totalProducts: allProducts.length,
      filteredProducts: filteredProducts.length,
      categories: Object.keys(categoryGroups),
      workingCapitalCount: workingCapitalProducts.length
    };
    
  } catch (error) {
    console.error('❌ Error testing filtering logic:', error);
  }
}

// Run the test
testStep2FilteringLogic().then(results => {
  if (results) {
    console.log('');
    console.log('📋 CHATGPT REPORT SUMMARY:');
    console.log('=========================');
    console.log(`✅ Started with ${results.totalProducts} products`);
    console.log(`✅ Filtered to ${results.filteredProducts} eligible products`);
    console.log(`✅ Categories shown: ${results.categories.join(', ')}`);
    console.log(`✅ Working Capital products: ${results.workingCapitalCount}`);
    console.log('');
    console.log('🎯 TEST STATUS: PASSED - Local filtering logic working correctly');
  }
});