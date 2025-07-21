// Step 2 Filtering Logic Validation Script
// CLIENT APPLICATION - Inspect /step-2 filtering logic as requested

console.log('🔍 CLIENT APPLICATION - Step 2 Filtering Logic Validation');

window.validateProducts = function() {
  console.log('=== STEP 2 PRODUCT VALIDATION ===');
  
  // Test Working Capital filtering with Canadian business
  const testData = {
    businessLocation: "canada",
    fundingAmount: 49999,
    lookingFor: "capital", 
    accountsReceivableBalance: 0
  };
  
  console.log('🧪 Test scenario:', testData);
  
  // Access cached products
  const products = window.cachedProducts || [];
  console.log(`📊 Total products available: ${products.length}`);
  
  if (products.length === 0) {
    console.log('❌ No products found - check if lender cache is loaded');
    return;
  }
  
  // Filter logic validation - EXACT match engine logic
  const workingCapitalProducts = [];
  const filteredOutProducts = [];
  
  products.forEach(product => {
    const selectedCountryCode = "CA"; // Canada
    const fundingAmount = 49999;
    
    // 1. Country check
    const countryMatch = product.country === selectedCountryCode || product.country === 'US/CA';
    
    // 2. Amount range check - EXACT LOGIC AS REQUESTED
    const amountMatch = product.minAmount <= fundingAmount && 
                       (product.maxAmount === null || product.maxAmount >= fundingAmount);
    
    // 3. Working Capital category check
    const isWorkingCapital = product.category?.toLowerCase().includes('working');
    
    // 4. Business capital product check (excludes equipment)
    const isCapitalProduct = !product.category?.toLowerCase().includes('equipment');
    
    // 5. Invoice factoring exclusion (A/R = 0)
    const isInvoiceFactoring = product.category?.toLowerCase().includes('invoice') || 
                              product.category?.toLowerCase().includes('factoring');
    const factorExclusion = isInvoiceFactoring && testData.accountsReceivableBalance === 0;
    
    const passes = countryMatch && amountMatch && isCapitalProduct && !factorExclusion;
    
    if (isWorkingCapital) {
      workingCapitalProducts.push({
        name: product.name,
        lender: product.lender_name,
        country: product.country,
        minAmount: product.minAmount,
        maxAmount: product.maxAmount,
        category: product.category,
        countryMatch,
        amountMatch,
        isCapitalProduct,
        factorExclusion,
        passes
      });
    }
    
    if (!passes && (isWorkingCapital || product.name?.includes('Advance') || product.name?.includes('Accord'))) {
      filteredOutProducts.push({
        name: product.name,
        reason: !countryMatch ? 'Country mismatch' :
                !amountMatch ? `Amount out of range: $${product.minAmount?.toLocaleString()}-$${product.maxAmount?.toLocaleString()} vs $${fundingAmount.toLocaleString()}` :
                !isCapitalProduct ? 'Equipment product excluded' :
                factorExclusion ? 'Invoice factoring excluded (no A/R)' : 'Unknown'
      });
    }
  });
  
  console.log('\n📈 WORKING CAPITAL ANALYSIS:');
  console.log(`Found ${workingCapitalProducts.length} Working Capital products total`);
  console.log(`Passed filtering: ${workingCapitalProducts.filter(p => p.passes).length}`);
  
  workingCapitalProducts.forEach(product => {
    console.log(`${product.passes ? '✅' : '❌'} ${product.name} (${product.lender}):`, {
      country: product.country,
      amount: `$${product.minAmount?.toLocaleString()}-$${product.maxAmount?.toLocaleString()}`,
      countryMatch: product.countryMatch,
      amountMatch: product.amountMatch,
      passes: product.passes
    });
  });
  
  console.log('\n🚫 FILTERED OUT PRODUCTS:');
  filteredOutProducts.forEach(product => {
    console.log(`❌ ${product.name}: ${product.reason}`);
  });
  
  // Summary for user validation
  const summary = {
    totalProducts: products.length,
    workingCapitalFound: workingCapitalProducts.length,
    workingCapitalPassed: workingCapitalProducts.filter(p => p.passes).length,
    filteredOut: filteredOutProducts.length
  };
  
  console.log('\n📊 VALIDATION SUMMARY:', summary);
  
  return summary;
};

// Quick validation function
window.quickValidation = function() {
  console.log('🏃‍♂️ Quick Product Validation');
  
  const products = window.cachedProducts || [];
  if (products.length === 0) {
    console.log('❌ No products cached - visit step 2 first');
    return;
  }
  
  const workingCapital = products.filter(p => 
    p.category?.toLowerCase().includes('working') && 
    p.country === 'CA' &&
    p.minAmount <= 49999 && 
    (p.maxAmount === null || p.maxAmount >= 49999)
  );
  
  console.log(`📊 Canadian Working Capital products for $49,999: ${workingCapital.length}`);
  workingCapital.forEach(p => console.log(`  • ${p.name} (${p.lender_name}): $${p.minAmount?.toLocaleString()}-$${p.maxAmount?.toLocaleString()}`));
  
  return workingCapital.length;
};

// Auto-run if products are already cached
setTimeout(() => {
  if (window.cachedProducts && window.cachedProducts.length > 0) {
    console.log('🔍 Auto-running validation with cached products...');
    window.validateProducts();
  } else {
    console.log('💡 Run validateProducts() after visiting Step 2 to load product cache');
  }
}, 1000);

console.log('✅ Validation functions ready: validateProducts() and quickValidation()');