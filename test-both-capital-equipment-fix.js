/**
 * TEST: "Both Capital & Equipment" Filtering Fix
 * Purpose: Validate that equipment-only products are excluded when user selects "both"
 */

console.log('🧪 TESTING "BOTH CAPITAL & EQUIPMENT" FILTERING FIX');
console.log('==================================================');

// Test scenario based on user's actual case
const testScenario = {
  name: "User Case: $700K Capital + $400K Equipment",
  formData: {
    businessLocation: "CA",
    headquarters: "CA", 
    industry: "agriculture",
    lookingFor: "both",
    fundingAmount: 700000,
    fundsPurpose: "expansion",
    revenueLastYear: 1000000,
    averageMonthlyRevenue: 100000,
    accountsReceivableBalance: 3000000,
    equipmentValue: 400000
  }
};

// Mock products based on console logs
const mockProducts = [
  {
    name: "Equipment Finance",
    category: "Equipment Financing",
    country: "CA",
    min_amount: 10000,
    max_amount: 5000000,
    lender_name: "Meridian OneCap Credit Corp",
    isEquipmentOnly: true
  },
  {
    name: "Purchase Order Financing", 
    category: "Purchase Order Financing",
    country: "CA",
    min_amount: 250000,
    max_amount: 5000000,
    lender_name: "Capitally",
    isEquipmentOnly: false
  },
  {
    name: "Invoice Factoring",
    category: "Invoice Factoring",
    country: "CA", 
    min_amount: 10000,
    max_amount: 30000000,
    lender_name: "Factoring Corp",
    isEquipmentOnly: false
  },
  {
    name: "Working Capital Loan",
    category: "Working Capital",
    country: "CA",
    min_amount: 15000,
    max_amount: 800000,
    lender_name: "Advance Funds Network",
    isEquipmentOnly: false
  }
];

function isBusinessCapitalProduct(category) {
  const capitalCategories = [
    'Working Capital',
    'Business Line of Credit', 
    'Term Loan',
    'Business Term Loan',
    'SBA Loan',
    'Asset Based Lending',
    'Invoice Factoring',
    'Purchase Order Financing'
  ];
  
  const categoryLower = category.toLowerCase();
  return capitalCategories.some(cat => 
    categoryLower.includes(cat.toLowerCase()) ||
    cat.toLowerCase().includes(categoryLower)
  );
}

function isEquipmentFinancingProduct(category) {
  const equipmentCategories = [
    'Equipment Financing',
    'Equipment Finance',
    'Asset-Based Lending',
    'Asset Based Lending'
  ];
  
  return equipmentCategories.some(cat => 
    category.toLowerCase().includes(cat.toLowerCase()) ||
    cat.toLowerCase().includes(category.toLowerCase())
  );
}

function testBothFiltering(scenario, products) {
  console.log(`\n🔍 Testing: ${scenario.name}`);
  console.log('=' .repeat(50));
  
  const { fundingAmount, lookingFor, accountsReceivableBalance } = scenario.formData;
  const results = {
    includedProducts: [],
    excludedEquipmentOnly: [],
    totalProcessed: 0
  };
  
  products.forEach(product => {
    results.totalProcessed++;
    
    // Basic filtering (country, amount)
    const countryMatch = product.country === "CA";
    const amountMatch = fundingAmount >= product.min_amount && fundingAmount <= product.max_amount;
    
    if (!countryMatch || !amountMatch) {
      console.log(`   ❌ BASIC FILTER: ${product.name} (country: ${countryMatch}, amount: ${amountMatch})`);
      return;
    }
    
    // "Both" filtering logic
    if (lookingFor === "both") {
      const isCapitalProduct = isBusinessCapitalProduct(product.category);
      const isEquipmentProduct = isEquipmentFinancingProduct(product.category);
      
      // NEW LOGIC: Exclude equipment-only products when user selects "both"
      if (isEquipmentProduct && !isCapitalProduct) {
        results.excludedEquipmentOnly.push(product);
        console.log(`   🔄 BOTH FILTER: ${product.name} (${product.category}) → EXCLUDED (Equipment-only)`);
        return;
      }
      
      // Only include capital products (which can be used for equipment too)
      if (!isCapitalProduct) {
        console.log(`   ❌ BOTH FILTER: ${product.name} (${product.category}) → EXCLUDED (Not capital product)`);
        return;
      }
    }
    
    // Invoice Factoring special check
    if (product.category.toLowerCase().includes('invoice') && accountsReceivableBalance === 0) {
      console.log(`   ❌ A/R CHECK: ${product.name} → EXCLUDED (No A/R balance)`);
      return;
    }
    
    // Passed all filters
    results.includedProducts.push(product);
    console.log(`   ✅ INCLUDED: ${product.name} (${product.category})`);
  });
  
  return results;
}

// Run the test
const results = testBothFiltering(testScenario, mockProducts);

console.log('\n📊 TEST RESULTS SUMMARY');
console.log('========================');
console.log(`Total Products Processed: ${results.totalProcessed}`);
console.log(`Products Included: ${results.includedProducts.length}`);
console.log(`Equipment-Only Excluded: ${results.excludedEquipmentOnly.length}`);

console.log('\n✅ INCLUDED PRODUCTS:');
results.includedProducts.forEach(p => {
  console.log(`   • ${p.name} (${p.category}) - ${p.lender_name}`);
});

console.log('\n🔄 EQUIPMENT-ONLY PRODUCTS EXCLUDED:');
results.excludedEquipmentOnly.forEach(p => {
  console.log(`   • ${p.name} (${p.category}) - Was excluded because it's equipment-only`);
});

console.log('\n🎯 VALIDATION:');
console.log('=============');

const expectedExclusions = mockProducts.filter(p => p.isEquipmentOnly);
const actualExclusions = results.excludedEquipmentOnly;

if (actualExclusions.length === expectedExclusions.length) {
  console.log('✅ PASS: Equipment-only products correctly excluded');
} else {
  console.log('❌ FAIL: Equipment-only exclusion not working properly');
}

const shouldInclude = ['Purchase Order Financing', 'Invoice Factoring', 'Working Capital'];
const actualCategories = results.includedProducts.map(p => p.category);

const correctInclusions = shouldInclude.every(cat => 
  actualCategories.some(actual => actual.includes(cat))
);

if (correctInclusions) {
  console.log('✅ PASS: Capital products correctly included');
} else {
  console.log('❌ FAIL: Some capital products missing');
  console.log(`   Expected: ${shouldInclude.join(', ')}`);
  console.log(`   Actual: ${actualCategories.join(', ')}`);
}

console.log('\n💡 KEY INSIGHTS:');
console.log('• Equipment Financing should NOT appear when user selects "Both"');
console.log('• Only capital products that can be used for equipment should show');
console.log('• This prevents confusion about equipment-only vs dual-purpose products');
console.log('• User gets clearer understanding of hybrid financing options');