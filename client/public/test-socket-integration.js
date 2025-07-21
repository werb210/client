// Socket.IO Integration Test Script
// This script verifies Socket.IO connection, training data, and chat functionality

console.log('🧪 Starting Socket.IO Integration Test...');

// Test 1: Check Socket.IO availability
function testSocketAvailability() {
  if (typeof io !== 'undefined') {
    console.log('✅ Socket.IO is available globally');
    return true;
  } else {
    console.error('❌ Socket.IO is NOT available - check script loading order');
    return false;
  }
}

// Test 2: Check global socket connection
function testGlobalSocket() {
  if (window.globalSocket && window.globalSocket.connected) {
    console.log('✅ Global socket is connected:', window.globalSocket.id);
    return true;
  } else {
    console.warn('⚠️ Global socket not connected or available');
    return false;
  }
}

// Test 3: Test session ID generation
function testSessionId() {
  if (window.globalSessionId) {
    console.log('✅ Session ID generated:', window.globalSessionId);
    return true;
  } else {
    console.warn('⚠️ No session ID found');
    return false;
  }
}

// Test 4: Test human request function
function testHumanRequest() {
  if (typeof window.requestHuman === 'function') {
    console.log('✅ requestHuman function is available');
    return true;
  } else {
    console.warn('⚠️ requestHuman function not available');
    return false;
  }
}

// Test 5: Test training data endpoint
async function testTrainingData() {
  try {
    const response = await fetch('/api/training-data');
    const data = await response.json();
    
    if (data.totalExamples > 0) {
      console.log(`✅ Training data loaded: ${data.totalExamples} examples`);
      return true;
    } else {
      console.warn('⚠️ No training examples found');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to fetch training data:', error);
    return false;
  }
}

// Run all tests
async function runIntegrationTests() {
  console.log('📋 Running Socket.IO Integration Tests...\n');
  
  const results = {
    socketAvailable: testSocketAvailability(),
    globalSocket: testGlobalSocket(),
    sessionId: testSessionId(),
    humanRequest: testHumanRequest(),
    trainingData: await testTrainingData()
  };
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All Socket.IO integration tests PASSED! System is operational.');
  } else {
    console.log('⚠️ Some tests failed. Check the issues above.');
  }
  
  return results;
}

// Auto-run tests when this script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runIntegrationTests);
} else {
  runIntegrationTests();
}

// Make test function available globally for manual testing
window.testSocketIOIntegration = runIntegrationTests;