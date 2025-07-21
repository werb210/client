// Socket.IO Integration Verification Script
// This script validates the complete Socket.IO setup per user specifications

console.log('🧪 Socket.IO Integration Verification Started...');

function verifySocketIntegration() {
  console.log('=== SOCKET.IO INTEGRATION VERIFICATION ===');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Check Script Loading Order
  console.log('\n1️⃣ Script Loading Order Verification');
  if (typeof io !== 'undefined') {
    console.log('✅ Socket.IO script loaded correctly');
    passed++;
  } else {
    console.log('❌ Socket.IO script not loaded');
    failed++;
  }
  
  if (typeof window.globalSocket !== 'undefined') {
    console.log('✅ chat-client.js loaded after Socket.IO');
    passed++;
  } else {
    console.log('❌ chat-client.js not initialized properly');
    failed++;
  }
  
  // Test 2: Connection Verification
  console.log('\n2️⃣ Connection Verification');
  if (window.globalSocket && window.globalSocket.connected) {
    console.log('✅ Socket.IO connected:', window.globalSocket.id);
    console.log('✅ Expected log: "Client connected <socketId>"');
    passed++;
  } else {
    console.log('❌ Socket.IO not connected');
    failed++;
  }
  
  // Test 3: Session Join Verification  
  console.log('\n3️⃣ Session Management');
  const sessionId = sessionStorage.getItem('chatSessionId');
  if (sessionId) {
    console.log('✅ Session ID exists:', sessionId);
    console.log('✅ Expected log: "Client emitted join-session: <sessionId>"');
    passed++;
  } else {
    console.log('❌ No session ID found');
    failed++;
  }
  
  // Test 4: Human Request Function
  console.log('\n4️⃣ Human Request Function Verification');
  if (typeof window.requestHuman === 'function') {
    console.log('✅ requestHuman function available');
    
    // Test the function without actually calling it
    const funcString = window.requestHuman.toString();
    if (funcString.includes('user-request-human')) {
      console.log('✅ requestHuman uses correct event: "user-request-human"');
      passed++;
    } else {
      console.log('❌ requestHuman does not use "user-request-human" event');
      failed++;
    }
    
    if (funcString.includes('userName')) {
      console.log('✅ requestHuman includes userName in payload');
      passed++;
    } else {
      console.log('❌ requestHuman missing userName parameter');
      failed++;
    }
  } else {
    console.log('❌ requestHuman function not available');
    failed += 2;
  }
  
  // Test 5: Welcome Flow Functions
  console.log('\n5️⃣ Welcome Flow Functions');
  const functions = ['startChat', 'waitForUser', 'processUserInput', 'appendBot'];
  functions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      console.log(`✅ ${funcName} function available`);
      passed++;
    } else {
      console.log(`❌ ${funcName} function missing`);
      failed++;
    }
  });
  
  // Test 6: Contact Collection
  console.log('\n6️⃣ Contact Collection System');
  const userName = sessionStorage.getItem('userName');
  const userEmail = sessionStorage.getItem('userEmail');
  
  if (userName) {
    console.log('✅ User name stored:', userName);
    passed++;
  } else {
    console.log('❌ No user name in storage (expected after welcome flow)');
    failed++;
  }
  
  if (userEmail) {
    console.log('✅ User email stored:', userEmail);
    passed++;
  } else {
    console.log('❌ No user email in storage (expected after welcome flow)');
    failed++;
  }
  
  // Summary
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🎯 Score: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED - Socket.IO integration complete!');
  } else if (failed <= 2) {
    console.log('⚠️ Minor issues detected - mostly functional');  
  } else {
    console.log('🚨 Major issues detected - needs attention');
  }
  
  return { passed, failed, score: Math.round((passed / (passed + failed)) * 100) };
}

// Test Human Request (Safe Test)
function testHumanRequestSafely() {
  console.log('\n🧪 TESTING HUMAN REQUEST FUNCTION (Safe Test)');
  
  if (window.requestHuman && window.globalSocket && window.globalSocket.connected) {
    console.log('⚠️ This will send a real human request. Proceed? (Uncomment line below to test)');
    console.log('// window.requestHuman(); // Uncomment to test');
    console.log('Expected console output:');
    console.log('  - "Client emitted requestHuman"');  
    console.log('  - "Client emitted user-request-human: {sessionId, userName}"');
    console.log('Expected server logs:');
    console.log('  - "Server received ask-human: {data}"');
    console.log('  - "Server broadcast ask-human event"');
  } else {
    console.log('❌ Cannot test - Socket.IO not connected or requestHuman not available');
  }
}

// Auto-run verification
setTimeout(() => {
  const result = verifySocketIntegration();
  testHumanRequestSafely();
  
  // Store result globally for debugging
  window.socketVerificationResult = result;
}, 1000);

// Make functions available globally
window.verifySocketIntegration = verifySocketIntegration;
window.testHumanRequestSafely = testHumanRequestSafely;