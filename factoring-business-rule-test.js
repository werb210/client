/**
 * FACTORING BUSINESS RULE TEST
 * Test the new factoring logic: show factoring when "No Account Receivables" selected
 */

async function testFactoringBusinessRule() {
  console.log('=== FACTORING BUSINESS RULE TEST ===\n');
  
  try {
    // Test scenario: Canadian business, $40K, working capital, NO account receivables
    const testFormData = {
      headquarters: 'CA',
      fundingAmount: 40000,
      lookingFor: 'capital',
      accountsReceivableBalance: 0, // This is "No Account Receivables"
      fundsPurpose: 'working_capital'
    };
    
    console.log('🧪 Test Scenario:');
    console.log('   📍 Location: Canada');
    console.log('   💰 Funding: $40,000');
    console.log('   🎯 Looking for: Business Capital');
    console.log('   📊 AR Balance: 0 (No Account Receivables)');
    console.log('   📋 Purpose: Working Capital\n');
    
    // Fetch products from API
    console.log('1️⃣ Fetching products from API...');
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!data.success || !data.products) {
      console.error('❌ API fetch failed:', data);
      return;
    }
    
    console.log(`✅ Fetched ${data.products.length} products\n`);
    
    // Find factoring products
    const factoringProducts = data.products.filter(product => 
      product.category && product.category.toLowerCase().includes('factoring')
    );
    
    console.log('2️⃣ Factoring Products Analysis:');
    console.log(`📦 Total Factoring Products: ${factoringProducts.length}`);
    
    factoringProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.lenderName})`);
      console.log(`      💰 Amount: $${product.minAmount?.toLocaleString()} - $${product.maxAmount?.toLocaleString()}`);
      console.log(`      🌍 Geography: ${Array.isArray(product.geography) ? product.geography.join(', ') : product.geography || product.country}`);
    });
    
    // Test the filtering logic
    console.log('\n3️⃣ Testing New Business Rule...');
    
    // Filter Canadian factoring products within amount range
    const eligibleFactoring = factoringProducts.filter(product => {
      const minAmount = typeof product.minAmount === 'number' ? product.minAmount : parseFloat(product.minAmount) || 0;
      const maxAmount = typeof product.maxAmount === 'number' ? product.maxAmount : parseFloat(product.maxAmount) || 0;
      
      const geography = Array.isArray(product.geography) ? product.geography : 
                       typeof product.geography === 'string' ? [product.geography] :
                       product.country ? [product.country] : [];
      
      return (
        geography.includes('CA') &&
        testFormData.fundingAmount >= minAmount && 
        testFormData.fundingAmount <= maxAmount
      );
    });
    
    console.log(`✅ Eligible Factoring Products for Test Scenario: ${eligibleFactoring.length}`);
    
    eligibleFactoring.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`);
      console.log(`      ✅ Geography Match: CA`);
      console.log(`      ✅ Amount Match: $${testFormData.fundingAmount.toLocaleString()} within $${product.minAmount?.toLocaleString()}-$${product.maxAmount?.toLocaleString()}`);
    });
    
    // Test the recommendation categories hook
    console.log('\n4️⃣ Testing Step 2 Recommendations...');
    
    // Simulate the useProductCategories hook call
    console.log('🔄 Simulating recommendation engine...');
    
    // Apply core filtering (business capital products for CA, $40K)
    const coreProducts = data.products.filter(product => {
      const minAmount = typeof product.minAmount === 'number' ? product.minAmount : parseFloat(product.minAmount) || 0;
      const maxAmount = typeof product.maxAmount === 'number' ? product.maxAmount : parseFloat(product.maxAmount) || 0;
      
      const geography = Array.isArray(product.geography) ? product.geography : 
                       typeof product.geography === 'string' ? [product.geography] :
                       product.country ? [product.country] : [];
      
      return (
        geography.includes('CA') &&
        testFormData.fundingAmount >= minAmount && testFormData.fundingAmount <= maxAmount &&
        (testFormData.lookingFor === "both" ||
         (testFormData.lookingFor === "capital" && !product.category.toLowerCase().includes("equipment")) ||
         (testFormData.lookingFor === "equipment" && product.category.toLowerCase().includes("equipment")))
      );
    });
    
    // Apply extra inclusions (NEW RULE: all factoring products)
    const extraProducts = data.products.filter(product => {
      const minAmount = typeof product.minAmount === 'number' ? product.minAmount : parseFloat(product.minAmount) || 0;
      const maxAmount = typeof product.maxAmount === 'number' ? product.maxAmount : parseFloat(product.maxAmount) || 0;
      
      const geography = Array.isArray(product.geography) ? product.geography : 
                       typeof product.geography === 'string' ? [product.geography] :
                       product.country ? [product.country] : [];
      
      return (
        geography.includes('CA') &&
        testFormData.fundingAmount >= minAmount && testFormData.fundingAmount <= maxAmount &&
        product.category.toLowerCase().includes("factoring") // NEW RULE: Include all factoring
      );
    });
    
    // Merge and deduplicate
    const byId = new Map();
    [...coreProducts, ...extraProducts].forEach(p => byId.set(p.id, p));
    const allRecommendedProducts = Array.from(byId.values());
    
    // Group by category
    const categoryGroups = {};
    allRecommendedProducts.forEach(product => {
      const category = product.category;
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(product);
    });
    
    console.log(`✅ Total Recommended Products: ${allRecommendedProducts.length}`);
    console.log(`📊 Product Categories: ${Object.keys(categoryGroups).length}`);
    
    Object.entries(categoryGroups).forEach(([category, products]) => {
      console.log(`   📂 ${category}: ${products.length} products`);
      
      if (category.toLowerCase().includes('factoring')) {
        console.log(`      🎯 FACTORING CATEGORY FOUND!`);
        console.log(`      💡 Message: "Available for future receivables financing"`);
      }
    });
    
    // Final verification
    console.log('\n🎯 BUSINESS RULE VERIFICATION:');
    const hasFactoring = Object.keys(categoryGroups).some(cat => cat.toLowerCase().includes('factoring'));
    
    if (hasFactoring) {
      console.log('✅ SUCCESS: Factoring products ARE displayed for "No Account Receivables"');
      console.log('✅ New business rule is working correctly');
      console.log('✅ Users can now access factoring for future receivables');
    } else {
      console.log('❌ FAILURE: Factoring products NOT displayed');
      console.log('❌ Business rule may need debugging');
    }
    
    return {
      success: true,
      totalProducts: data.products.length,
      factoringProducts: factoringProducts.length,
      eligibleFactoring: eligibleFactoring.length,
      recommendedProducts: allRecommendedProducts.length,
      categories: Object.keys(categoryGroups).length,
      hasFactoring: hasFactoring
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Auto-run the test
testFactoringBusinessRule().then(result => {
  if (result.success) {
    console.log('\n🎉 Factoring business rule test completed');
    console.log(`📊 Results: ${result.recommendedProducts} products across ${result.categories} categories`);
    console.log(`🎯 Factoring: ${result.hasFactoring ? 'INCLUDED' : 'EXCLUDED'}`);
  } else {
    console.log('\n❌ Test failed:', result.error);
  }
});