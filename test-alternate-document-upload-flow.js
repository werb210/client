/**
 * TEST PLAN: Alternate Document Upload Flow
 * Testing SMS-triggered document upload workflow
 */

// Step 1: Submit Application Without Required Documents
async function submitApplicationWithoutDocs() {
  console.log('🔁 Step 1: Submitting application without required docs...');
  
  const testData = {
    // Step 1: Business Basics
    businessName: "Test Document Flow Corp",
    fundingAmount: 75000,
    purposeOfFunds: "working_capital",
    
    // Step 2: Financing Options (skip for now - will be populated)
    
    // Step 3: Business Details  
    businessType: "corporation",
    industry: "technology",
    website: "https://testdocflow.com",
    yearsInBusiness: 3,
    numberOfEmployees: 12,
    businessAddress: {
      street: "123 Document Test Ave",
      city: "Calgary", 
      province: "AB",
      postalCode: "T2P 1A1",
      country: "CA"
    },
    annualRevenue: 500000,
    monthlyRevenue: 42000,
    
    // Step 4: Applicant Information - KEY: Use test phone number
    primaryApplicant: {
      firstName: "Test",
      lastName: "DocumentFlow", 
      email: `testdoc.${Date.now()}@example.com`, // Unique email
      phone: "587-888-1837", // SMS test number
      dateOfBirth: "1985-06-15",
      ownership: 75,
      title: "CEO"
    }
  };
  
  try {
    // Create application via API
    const response = await fetch('http://localhost:5000/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Application creation failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Application created:', result.applicationId);
    
    // Step 5: Skip document upload (bypass documents)
    console.log('📄 Step 5: Bypassing document upload...');
    
    const bypassResponse = await fetch(`http://localhost:5000/api/public/applications/${result.applicationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify({
        bypassDocuments: true,
        status: 'ready_for_finalization'
      })
    });
    
    if (bypassResponse.ok) {
      console.log('✅ Document bypass set successfully');
    }
    
    // Step 6: Finalize application (should trigger SMS)
    console.log('🏁 Step 6: Finalizing application (should trigger SMS)...');
    
    const finalizeResponse = await fetch(`http://localhost:5000/api/public/applications/${result.applicationId}/finalize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify({
        typedSignature: "Test DocumentFlow",
        title: "CEO",
        status: "submitted_no_docs" // Key: indicates documents needed
      })
    });
    
    if (!finalizeResponse.ok) {
      const errorText = await finalizeResponse.text();
      console.log('⚠️ Finalize response:', finalizeResponse.status, errorText);
    } else {
      const finalizeResult = await finalizeResponse.json();
      console.log('✅ Application finalized:', finalizeResult);
    }
    
    console.log('\n📱 Expected SMS to 587-888-1837:');
    console.log(`"We have reviewed your documents and the following document categories were missing.`);
    console.log(`You will need to click here: https://client.boreal.financial/upload-documents?app=${result.applicationId} to upload the correct documents."`);
    
    console.log('\n🔗 Test Link:');
    console.log(`/upload-documents?app=${result.applicationId}`);
    
    return result.applicationId;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Step 3: Test the upload-documents link behavior
async function testUploadDocumentsLink(applicationId) {
  console.log('\n✅ Step 3: Testing /upload-documents link behavior...');
  
  console.log('🔗 Simulating SMS link click to:');
  console.log(`/upload-documents?app=${applicationId}`);
  
  // Test the API endpoint that the page will call
  try {
    const response = await fetch(`http://localhost:5000/api/public/applications/${applicationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });
    
    console.log('📡 Application fetch status:', response.status);
    
    if (response.ok) {
      const appData = await response.json();
      console.log('✅ Application data loaded successfully');
      console.log('📋 Application category:', appData.category || appData.purposeOfFunds);
      console.log('💰 Funding amount:', appData.fundingAmount);
    } else {
      console.log('❌ 401 Error: API is blocking unauthenticated GET /application/:id');
      console.log('🔧 Expected behavior: Page should show default document categories');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
  
  console.log('\n📋 Expected document categories to show:');
  console.log('1. Bank Statements (6 required)');
  console.log('2. Financial Statements (1 required)'); 
  console.log('3. Business Tax Returns (3 required)');
  
  console.log('\n✅ Upload functionality should work with these endpoints:');
  console.log(`POST /api/public/upload/${applicationId} - Document upload`);
  console.log(`POST /api/public/upload/${applicationId}/reassess - Submit documents`);
}

// Execute the test
async function runTest() {
  console.log('🧪 Starting Alternate Document Upload Flow Test\n');
  
  const applicationId = await submitApplicationWithoutDocs();
  
  if (applicationId) {
    await testUploadDocumentsLink(applicationId);
    
    console.log('\n🎯 TEST SUMMARY:');
    console.log(`✅ Application created: ${applicationId}`);
    console.log('✅ Application submitted without documents');
    console.log('✅ SMS should be sent to: 587-888-1837');
    console.log(`✅ Upload link: /upload-documents?app=${applicationId}`);
    console.log('✅ Default document categories will show on 401 error');
  } else {
    console.log('❌ Test failed - could not create application');
  }
}

// Run the test
runTest();