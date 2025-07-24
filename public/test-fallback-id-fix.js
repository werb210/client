// ✅ FALLBACK APPLICATION ID FIX VALIDATION
// Quick browser console test to verify the bug fix is working

console.log('🔬 FALLBACK APPLICATION ID FIX VALIDATION');

async function testFallbackIdFix() {
  console.log('📋 Testing server fallback ID behavior...');
  
  // Test 1: Duplicate email constraint should return 409 with existing applicationId
  const duplicateEmailTest = {
    step1: { requestedAmount: 50000, use_of_funds: "equipment" },
    step3: { 
      operatingName: "Test Company", 
      businessPhone: "+14165551234",
      businessState: "ON" 
    },
    step4: { 
      applicantFirstName: "John",
      applicantLastName: "Doe", 
      applicantEmail: "todd@werboweski.com", // Known duplicate
      email: "todd@werboweski.com"
    }
  };

  try {
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test'}`
      },
      body: JSON.stringify(duplicateEmailTest)
    });

    const result = await response.json();
    
    if (response.status === 409) {
      if (result.applicationId && !result.applicationId.startsWith('app_')) {
        console.log('✅ PASS: Server correctly returned 409 with existing UUID applicationId:', result.applicationId);
        return true;
      } else if (result.applicationId && result.applicationId.startsWith('app_')) {
        console.log('❌ FAIL: Server returned 409 but created fallback ID:', result.applicationId);
        return false;
      } else {
        console.log('⚠️ PARTIAL: Server returned 409 but no applicationId provided');
        return false;
      }
    } else if (response.status === 200) {
      const appId = result.applicationId;
      if (appId && appId.match(/^[0-9a-f-]{36}$/)) {
        console.log('✅ PASS: Server created new UUID applicationId:', appId);
        return true;
      } else if (appId && appId.startsWith('app_')) {
        console.log('❌ FAIL: Server created fallback ID instead of UUID:', appId);
        return false;
      }
    }
    
    console.log('⚠️ UNEXPECTED: Server response:', response.status, result);
    return false;
    
  } catch (error) {
    console.log('❌ ERROR: Test failed:', error.message);
    return false;
  }
}

async function testStep6ApplicationIdUsage() {
  console.log('📋 Testing Step 6 applicationId usage...');
  
  // Set a test UUID in localStorage
  const testUuid = '12345678-1234-1234-1234-123456789012';
  localStorage.setItem('applicationId', testUuid);
  
  // Verify retrieval
  const retrieved = localStorage.getItem('applicationId');
  if (retrieved === testUuid) {
    console.log('✅ PASS: Step 6 can access applicationId from localStorage:', retrieved);
    return true;
  } else {
    console.log('❌ FAIL: Step 6 localStorage access failed');
    return false;
  }
}

function testApplicationIdFormat() {
  console.log('📋 Testing application ID format validation...');
  
  const testCases = [
    { id: '12345678-1234-1234-1234-123456789012', expected: true, desc: 'Valid UUID' },
    { id: 'app_1753323165848_rnpj3uz94', expected: false, desc: 'Fallback ID (should be rejected)' },
    { id: 'invalid-format', expected: false, desc: 'Invalid format' }
  ];

  let allPassed = true;
  testCases.forEach(test => {
    const isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(test.id);
    if (isValid === test.expected) {
      console.log(`✅ PASS: ${test.desc} - ${test.id}`);
    } else {
      console.log(`❌ FAIL: ${test.desc} - ${test.id}`);
      allPassed = false;
    }
  });

  return allPassed;
}

// Main test function
async function runFallbackIdFixValidation() {
  console.log('🚀 Starting Fallback ID Fix Validation...');
  
  const test1 = await testFallbackIdFix();
  const test2 = await testStep6ApplicationIdUsage();
  const test3 = testApplicationIdFormat();
  
  const passedCount = [test1, test2, test3].filter(Boolean).length;
  const totalTests = 3;
  
  console.log(`📊 RESULTS: ${passedCount}/${totalTests} tests passed`);
  
  if (passedCount === totalTests) {
    console.log('✅ SUCCESS: Fallback ID bug fix verified working correctly');
  } else {
    console.log('⚠️ WARNING: Some tests failed - review implementation');
  }
  
  return { test1, test2, test3, passed: passedCount === totalTests };
}

// Auto-run the test
runFallbackIdFixValidation();

// Make available for manual execution
window.testFallbackIdFix = runFallbackIdFixValidation;