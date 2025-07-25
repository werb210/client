/**
 * GET APPLICATION ID FROM E2E TEST
 * Retrieves the specific application ID generated during testing
 */

console.log('🔍 RETRIEVING APPLICATION ID FROM E2E TEST');
console.log('='.repeat(50));

// Check localStorage for stored application IDs
const storedAppId = localStorage.getItem('applicationId');
const lastTestAppId = localStorage.getItem('lastTestApplicationId');

console.log(`📋 Current Application ID: ${storedAppId || 'Not found'}`);
console.log(`📋 Last Test Application ID: ${lastTestAppId || 'Not found'}`);

// Check if there's an existing application from previous test
const existingApplicationId = storedAppId || lastTestAppId;

if (existingApplicationId) {
  console.log(`🆔 FOUND APPLICATION ID: ${existingApplicationId}`);
  
  // Verify this application exists
  fetch(`/api/public/applications/${existingApplicationId}`, {
    headers: { 'Authorization': 'Bearer test-token' }
  })
  .then(response => {
    console.log(`📊 Application Verification: ${response.status}`);
    if (response.ok) {
      console.log(`✅ Application ${existingApplicationId} exists and is accessible`);
    } else {
      console.log(`❌ Application ${existingApplicationId} not found or inaccessible`);
    }
  })
  .catch(error => {
    console.log(`❌ Error checking application: ${error.message}`);
  });
  
} else {
  console.log('❌ No application ID found in storage');
  console.log('💡 The E2E test may have generated a new UUID that was not stored');
}

// Also check for the specific test application ID from recent execution
console.log('\n🔍 CHECKING FOR RECENT TEST EXECUTION...');

// Look for any UUIDs in recent console output or logs
const recentApplicationPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

// Check if window.runFullE2ETest exists (indicates test was loaded)
if (typeof window.runFullE2ETest === 'function') {
  console.log('✅ E2E test function found - test script was loaded');
} else {
  console.log('❌ E2E test function not found');
}

// Export the found ID
window.currentApplicationId = existingApplicationId;
console.log(`\n🎯 RESULT: Application ID is ${existingApplicationId || 'NOT_FOUND'}`);