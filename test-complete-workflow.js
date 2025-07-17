/**
 * Complete Workflow Test
 * Tests the full Step 1-7 application workflow with document uploads
 */

const API_BASE_URL = window.location.origin;

// Complete test application data
const completeApplicationData = {
  step1: {
    businessLocation: "CA",
    headquarters: "CA", 
    headquartersState: "ON",
    industry: "technology",
    lookingFor: "capital",
    fundingAmount: 75000,
    fundsPurpose: "expansion",
    salesHistory: "3+yr",
    revenueLastYear: 850000,
    averageMonthlyRevenue: 70833,
    accountsReceivableBalance: 45000,
    fixedAssetsValue: 125000,
    requestedAmount: 75000,
    use_of_funds: "expansion"
  },
  step2: {
    selectedCategory: "working_capital",
    selectedProductId: "test-product-123",
    selectedProductName: "Business Line of Credit",
    selectedLenderName: "Test Lender"
  },
  step3: {
    operatingName: "TechFlow Solutions Inc",
    legalName: "TechFlow Solutions Incorporated", 
    businessStreetAddress: "789 Innovation Drive",
    businessCity: "Vancouver",
    businessState: "BC",
    businessPostalCode: "V6B 2W2",
    businessPhone: "+1-604-555-0199",
    businessWebsite: "https://techflowsolutions.ca",
    businessStartDate: "2019-03-15",
    businessStructure: "corporation",
    employeeCount: 28,
    estimatedYearlyRevenue: 850000,
    businessName: "TechFlow Solutions Incorporated"
  },
  step4: {
    applicantFirstName: "Sarah",
    applicantLastName: "Chen",
    applicantEmail: "sarah.chen@techflowsolutions.ca",
    applicantPhone: "+1-604-555-0200",
    applicantAddress: "1234 Residential St",
    applicantCity: "Vancouver", 
    applicantState: "BC",
    applicantZipCode: "V6B 3C3",
    applicantDateOfBirth: "1987-09-22",
    applicantSSN: "987654321",
    ownershipPercentage: 85,
    hasPartner: true,
    partnerFirstName: "Michael",
    partnerLastName: "Wong",
    partnerEmail: "michael.wong@techflowsolutions.ca",
    partnerPhone: "+1-604-555-0201",
    partnerAddress: "5678 Partner Ave",
    partnerCity: "Vancouver",
    partnerState: "BC", 
    partnerZipCode: "V6B 4D4",
    partnerDateOfBirth: "1985-12-10",
    partnerSSN: "876543210",
    partnerOwnershipPercentage: 15,
    email: "sarah.chen@techflowsolutions.ca"
  }
};

