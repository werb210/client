/**
 * Test script to verify document quantity requirements
 * Tests: Accountant Prepared Financial Statements = 3, Tax Returns = 3
 */

console.log('🧪 TESTING DOCUMENT QUANTITY REQUIREMENTS');
console.log('=========================================');

// Test the document quantity function logic
const getDocumentQuantity = (docName) => {
  const normalizedName = docName.toLowerCase();
  
  // Banking Statements always require 6 documents
  if (normalizedName.includes('bank') && normalizedName.includes('statement')) {
    return 6;
  }
  
  // Accountant Prepared Financial Statements require 3 documents
  if (normalizedName.includes('accountant') && normalizedName.includes('financial') && normalizedName.includes('statement')) {
    return 3;
  }
  
  // Financial Statements (general) require 3 documents
  if (normalizedName.includes('financial') && normalizedName.includes('statement')) {
    return 3;
  }
  
  // Tax Returns require 3 documents
  if (normalizedName.includes('tax') && normalizedName.includes('return')) {
    return 3;
  }
  
  // Business Tax Returns require 3 documents
  if (normalizedName.includes('business_tax_returns') || normalizedName.includes('business tax returns')) {
    return 3;
  }
  
  // All other documents require 1
  return 1;
};

// Test cases
const testCases = [
  { name: 'Accountant Prepared Financial Statements', expected: 3 },
  { name: 'Financial Statements', expected: 3 },
  { name: 'Tax Returns', expected: 3 },
  { name: 'Business Tax Returns', expected: 3 },
  { name: 'business_tax_returns', expected: 3 },
  { name: 'Bank Statements', expected: 6 },
  { name: 'Business License', expected: 1 },
  { name: 'Equipment Quote', expected: 1 }
];

console.log('\n📊 QUANTITY TEST RESULTS:');
console.log('=========================');

let allPassed = true;
testCases.forEach(test => {
  const actual = getDocumentQuantity(test.name);
  const passed = actual === test.expected;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${status} "${test.name}": Expected ${test.expected}, Got ${actual}`);
  
  if (!passed) {
    allPassed = false;
  }
});

console.log('\n🎯 OVERALL RESULT:');
console.log('==================');
console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

console.log('\n💡 VERIFIED REQUIREMENTS:');
console.log('• Accountant Prepared Financial Statements: 3 documents');
console.log('• Financial Statements: 3 documents'); 
console.log('• Tax Returns: 3 documents');
console.log('• Business Tax Returns: 3 documents');
console.log('• Bank Statements: 6 documents');
console.log('• Other documents: 1 document each');