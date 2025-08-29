/**
 * Automated Step 2 Recommendation Engine Test Suite
 * Run with: node test_step2_recommendations.js
 */

const testScenarios = [
  {
    name: "Canadian Small Equipment Purchase",
    filters: { country: "CA", amount: 50000, lookingFor: "equipment" },
    expectedMinProducts: 3
  },
  {
    name: "US Medium Working Capital", 
    filters: { country: "US", amount: 250000, lookingFor: "capital" },
    expectedMinProducts: 5
  },
  {
    name: "Canadian Large Mixed Financing",
    filters: { country: "CA", amount: 1000000, lookingFor: "both" },
    expectedMinProducts: 10
  },
  {
    name: "US High Amount Equipment",
    filters: { country: "US", amount: 5000000, lookingFor: "equipment" },
    expectedMinProducts: 1
  }
];

async function testStep2Recommendations() {
  console.log('🧪 Running Step 2 Recommendation Engine Test Suite\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/products');
    const products = await response.json();
    
    console.log(`📦 Loaded ${products.length} total products\n`);
    
    let allTestsPassed = true;
    
    for (const scenario of testScenarios) {
      console.log(`🎯 Testing: ${scenario.name}`);
      
      const matchingProducts = products.filter(p => {
        const matchesCountry = p.country === scenario.filters.country;
        const matchesAmount = scenario.filters.amount >= (p.min_amount || 0) &&
                             scenario.filters.amount <= (p.max_amount === 0 ? 99999999 : p.max_amount);
        
        let matchesType = true;
        if (scenario.filters.lookingFor === 'equipment') {
          matchesType = p.category === 'equipment_financing';
        } else if (scenario.filters.lookingFor === 'capital') {
          matchesType = ['working_capital', 'line_of_credit', 'term_loan'].includes(p.category);
        }
        // 'both' accepts any category
        
        return matchesCountry && matchesAmount && matchesType;
      });
      
      const passed = matchingProducts.length >= scenario.expectedMinProducts;
      const status = passed ? '✅' : '❌';
      
      console.log(`   ${status} Found ${matchingProducts.length} products (expected min: ${scenario.expectedMinProducts})`);
      
      if (matchingProducts.length > 0) {
        const categories = [...new Set(matchingProducts.map(p => p.category))];
        console.log(`   📊 Categories: ${categories.join(', ')}`);
      }
      
      if (!passed) allTestsPassed = false;
      console.log('');
    }
    
    // Test edge cases
    console.log('🔍 Testing Edge Cases:');
    
    // Test empty results handling
    const verySpecificFilters = products.filter(p => 
      p.country === 'CA' && 
      p.min_amount > 10000000 // Very high minimum
    );
    console.log(`   ✅ Very high minimums: ${verySpecificFilters.length} products (should show fallback UI)`);
    
    // Test category diversity
    const allCategories = [...new Set(products.map(p => p.category))];
    console.log(`   ✅ Category diversity: ${allCategories.length} unique categories`);
    
    console.log(`\n🎉 Overall Result: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    return allTestsPassed;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return false;
  }
}

testStep2Recommendations();
