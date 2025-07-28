/**
 * STEP 6 SIGNNOW INTEGRATION TEST
 * Manual test script for verifying SignNow console output and network requests
 */

// ✅ Step 1: Confirm API Base URL
console.log('🌍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// ✅ Step 2: Manually trigger Step 6 (SignNow Integration)
localStorage.setItem('applicationId', 'f22c0bc9-40d7-4eaa-b671-7761d8101d50'); 
console.log('🆔 Test Application ID set:', localStorage.getItem('applicationId'));

// Instructions for manual verification
console.log('');
console.log('🧪 MANUAL TEST INSTRUCTIONS:');
console.log('1. Open DevTools → Network tab');
console.log('2. Filter by "signnow"');
console.log('3. Navigate to Step 6 to trigger SignNow API call');

// Navigate to Step 6
setTimeout(() => {
  console.log('🚀 Navigating to Step 6...');
  window.location.href = '/apply/step-6';
}, 1000);

// Make function available globally
window.testStep6SignNow = () => {
  console.log('🌍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  localStorage.setItem('applicationId', 'f22c0bc9-40d7-4eaa-b671-7761d8101d50');
  window.location.href = '/apply/step-6';
};