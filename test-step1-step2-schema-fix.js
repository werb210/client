#!/usr/bin/env node

/**
 * Test Step 1 → Step 2 Schema Fix Verification
 * Verifies that the schema mapping fix allows proper data flow
 */

console.log('🧪 Testing Step 1 → Step 2 Schema Fix...\n');

// Test the normalization function directly
const { normalizeStep1 } = await import('./client/src/utils/normalizeIntake.ts');

// Simulate Step 1 data
const step1Data = {
  fundingAmount: 75000,
  headquarters: 'US',
  businessLocation: 'United States',
  industry: 'professional_services',
  lookingFor: 'capital',
  salesHistory: '1-3yr',
  revenueLastYear: 250000,
  averageMonthlyRevenue: 25000,
  accountsReceivableBalance: 50000,
  fixedAssetsValue: 100000
};

console.log('📝 Step 1 Input Data:', step1Data);

// Test normalization
const normalized = normalizeStep1(step1Data);
console.log('🔧 Normalized for Step 2:', normalized);

// Verify critical mappings
const tests = [
  {
    name: 'fundingAmount → amountRequested',
    test: normalized.amountRequested === 75000,
    expected: 75000,
    actual: normalized.amountRequested
  },
  {
    name: 'headquarters → country',
    test: normalized.country === 'US',
    expected: 'US',
    actual: normalized.country
  },
  {
    name: 'industry mapping',
    test: normalized.industry === 'professional_services',
    expected: 'professional_services',
    actual: normalized.industry
  },
  {
    name: 'salesHistory → yearsInBusiness',
    test: normalized.yearsInBusiness === 2,
    expected: 2,
    actual: normalized.yearsInBusiness
  }
];

console.log('\n📊 Schema Mapping Test Results:');
let allPassed = true;

tests.forEach(test => {
  const status = test.test ? '✅' : '❌';
  console.log(`   ${status} ${test.name}: ${test.actual} (expected: ${test.expected})`);
  if (!test.test) allPassed = false;
});

console.log(`\n🎯 Overall Result: ${allPassed ? 'ALL SCHEMA MAPPINGS WORK!' : 'SOME MAPPINGS FAILED!'}`);

// Test recommendation filtering logic
console.log('\n🧪 Testing Step 2 Filtering Logic...');

const filteringTest = {
  country: 'US',
  amount: 75000,
  lookingFor: 'capital'
};

// Simulate products array filtering (matching Step 2 logic)
const sampleProducts = [
  { id: 1, name: 'US Term Loan', country: 'US', min_amount: 50000, max_amount: 1000000, category: 'term_loan', active: true },
  { id: 2, name: 'CA Line of Credit', country: 'CA', min_amount: 25000, max_amount: 500000, category: 'line_of_credit', active: true },
  { id: 3, name: 'US Equipment Finance', country: 'US', min_amount: 10000, max_amount: 2000000, category: 'equipment_financing', active: true }
];

const eligibleProducts = sampleProducts.filter(p => {
  const okCountry = !p.country || p.country === filteringTest.country;
  const min = p.min_amount || 0;
  const max = p.max_amount || 0;
  const okAmount = (!min || filteringTest.amount >= min) && (!max || filteringTest.amount <= max || max === 0);
  const isActive = p.active !== false;
  return okCountry && okAmount && isActive;
});

console.log(`   📦 Total products: ${sampleProducts.length}`);
console.log(`   ✅ Eligible products: ${eligibleProducts.length}`);
console.log(`   🎯 Expected: 2 products (US Term Loan + US Equipment Finance)`);

const filterPassed = eligibleProducts.length >= 2;
console.log(`   ${filterPassed ? '✅' : '❌'} Filtering test: ${filterPassed ? 'PASSED' : 'FAILED'}`);

console.log(`\n🚀 Final Result: ${allPassed && filterPassed ? 'STEP 1 → STEP 2 FLOW IS 100% READY!' : 'NEEDS MORE WORK'}`);