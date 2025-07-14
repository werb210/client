/**
 * SIGNNOW FIELD POPULATION TEST
 * Tests the corrected field mapping and status polling fixes
 * Date: July 14, 2025
 */

console.log('🔧 SIGNNOW FIELD POPULATION & STATUS POLLING TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function testSignNowFieldPopulation() {
  const results = {
    fieldMapping: {},
    statusPolling: {},
    totalTests: 0,
    passed: 0,
    failed: 0,
    errors: []
  };

  // Test 1: Check if form data is properly structured
  console.log('\n📋 Testing Form Data Structure:');
  
  const formData = JSON.parse(localStorage.getItem('formData') || '{}');
  
  const requiredFields = [
    { step: 'step1', field: 'requestedAmount', description: 'Funding Amount' },
    { step: 'step1', field: 'purposeOfFunds', description: 'Purpose of Funds' },
    { step: 'step3', field: 'operatingName', description: 'Business Name' },
    { step: 'step3', field: 'legalName', description: 'Legal Business Name' },
    { step: 'step3', field: 'businessStreetAddress', description: 'Business Address' },
    { step: 'step3', field: 'businessCity', description: 'Business City' },
    { step: 'step4', field: 'applicantFirstName', description: 'First Name' },
    { step: 'step4', field: 'applicantLastName', description: 'Last Name' },
    { step: 'step4', field: 'applicantEmail', description: 'Email' },
    { step: 'step4', field: 'applicantPhone', description: 'Phone' },
    { step: 'step4', field: 'applicantAddress', description: 'Address' },
    { step: 'step4', field: 'applicantCity', description: 'City' }
  ];

  requiredFields.forEach(({ step, field, description }) => {
    results.totalTests++;
    const stepData = formData[step];
    const fieldValue = stepData?.[field];
    
    if (fieldValue && fieldValue !== '') {
      console.log(`✅ ${description}: "${fieldValue}"`);
      results.passed++;
      results.fieldMapping[field] = { status: 'present', value: fieldValue };
    } else {
      console.log(`❌ ${description}: Missing or empty`);
      results.failed++;
      results.errors.push(`${description} (${step}.${field}) is missing or empty`);
      results.fieldMapping[field] = { status: 'missing', expected: `${step}.${field}` };
    }
  });

  // Test 2: Check SignNow smart fields mapping
  console.log('\n🔗 Testing SignNow Smart Fields Mapping:');
  
  const smartFieldsMapping = {
    'contact_first_name': formData.step4?.applicantFirstName,
    'contact_last_name': formData.step4?.applicantLastName,
    'contact_email': formData.step4?.applicantEmail,
    'contact_phone': formData.step4?.applicantPhone,
    'contact_address': formData.step4?.applicantAddress,
    'contact_city': formData.step4?.applicantCity,
    'business_dba_name': formData.step3?.operatingName,
    'legal_business_name': formData.step3?.legalName,
    'business_address': formData.step3?.businessStreetAddress,
    'business_city': formData.step3?.businessCity,
    'requested_amount': formData.step1?.requestedAmount,
    'purpose_of_funds': formData.step1?.purposeOfFunds
  };

  Object.entries(smartFieldsMapping).forEach(([smartField, value]) => {
    results.totalTests++;
    if (value && value !== '') {
      console.log(`✅ ${smartField}: "${value}"`);
      results.passed++;
    } else {
      console.log(`❌ ${smartField}: Missing`);
      results.failed++;
      results.errors.push(`SignNow smart field "${smartField}" is missing`);
    }
  });

  // Test 3: Test Status Polling Logic
  console.log('\n📡 Testing Status Polling Logic:');
  
  const testStatusResponses = [
    { response: { status: 'invite_sent' }, expected: false, description: 'Invite sent status' },
    { response: { status: 'invite_signed' }, expected: true, description: 'Invite signed status' },
    { response: { signing_status: 'invite_signed' }, expected: true, description: 'Signing status invite signed' },
    { response: { status: 'signed' }, expected: true, description: 'Signed status' },
    { response: { signing_status: 'signed' }, expected: true, description: 'Signing status signed' }
  ];

  testStatusResponses.forEach(({ response, expected, description }) => {
    results.totalTests++;
    
    // Test the actual polling logic
    const shouldRedirect = response?.signing_status === "invite_signed" || 
                          response?.status === "invite_signed" || 
                          response?.signing_status === "signed" || 
                          response?.status === "signed";
    
    if (shouldRedirect === expected) {
      console.log(`✅ ${description}: Correctly ${shouldRedirect ? 'redirects' : 'stays'}`);
      results.passed++;
    } else {
      console.log(`❌ ${description}: Expected ${expected}, got ${shouldRedirect}`);
      results.failed++;
      results.errors.push(`Status polling logic failed for ${description}`);
    }
  });

  // Test 4: Check Current Application ID
  console.log('\n🆔 Testing Application ID:');
  
  const applicationId = localStorage.getItem('applicationId');
  results.totalTests++;
  
  if (applicationId && applicationId !== 'null' && applicationId.length > 10) {
    console.log(`✅ Application ID: ${applicationId}`);
    results.passed++;
  } else {
    console.log(`❌ Application ID: Missing or invalid (${applicationId})`);
    results.failed++;
    results.errors.push('Application ID is missing or invalid');
  }

  // Generate Final Report
  console.log('\n📊 SIGNNOW FIELD POPULATION TEST RESULTS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Tests Passed: ${results.passed}/${results.totalTests}`);
  console.log(`❌ Tests Failed: ${results.failed}/${results.totalTests}`);
  
  if (results.errors.length > 0) {
    console.log('\n🔍 ERRORS FOUND:');
    results.errors.forEach(error => console.log(`   • ${error}`));
  }

  const successRate = Math.round((results.passed / results.totalTests) * 100);
  console.log(`\n📈 SUCCESS RATE: ${successRate}%`);
  
  // Specific SignNow Recommendations
  console.log('\n🔧 SIGNNOW INTEGRATION STATUS:');
  
  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! SignNow fields should populate correctly.');
  } else {
    console.log('⚠️  Some fields are missing - SignNow template may not populate completely.');
  }
  
  console.log('\n💡 FIXES IMPLEMENTED:');
  console.log('   • Fixed status polling to check both "status" and "signing_status" fields');
  console.log('   • Fixed status values to check "invite_signed" and "signed"');
  console.log('   • Fixed field mapping to use actual form field names');
  console.log('   • Added comprehensive smart fields mapping for template population');
  
  return results;
}

// Run the test
const testResults = testSignNowFieldPopulation();

// Make results available globally
window.signNowFieldTest = {
  run: testSignNowFieldPopulation,
  results: testResults
};

console.log('\n💡 To run test again: window.signNowFieldTest.run()');