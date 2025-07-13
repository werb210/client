/**
 * PAYLOAD VERIFICATION TEST - Step 4 to Staff Backend
 * Run this in browser console to capture and verify the exact payload being sent
 * Specifically checks for field mapping issues causing SignNow population failures
 */

console.log('🧪 Payload Verification Test Active');

// Override fetch to capture POST requests to /public/applications
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  // Capture application creation requests
  if (options?.method === 'POST' && url.includes('/public/applications') && !url.includes('/submit') && !url.includes('/upload')) {
    console.log('\n🚀 INTERCEPTED: Application Creation POST');
    console.log('📍 URL:', url);
    console.log('🔑 Headers:', options.headers);
    
    if (options.body) {
      try {
        const payload = JSON.parse(options.body);
        console.log('\n🟢 Final payload being sent to staff backend:', payload);
        
        // Check payload structure
        console.log('\n📋 Payload structure analysis:');
        console.log('  - Has step1:', !!payload.step1);
        console.log('  - Has step3:', !!payload.step3);  
        console.log('  - Has step4:', !!payload.step4);
        console.log('  - Total root keys:', Object.keys(payload));
        
        // Verify critical fields for SignNow population
        console.log('\n🔍 SignNow field population check:');
        const fundingAmount = payload.step1?.fundingAmount;
        const businessName = payload.step3?.operatingName;
        const firstName = payload.step4?.firstName;
        const personalEmail = payload.step4?.personalEmail;
        
        console.log('  - step1.fundingAmount:', fundingAmount || '[MISSING]');
        console.log('  - step3.operatingName (businessName):', businessName || '[MISSING]');
        console.log('  - step4.firstName:', firstName || '[MISSING]');
        console.log('  - step4.personalEmail:', personalEmail || '[MISSING]');
        
        // Check if all critical fields are present and non-empty
        const criticalFields = [fundingAmount, businessName, firstName, personalEmail];
        const allPresent = criticalFields.every(field => field && field !== '' && field !== 0);
        
        console.log('\n✅ All critical fields present:', allPresent);
        
        if (!allPresent) {
          console.warn('\n⚠️ CRITICAL ISSUE: Missing required fields for SignNow population');
          console.warn('   This will cause fields to be blank in the SignNow document');
          console.warn('   The application may not be properly received by staff backend');
        } else {
          console.log('\n✅ SUCCESS: All required fields present for SignNow population');
        }
        
        // Show step field counts
        console.log('\n📊 Field count verification:');
        console.log('  - step1 fields:', payload.step1 ? Object.keys(payload.step1).length : 0);
        console.log('  - step3 fields:', payload.step3 ? Object.keys(payload.step3).length : 0);
        console.log('  - step4 fields:', payload.step4 ? Object.keys(payload.step4).length : 0);
        
      } catch (e) {
        console.error('❌ Failed to parse request body:', e);
      }
    }
  }
  
  // Call original fetch
  return originalFetch.apply(this, arguments);
};

console.log('💡 Monitoring enabled - submit Step 4 to see payload verification');
console.log('💡 This will verify the exact data being sent to staff backend');
console.log('💡 Watch for "🟢 Final payload being sent to staff backend" messages');

// Function to check current localStorage state
window.checkStoredData = function() {
  const formData = JSON.parse(localStorage.getItem('formData') || '{}');
  console.log('\n📱 Current localStorage data:');
  console.log('  - fundingAmount:', formData.fundingAmount);
  console.log('  - operatingName:', formData.operatingName);
  console.log('  - firstName:', formData.firstName);
  console.log('  - applicationId:', localStorage.getItem('applicationId'));
};