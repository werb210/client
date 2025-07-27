#!/usr/bin/env node

/**
 * Live Debug Panel Test - Exact Input from User
 * Testing: { requestedAmount: 250000, country: "Canada", useOfFunds: "Working capital", productCategory: "Term Loans" }
 */

console.log('🔍 LIVE DEBUG PANEL TEST');
console.log('========================');
console.log('Testing exact input from user requirements:');
console.log(JSON.stringify({
  requestedAmount: 250000,
  country: "Canada", 
  useOfFunds: "Working capital",
  productCategory: "Term Loans"
}, null, 2));

console.log('\n📋 EXPECTED CANADIAN TERM LOAN LENDERS:');
console.log('1. BDC Capital - Growth Capital Term Loan ($50K-$2M) - SHOULD PASS');
console.log('2. Export Development Canada - Small Business Term Loan ($25K-$1M) - SHOULD PASS');
console.log('3. Royal Bank - Business Term Loan (if exists) - SHOULD PASS if Canadian');
console.log('4. TD Bank - Commercial Term Loan (if exists) - SHOULD PASS if Canadian');

console.log('\n🚫 EXPECTED EXCLUSIONS:');
console.log('- US Term Loan products (country mismatch)');
console.log('- Working Capital products (category mismatch)');
console.log('- Small business loans <$250K max (amount out of range)'); 
console.log('- Equipment financing (category mismatch)');

console.log('\n🎯 SCORING EXPECTATIONS:');
console.log('- Country match (Canada): +30 points');
console.log('- Amount fit ($250K): +25 points');
console.log('- Category match (Term Loan): +20 points');
console.log('- Purpose alignment (Working capital): +0 to +15 points');
console.log('- Expected total: 75-90 points for qualifying products');

console.log('\n🔬 TESTING CHECKLIST:');
console.log('[ ] Navigate to /dev/recommendation-debug');
console.log('[ ] Input: Country = Canada');
console.log('[ ] Input: Amount = 250000');
console.log('[ ] Input: Category = Term Loan');
console.log('[ ] Input: Purpose = Working capital');
console.log('[ ] Click "Run Debug Test"');
console.log('[ ] Check Passed tab - are expected lenders present?');
console.log('[ ] Check Failed tab - are missing lenders shown with reasons?');
console.log('[ ] Check Advanced Scoring - are scores 75+ points?');
console.log('[ ] Check Required Documents - Term Loan docs shown?');

console.log('\n⚠️  POTENTIAL BUGS TO IDENTIFY:');
console.log('1. Case sensitivity in country/category matching');
console.log('2. useOfFunds vs productCategory confusion');
console.log('3. Amount range filtering too strict');
console.log('4. Purpose matching too restrictive');
console.log('5. Duplicate filtering logic causing false negatives');

console.log('\n🛠️  IF BUGS FOUND:');
console.log('1. Identify specific filtering logic causing exclusions');
console.log('2. Patch client/src/lib/recommendationEngine.ts');
console.log('3. Make string comparisons case-insensitive');
console.log('4. Fix redundant useOfFunds/productCategory filters');
console.log('5. Adjust minimum confidence threshold if too strict');
console.log('6. Re-test with same input to verify fix');

console.log('\n✅ READY FOR MANUAL TESTING');
console.log('Navigate to /dev/recommendation-debug now');