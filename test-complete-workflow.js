/**
 * COMPLETE WORKFLOW TEST
 * Tests the complete Step 4 → Step 6 flow with the enhanced logging
 * Run this in browser console after filling out Steps 1-4
 */

async function testCompleteWorkflow() {
  console.log('🚀 Starting complete workflow test...');
  
  // 1. Test Step 4 form data capture
  console.log('📝 Step 1: Testing Step 4 form submission...');
  const step4Form = document.querySelector('form');
  if (step4Form) {
    console.log('✅ Step 4 form found');
    
    // Check if form has data
    const formData = new FormData(step4Form);
    const formEntries = Array.from(formData.entries());
    console.log('📋 Form data entries:', formEntries);
    
    // Check critical fields
    const firstName = document.querySelector('input[name="firstName"]')?.value;
    const personalEmail = document.querySelector('input[name="personalEmail"]')?.value;
    console.log('🔍 Critical fields:', { firstName, personalEmail });
  }
  
  // 2. Test localStorage applicationId
  console.log('📝 Step 2: Testing applicationId storage...');
  const applicationId = localStorage.getItem('applicationId');
  console.log('🆔 Application ID:', applicationId);
  
  // 3. Test polling endpoint
  if (applicationId) {
    console.log('📝 Step 3: Testing polling endpoint...');
    const pollingEndpoint = `/api/public/applications/${applicationId}/signature-status`;
    console.log('📡 Polling endpoint:', pollingEndpoint);
    
    try {
      const response = await fetch(pollingEndpoint);
      console.log('📡 Polling response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('📡 Polling response data:', data);
      }
    } catch (error) {
      console.log('📡 Polling error (expected if no application):', error.message);
    }
  }
  
  // 4. Test SignNow URL fetch
  if (applicationId) {
    console.log('📝 Step 4: Testing SignNow URL fetch...');
    const signNowEndpoint = `/api/public/applications/${applicationId}/signing-status`;
    console.log('🔗 SignNow endpoint:', signNowEndpoint);
    
    try {
      const response = await fetch(signNowEndpoint);
      console.log('🔗 SignNow response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🔗 SignNow response data:', data);
      }
    } catch (error) {
      console.log('🔗 SignNow error (expected if no application):', error.message);
    }
  }
  
  console.log('✅ Complete workflow test finished');
}

// Run the test
testCompleteWorkflow().catch(console.error);