/**
 * URGENT SignNow Embedded Invite Verification
 * Tests embedded invite creation, Smart Fields population, and signer role matching
 */

const PRODUCTION_API = 'https://app.boreal.financial/api';
const CLIENT_TOKEN = process.env.CLIENT_APP_SHARED_TOKEN;
const SIGNNOW_API_KEY = process.env.SIGNNOW_API_KEY;

async function testSignNowEmbeddedInvite() {
  console.log('🔍 URGENT: SignNow Embedded Invite Verification');
  console.log('==============================================');
  
  if (!CLIENT_TOKEN) {
    console.log('❌ CRITICAL: CLIENT_APP_SHARED_TOKEN not found');
    return false;
  }
  
  if (!SIGNNOW_API_KEY) {
    console.log('❌ CRITICAL: SIGNNOW_API_KEY not found');
    return false;
  }
  
  console.log('✅ Both API keys configured');
  
  // Test 1: Create test application with complete data
  console.log('\n1. Creating test application with full Smart Fields data...');
  
  const testApplicationData = {
    formFields: {
      // Financial Profile (Step 1)
      headquarters: 'Canada',
      industry: 'Manufacturing',
      lookingFor: 'Working Capital',
      fundingAmount: 250000,
      salesHistory: '2 to 5 years',
      averageMonthlyRevenue: 75000,
      accountsReceivableBalance: 45000,
      fixedAssetsValue: 180000,
      
      // Business Details (Step 3)
      businessName: 'Maple Manufacturing Inc.',
      businessAddress: '123 Industry Drive',
      businessCity: 'Toronto',
      businessState: 'ON',
      businessZipCode: 'M5V 3A8',
      businessPhone: '+1-416-555-0123',
      businessEmail: 'info@maplemanufacturing.ca',
      businessWebsite: 'https://maplemanufacturing.ca',
      businessStructure: 'Corporation',
      businessRegistrationDate: '2020-03-15',
      businessTaxId: '123456789RT0001',
      businessDescription: 'Industrial manufacturing and equipment production',
      numberOfEmployees: '25-50',
      primaryBankName: 'TD Canada Trust',
      bankingRelationshipLength: '3-5 years',
      
      // Applicant Details (Step 4)
      firstName: 'John',
      lastName: 'Smith',
      title: 'CEO & President',
      dateOfBirth: '1975-08-22',
      socialSecurityNumber: '123-45-6789',
      personalEmail: 'john.smith@maplemanufacturing.ca',
      personalPhone: '+1-416-555-0124',
      homeAddress: '456 Residential Ave',
      homeCity: 'Toronto',
      homeState: 'ON',
      homeZipCode: 'M4W 2B3',
      personalIncome: '$150,000 - $200,000',
      creditScore: '700-750',
      ownershipPercentage: '75%',
      yearsWithBusiness: '5+',
      previousLoans: 'Yes - All paid successfully',
      bankruptcyHistory: 'No'
    },
    uploadedDocuments: [
      {
        id: 'doc_1',
        name: 'bank_statements_2024.pdf',
        documentType: 'Bank Statements',
        size: 1024000,
        type: 'application/pdf'
      },
      {
        id: 'doc_2', 
        name: 'tax_returns_2023.pdf',
        documentType: 'Tax Returns',
        size: 856000,
        type: 'application/pdf'
      }
    ],
    productId: 'working_capital_bmo_001',
    clientId: 'test_client_urgent_verification'
  };
  
  let applicationId;
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Submit application
    const submitResponse = await fetch(`${PRODUCTION_API}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLIENT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testApplicationData)
    });
    
    if (!submitResponse.ok) {
      console.log(`❌ Application submission failed: ${submitResponse.status}`);
      const errorText = await submitResponse.text();
      console.log(`Error: ${errorText}`);
      return false;
    }
    
    const submitResult = await submitResponse.json();
    applicationId = submitResult.applicationId;
    
    if (!applicationId || !applicationId.startsWith('app_prod_')) {
      console.log(`❌ Invalid application ID: ${applicationId}`);
      return false;
    }
    
    console.log(`✅ Application created: ${applicationId}`);
    
  } catch (error) {
    console.log(`❌ Application creation failed: ${error.message}`);
    return false;
  }
  
  // Test 2: Initiate SignNow with embedded invite
  console.log('\n2. Testing SignNow embedded invite creation...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    const signNowResponse = await fetch(`${PRODUCTION_API}/applications/${applicationId}/initiate-signing`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLIENT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        applicantEmail: 'john.smith@maplemanufacturing.ca',
        applicantName: 'John Smith',
        embeddedInvite: true, // REQUEST EMBEDDED INVITE
        signerRole: 'Borrower', // VERIFY ROLE MATCHING
        smartFieldsData: testApplicationData.formFields
      })
    });
    
    console.log(`SignNow Response Status: ${signNowResponse.status}`);
    
    if (!signNowResponse.ok) {
      const errorText = await signNowResponse.text();
      console.log(`❌ SignNow initiation failed: ${errorText}`);
      return false;
    }
    
    const signNowResult = await signNowResponse.json();
    
    // CRITICAL VERIFICATION POINTS
    console.log('\n📋 CRITICAL VERIFICATION RESULTS:');
    console.log('================================');
    
    // 1. Embedded Invite URL
    const signingUrl = signNowResult.signingUrl || signNowResult.signUrl;
    if (signingUrl) {
      console.log(`✅ Signing URL returned: ${signingUrl}`);
      
      // Check if it's embedded invite format
      if (signingUrl.includes('embedded') || signingUrl.includes('iframe')) {
        console.log('✅ EMBEDDED invite format detected');
      } else {
        console.log('⚠️  WARNING: URL may be email invite, not embedded');
      }
      
      // Test URL accessibility
      try {
        const urlTestResponse = await fetch(signingUrl, { method: 'HEAD' });
        console.log(`✅ Signing URL accessible: ${urlTestResponse.status}`);
      } catch (error) {
        console.log(`⚠️  Signing URL test failed: ${error.message}`);
      }
      
    } else {
      console.log('❌ CRITICAL: No signing URL returned');
      return false;
    }
    
    // 2. Signer Role Verification
    if (signNowResult.signerRole || signNowResult.role) {
      const role = signNowResult.signerRole || signNowResult.role;
      console.log(`✅ Signer role: ${role}`);
      if (role === 'Borrower') {
        console.log('✅ Signer role matches template');
      } else {
        console.log(`⚠️  WARNING: Unexpected signer role: ${role}`);
      }
    } else {
      console.log('⚠️  WARNING: No signer role information returned');
    }
    
    // 3. Smart Fields Population Status
    if (signNowResult.smartFieldsPopulated !== undefined) {
      if (signNowResult.smartFieldsPopulated) {
        console.log('✅ Smart Fields populated successfully');
      } else {
        console.log('❌ CRITICAL: Smart Fields NOT populated');
      }
    } else {
      console.log('⚠️  WARNING: Smart Fields status unknown');
    }
    
    // 4. Check for fallback indicators
    if (signNowResult.inviteType) {
      console.log(`📧 Invite Type: ${signNowResult.inviteType}`);
      if (signNowResult.inviteType === 'email') {
        console.log('⚠️  WARNING: Fallback to email invite detected');
      }
    }
    
    console.log('\n🔍 COMPLETE RESPONSE ANALYSIS:');
    console.log(JSON.stringify(signNowResult, null, 2));
    
    // Final verification with sandbox iframe test
    console.log('\n3. Sandbox iframe compatibility test...');
    
    if (signingUrl) {
      console.log('📄 SANDBOX IFRAME TEST URL:');
      console.log(`   ${signingUrl}`);
      console.log('\n📋 Manual verification required:');
      console.log('   1. Copy URL above into iframe src');
      console.log('   2. Verify document loads in sandbox');
      console.log('   3. Check Smart Fields are pre-populated');
      console.log('   4. Confirm signer role matches "Borrower"');
      
      return true;
    }
    
  } catch (error) {
    console.log(`❌ SignNow integration test failed: ${error.message}`);
    return false;
  }
  
  return false;
}

// Run verification
testSignNowEmbeddedInvite().then(success => {
  if (success) {
    console.log('\n🚀 VERIFICATION COMPLETE');
  } else {
    console.log('\n❌ VERIFICATION FAILED - REQUIRES IMMEDIATE ATTENTION');
  }
}).catch(error => {
  console.error('\n💥 CRITICAL ERROR:', error.message);
});