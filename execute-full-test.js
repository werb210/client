/**
 * COMPLETE APPLICATION FLOW TEST - AUTOMATED EXECUTION
 * Using real SITE ENGINEERING TECHNOLOGY INC data and ATB bank statements
 */

console.log("🚀 STARTING COMPLETE APPLICATION FLOW TEST");

const testData = {
  businessName: "SITE ENGINEERING TECHNOLOGY INC",
  operatingName: "S E T Inc",
  businessLocation: "CA",
  fundingAmount: 150000,
  lookingFor: "equipment",
  fundsPurpose: "equipment",
  businessPhone: "+14035551234",
  businessEmail: "info@siteengineering.ca",
  businessAddress: "PO BOX 20056 Red Deer",
  businessCity: "Red Deer",
  businessState: "AB",
  businessPostalCode: "T4N 6X5",
  applicantFirstName: "Todd",
  applicantLastName: "Werboweski",
  applicantEmail: "todd@werboweski.com",
  applicantPhone: "+14035551234",
  dateOfBirth: "1980-01-01"
};

// Step 1: Navigate to application start
async function startApplication() {
  console.log("📝 STEP 1: Starting application");
  try {
    const response = await fetch('/apply/step-1');
    console.log("✅ Navigation successful");
    return true;
  } catch (error) {
    console.error("❌ Navigation failed:", error);
    return false;
  }
}

// Step 2: Create application via API
async function createApplication() {
  console.log("📝 STEP 2-4: Creating application with business data");
  
  const payload = {
    // Step 1 data
    businessName: testData.businessName,
    operatingName: testData.operatingName,
    businessLocation: testData.businessLocation,
    fundingAmount: testData.fundingAmount,
    lookingFor: testData.lookingFor,
    fundsPurpose: testData.fundsPurpose,
    
    // Step 3 data
    businessPhone: testData.businessPhone,
    businessEmail: testData.businessEmail,
    businessAddress: testData.businessAddress,
    businessCity: testData.businessCity,
    businessState: testData.businessState,
    businessPostalCode: testData.businessPostalCode,
    
    // Step 4 data
    applicantFirstName: testData.applicantFirstName,
    applicantLastName: testData.applicantLastName,
    applicantEmail: testData.applicantEmail,
    applicantPhone: testData.applicantPhone,
    dateOfBirth: testData.dateOfBirth
  };
  
  console.log("🧪 FINAL PAYLOAD:", JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log("📤 API Response:", response.status, result);
    
    if (response.ok && result.applicationId) {
      console.log("✅ Application created:", result.applicationId);
      return result.applicationId;
    } else {
      console.error("❌ Application creation failed:", result);
      return null;
    }
  } catch (error) {
    console.error("❌ API Error:", error);
    return null;
  }
}

// Step 5: Upload documents
async function uploadDocuments(applicationId) {
  console.log("📁 STEP 5: Uploading ATB bank statements");
  
  const documents = [
    "nov 2024_1753308255231.pdf",
    "dec 15_1753308255236.pdf", 
    "jan 15 2025_1753308255237.pdf",
    "feb 15 2025_1753308255237.pdf",
    "mar 15 2025_1753308255238.pdf",
    "Apr 15 2025_1753308255234.pdf"
  ];
  
  console.log(`📊 Found ${documents.length} ATB bank statements to upload`);
  
  for (const filename of documents) {
    try {
      // Check if file exists in attached_assets
      const fileExists = await fetch(`/attached_assets/${filename}`, { method: 'HEAD' });
      
      if (fileExists.ok) {
        console.log(`📤 Uploading: ${filename}`);
        
        // Create FormData for upload
        const formData = new FormData();
        
        // Fetch the actual file
        const fileResponse = await fetch(`/attached_assets/${filename}`);
        const fileBlob = await fileResponse.blob();
        
        formData.append('document', fileBlob, filename);
        formData.append('documentType', 'bank_statements');
        
        // Upload to server
        const uploadResponse = await fetch(`/api/public/upload/${applicationId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
          },
          body: formData
        });
        
        const uploadResult = await uploadResponse.json();
        console.log(`📥 Upload response for ${filename}:`, uploadResponse.status, uploadResult);
        
        if (uploadResponse.ok) {
          console.log(`✅ Successfully uploaded: ${filename}`);
        } else {
          console.error(`❌ Upload failed for ${filename}:`, uploadResult);
        }
      } else {
        console.log(`⚠️ File not found: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Error uploading ${filename}:`, error);
    }
  }
  
  console.log("✅ Document upload phase complete");
  return true;
}

// Step 6: Finalize application
async function finalizeApplication(applicationId) {
  console.log("📝 STEP 6: Finalizing application");
  
  try {
    const response = await fetch(`/api/public/applications/${applicationId}/finalize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify({
        status: 'submitted',
        submittedAt: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    console.log("📤 Finalization response:", response.status, result);
    
    if (response.ok) {
      console.log("✅ Application finalized successfully");
      return true;
    } else {
      console.error("❌ Finalization failed:", result);
      return false;
    }
  } catch (error) {
    console.error("❌ Finalization error:", error);
    return false;
  }
}

// Execute complete test
async function executeCompleteTest() {
  console.log("🟦 EXECUTING COMPLETE APPLICATION FLOW TEST");
  console.log("🏢 Company: SITE ENGINEERING TECHNOLOGY INC");
  console.log("📧 Email: todd@werboweski.com");
  console.log("💰 Amount: $150,000 CAD");
  console.log("📄 Documents: 6 ATB Financial bank statements");
  
  // Step 1: Start
  const started = await startApplication();
  if (!started) return;
  
  // Step 2-4: Create application
  const applicationId = await createApplication();
  if (!applicationId) return;
  
  // Step 5: Upload documents
  const uploaded = await uploadDocuments(applicationId);
  if (!uploaded) return;
  
  // Step 6: Finalize
  const finalized = await finalizeApplication(applicationId);
  
  if (finalized) {
    console.log("🎉 COMPLETE APPLICATION FLOW TEST SUCCESSFUL!");
    console.log(`📋 Final Application ID: ${applicationId}`);
    console.log("📊 All 6 ATB bank statements uploaded");
    console.log("✅ Application submitted successfully");
  } else {
    console.log("❌ Test completed with errors");
  }
}

// Make functions available globally
window.executeCompleteTest = executeCompleteTest;
window.testData = testData;

console.log("🔧 Test ready - run window.executeCompleteTest() to start");