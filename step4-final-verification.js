/**
 * STEP 4 FINAL PAYLOAD VERIFICATION
 * Paste this into browser console before submitting Step 4
 * Verifies exact payload structure and critical field values
 */

console.log('🧪 Step 4 Final Payload Verification Active');

// Override fetch to capture the exact POST request
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  // Capture POST requests to /public/applications
  if (options?.method === 'POST' && url.includes('/public/applications')) {
    console.log('\n🚀 INTERCEPTED: POST /api/public/applications');
    console.log('📍 URL:', url);
    console.log('🔑 Headers:', options.headers);
    
    if (options.body) {
      try {
        const payload = JSON.parse(options.body);
        console.log('\n🟢 Final payload being sent:', payload);
        
        // Verify structure
        console.log('\n📋 Payload structure verification:');
        console.log('  - step1 present:', !!payload.step1);
        console.log('  - step3 present:', !!payload.step3);  
        console.log('  - step4 present:', !!payload.step4);
        
        // Verify critical values
        console.log('\n🔍 Critical field verification:');
        console.log('  - step1.fundingAmount:', payload.step1?.fundingAmount || '[MISSING]');
        console.log('  - step3.operatingName (businessName):', payload.step3?.operatingName || '[MISSING]');
        console.log('  - step4.firstName:', payload.step4?.firstName || '[MISSING]');
        console.log('  - step4.personalEmail:', payload.step4?.personalEmail || '[MISSING]');
        
        // Check if all critical fields are non-empty
        const criticalFields = [
          payload.step1?.fundingAmount,
          payload.step3?.operatingName,
          payload.step4?.firstName,
          payload.step4?.personalEmail
        ];
        
        const allFieldsPresent = criticalFields.every(field => field && field !== '');
        console.log('\n✅ All critical fields present:', allFieldsPresent);
        
        if (!allFieldsPresent) {
          console.warn('⚠️ MISSING CRITICAL FIELDS - SignNow document may not populate correctly');
        }
        
      } catch (e) {
        console.error('❌ Failed to parse request body:', e);
      }
    }
  }
  
  // Call original fetch
  return originalFetch.apply(this, arguments);
};

console.log('💡 Monitoring enabled - submit Step 4 to see payload verification');
console.log('💡 Look for "🟢 Final payload being sent" messages in console');

// Function to manually check current form state
window.checkCurrentFormData = function() {
  const formData = JSON.parse(localStorage.getItem('formData') || '{}');
  console.log('\n📋 Current form data check:', {
    step1Available: !!formData.step1,
    step3Available: !!formData.step3,
    step4Available: !!formData.step4,
    fundingAmount: formData.fundingAmount || formData.step1?.fundingAmount,
    businessName: formData.operatingName || formData.step3?.operatingName,
    firstName: formData.firstName || formData.step4?.firstName
  });
};