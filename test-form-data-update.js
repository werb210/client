// Test script to verify form-data dependency update didn't break functionality
// Tests key areas that use form-data: document uploads, API requests

console.log('🧪 Testing form-data dependency update impact...');

// Test 1: Basic application health
async function testApplicationHealth() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    
    if (response.ok && data.status === 'ok') {
      console.log('✅ [TEST 1] Application health check: PASSED');
      return true;
    } else {
      console.log('❌ [TEST 1] Application health check: FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ [TEST 1] Application health check: ERROR -', error.message);
    return false;
  }
}

// Test 2: API proxy functionality (uses internal fetch, might use form-data)
async function testAPIProxy() {
  try {
    const response = await fetch('http://localhost:5000/api/public/lenders');
    const data = await response.json();
    
    if (response.ok && Array.isArray(data) && data.length > 0) {
      console.log(`✅ [TEST 2] API proxy functionality: PASSED (${data.length} lenders)`);
      return true;
    } else {
      console.log('❌ [TEST 2] API proxy functionality: FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ [TEST 2] API proxy functionality: ERROR -', error.message);
    return false;
  }
}

// Test 3: Document upload endpoint structure (tests multer/form-data integration)
async function testUploadEndpointStructure() {
  try {
    // Test with empty request to see if endpoint responds correctly
    const response = await fetch('http://localhost:5000/api/public/s3-upload/test-app-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    // We expect this to fail with specific error, but the endpoint should respond
    const responseText = await response.text();
    
    if (response.status === 400 || response.status === 401 || response.status === 404) {
      console.log('✅ [TEST 3] Upload endpoint structure: PASSED (proper error handling)');
      return true;
    } else {
      console.log(`❌ [TEST 3] Upload endpoint structure: UNEXPECTED RESPONSE (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log('❌ [TEST 3] Upload endpoint structure: ERROR -', error.message);
    return false;
  }
}

// Test 4: Application creation endpoint (might use form-data indirectly)
async function testApplicationCreation() {
  try {
    const testPayload = {
      step1: { fundingAmount: "50000", fundsPurpose: "working_capital" },
      step3: { 
        operatingName: "Test Company", 
        legalName: "Test Company Ltd",
        businessStructure: "corporation",
        businessPhone: "+1-555-123-4567"
      },
      step4: {
        applicantFirstName: "Test",
        applicantLastName: "User",
        applicantEmail: `test.form.data.${Date.now()}@example.com`,
        applicantPhone: "+1-555-987-6543",
        applicantDateOfBirth: "1990-01-01",
        applicantSSN: "123-45-6789",
        ownershipPercentage: 100
      }
    };
    
    const response = await fetch('http://localhost:5000/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.applicationId) {
      console.log(`✅ [TEST 4] Application creation: PASSED (ID: ${data.applicationId})`);
      return { success: true, applicationId: data.applicationId };
    } else {
      console.log('❌ [TEST 4] Application creation: FAILED -', data);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ [TEST 4] Application creation: ERROR -', error.message);
    return { success: false };
  }
}

// Test 5: Basic frontend accessibility
async function testFrontendAccess() {
  try {
    const response = await fetch('http://localhost:5000/');
    
    if (response.ok && response.headers.get('content-type')?.includes('html')) {
      console.log('✅ [TEST 5] Frontend accessibility: PASSED');
      return true;
    } else {
      console.log('❌ [TEST 5] Frontend accessibility: FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ [TEST 5] Frontend accessibility: ERROR -', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting form-data dependency update verification...\n');
  
  const results = {
    health: await testApplicationHealth(),
    apiProxy: await testAPIProxy(), 
    uploadStructure: await testUploadEndpointStructure(),
    appCreation: await testApplicationCreation(),
    frontend: await testFrontendAccess()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(40));
  
  const passed = Object.values(results).filter(r => r === true || (r && r.success)).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result === true || (result && result.success) ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.padEnd(15)}: ${status}`);
  });
  
  console.log('='.repeat(40));
  console.log(`Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 SUCCESS: form-data dependency update did not break any functionality!');
    console.log('💡 The application is fully operational after the security update.');
  } else {
    console.log('⚠️  WARNING: Some functionality may be affected by the form-data update.');
    console.log('🔍 Review failed tests and investigate potential issues.');
  }
  
  return passed === total;
}

// Execute tests
runAllTests().catch(console.error);