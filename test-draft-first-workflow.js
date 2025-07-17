// Draft-First Architecture Test
// Tests Steps 4 → 5 → 7 with network call verification

console.log("🧪 Starting Draft-First Architecture Test");

// Test Step 4: Application Creation
async function testStep4ApplicationCreation() {
  console.log("\n=== STEP 4 TEST: Application Creation ===");
  
  const step4Data = {
    step1: {
      requestedAmount: 50000,
      fundsPurpose: "working_capital",
      lookingFor: "financing",
      headquarters: "CA"
    },
    step3: {
      operatingName: "Test Business Inc",
      legalName: "Test Business Inc",
      businessStreetAddress: "123 Main St",
      businessCity: "Toronto",
      businessState: "ON",
      businessZipCode: "M5V 3A8",
      businessPhone: "+1-416-555-0123",
      businessStartDate: "2020-01-15",
      businessStructure: "corporation",
      numberOfEmployees: 5,
      estimatedYearlyRevenue: 500000
    },
    step4: {
      applicantFirstName: "John",
      applicantLastName: "Smith", 
      applicantEmail: "john@testbusiness.com",
      applicantPhone: "+1-416-555-0456",
      applicantAddress: "456 Oak Ave",
      applicantCity: "Toronto",
      applicantState: "ON",
      applicantZipCode: "M5V 3B9",
      applicantDateOfBirth: "1985-03-15",
      ownershipPercentage: 100,
      hasPartner: false
    }
  };

  try {
    console.log("📤 POST /api/public/applications");
    console.log("Payload:", JSON.stringify(step4Data, null, 2));
    
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify(step4Data)
    });
    
    console.log("📥 Response:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Step 4 Failed:", errorText);
      return null;
    }
    
    const result = await response.json();
    console.log("✅ Step 4 Success:", result);
    console.log("🆔 Application ID:", result.applicationId);
    
    return result.applicationId;
    
  } catch (error) {
    console.error("❌ Step 4 Error:", error);
    return null;
  }
}

// Test Step 5: Document Upload
async function testStep5DocumentUpload(applicationId) {
  console.log("\n=== STEP 5 TEST: Document Upload ===");
  
  if (!applicationId) {
    console.error("❌ No applicationId provided for Step 5");
    return false;
  }
  
  // Create 6 test PDF files
  const testFiles = [
    { name: "bank_statement_1.pdf", type: "application/pdf", content: "Bank Statement 1" },
    { name: "bank_statement_2.pdf", type: "application/pdf", content: "Bank Statement 2" },
    { name: "bank_statement_3.pdf", type: "application/pdf", content: "Bank Statement 3" },
    { name: "financial_statement_1.pdf", type: "application/pdf", content: "Financial Statement 1" },
    { name: "financial_statement_2.pdf", type: "application/pdf", content: "Financial Statement 2" },
    { name: "tax_return.pdf", type: "application/pdf", content: "Tax Return" }
  ];
  
  console.log("📄 6-file array before upload:", testFiles.map(f => f.name));
  
  let successCount = 0;
  
  for (let i = 0; i < testFiles.length; i++) {
    const file = testFiles[i];
    const formData = new FormData();
    
    // Create actual File object
    const blob = new Blob([file.content], { type: file.type });
    const actualFile = new File([blob], file.name, { type: file.type });
    
    formData.append('document', actualFile);
    formData.append('documentType', file.name.includes('bank') ? 'bank_statements' : 
                                     file.name.includes('financial') ? 'financial_statements' : 
                                     'tax_returns');
    
    try {
      console.log(`📤 POST /api/public/applications/${applicationId}/documents (${i + 1}/6)`);
      console.log(`   File: ${file.name}`);
      
      const response = await fetch(`/api/public/applications/${applicationId}/documents`, {
        method: 'POST',
        body: formData
      });
      
      console.log(`📥 Response ${i + 1}/6:`, response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Upload ${i + 1}/6 Success:`, result);
        successCount++;
      } else {
        const errorText = await response.text();
        console.error(`❌ Upload ${i + 1}/6 Failed:`, errorText);
      }
      
    } catch (error) {
      console.error(`❌ Upload ${i + 1}/6 Error:`, error);
    }
  }
  
  console.log(`📊 Step 5 Summary: ${successCount}/6 uploads successful`);
  return successCount === 6;
}

// Test Step 7: Application Finalization
async function testStep7Finalization(applicationId) {
  console.log("\n=== STEP 7 TEST: Application Finalization ===");
  
  if (!applicationId) {
    console.error("❌ No applicationId provided for Step 7");
    return false;
  }
  
  const finalizationData = {
    status: "submitted",
    termsAccepted: true,
    privacyAccepted: true,
    submissionTimestamp: new Date().toISOString()
  };
  
  try {
    console.log(`📤 PATCH /api/public/applications/${applicationId}`);
    console.log("Body:", JSON.stringify(finalizationData, null, 2));
    
    const response = await fetch(`/api/public/applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify(finalizationData)
    });
    
    console.log("📥 Response:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Step 7 Failed:", errorText);
      return false;
    }
    
    const result = await response.json();
    console.log("✅ Step 7 Success:", result);
    
    return true;
    
  } catch (error) {
    console.error("❌ Step 7 Error:", error);
    return false;
  }
}

// Run Complete Workflow Test
async function runCompleteWorkflowTest() {
  console.log("🚀 Starting Complete Draft-First Workflow Test");
  console.log("Expected Network Calls:");
  console.log("Step 4: POST /api/public/applications 200 (Response carries applicationId)");
  console.log("Step 5: 6× POST /api/public/applications/:id/documents 200 (Fires on each chosen PDF)");
  console.log("Step 7: PATCH /api/public/applications/:id 200 (Body: { status:\"submitted\", … })");
  
  // Step 4: Create Application
  const applicationId = await testStep4ApplicationCreation();
  if (!applicationId) {
    console.error("🚫 Test stopped - Step 4 failed");
    return;
  }
  
  // Step 5: Upload Documents
  const step5Success = await testStep5DocumentUpload(applicationId);
  if (!step5Success) {
    console.error("⚠️ Step 5 had failures but continuing to Step 7");
  }
  
  // Step 7: Finalize Application
  const step7Success = await testStep7Finalization(applicationId);
  
  // Summary
  console.log("\n🏁 WORKFLOW TEST COMPLETE");
  console.log("Step 4 (Application Creation):", applicationId ? "✅ SUCCESS" : "❌ FAILED");
  console.log("Step 5 (Document Upload):", step5Success ? "✅ SUCCESS" : "❌ FAILED");
  console.log("Step 7 (Finalization):", step7Success ? "✅ SUCCESS" : "❌ FAILED");
  
  if (applicationId && step5Success && step7Success) {
    console.log("🎉 DRAFT-FIRST ARCHITECTURE FULLY OPERATIONAL!");
  } else {
    console.log("⚠️ Some issues detected - review logs above");
  }
}

// Export for browser console usage
window.runDraftFirstTest = runCompleteWorkflowTest;
window.testStep4 = testStep4ApplicationCreation;
window.testStep5 = testStep5DocumentUpload;
window.testStep7 = testStep7Finalization;

console.log("✅ Test functions loaded. Run: runDraftFirstTest()");