#!/usr/bin/env node

/**
 * TEST ACTUAL STEP 6 BEHAVIOR
 * Creates a complete application scenario and provides browser test instructions
 */

const API_BASE = 'http://localhost:5000';
const TEST_EMAIL = 'todd@werboweski.com';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = await response.text();
  }
  
  return { status: response.status, data };
}

async function setupTestScenario() {
  console.log('🎯 SETTING UP ACTUAL STEP 6 TEST SCENARIO');
  console.log('📧 Test Email:', TEST_EMAIL);
  
  // Create application that mirrors browser workflow
  const appData = {
    step1: { 
      requestedAmount: 75000, 
      use_of_funds: "working_capital", 
      businessLocation: "CA" 
    },
    step3: { 
      operatingName: "STEP 6 BEHAVIOR TEST", 
      businessPhone: "+15551112222", 
      businessState: "BC" 
    },
    step4: { 
      applicantFirstName: "Todd", 
      applicantLastName: "BehaviorTest", 
      applicantEmail: TEST_EMAIL, 
      email: TEST_EMAIL 
    }
  };
  
  console.log('\n1️⃣ Creating test application...');
  const createResult = await makeRequest('/api/public/applications', {
    method: 'POST',
    body: JSON.stringify(appData)
  });
  
  if (!createResult.data.success) {
    console.log('❌ Failed to create application');
    return null;
  }
  
  const applicationId = createResult.data.applicationId;
  console.log(`✅ Application created: ${applicationId}`);
  
  // Upload documents to simulate Step 5
  console.log('\n2️⃣ Simulating Step 5 document uploads...');
  const testPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<<\n/Size 1\n/Root 1 0 R\n>>\nstartxref\n32\n%%EOF');
  
  const documents = [
    'bank-statement-current.pdf',
    'bank-statement-previous.pdf'
  ];
  
  let successCount = 0;
  for (const docName of documents) {
    const formData = new FormData();
    const testFile = new File([testPdf], docName, { type: 'application/pdf' });
    formData.append('document', testFile);
    formData.append('documentType', 'bank_statements');
    
    const uploadResult = await makeRequest(`/api/public/upload/${applicationId}`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
    
    if (uploadResult.data.success) {
      successCount++;
      console.log(`   ✅ ${docName} uploaded successfully`);
    } else {
      console.log(`   ❌ ${docName} upload failed`);
    }
  }
  
  // Test document validation endpoint (should return 404)
  console.log('\n3️⃣ Testing document validation endpoint...');
  const validationResult = await makeRequest(`/api/public/applications/${applicationId}/documents`);
  console.log(`   Validation status: ${validationResult.status} (404 expected for client-generated IDs)`);
  
  console.log('\n📊 SETUP COMPLETE');
  console.log('='*60);
  console.log(`✅ Application ID: ${applicationId}`);
  console.log(`✅ Documents uploaded: ${successCount}/${documents.length}`);
  console.log(`✅ Validation endpoint: ${validationResult.status === 404 ? 'READY' : 'UNEXPECTED'}`);
  
  console.log('\n🎯 MANUAL BROWSER TEST REQUIRED');
  console.log('Now you need to test the actual Step 6 behavior:');
  
  console.log('\n📋 STEP-BY-STEP BROWSER TEST:');
  console.log('1. Open browser and go to: http://localhost:5000');
  console.log('2. Navigate through application steps with this data:');
  console.log(`   - Step 1: $75,000 working capital, Canada`);
  console.log(`   - Step 3: Business name "STEP 6 BEHAVIOR TEST", phone "+15551112222", BC`);
  console.log(`   - Step 4: Todd BehaviorTest, ${TEST_EMAIL}`);
  console.log(`   - Step 5: Upload 2+ bank statement documents`);
  console.log('3. On Step 6, open browser console and check logs');
  console.log('4. Attempt to finalize the application');
  
  console.log('\n🔍 WHAT TO LOOK FOR IN BROWSER CONSOLE:');
  console.log('✅ EXPECTED SUCCESS LOGS:');
  console.log('   "🔍 [STEP6] Checking local upload evidence:"');
  console.log('   "contextUploadedFilesCount: X" (where X > 0)');
  console.log('   "✅ [STEP6] Local upload evidence found"');
  console.log('   "Proceeding with application finalization"');
  
  console.log('\n❌ FAILURE INDICATORS:');
  console.log('   "❌ [STEP6] No local upload evidence found"');
  console.log('   "Documents Required" toast message');
  console.log('   Redirect back to Step 5');
  
  console.log('\n🧪 BROWSER CONSOLE DEBUG COMMANDS:');
  console.log('Run these in browser console on Step 6:');
  console.log('• window.debugApplication() - Check full application state');
  console.log('• Check state.step5DocumentUpload for upload data');
  console.log('• Verify localStorage.getItem("formData") contains uploaded files');
  
  return {
    applicationId,
    uploadCount: successCount,
    validationStatus: validationResult.status,
    testReady: successCount > 0 && validationResult.status === 404
  };
}

setupTestScenario()
  .then(result => {
    if (result && result.testReady) {
      console.log('\n🚀 TEST SCENARIO READY - PROCEED WITH BROWSER TESTING');
    } else {
      console.log('\n❌ TEST SCENARIO SETUP FAILED');
    }
  })
  .catch(console.error);