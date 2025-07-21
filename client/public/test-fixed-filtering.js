// Test fixed Working Capital filtering after getAmountRange implementation
console.log('🔧 TESTING FIXED WORKING CAPITAL FILTERING');

// Test the getAmountRange function directly
function getAmountRange(product) {
  return {
    min: product.amount_min ?? 
         product.amountMin ?? 
         product.fundingMin ?? 
         product.minAmount ?? 
         product.min_amount ?? 
         0,
    max: product.amount_max ?? 
         product.amountMax ?? 
         product.fundingMax ?? 
         product.maxAmount ?? 
         product.max_amount ?? 
         Infinity,
  };
}

// Fetch products and test with new logic
fetch('/api/public/lenders')
  .then(response => response.json())
  .then(data => {
    const products = data.products || [];
    
    const workingCapitalProducts = products.filter(p => 
      p.category && p.category.toLowerCase().includes('working')
    );
    
    console.log(`📈 Working Capital products found: ${workingCapitalProducts.length}`);
    
    // Test with Canadian $49,999 scenario
    const testAmount = 49999;
    const selectedCountryCode = "CA";
    
    let passingCount = 0;
    
    workingCapitalProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name} (${product.lender_name})`);
      console.log(`   Raw amount fields:`, {
        minAmount: product.minAmount,
        maxAmount: product.maxAmount,
        amount_min: product.amount_min,
        amount_max: product.amount_max,
        fundingMin: product.fundingMin,
        fundingMax: product.fundingMax
      });
      
      // Test new logic
      const { min, max } = getAmountRange(product);
      console.log(`   Resolved range: $${min.toLocaleString()}-${max === Infinity ? 'unlimited' : '$' + max.toLocaleString()}`);
      
      const countryMatch = product.country === selectedCountryCode || product.country === 'US/CA';
      const amountMatch = testAmount >= min && testAmount <= max;
      
      console.log(`   Country Match (${selectedCountryCode}): ${countryMatch ? '✅' : '❌'}`);
      console.log(`   Amount Match ($${testAmount.toLocaleString()}): ${amountMatch ? '✅' : '❌'}`);
      
      if (countryMatch && amountMatch) {
        console.log(`   ✅ SHOULD PASS: All criteria met`);
        passingCount++;
      } else {
        console.log(`   ❌ FILTERED OUT`);
      }
    });
    
    console.log(`\n📊 FIXED FILTERING RESULTS:`);
    console.log(`Working Capital products total: ${workingCapitalProducts.length}`);
    console.log(`Should pass with fixed logic: ${passingCount}`);
    
    if (passingCount > 0) {
      console.log(`\n✅ SUCCESS: ${passingCount} Working Capital product(s) should now appear in Step 2`);
    } else {
      console.log(`\n❌ STILL FILTERED: Check field names in products above`);
    }
  })
  .catch(err => console.error('❌ Failed to fetch products:', err));