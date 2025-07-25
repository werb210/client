/**
 * GET CURRENT TEST APPLICATION ID
 * Executes a fresh test to get the actual current application ID
 */

console.log('🔍 EXECUTING FRESH E2E TEST TO GET CURRENT APPLICATION ID');
console.log('='.repeat(60));

async function getCurrentTestApplication() {
  // Generate current test application ID
  const currentTestTimestamp = Date.now();
  const currentApplicationId = crypto.randomUUID();
  
  console.log(`🆔 CURRENT TEST APPLICATION ID: ${currentApplicationId}`);
  console.log(`⏰ Generated at: ${new Date().toISOString()}`);
  console.log(`🔢 Timestamp: ${currentTestTimestamp}`);
  
  // Store this as the current application ID
  localStorage.setItem('currentTestApplicationId', currentApplicationId);
  localStorage.setItem('currentTestTimestamp', currentTestTimestamp.toString());
  
  console.log('\n📋 CURRENT APPLICATION TEST DATA:');
  console.log(`Business Name: E2E Test Corporation ${currentTestTimestamp}`);
  console.log(`Email: test.${currentTestTimestamp}@boreal.financial`);
  console.log(`Funding Amount: $75,000`);
  console.log(`Purpose: Equipment Financing`);
  
  // Test application creation
  try {
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        applicationId: currentApplicationId,
        form_data: {
          step1: {
            fundingAmount: 75000,
            requestedAmount: 75000,
            productCategory: "Equipment Financing"
          },
          step3: {
            businessType: "Corporation",
            operatingName: `E2E Test Corporation ${currentTestTimestamp}`,
            businessPhone: "+15551234567"
          },
          step4: {
            applicantFirstName: "Current",
            applicantLastName: "Tester",
            applicantEmail: `test.${currentTestTimestamp}@boreal.financial`
          }
        }
      })
    });
    
    console.log(`\n📊 Application Creation Response: ${response.status}`);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log(`✅ CURRENT APPLICATION CREATED SUCCESSFULLY`);
      console.log(`🆔 Confirmed Application ID: ${responseData.applicationId || currentApplicationId}`);
      
      // Store the confirmed ID
      const confirmedId = responseData.applicationId || currentApplicationId;
      localStorage.setItem('confirmedCurrentApplicationId', confirmedId);
      
      return confirmedId;
    } else {
      const error = await response.text();
      console.log(`❌ Application creation failed: ${error}`);
      return null;
    }
    
  } catch (error) {
    console.log(`❌ Error creating application: ${error.message}`);
    return null;
  }
}

// Execute and get current application ID
getCurrentTestApplication().then(applicationId => {
  if (applicationId) {
    console.log(`\n🎯 FINAL RESULT: Current Application ID is ${applicationId}`);
    window.currentApplicationId = applicationId;
  } else {
    console.log(`\n❌ Failed to create current test application`);
  }
});