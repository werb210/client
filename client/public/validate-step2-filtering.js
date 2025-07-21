// Step 2 Comprehensive Category & Revenue Filtering Validation
// CLIENT APPLICATION - Audit all categories and revenue filtering

console.log('🔍 COMPREHENSIVE STEP 2 CATEGORY & REVENUE AUDIT');

// Enhanced field access helpers with fallback chains
function getAmountRange(product) {
  return {
    min: product.amount_min ?? product.amountMin ?? product.fundingMin ?? product.minAmount ?? product.min_amount ?? 0,
    max: product.amount_max ?? product.amountMax ?? product.fundingMax ?? product.maxAmount ?? product.max_amount ?? Infinity,
  };
}

function getRevenueMin(product) {
  return product.revenue_min ?? product.revenueMin ?? product.minimumRevenue ?? product.min_revenue ?? 0;
}

window.validateProducts = function() {
  console.log('=== COMPREHENSIVE STEP 2 CATEGORY AUDIT ===');
  
  // Test scenarios with multiple amounts and countries
  const testScenarios = [
    { businessLocation: "canada", fundingAmount: 25000, applicantRevenue: 100000, lookingFor: "capital" },
    { businessLocation: "canada", fundingAmount: 50000, applicantRevenue: 250000, lookingFor: "capital" },
    { businessLocation: "canada", fundingAmount: 250000, applicantRevenue: 500000, lookingFor: "capital" },
    { businessLocation: "united-states", fundingAmount: 50000, applicantRevenue: 200000, lookingFor: "capital" }
  ];
  
  console.log('🧪 Test scenarios:', testScenarios.length);
  
  // Access cached products
  const products = window.cachedProducts || [];
  console.log(`📊 Total products available: ${products.length}`);
  
  if (products.length === 0) {
    console.log('❌ No products found - check if lender cache is loaded');
    return;
  }

  // Group products by category for comprehensive analysis
  const categoryGroups = {};
  const categoryStats = {};
  
  products.forEach(product => {
    const category = product.category || 'unknown';
    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
      categoryStats[category] = { total: 0, hasAmountFields: 0, hasRevenueFields: 0, missingFields: [] };
    }
    categoryGroups[category].push(product);
    categoryStats[category].total++;
    
    // Check field availability
    const { min, max } = getAmountRange(product);
    const revenueMin = getRevenueMin(product);
    
    if (min !== 0 || max !== Infinity) categoryStats[category].hasAmountFields++;
    if (revenueMin > 0) categoryStats[category].hasRevenueFields++;
    
    // Track missing/undefined fields
    const missingFields = [];
    if (product.minAmount === undefined && product.amount_min === undefined) missingFields.push('amount_min');
    if (product.maxAmount === undefined && product.amount_max === undefined) missingFields.push('amount_max');
    if (revenueMin === 0 && product.revenue_min === undefined) missingFields.push('revenue_min');
    
    if (missingFields.length > 0) {
      categoryStats[category].missingFields.push(`${product.name}: ${missingFields.join(', ')}`);
    }
  });

  console.log('\n📋 CATEGORY BREAKDOWN:');
  Object.entries(categoryStats).forEach(([category, stats]) => {
    console.log(`\n${category.toUpperCase()}:`);
    console.log(`  Total products: ${stats.total}`);
    console.log(`  With amount fields: ${stats.hasAmountFields}/${stats.total}`);
    console.log(`  With revenue requirements: ${stats.hasRevenueFields}/${stats.total}`);
    if (stats.missingFields.length > 0) {
      console.log(`  Missing fields: ${stats.missingFields.length} products`);
      stats.missingFields.slice(0, 3).forEach(issue => console.log(`    • ${issue}`));
    }
  });

  // Test filtering for each scenario
  let totalResults = { passed: 0, failed: 0, categories: new Set() };
  
  testScenarios.forEach((scenario, index) => {
    console.log(`\n🧪 SCENARIO ${index + 1}: ${scenario.businessLocation.toUpperCase()} $${scenario.fundingAmount.toLocaleString()} (Revenue: $${scenario.applicantRevenue.toLocaleString()})`);
    
    const selectedCountryCode = scenario.businessLocation === "united-states" ? "US" : "CA";
    let scenarioPassed = 0;
    const scenarioResults = {};
    
    Object.entries(categoryGroups).forEach(([category, categoryProducts]) => {
      let categoryPassed = 0;
      
      categoryProducts.forEach(product => {
        // Apply filtering logic
        const countryMatch = product.country === selectedCountryCode || product.country === 'US/CA';
        const { min, max } = getAmountRange(product);
        const amountMatch = scenario.fundingAmount >= min && scenario.fundingAmount <= max;
        const revenueMin = getRevenueMin(product);
        const revenueMatch = scenario.applicantRevenue >= revenueMin;
        
        const passes = countryMatch && amountMatch && revenueMatch;
        
        if (passes) {
          categoryPassed++;
          scenarioPassed++;
          totalResults.passed++;
          totalResults.categories.add(category);
        } else {
          totalResults.failed++;
        }
      });
      
      if (categoryPassed > 0) {
        scenarioResults[category] = categoryPassed;
      }
    });
    
    console.log(`  ✅ Passed: ${scenarioPassed} products across ${Object.keys(scenarioResults).length} categories`);
    Object.entries(scenarioResults).forEach(([cat, count]) => {
      console.log(`    • ${cat}: ${count} products`);
    });
  });

  console.log('\n📊 COMPREHENSIVE AUDIT SUMMARY:');
  console.log(`Total products tested: ${products.length}`);
  console.log(`Categories found: ${Object.keys(categoryGroups).length}`);
  console.log(`Categories with passing products: ${totalResults.categories.size}`);
  console.log(`Total filter passes: ${totalResults.passed}`);
  console.log(`Total filter failures: ${totalResults.failed}`);
  
  return {
    totalProducts: products.length,
    categories: Object.keys(categoryGroups).length,
    categoryStats,
    totalPassed: totalResults.passed,
    totalFailed: totalResults.failed,
    categoriesWithResults: totalResults.categories.size
  };
};

