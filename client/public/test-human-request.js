// Test Human Request Function
// This script tests the "Talk to Human" functionality via Socket.IO

console.log('🧪 Testing Human Request Function...');

function testHumanRequest() {
  console.log('=== Human Request Test ===');
  
  // Check Socket.IO connection
  if (window.globalSocket && window.globalSocket.connected) {
    console.log('✅ Socket.IO connected:', window.globalSocket.id);
  } else {
    console.error('❌ Socket.IO not connected');
    return false;
  }
  
  // Check requestHuman function
  if (typeof window.requestHuman === 'function') {
    console.log('✅ requestHuman function available');
    
    // Test the function
    console.log('🧪 Testing requestHuman()...');
    window.requestHuman();
    
    console.log('✅ Human request function executed');
    console.log('📋 Check server logs for "Client emitted user-request-human" message');
    
    return true;
  } else {
    console.error('❌ requestHuman function not available');
    return false;
  }
}

// Auto-run test
setTimeout(testHumanRequest, 1000);

// Make test function available globally
window.testHumanRequest = testHumanRequest;