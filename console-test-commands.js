// STEP 4 → STEP 6 VERIFICATION - PASTE INTO BROWSER CONSOLE

// 1. Monitor Step 4 submission payload
console.log('🧪 Step 4 → Step 6 Test Active - Submit Step 4 to see payload logging');

// 2. Quick check of current form data
console.log('📋 Current stored data:', {
  step1: JSON.parse(localStorage.getItem('formData') || '{}').step1,
  step3: JSON.parse(localStorage.getItem('formData') || '{}').step3,
  applicationId: localStorage.getItem('applicationId')
});

// 3. Function to check SignNow iframe (run on Step 6)
window.checkSignNowFields = function() {
  const iframe = document.querySelector('iframe[title*="SignNow"]');
  if (iframe) {
    console.log('✅ SignNow iframe found');
    console.log('🔗 Signing URL:', iframe.src);
    
    if (iframe.src.includes('temp_')) {
      console.log('⚠️ Using fallback URL - fields may not populate');
    } else {
      console.log('✅ Real SignNow URL - check document fields are populated');
    }
    
    console.log('📌 ApplicationId:', localStorage.getItem('applicationId'));
  } else {
    console.log('❌ No SignNow iframe found');
  }
};

// 4. Expected console messages to watch for:
console.log('🔍 Watch for these messages when submitting Step 4:');
console.log('   📝 "Complete application payload: { step1: {...}, step3: {...}, step4: {...} }"');
console.log('   📋 "Application creation response received: { applicationId: ..., signNowDocumentId: ... }"');
console.log('💡 On Step 6, run: checkSignNowFields()');