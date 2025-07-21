// Direct Step 2 Working Capital Analysis
console.log('🔍 DIRECT STEP 2 WORKING CAPITAL ANALYSIS');

// Fetch products directly and analyze Working Capital filtering
fetch('/api/public/lenders')
  .then(response => response.json())
  .then(data => {
    const products = data.products || [];
    console.log(`📊 Total products available: ${products.length}`);
    
    // Filter Working Capital products
    const workingCapitalProducts = products.filter(p => 
      p.category && p.category.toLowerCase().includes('working')
    );
    
    console.log(`📈 Working Capital products found: ${workingCapitalProducts.length}`);
    
    workingCapitalProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name} (${product.lender_name})`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Country: ${product.country}`);
      console.log(`   Amount Range: $${product.minAmount?.toLocaleString()}-$${product.maxAmount?.toLocaleString()}`);
      
      // Test Canadian $49,999 scenario
      const testAmount = 49999;
      const selectedCountryCode = "CA";
      
      // Apply Step 2 filtering logic
      const countryMatch = product.country === selectedCountryCode || product.country === 'US/CA';
      const amountMatch = product.minAmount <= testAmount && 
                         (product.maxAmount === null || product.maxAmount >= testAmount);
      
      console.log(`   🧪 Test Results for Canadian $${testAmount.toLocaleString()}:`);
      console.log(`      Country Match (${selectedCountryCode}): ${countryMatch ? '✅' : '❌'}`);
      console.log(`      Amount Match: ${amountMatch ? '✅' : '❌'}`);
      
      if (!countryMatch) {
        console.log(`      ❌ FILTERED OUT: Country mismatch (${product.country} vs ${selectedCountryCode})`);
      }
      if (!amountMatch) {
        console.log(`      ❌ FILTERED OUT: Amount out of range ($${product.minAmount?.toLocaleString()}-$${product.maxAmount?.toLocaleString()} vs $${testAmount.toLocaleString()})`);
      }
      if (countryMatch && amountMatch) {
        console.log(`      ✅ SHOULD PASS: All criteria met`);
      }
    });
    
    // Summary
    const canadianWorkingCapital = workingCapitalProducts.filter(p => {
      const testAmount = 49999;
      const selectedCountryCode = "CA";
      const countryMatch = p.country === selectedCountryCode || p.country === 'US/CA';
      const amountMatch = p.minAmount <= testAmount && 
                         (p.maxAmount === null || p.maxAmount >= testAmount);
      return countryMatch && amountMatch;
    });
    
    console.log(`\n📋 SUMMARY FOR CANADIAN $49,999 WORKING CAPITAL:`);
    console.log(`Working Capital products found: ${workingCapitalProducts.length}`);
    console.log(`Should pass filtering: ${canadianWorkingCapital.length}`);
    
    if (workingCapitalProducts.length > canadianWorkingCapital.length) {
      console.log(`\n🚨 ISSUE: ${workingCapitalProducts.length - canadianWorkingCapital.length} Working Capital product(s) being filtered out`);
      const filtered = workingCapitalProducts.filter(p => {
        const testAmount = 49999;
        const selectedCountryCode = "CA";
        const countryMatch = p.country === selectedCountryCode || p.country === 'US/CA';
        const amountMatch = p.minAmount <= testAmount && 
                           (p.maxAmount === null || p.maxAmount >= testAmount);
        return !(countryMatch && amountMatch);
      });
      
      filtered.forEach(p => {
        const testAmount = 49999;
        const selectedCountryCode = "CA";
        const countryMatch = p.country === selectedCountryCode || p.country === 'US/CA';
        const amountMatch = p.minAmount <= testAmount && 
                           (p.maxAmount === null || p.maxAmount >= testAmount);
        
        let reason = '';
        if (!countryMatch) reason += `Country: ${p.country} vs ${selectedCountryCode}; `;
        if (!amountMatch) reason += `Amount: $${p.minAmount?.toLocaleString()}-$${p.maxAmount?.toLocaleString()} vs $${testAmount.toLocaleString()}`;
        
        console.log(`   ❌ ${p.name}: ${reason}`);
      });
    }
  })
  .catch(err => console.error('❌ Failed to fetch products:', err));