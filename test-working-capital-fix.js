/**
 * TEST: Working Capital and LOC Override Fix
 * Purpose: Verify both Working Capital and LOC products are included correctly
 */

console.log('🧪 TESTING WORKING CAPITAL + LOC OVERRIDE FIX');
console.log('===============================================');

// Import the field access helpers (simulated)
function matchesCategory(userSelection, productCategory) {
  if (!productCategory) return false;
  
  // Direct match first
  if (productCategory.toLowerCase().includes(userSelection.toLowerCase())) {
    return true;
  }
  
  // Category map
  const CATEGORY_MAP = {
    equipment: [
      "Equipment Financing", "equipment_financing", "equipment", "Equipment Loan"
    ],
    working_capital: [
      "Working Capital", "Working Capital Loan", "Working Capital Financing", "Term Loan", 
      "Loan", "Business Loan", "working_capital", "term_loan"
    ],
    factoring: [
      "Invoice Factoring", "AR Factoring", "Factor+", "Factoring", "invoice_factoring"
    ],
    "line of credit": [
      "Line of Credit", "Business Line of Credit", "LOC", "Credit Line", 
      "line_of_credit", "business_line_of_credit"
    ],
    purchase_order: [
      "Purchase Order Financing", "PO Financing", "purchase_order", "po_financing"
    ]
  };
  
  // Fuzzy matching with aliases
  const aliases = CATEGORY_MAP[userSelection.toLowerCase()] || [];
  return aliases.some(alias => 
    productCategory.toLowerCase().includes(alias.toLowerCase())
  );
}

function isBusinessCapitalProduct(category) {
  if (!category) return false;
  
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

// Test products from console logs
const testProducts = [
  {
    name: "Working Capital Loan",
    category: "Working Capital",
    country: "CA",
    amount_min: 15000,
    amount_max: 800000,
    lender_name: "Advance Funds Network"
  },
  {
    name: "Flex Line",
    category: "Business Line of Credit",
    country: "CA",
    amount_min: 20000,
    amount_max: 150000,
    lender_name: "Accord Financial"
  },
  {
    name: "Business Line",
    category: "Business Line of Credit", 
    country: "CA",
    amount_min: 150000,
    amount_max: 250000,
    lender_name: "Accord Financial"
  },
  {
    name: "Purchase Order Financing",
    category: "Purchase Order Financing",
    country: "CA",
    amount_min: 250000,
    amount_max: 5000000,
    lender_name: "Capitally"
  }
];

const userScenario = {
  headquarters: "CA",
  fundingAmount: 600000,
  lookingFor: "capital",
  accountsReceivableBalance: 3000000,
  fundsPurpose: "expansion"
};

console.log('\n🔍 TESTING SCENARIO:');
console.log(`   Amount: $${userScenario.fundingAmount.toLocaleString()}`);
console.log(`   Country: ${userScenario.headquarters}`);
console.log(`   Looking For: ${userScenario.lookingFor}`);

console.log('\n📋 PRODUCT FILTERING RESULTS:');
console.log('=' .repeat(50));

testProducts.forEach((product, index) => {
  console.log(`\n${index + 1}. ${product.name} (${product.category})`);
  
  // Country check
  const countryMatch = product.country === userScenario.headquarters;
  
  // Amount check
  const amountMatch = userScenario.fundingAmount >= product.amount_min && 
                     userScenario.fundingAmount <= product.amount_max;
  
  // LOC override check
  const isLOC = matchesCategory('line of credit', product.category);
  const locOverride = isLOC && countryMatch && amountMatch;
  
  // Business capital check
  const isCapitalProduct = isBusinessCapitalProduct(product.category);
  
  // Working Capital specific check
  const isWorkingCapital = matchesCategory('working_capital', product.category);
  
  // Standard match
  const standardMatch = countryMatch && amountMatch && isCapitalProduct;
  
  // Final decision
  const shouldInclude = standardMatch || locOverride;
  
  console.log(`   Country Match: ${countryMatch ? '✅' : '❌'} (${product.country} = ${userScenario.headquarters})`);
  console.log(`   Amount Match: ${amountMatch ? '✅' : '❌'} ($${product.amount_min.toLocaleString()}-$${product.amount_max.toLocaleString()} vs $${userScenario.fundingAmount.toLocaleString()})`);
  console.log(`   Is LOC: ${isLOC ? '✅' : '❌'}`);
  console.log(`   LOC Override: ${locOverride ? '✅ FORCE INCLUDE' : '❌'}`);
  console.log(`   Is Capital Product: ${isCapitalProduct ? '✅' : '❌'}`);
  console.log(`   Is Working Capital: ${isWorkingCapital ? '✅' : '❌'}`);
  console.log(`   Standard Match: ${standardMatch ? '✅' : '❌'}`);
  console.log(`   FINAL RESULT: ${shouldInclude ? '✅ INCLUDED' : '❌ EXCLUDED'}`);
});

console.log('\n🎯 SUMMARY:');
console.log('=' .repeat(30));

const included = testProducts.filter(product => {
  const countryMatch = product.country === userScenario.headquarters;
  const amountMatch = userScenario.fundingAmount >= product.amount_min && 
                     userScenario.fundingAmount <= product.amount_max;
  const isLOC = matchesCategory('line of credit', product.category);
  const locOverride = isLOC && countryMatch && amountMatch;
  const isCapitalProduct = isBusinessCapitalProduct(product.category);
  const standardMatch = countryMatch && amountMatch && isCapitalProduct;
  return standardMatch || locOverride;
});

console.log(`Total Products Tested: ${testProducts.length}`);
console.log(`Products Included: ${included.length}`);
console.log(`\nIncluded Products:`);
included.forEach(p => {
  console.log(`   • ${p.name} (${p.category})`);
});

console.log('\n✅ EXPECTED RESULTS:');
console.log('   • Working Capital Loan should be INCLUDED ($600K fits in $15K-$800K)');
console.log('   • LOC products should be EXCLUDED ($600K exceeds their maximums)');
console.log('   • Purchase Order Financing should be INCLUDED ($600K fits in $250K-$5M)');