// Enhanced console helper function for manual testing
window.manualTestFiltering = function() {
  console.log('🧪 MANUAL FILTERING TEST');
  
  const testScenarios = [
    { country: 'CA', amount: 40000, revenue: 200000, category: 'Working Capital', expected: 2 },
    { country: 'CA', amount: 100000, revenue: 300000, category: 'Term Loan', expected: 'multiple' },
    { country: 'US', amount: 50000, revenue: 100000, category: 'MCA', expected: 1 }
  ];
  
  const products = window.cachedProducts || [];
  
  testScenarios.forEach((scenario, index) => {
    console.log(`\n🧪 TEST ${index + 1}: ${scenario.country} $${scenario.amount.toLocaleString()} - ${scenario.category}`);
    
    const selectedCountryCode = scenario.country;
    let matching = 0;
    const matchingProducts = [];
    
    products.forEach(product => {
      // Filter by category if specified
      const categoryMatch = scenario.category === 'Working Capital' ? 
        product.category?.toLowerCase().includes('working') :
        scenario.category === 'Term Loan' ?
        product.category?.toLowerCase().includes('term') :
        scenario.category === 'MCA' ?
        product.category?.toLowerCase().includes('merchant') || product.category?.toLowerCase().includes('cash') :
        true;
      
      if (!categoryMatch) return;
      
      // Apply filtering logic
      const countryMatch = product.country === selectedCountryCode || product.country === 'US/CA';
      const { min, max } = getAmountRange(product);
      const amountMatch = scenario.amount >= min && scenario.amount <= max;
      const revenueMin = getRevenueMin(product);
      const revenueMatch = scenario.revenue >= revenueMin;
      
      const passes = countryMatch && amountMatch && revenueMatch;
      
      if (passes) {
        matching++;
        matchingProducts.push(product.name);
      }
    });
    
    console.log(`  ✅ Found: ${matching} products`);
    console.log(`  Expected: ${scenario.expected}`);
    console.log(`  Products: ${matchingProducts.join(', ')}`);
    
    const success = typeof scenario.expected === 'number' ? 
      matching === scenario.expected : 
      matching >= 1;
    
    console.log(`  Result: ${success ? '✅ PASS' : '❌ FAIL'}`);
  });
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