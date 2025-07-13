/**
 * STEP 6 REDIRECT BUG TEST
 * Test the exact conditions that were causing redirects from Step 6
 * Run this in browser console while on Step 6 to verify the fix
 */

console.log('🧪 Starting Step 6 Redirect Bug Test');

// Test 1: Simulate polling API failure (404)
async function testPollingFailure() {
  console.log('🧪 Test 1: Simulating polling API failure (404)');
  
  try {
    const fakeApplicationId = '12345678-1234-5678-9abc-123456789012';
    const res = await fetch(`/api/public/applications/${fakeApplicationId}/signature-status`);
    
    console.log('📡 Response status:', res.status);
    console.log('📡 Response ok:', res.ok);
    
    if (!res.ok) {
      console.log('✅ Test 1 PASSED: API failure does NOT trigger redirect');
      return true;
    } else {
      console.log('⚠️ Test 1 UNEXPECTED: Got 200 OK instead of 404');
      return false;
    }
  } catch (error) {
    console.log('✅ Test 1 PASSED: Network error does NOT trigger redirect');
    return true;
  }
}

// Test 2: Simulate JSON parse error
async function testJSONParseError() {
  console.log('🧪 Test 2: Simulating JSON parse error');
  
  try {
    // This endpoint should return invalid JSON or fail
    const res = await fetch('/api/invalid-endpoint');
    
    if (res.ok) {
      try {
        await res.json();
        console.log('⚠️ Test 2 UNEXPECTED: JSON parsed successfully');
        return false;
      } catch (jsonError) {
        console.log('✅ Test 2 PASSED: JSON parse error does NOT trigger redirect');
        return true;
      }
    } else {
      console.log('✅ Test 2 PASSED: Failed request does NOT trigger redirect');
      return true;
    }
  } catch (error) {
    console.log('✅ Test 2 PASSED: Network error does NOT trigger redirect');
    return true;
  }
}

// Test 3: Check current navigation state
function testNavigationState() {
  console.log('🧪 Test 3: Checking current navigation state');
  
  const currentPath = window.location.pathname;
  console.log('📍 Current path:', currentPath);
  
  if (currentPath.includes('step-6')) {
    console.log('✅ Test 3 PASSED: Still on Step 6 after errors');
    return true;
  } else {
    console.log('❌ Test 3 FAILED: Redirected away from Step 6');
    return false;
  }
}

// Test 4: Monitor for any automatic redirects
function testAutoRedirectPrevention() {
  console.log('🧪 Test 4: Monitoring for automatic redirects (10 seconds)');
  
  const initialPath = window.location.pathname;
  let redirectDetected = false;
  
  const checkInterval = setInterval(() => {
    if (window.location.pathname !== initialPath) {
      console.log('❌ Test 4 FAILED: Automatic redirect detected');
      console.log('📍 From:', initialPath);
      console.log('📍 To:', window.location.pathname);
      redirectDetected = true;
      clearInterval(checkInterval);
    }
  }, 500);
  
  setTimeout(() => {
    clearInterval(checkInterval);
    if (!redirectDetected) {
      console.log('✅ Test 4 PASSED: No automatic redirects detected');
    }
  }, 10000);
  
  return new Promise(resolve => {
    setTimeout(() => resolve(!redirectDetected), 10000);
  });
}

// Run all tests
async function runAllRedirectTests() {
  console.log('🧪 Running comprehensive Step 6 redirect bug tests...');
  
  const test1 = await testPollingFailure();
  const test2 = await testJSONParseError();
  const test3 = testNavigationState();
  const test4 = await testAutoRedirectPrevention();
  
  const allPassed = test1 && test2 && test3 && test4;
  
  console.log('\n📊 Test Results Summary:');
  console.log('Test 1 (Polling Failure):', test1 ? '✅ PASSED' : '❌ FAILED');
  console.log('Test 2 (JSON Parse Error):', test2 ? '✅ PASSED' : '❌ FAILED');
  console.log('Test 3 (Navigation State):', test3 ? '✅ PASSED' : '❌ FAILED');
  console.log('Test 4 (Auto Redirect Prevention):', test4 ? '✅ PASSED' : '❌ FAILED');
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED: Step 6 redirect bug is FIXED!');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED: Step 6 redirect bug may still exist');
  }
  
  return allPassed;
}

// Auto-run if on Step 6
if (window.location.pathname.includes('step-6')) {
  console.log('🎯 Detected Step 6 - running tests automatically');
  runAllRedirectTests();
} else {
  console.log('📍 Not on Step 6 - navigate to Step 6 and run: runAllRedirectTests()');
}

// Expose test functions globally
window.runAllRedirectTests = runAllRedirectTests;
window.testPollingFailure = testPollingFailure;
window.testJSONParseError = testJSONParseError;
window.testNavigationState = testNavigationState;
window.testAutoRedirectPrevention = testAutoRedirectPrevention;

export { runAllRedirectTests };