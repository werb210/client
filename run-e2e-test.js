/**
 * Execute E2E Test via Browser Console
 * Navigate to /e2e-test and run comprehensive test suite
 */

console.log('🚀 Starting E2E Test Navigation and Execution...');

// Navigate to E2E test page
window.location.href = '/e2e-test';

// Wait for page load and then trigger test execution
setTimeout(() => {
  console.log('📍 Navigated to E2E test page, looking for test button...');
  
  // Look for the test button and click it
  const testButton = document.querySelector('button');
  if (testButton && testButton.textContent.includes('Run')) {
    console.log('🎯 Found test button, starting E2E test execution...');
    testButton.click();
  } else {
    console.log('❌ Test button not found, page may still be loading...');
    // Try again after another delay
    setTimeout(() => {
      const retryButton = document.querySelector('button');
      if (retryButton) {
        console.log('🔄 Retry: Found test button, starting execution...');
        retryButton.click();
      }
    }, 2000);
  }
}, 2000);