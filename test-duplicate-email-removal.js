/**
 * Test Script: Duplicate Email Removal Verification
 * Verifies that duplicate emails no longer block application submission
 */

const API_BASE_URL = window.location.origin;

async function testDuplicateEmailRemoval() {
  console.log('🧪 TESTING: Duplicate Email Removal Verification');
  console.log('📋 Expected behavior: All submissions return HTTP 200 regardless of email duplication');
  
  const duplicateEmailPayload = {
    step1: {
      requestedAmount: 45000,
      use_of_funds: "capital",
      businessLocation: "CA",
      selectedCategory: "Working Capital"
    },
    step3: {
      operatingName: "Test Company A",
      legalName: "Test Company A", 
      businessName: "Test Company A",
      businessPhone: "+18888888888",
      businessState: "AB"
    },
    step4: {
      applicantFirstName: "John",
      applicantLastName: "Smith", 
      applicantEmail: "duplicate.test@example.com", // Same email for multiple tests
      applicantPhone: "+15878881837",
      email: "duplicate.test@example.com"
    }
  };
  
  // Test 1: First submission with duplicate email
  console.log('\n🧪 TEST 1: First submission with test email');
  const response1 = await submitApplication(duplicateEmailPayload, 1);
  
  // Test 2: Second submission with same email
  console.log('\n🧪 TEST 2: Second submission with same email (should not block)');
  duplicateEmailPayload.step3.operatingName = "Test Company B";
  duplicateEmailPayload.step4.applicantFirstName = "Jane";
  const response2 = await submitApplication(duplicateEmailPayload, 2);
  
  // Test 3: Third submission with same email
  console.log('\n🧪 TEST 3: Third submission with same email (should not block)');
  duplicateEmailPayload.step3.operatingName = "Test Company C";
  duplicateEmailPayload.step4.applicantFirstName = "Bob";
  const response3 = await submitApplication(duplicateEmailPayload, 3);
  
  console.log('\n✅ DUPLICATE EMAIL REMOVAL TEST COMPLETE');
  console.log('📊 Summary:');
  console.log(`   - Test 1: ${response1.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   - Test 2: ${response2.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   - Test 3: ${response3.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (response1.success && response2.success && response3.success) {
    console.log('🎉 ALL TESTS PASSED: Duplicate email blocking has been successfully removed!');
    return true;
  } else {
    console.log('❌ SOME TESTS FAILED: Check individual test results above');
    return false;
  }
}

async function submitApplication(payload, testNumber) {
  try {
    console.log(`📤 Submitting test ${testNumber} application...`);
    
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`📊 Test ${testNumber} Response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Test ${testNumber} SUCCESS: Application ID ${result.applicationId}`);
      return {
        success: true,
        status: response.status,
        applicationId: result.applicationId,
        message: result.message
      };
    } else {
      const error = await response.text();
      console.log(`❌ Test ${testNumber} FAILED: ${response.status} - ${error}`);
      return {
        success: false,
        status: response.status,
        error: error
      };
    }
  } catch (error) {
    console.error(`❌ Test ${testNumber} NETWORK ERROR:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Make function available globally
window.testDuplicateEmailRemoval = testDuplicateEmailRemoval;

console.log('🔧 Duplicate Email Removal Test loaded');
console.log('🔧 Run: window.testDuplicateEmailRemoval()');