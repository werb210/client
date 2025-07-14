/**
 * AUTOCAPITALIZATION TEST SCRIPT
 * Validates that all text input fields have proper autocapitalization attributes
 * Date: July 14, 2025
 */

console.log('🔤 AUTOCAPITALIZATION TEST - VALIDATING TEXT INPUT FIELDS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function testAutocapitalization() {
  const results = {
    step3: {},
    step4: {},
    totalFields: 0,
    correctFields: 0,
    errors: []
  };

  // Test Step 3 fields
  const step3Fields = [
    { name: 'operatingName', expected: 'words', description: 'Business Name (DBA)' },
    { name: 'legalName', expected: 'words', description: 'Business Legal Name' },
    { name: 'businessStreetAddress', expected: 'words', description: 'Business Address' },
    { name: 'businessCity', expected: 'words', description: 'Business City' },
    { name: 'businessWebsite', expected: 'none', description: 'Business Website (URL)' }
  ];

  // Test Step 4 fields
  const step4Fields = [
    { name: 'applicantFirstName', expected: 'words', description: 'Applicant First Name' },
    { name: 'applicantLastName', expected: 'words', description: 'Applicant Last Name' },
    { name: 'applicantEmail', expected: 'none', description: 'Applicant Email' },
    { name: 'applicantAddress', expected: 'words', description: 'Applicant Address' },
    { name: 'applicantCity', expected: 'words', description: 'Applicant City' },
    { name: 'partnerFirstName', expected: 'words', description: 'Partner First Name' },
    { name: 'partnerLastName', expected: 'words', description: 'Partner Last Name' },
    { name: 'partnerEmail', expected: 'none', description: 'Partner Email' }
  ];

  function testFieldsOnPage(fields, stepName) {
    console.log(`\n📋 Testing ${stepName} Fields:`);
    
    fields.forEach(field => {
      results.totalFields++;
      const input = document.querySelector(`input[name="${field.name}"]`);
      
      if (input) {
        const autocapitalize = input.getAttribute('autocapitalize') || input.getAttribute('autoCapitalize');
        
        if (autocapitalize === field.expected) {
          console.log(`✅ ${field.description}: autoCapitalize="${autocapitalize}"`);
          results.correctFields++;
          results[stepName][field.name] = { status: 'correct', value: autocapitalize };
        } else {
          console.log(`❌ ${field.description}: Expected "${field.expected}", got "${autocapitalize}"`);
          results.errors.push(`${field.description}: Expected "${field.expected}", got "${autocapitalize}"`);
          results[stepName][field.name] = { status: 'incorrect', expected: field.expected, actual: autocapitalize };
        }
      } else {
        console.log(`⚠️  ${field.description}: Input field not found on current page`);
        results[stepName][field.name] = { status: 'not_found' };
      }
    });
  }

  // Test current page
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('step-3')) {
    testFieldsOnPage(step3Fields, 'step3');
  } else if (currentPath.includes('step-4')) {
    testFieldsOnPage(step4Fields, 'step4');
  } else {
    console.log('⚠️  Not on Step 3 or Step 4 page. Navigate to /apply/step-3 or /apply/step-4 to test.');
    
    // Test all fields if available
    testFieldsOnPage(step3Fields, 'step3');
    testFieldsOnPage(step4Fields, 'step4');
  }

  // Generate report
  console.log('\n📊 AUTOCAPITALIZATION TEST RESULTS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Correct Fields: ${results.correctFields}/${results.totalFields}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n🔍 ERRORS FOUND:');
    results.errors.forEach(error => console.log(`   • ${error}`));
  }
  
  console.log('\n🎯 FIELD COVERAGE:');
  console.log('   • Text fields (names, addresses, cities): autoCapitalize="words"');
  console.log('   • Email fields: autoCapitalize="none"');
  console.log('   • Phone, postal code, date fields: No autocapitalization (handled by formatting)');
  
  const successRate = Math.round((results.correctFields / results.totalFields) * 100);
  console.log(`\n📈 SUCCESS RATE: ${successRate}%`);
  
  if (successRate === 100) {
    console.log('🎉 ALL AUTOCAPITALIZATION TESTS PASSED!');
  } else {
    console.log('⚠️  Some autocapitalization issues need attention');
  }
  
  return results;
}

// Run the test
const testResults = testAutocapitalization();

// Make results available globally
window.autocapitalizationTest = {
  run: testAutocapitalization,
  results: testResults
};

console.log('\n💡 To run test again: window.autocapitalizationTest.run()');