async function testCompleteWorkflow() {
  console.log('🚀 =================================');
  console.log('🚀 COMPLETE WORKFLOW TEST');
  console.log('🚀 =================================');
  
  let applicationId = null;
  
  try {
    // Step 4: Create Application
    console.log('\n📤 Step 4: Creating application...');
    const createResponse = await fetch(`${API_BASE_URL}/api/public/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify(completeApplicationData)
    });
    
    console.log(`📥 Application creation: ${createResponse.status} ${createResponse.statusText}`);
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      applicationId = createResult.applicationId || createResult.id;
      console.log('✅ Application created successfully:', applicationId);
      console.log('📋 Full response:', createResult);
      
    } else if (createResponse.status === 409) {
      // Handle duplicate - extract existing ID
      const duplicateError = await createResponse.json();
      console.log('🔄 Duplicate application detected:', duplicateError);
      applicationId = duplicateError.applicationId;
      
      if (applicationId) {
        console.log('✅ Using existing application ID:', applicationId);
      } else {
        console.log('❌ No application ID in duplicate response');
        return;
      }
      
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Application creation failed:', errorText);
      return;
    }
    
    // Step 5: Document Upload Test
    console.log('\n📤 Step 5: Testing document uploads...');
    
    // Create test files for upload
    const testDocuments = [
      { name: 'bank_statement_1.pdf', type: 'bank_statements', content: 'Mock bank statement 1 content' },
      { name: 'bank_statement_2.pdf', type: 'bank_statements', content: 'Mock bank statement 2 content' },
      { name: 'bank_statement_3.pdf', type: 'bank_statements', content: 'Mock bank statement 3 content' },
      { name: 'financial_statement.pdf', type: 'financial_statements', content: 'Mock financial statement content' },
      { name: 'business_license.pdf', type: 'business_license', content: 'Mock business license content' }
    ];
    
    const uploadedDocs = [];
    
    for (const doc of testDocuments) {
      try {
        // Create a blob to simulate file upload
        const blob = new Blob([doc.content], { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('document', blob, doc.name);
        formData.append('documentType', doc.type);
        
        console.log(`📄 Uploading ${doc.name} as ${doc.type}...`);
        
        const uploadResponse = await fetch(`${API_BASE_URL}/api/public/applications/${applicationId}/documents`, {
          method: 'POST',
          body: formData
        });
        
        console.log(`📥 Upload ${doc.name}: ${uploadResponse.status} ${uploadResponse.statusText}`);
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          console.log(`✅ ${doc.name} uploaded successfully:`, uploadResult);
          uploadedDocs.push(uploadResult);
        } else {
          const uploadError = await uploadResponse.text();
          console.log(`❌ ${doc.name} upload failed:`, uploadError);
        }
        
      } catch (uploadError) {
        console.log(`❌ ${doc.name} upload error:`, uploadError);
      }
    }
    
    console.log(`\n📊 Upload Summary: ${uploadedDocs.length}/${testDocuments.length} documents uploaded successfully`);
    
    // Step 7: Finalization Test
    console.log('\n📤 Step 7: Testing application finalization...');
    
    const finalizationData = {
      step1: completeApplicationData.step1,
      step3: completeApplicationData.step3,
      step4: completeApplicationData.step4,
      termsAccepted: true,
      privacyAccepted: true,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
    
    const finalizeResponse = await fetch(`${API_BASE_URL}/api/public/applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify(finalizationData)
    });
    
    console.log(`📥 Finalization: ${finalizeResponse.status} ${finalizeResponse.statusText}`);
    
    if (finalizeResponse.ok) {
      const finalizeResult = await finalizeResponse.json();
      console.log('✅ Application finalized successfully:', finalizeResult);
    } else if (finalizeResponse.status === 409) {
      const duplicateError = await finalizeResponse.json();
      console.log('🔄 Application already submitted:', duplicateError);
    } else {
      const finalizeError = await finalizeResponse.text();
      console.log('❌ Finalization failed:', finalizeError);
    }
    
    // Health Check Summary
    console.log('\n📊 =================================');
    console.log('📊 WORKFLOW HEALTH CHECK SUMMARY');
    console.log('📊 =================================');
    console.log(`✅ Application Creation: ${applicationId ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Document Uploads: ${uploadedDocs.length}/${testDocuments.length} PASS`);
    console.log(`✅ Application Finalization: ${finalizeResponse.ok || finalizeResponse.status === 409 ? 'PASS' : 'FAIL'}`);
    console.log(`🔑 Application ID: ${applicationId}`);
    console.log(`📄 Documents Uploaded: ${uploadedDocs.length}`);
    
    // Display uploaded document details
    if (uploadedDocs.length > 0) {
      console.log('\n📋 Uploaded Documents:');
      uploadedDocs.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.name || 'Unknown'} (${doc.documentType || 'Unknown Type'}) - ID: ${doc.documentId || doc.id || 'No ID'}`);
      });
    }
    
    return {
      applicationId,
      uploadedDocuments: uploadedDocs.length,
      totalDocuments: testDocuments.length,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test retry functionality
async function testUploadRetry(applicationId) {
  if (!applicationId) {
    console.log('❌ No application ID provided for retry test');
    return;
  }
  
  console.log('\n🔄 =================================');
  console.log('🔄 TESTING UPLOAD RETRY');
  console.log('🔄 =================================');
  
  const retryDoc = {
    name: 'retry_test_document.pdf',
    type: 'tax_returns',
    content: 'Retry test document content'
  };
  
  try {
    const blob = new Blob([retryDoc.content], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('document', blob, retryDoc.name);
    formData.append('documentType', retryDoc.type);
    
    console.log(`🔄 Attempting retry upload: ${retryDoc.name}`);
    
    const retryResponse = await fetch(`${API_BASE_URL}/api/public/applications/${applicationId}/documents`, {
      method: 'POST',
      body: formData
    });
    
    console.log(`📥 Retry response: ${retryResponse.status} ${retryResponse.statusText}`);
    
    if (retryResponse.ok) {
      const retryResult = await retryResponse.json();
      console.log('✅ Retry successful:', retryResult);
    } else {
      const retryError = await retryResponse.text();
      console.log('❌ Retry failed:', retryError);
    }
    
  } catch (error) {
    console.log('❌ Retry test error:', error);
  }
}

// Export for browser console
window.testCompleteWorkflow = testCompleteWorkflow;
window.testUploadRetry = testUploadRetry;

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
  console.log('🚀 Complete Workflow Test Suite Loaded');
  console.log('🚀 Run: testCompleteWorkflow()');
  console.log('🔄 Run: testUploadRetry(applicationId)');
}