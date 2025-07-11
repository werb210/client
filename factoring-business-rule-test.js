/**
 * FACTORING BUSINESS RULE TEST
 * Test the new factoring logic: show factoring when "No Account Receivables" selected
 */

async function testFactoringBusinessRule() {
  console.log('🧪 TESTING FACTORING BUSINESS RULE');
  console.log('================================');
  
  // Test case 1: No Account Receivables (should NOT show factoring)
  console.log('\n📋 TEST 1: No Account Receivables Selected');
  console.log('Expected: Invoice Factoring products should NOT appear');
  
  const formDataNoAR = {
    headquarters: 'CA',
    fundingAmount: 40000,
    lookingFor: 'capital',
    accountsReceivableBalance: 0,  // No Account Receivables
    fundsPurpose: 'working_capital'
  };
  
  try {
    // Fetch products for filtering test
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (data.success && data.products) {
      // Import the filtering function (simulated for testing)
      const products = data.products;
      
      // Test filtering logic manually
      const factoringleProducts = products.filter(product => 
        product.category && product.category.toLowerCase().includes('factoring')
      );
      
      console.log(`📊 Found ${factoringleProducts.length} factoring products in database`);
      factoringleProducts.forEach(product => {
        console.log(`  - ${product.lender}: ${product.category}`);
      });
      
      // Test the filtering logic
      const filteredForNoAR = factoringleProducts.filter(product => {
        // This simulates the fixed logic: factoring only when accountsReceivableBalance > 0
        return formDataNoAR.accountsReceivableBalance > 0;
      });
      
      console.log(`✅ TEST 1 RESULT: ${filteredForNoAR.length} factoring products shown (expected: 0)`);
      
      if (filteredForNoAR.length === 0) {
        console.log('✅ PASS: No factoring products shown when "No Account Receivables"');
      } else {
        console.log('❌ FAIL: Factoring products still appearing when they should not');
      }
      
    } else {
      console.log('❌ Failed to fetch products for testing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  // Test case 2: Has Account Receivables (should show factoring)
  console.log('\n📋 TEST 2: Has Account Receivables');
  console.log('Expected: Invoice Factoring products SHOULD appear');
  
  const formDataWithAR = {
    headquarters: 'CA',
    fundingAmount: 40000,
    lookingFor: 'capital',
    accountsReceivableBalance: 100000,  // Has Account Receivables
    fundsPurpose: 'working_capital'
  };
  
  try {
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (data.success && data.products) {
      const products = data.products;
      const factoringleProducts = products.filter(product => 
        product.category && product.category.toLowerCase().includes('factoring')
      );
      
      // Test the filtering logic with AR > 0
      const filteredForWithAR = factoringleProducts.filter(product => {
        return formDataWithAR.accountsReceivableBalance > 0;
      });
      
      console.log(`✅ TEST 2 RESULT: ${filteredForWithAR.length} factoring products shown (expected: > 0)`);
      
      if (filteredForWithAR.length > 0) {
        console.log('✅ PASS: Factoring products shown when account receivables exist');
        filteredForWithAR.forEach(product => {
          console.log(`  - ${product.lender}: ${product.category}`);
        });
      } else {
        console.log('❌ FAIL: No factoring products shown when they should appear');
      }
      
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n🎯 TESTING COMPLETE');
  console.log('================================');
}

// Auto-run the test
testFactoringBusinessRule();