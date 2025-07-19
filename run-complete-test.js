// Complete Application Test - Execute Now
const testData = {
  step1: {
    businessLocation: "CA",
    headquarters: "CA", 
    headquartersState: "AB",
    industry: "engineering",
    lookingFor: "capital",
    fundingAmount: 75000,
    fundsPurpose: "working_capital",
    salesHistory: "3+yr",
    revenueLastYear: 480000,
    averageMonthlyRevenue: 40000,
    accountsReceivableBalance: 25000,
    fixedAssetsValue: 50000,
    equipmentValue: 75000,
    requestedAmount: 75000
  },
  step3: {
    operatingName: "SITE ENGINEERING TECHNOLOGY INC",
    legalName: "SITE ENGINEERING TECHNOLOGY INC",
    businessStructure: "corporation",
    businessStreetAddress: "PO BOX 20056",
    businessCity: "Red Deer",
    businessState: "AB",
    businessPostalCode: "T4N 6X5",
    businessPhone: "+14035551234",
    businessStartDate: "2012-01-01",
    businessWebsite: "",
    employeeCount: 8,
    estimatedYearlyRevenue: 480000
  },
  step4: {
    applicantFirstName: "John",
    applicantLastName: "Smith",
    applicantEmail: "john.smith@setinc.ca",
    applicantPhone: "+14035551234",
    applicantAddress: "PO BOX 20056",
    applicantCity: "Red Deer",
    applicantState: "AB",
    applicantZipCode: "T4N 6X5",
    applicantDateOfBirth: "1975-06-15",
    applicantSSN: "123456789",
    ownershipPercentage: 100,
    hasPartner: false
  }
};

// Test Step 4 Application Creation
async function testApplicationCreation() {
  console.log("🚀 Testing Step 4 Application Creation");
  
  const payload = {
    step1: testData.step1,
    step3: testData.step3, 
    step4: testData.step4
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/public/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log(`Application Creation: ${response.status} ${response.statusText}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Application created: ${data.applicationId}`);
      return data.applicationId;
    } else {
      console.error("❌ Application creation failed:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Network error:", error);
    return null;
  }
}

// Test Document Upload
async function testDocumentUpload(applicationId) {
  console.log("📄 Testing Document Upload");
  
  // Create a test file blob to simulate bank statement upload
  const testFile = new Blob(['%PDF-1.4 Test Bank Statement'], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('document', testFile, 'test-bank-statement.pdf');
  formData.append('documentType', 'bank_statements');
  
  try {
    const response = await fetch(`http://localhost:5000/api/public/applications/${applicationId}/documents`, {
      method: 'POST',
      body: formData
    });
    
    console.log(`Document Upload: ${response.status} ${response.statusText}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Document uploaded: ${data.documentId}`);
      return true;
    } else {
      console.error("❌ Document upload failed:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Upload error:", error);
    return false;
  }
}

// Test Application Finalization
async function testFinalization(applicationId) {
  console.log("🏁 Testing Application Finalization");
  
  const payload = {
    step6Authorization: {
      applicantName: "John Smith",
      timestamp: new Date().toISOString(),
      ipAddress: "127.0.0.1",
      userAgent: "Test Agent",
      agreements: {
        applicationAccuracy: true,
        electronicSignature: true,
        creditAuthorization: true,
        dataSharing: true,
        termsConditions: true
      }
    }
  };
  
  try {
    const response = await fetch(`http://localhost:5000/api/public/applications/${applicationId}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log(`Finalization: ${response.status} ${response.statusText}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Application finalized successfully");
      return true;
    } else {
      console.error("❌ Finalization failed:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Finalization error:", error);
    return false;
  }
}

// Execute Complete Test
async function runCompleteTest() {
  console.log("🧪 STARTING COMPLETE APPLICATION TEST");
  console.log("Testing SITE ENGINEERING TECHNOLOGY INC application");
  
  // Step 1: Create Application
  const applicationId = await testApplicationCreation();
  if (!applicationId) {
    console.error("❌ TEST FAILED: Could not create application");
    return;
  }
  
  // Step 2: Upload Document
  const uploadSuccess = await testDocumentUpload(applicationId);
  if (!uploadSuccess) {
    console.error("❌ TEST FAILED: Could not upload document");
    return;
  }
  
  // Step 3: Finalize Application
  const finalizeSuccess = await testFinalization(applicationId);
  if (!finalizeSuccess) {
    console.error("❌ TEST FAILED: Could not finalize application");
    return;
  }
  
  console.log("🎉 COMPLETE TEST SUCCESSFUL");
  console.log(`Application ID: ${applicationId}`);
  console.log("All endpoints working correctly!");
}

// Run the test
runCompleteTest();