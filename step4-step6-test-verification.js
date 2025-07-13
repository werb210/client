/**
 * STEP 4 → STEP 6 FLOW VERIFICATION TEST
 * Copy and paste this into browser console to monitor the complete data flow
 * Date: January 13, 2025
 */

console.log('🧪 Starting Step 4 → Step 6 Flow Verification Test');

// Monitor console for application creation
let applicationId = null;
let signNowDocumentId = null;
let payloadLogged = false;
let responseLogged = false;

// Override console.log to capture our specific logs
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  
  // Capture application payload
  if (message.includes('Complete application payload:')) {
    payloadLogged = true;
    originalLog('✅ CAPTURED: Application submission payload logged');
  }
  
  // Capture response with IDs
  if (message.includes('Application creation response received:')) {
    responseLogged = true;
    originalLog('✅ CAPTURED: Application creation response logged');
  }
  
  // Extract applicationId from various log formats
  if (message.includes('applicationId') && !applicationId) {
    const match = message.match(/applicationId["\s:]+([a-f0-9-]{36})/i);
    if (match) {
      applicationId = match[1];
      originalLog('🆔 CAPTURED: applicationId =', applicationId);
    }
  }
  
  // Extract signNowDocumentId
  if (message.includes('signNowDocumentId') && !signNowDocumentId) {
    const match = message.match(/signNowDocumentId["\s:]+([a-f0-9-]{36})/i);
    if (match) {
      signNowDocumentId = match[1];
      originalLog('📄 CAPTURED: signNowDocumentId =', signNowDocumentId);
    }
  }
  
  // Call original console.log
  originalLog.apply(console, args);
};

// Function to check current step and provide guidance
function checkCurrentStep() {
  const currentPath = window.location.pathname;
  originalLog('📍 Current location:', currentPath);
  
  if (currentPath.includes('step-4')) {
    originalLog('📝 You are on Step 4 - fill out the form and submit to see payload logging');
    originalLog('🔍 Looking for these console messages:');
    originalLog('   - "Complete application payload: { step1: {...}, step3: {...}, step4: {...} }"');
    originalLog('   - "Application creation response received: { applicationId: ..., signNowDocumentId: ... }"');
  } else if (currentPath.includes('step-6')) {
    originalLog('📄 You are on Step 6 - checking SignNow iframe and field population');
    checkSignNowIframe();
  } else {
    originalLog('🧭 Navigate to Step 4 to begin the test');
  }
}

// Function to check SignNow iframe and field population
function checkSignNowIframe() {
  const iframe = document.querySelector('iframe[title*="SignNow"]');
  
  if (iframe) {
    const signingUrl = iframe.src;
    originalLog('✅ SignNow iframe found');
    originalLog('🔗 Signing URL:', signingUrl);
    
    if (signingUrl.includes('temp_')) {
      originalLog('⚠️ WARNING: Using fallback/temp URL - fields may not be populated');
    } else {
      originalLog('✅ Real SignNow URL detected - fields should be populated');
    }
    
    // Check if iframe has loaded
    iframe.onload = function() {
      originalLog('📄 SignNow iframe loaded successfully');
      originalLog('🔍 To verify field population:');
      originalLog('   1. Look inside the SignNow document');
      originalLog('   2. Check that name, email, business name fields are filled');
      originalLog('   3. If blank, note the signing URL and applicationId below:');
      if (applicationId) originalLog('   📌 ApplicationId:', applicationId);
      if (signNowDocumentId) originalLog('   📌 SignNowDocumentId:', signNowDocumentId);
    };
    
    iframe.onerror = function() {
      originalLog('❌ SignNow iframe failed to load');
      originalLog('🔗 URL that failed:', signingUrl);
    };
  } else {
    originalLog('❌ No SignNow iframe found on this page');
    originalLog('🔍 Looking for iframe with title containing "SignNow"');
  }
}

// Function to manually extract data from localStorage
function checkStoredData() {
  const storedAppId = localStorage.getItem('applicationId');
  const formData = JSON.parse(localStorage.getItem('formData') || '{}');
  
  originalLog('💾 Stored Data Check:');
  originalLog('   applicationId in localStorage:', storedAppId);
  originalLog('   formData keys:', Object.keys(formData));
  
  if (formData.step1) {
    originalLog('   Step 1 data:', {
      fundingAmount: formData.step1.fundingAmount,
      lookingFor: formData.step1.lookingFor
    });
  }
  
  if (formData.step3) {
    originalLog('   Step 3 data:', {
      operatingName: formData.step3.operatingName,
      businessCity: formData.step3.businessCity
    });
  }
  
  if (formData.step4) {
    originalLog('   Step 4 data:', {
      firstName: formData.step4.firstName,
      lastName: formData.step4.lastName,
      personalEmail: formData.step4.personalEmail
    });
  }
}

// Function to generate test summary
function generateTestSummary() {
  originalLog('\n📊 TEST SUMMARY:');
  originalLog('================');
  originalLog('Payload Logged:', payloadLogged ? '✅' : '❌');
  originalLog('Response Logged:', responseLogged ? '✅' : '❌');
  originalLog('ApplicationId Captured:', applicationId ? '✅' : '❌');
  originalLog('SignNowDocumentId Captured:', signNowDocumentId ? '✅' : '❌');
  
  if (applicationId && signNowDocumentId) {
    originalLog('🎉 COMPLETE: All required IDs captured for webhook verification');
  } else {
    originalLog('⚠️  INCOMPLETE: Missing critical IDs for webhook integration');
  }
}

// Start the test
checkCurrentStep();
checkStoredData();

// Set up monitoring
originalLog('🔄 Test monitoring active - complete Step 4 or navigate to Step 6');
originalLog('💡 Use generateTestSummary() to see current status');
originalLog('💡 Use checkSignNowIframe() to re-check iframe on Step 6');

// Make functions available globally
window.generateTestSummary = generateTestSummary;
window.checkSignNowIframe = checkSignNowIframe;
window.checkStoredData = checkStoredData;