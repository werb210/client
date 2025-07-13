/**
 * SIGNATURE STATUS POLLING TEST
 * Run this in browser console to test the polling implementation
 */

async function testSignaturePolling() {
  console.log('🧪 Testing Signature Status Polling Implementation');
  
  // Simulate applicationId (replace with real UUID when testing)
  const testApplicationId = localStorage.getItem("applicationId") || "12345678-1234-5678-9abc-123456789012";
  console.log('📋 Using applicationId:', testApplicationId);
  
  // Test the exact polling function from Step 6
  const checkSignatureStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/applications/${testApplicationId}/signature-status`);
      const { status } = await res.json();
      
      console.log('📄 Signature status check:', { applicationId: testApplicationId, status });
      
      if (status === 'invite_signed') {
        console.log('✅ Signature completed - would redirect to Step 7');
        return true; // Signature complete
      }
      
      return false; // Still pending
    } catch (err) {
      console.error('❌ Signature status polling error:', err);
      return false;
    }
  };
  
  // Run a single test check
  console.log('🔄 Testing single status check...');
  const result = await checkSignatureStatus();
  
  if (result) {
    console.log('🎉 SUCCESS: Signature detected and would redirect');
  } else {
    console.log('⏳ PENDING: No signature detected yet');
  }
  
  // Test the polling interval (run for 30 seconds)
  console.log('🔄 Testing 10-second polling interval for 30 seconds...');
  let pollCount = 0;
  
  const interval = setInterval(async () => {
    pollCount++;
    console.log(`📊 Poll #${pollCount} at ${new Date().toLocaleTimeString()}`);
    
    const signed = await checkSignatureStatus();
    
    if (signed) {
      console.log('🎉 Signature detected - stopping polling');
      clearInterval(interval);
    }
    
    if (pollCount >= 3) {
      console.log('⏰ Test complete - 30 seconds of polling finished');
      clearInterval(interval);
    }
  }, 10000);
  
  return {
    testApplicationId,
    checkSignatureStatus,
    stopPolling: () => clearInterval(interval)
  };
}

// Auto-run test when script is loaded
console.log('🔧 Signature Polling Test Script Loaded');
console.log('📋 Run testSignaturePolling() to start testing');

// For manual testing in console
window.testSignaturePolling = testSignaturePolling;