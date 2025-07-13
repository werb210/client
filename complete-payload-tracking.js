/**
 * COMPLETE PAYLOAD TRACKING - Client to Staff Backend
 * Run this in browser console to track the complete data flow
 * Shows exactly what happens from form submission to staff backend response
 */

console.log('🧪 Complete Payload Tracking Active');

// Override fetch to capture the complete flow
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  // Capture POST requests to /public/applications
  if (options?.method === 'POST' && url.includes('/public/applications')) {
    console.log('\n🚀 [CLIENT] Application submission intercepted');
    console.log('📍 [CLIENT] URL:', url);
    console.log('🔑 [CLIENT] Headers:', options.headers);
    
    if (options.body) {
      try {
        const payload = JSON.parse(options.body);
        console.log('\n🟢 [CLIENT] Final payload being sent to server:', payload);
        
        // Detailed payload analysis
        console.log('\n📊 [CLIENT] Payload Structure Analysis:');
        console.log('  Step 1 fields:', Object.keys(payload.step1 || {}));
        console.log('  Step 3 fields:', Object.keys(payload.step3 || {}));
        console.log('  Step 4 fields:', Object.keys(payload.step4 || {}));
        
        // Critical values
        console.log('\n🔍 [CLIENT] Critical Values Check:');
        console.log('  fundingAmount:', payload.step1?.fundingAmount, typeof payload.step1?.fundingAmount);
        console.log('  operatingName:', payload.step3?.operatingName, typeof payload.step3?.operatingName);
        console.log('  firstName:', payload.step4?.firstName, typeof payload.step4?.firstName);
        console.log('  personalEmail:', payload.step4?.personalEmail, typeof payload.step4?.personalEmail);
        
        // Check for empty strings or zero values
        const isEmpty = (value) => value === '' || value === 0 || value === null || value === undefined;
        console.log('\n⚠️ [CLIENT] Empty Value Detection:');
        console.log('  fundingAmount empty?', isEmpty(payload.step1?.fundingAmount));
        console.log('  operatingName empty?', isEmpty(payload.step3?.operatingName));
        console.log('  firstName empty?', isEmpty(payload.step4?.firstName));
        console.log('  personalEmail empty?', isEmpty(payload.step4?.personalEmail));
        
      } catch (e) {
        console.error('❌ [CLIENT] Failed to parse request body:', e);
      }
    }
    
    // Track the response
    const originalThen = originalFetch.apply(this, arguments).then;
    return originalFetch.apply(this, arguments)
      .then(response => {
        console.log(`\n📋 [CLIENT] Server response: ${response.status} ${response.statusText}`);
        
        const originalJson = response.json.bind(response);
        response.json = function() {
          return originalJson().then(data => {
            console.log('✅ [CLIENT] Response data received:', data);
            
            if (data.success === false) {
              console.error('❌ [CLIENT] Server returned error:', data.error);
            } else if (data.applicationId) {
              console.log('🎉 [CLIENT] Application created successfully!');
              console.log('📋 [CLIENT] Application ID:', data.applicationId);
              console.log('📋 [CLIENT] SignNow Document ID:', data.signNowDocumentId || 'None');
            } else {
              console.warn('⚠️ [CLIENT] Unexpected response format:', data);
            }
            
            return data;
          });
        };
        
        return response;
      })
      .catch(error => {
        console.error('❌ [CLIENT] Network error:', error);
        throw error;
      });
  }
  
  // Call original fetch for all other requests
  return originalFetch.apply(this, arguments);
};

console.log('💡 Complete payload tracking enabled');
console.log('💡 This will show the complete flow from client → server → staff backend');
console.log('💡 Submit Step 4 to see detailed tracking');

// Function to manually check what will be sent
window.previewPayload = function() {
  const formData = JSON.parse(localStorage.getItem('formData') || '{}');
  
  const mockPayload = {
    step1: {
      fundingAmount: formData.fundingAmount,
      lookingFor: formData.lookingFor,
      businessLocation: formData.businessLocation
    },
    step3: {
      operatingName: formData.operatingName,
      businessCity: formData.businessCity,
      businessState: formData.businessState
    },
    step4: {
      firstName: formData.firstName,
      personalEmail: formData.personalEmail
    }
  };
  
  console.log('\n🔮 [PREVIEW] Payload that would be sent:', mockPayload);
  
  return mockPayload;
};