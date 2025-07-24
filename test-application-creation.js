/**
 * Test Application Creation with Unique Email
 * This script tests the application creation flow with a unique email to avoid duplicate constraints
 */

async function testApplicationCreation() {
  console.log('🧪 TESTING APPLICATION CREATION WITH UNIQUE EMAIL');
  console.log('==================================================');
  
  // Generate unique email to avoid duplicate constraint
  const timestamp = Date.now();
  const uniqueEmail = `test.user.${timestamp}@example.com`;
  
  console.log('📧 Using unique email:', uniqueEmail);
  
  const applicationData = {
    step1: {
      businessLocation: "CA",
      headquarters: "US", 
      headquartersState: "",
      industry: "transportation",
      lookingFor: "capital",
      fundingAmount: 40000,
      fundsPurpose: "working_capital",
      salesHistory: "3+yr",
      revenueLastYear: 250000,
      averageMonthlyRevenue: 25000,
      accountsReceivableBalance: 0,
      fixedAssetsValue: 0,
      equipmentValue: 0,
      requestedAmount: 40000
    },
    step3: {
      operatingName: "Test Business Inc",
      employeeCount: 2,
      estimatedYearlyRevenue: 480000,
      legalName: "Test Business Inc",
      businessStructure: "corporation",
      businessStreetAddress: "123 Test Street",
      businessCity: "Calgary",
      businessState: "AB",
      businessPostalCode: "T5R 5T5",
      businessPhone: "+18888888888",
      businessStartDate: "2014-07-09",
      businessWebsite: ""
    },
    step4: {
      applicantFirstName: "Test",
      applicantLastName: "User",
      applicantEmail: uniqueEmail,
      applicantPhone: "+15878881837",
      applicantAddress: "123 Test Address",
      applicantCity: "Calgary",
      applicantState: "AB",
      applicantZipCode: "T5R 4R4",
      applicantDateOfBirth: "1985-01-01",
      applicantSSN: "",
      ownershipPercentage: 100,
      hasPartner: false,
      partnerFirstName: "",
      partnerLastName: "",
      partnerEmail: "",
      partnerPhone: "",
      partnerAddress: "",
      partnerCity: "",
      partnerState: "",
      partnerZipCode: "",
      partnerDateOfBirth: "",
      partnerSSN: "",
      partnerOwnershipPercentage: 0,
      email: uniqueEmail
    }
  };
  
  try {
    console.log('📤 POST /api/public/applications');
    console.log('📋 Payload:', JSON.stringify(applicationData, null, 2));
    
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.ENV?.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify(applicationData)
    });
    
    console.log('📥 Response:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS: Application created!');
      console.log('🆔 Application ID:', result.applicationId);
      console.log('📋 Full response:', result);
      
      // Test if it's a proper UUID (not a fallback)
      const isUuid = result.applicationId && result.applicationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      const isFallback = result.applicationId && result.applicationId.startsWith('fallback_');
      
      console.log('🔍 ID Analysis:');
      console.log('  - Is proper UUID:', !!isUuid);
      console.log('  - Is fallback ID:', isFallback);
      
      if (isUuid) {
        console.log('🎉 SUCCESS: Got proper UUID from staff backend!');
        window.testApplicationId = result.applicationId;
        return result.applicationId;
      } else if (isFallback) {
        console.log('⚠️ WARNING: Got fallback ID - staff backend issue detected');
        return null;
      } else {
        console.log('❓ UNKNOWN: Unexpected ID format');
        return result.applicationId;
      }
      
    } else {
      const errorText = await response.text();
      console.error('❌ FAILED: Application creation failed');
      console.error('Status:', response.status);
      console.error('Error:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Error details:', errorJson);
      } catch (e) {
        console.log('Error response is not JSON');
      }
      
      return null;
    }
    
  } catch (error) {
    console.error('❌ NETWORK ERROR:', error);
    return null;
  }
}

// Auto-run the test
console.log('🚀 Starting application creation test...');
testApplicationCreation().then(applicationId => {
  if (applicationId && !applicationId.startsWith('fallback_')) {
    console.log('\n🎉 TEST PASSED: Application created with proper UUID');
    console.log('✅ Ready to test document upload and finalization');
  } else {
    console.log('\n❌ TEST FAILED: No proper UUID received');
    console.log('🔍 Check staff backend connectivity and duplicate email handling');
  }
});

// Export for manual testing
window.testApplicationCreation = testApplicationCreation;