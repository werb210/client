/**
 * Test script for retry system functionality
 */

console.log('🧪 [RETRY TEST] Testing retry system functionality...');

// Test 1: Add a mock failed application to retry queue
const mockApplicationData = {
  step1: { fundingAmount: 50000, businessLocation: 'CA' },
  step3: { operatingName: 'Test Company', businessPhone: '+1234567890' },
  step4: { applicantFirstName: 'Test', applicantLastName: 'User', applicantEmail: 'test@example.com' }
};

// Test adding to retry queue
if (typeof addToRetryQueue !== 'undefined') {
  addToRetryQueue({
    applicationId: 'test-app-123',
    payload: mockApplicationData,
    type: 'application',
    error: 'Test network error'
  });
  
  console.log('✅ [RETRY TEST] Added test application to retry queue');
} else {
  console.log('❌ [RETRY TEST] addToRetryQueue function not available');
}

// Test getting queue summary
if (typeof getRetryQueueSummary !== 'undefined') {
  const summary = getRetryQueueSummary();
  console.log('📊 [RETRY TEST] Queue summary:', summary);
} else {
  console.log('❌ [RETRY TEST] getRetryQueueSummary function not available');
}

// Test manual retry (will fail due to network, but should attempt)
setTimeout(() => {
  if (typeof manualRetryAll !== 'undefined') {
    console.log('🔄 [RETRY TEST] Testing manual retry...');
    manualRetryAll().catch(error => {
      console.log('⚠️ [RETRY TEST] Manual retry failed as expected:', error.message);
    });
  } else {
    console.log('❌ [RETRY TEST] manualRetryAll function not available');
  }
}, 1000);

console.log('🧪 [RETRY TEST] Test script completed');