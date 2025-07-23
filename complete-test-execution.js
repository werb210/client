/**
 * COMPLETE END-TO-END APPLICATION TEST
 * Using real SITE ENGINEERING TECHNOLOGY INC data and 6 ATB bank statements
 * Executes full workflow without interruption
 */

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

const bankStatements = [
  "nov 2024_1753309140916.pdf",
  "dec 15_1753309140916.pdf",
  "jan 15 2025_1753309140918.pdf", 
  "feb 15 2025_1753309140917.pdf",
  "mar 15 2025_1753309140918.pdf",
  "Apr 15 2025_1753309140914.pdf"
];

console.log("🚀 STARTING COMPLETE END-TO-END TEST");
console.log("🏢 Company: SITE ENGINEERING TECHNOLOGY INC");
console.log("📧 Contact: todd@werboweski.com");
console.log("💰 Amount: $150,000 CAD Equipment Financing");
console.log(`📄 Documents: ${bankStatements.length} ATB Financial bank statements`);

async function executeCompleteTest() {
  let applicationId = null;
  const results = {
    applicationCreated: false,
    documentsUploaded: 0,
    totalDocuments: bankStatements.length,
    finalized: false,
    errors: []
  };

  try {
    // Step 1: Create Application
    console.log("📝 STEP 1: Creating application...");
    const appResponse = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(testData)
    });

    const appResult = await appResponse.json();
    console.log(`📤 Application API Response: ${appResponse.status}`);
    
    if (appResponse.ok && appResult.applicationId) {
      applicationId = appResult.applicationId;
      results.applicationCreated = true;
      console.log(`✅ Application Created: ${applicationId}`);
    } else {
      throw new Error(`Application creation failed: ${JSON.stringify(appResult)}`);
    }

    // Step 2: Upload Documents
    console.log("📁 STEP 2: Uploading bank statements...");
    for (const filename of bankStatements) {
      try {
        // Check if file exists
        const checkResponse = await fetch(`/attached_assets/${filename}`, { method: 'HEAD' });
        
        if (!checkResponse.ok) {
          console.log(`⚠️ File not found: ${filename}`);
          continue;
        }

        // Get file and upload
        const fileResponse = await fetch(`/attached_assets/${filename}`);
        const fileBlob = await fileResponse.blob();
        
        const formData = new FormData();
        formData.append('document', fileBlob, filename);
        formData.append('documentType', 'bank_statements');

        const uploadResponse = await fetch(`/api/public/upload/${applicationId}`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token'
          },
          body: formData
        });

        const uploadResult = await uploadResponse.json();
        
        if (uploadResponse.ok) {
          results.documentsUploaded++;
          console.log(`✅ Uploaded: ${filename} (${fileBlob.size} bytes)`);
        } else {
          console.log(`❌ Upload failed: ${filename} - ${JSON.stringify(uploadResult)}`);
          results.errors.push(`Upload failed: ${filename}`);
        }
      } catch (error) {
        console.log(`❌ Error uploading ${filename}: ${error.message}`);
        results.errors.push(`Error uploading ${filename}: ${error.message}`);
      }
    }

    // Step 3: Finalize Application
    console.log("🏁 STEP 3: Finalizing application...");
    const finalizeResponse = await fetch(`/api/public/applications/${applicationId}/finalize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        status: 'submitted',
        submittedAt: new Date().toISOString()
      })
    });

    const finalizeResult = await finalizeResponse.json();
    console.log(`📤 Finalization API Response: ${finalizeResponse.status}`);
    
    if (finalizeResponse.ok) {
      results.finalized = true;
      console.log("✅ Application finalized successfully");
    } else {
      console.log(`❌ Finalization failed: ${JSON.stringify(finalizeResult)}`);
      results.errors.push(`Finalization failed: ${finalizeResult.error || 'Unknown error'}`);
    }

  } catch (error) {
    console.log(`❌ Critical error: ${error.message}`);
    results.errors.push(`Critical error: ${error.message}`);
  }

  // Final Results
  console.log("\n🎯 COMPLETE TEST RESULTS:");
  console.log(`📋 Application ID: ${applicationId || 'FAILED'}`);
  console.log(`📝 Application Created: ${results.applicationCreated ? 'YES' : 'NO'}`);
  console.log(`📁 Documents Uploaded: ${results.documentsUploaded}/${results.totalDocuments}`);
  console.log(`🏁 Application Finalized: ${results.finalized ? 'YES' : 'NO'}`);
  
  if (results.errors.length > 0) {
    console.log("❌ Errors encountered:");
    results.errors.forEach(error => console.log(`   - ${error}`));
  }

  const successRate = Math.round(
    ((results.applicationCreated ? 1 : 0) + 
     (results.documentsUploaded / results.totalDocuments) + 
     (results.finalized ? 1 : 0)) / 3 * 100
  );

  console.log(`\n📊 OVERALL SUCCESS RATE: ${successRate}%`);
  
  if (successRate >= 85) {
    console.log("🎉 TEST PASSED - System operational for production");
  } else {
    console.log("⚠️ TEST FAILED - Issues require resolution");
  }

  return {
    applicationId,
    successRate,
    results
  };
}

// Execute immediately
executeCompleteTest().then(result => {
  console.log("\n✅ Complete end-to-end test execution finished");
  window.testResults = result;
}).catch(error => {
  console.error("💥 Test execution failed:", error);
});