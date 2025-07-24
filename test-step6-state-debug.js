#!/usr/bin/env node

/**
 * STEP 6 STATE DEBUG - COMPREHENSIVE TEST
 * Creates application, uploads documents, then checks what data is available
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

// Client-side script to check FormData context state
const CLIENT_DEBUG_SCRIPT = `
(function() {
  console.log('🧪 STEP 6 STATE DEBUG EXECUTED');
  
  // Try to access FormData context state directly
  const stateChecks = {
    windowDebugFunction: typeof window.debugApplication === 'function',
    localStorage: {
      formData: localStorage.getItem('formData') !== null,
      financialFormData: localStorage.getItem('financialFormData') !== null,
      applicationId: localStorage.getItem('applicationId') !== null
    }
  };
  
  console.log('🔍 State Check Results:', stateChecks);
  
  // Try window.debugApplication if available
  if (stateChecks.windowDebugFunction) {
    try {
      const debugResult = window.debugApplication();
      console.log('🧠 Debug Application Result:', debugResult);
      
      if (debugResult && debugResult.step5DocumentUpload) {
        console.log('📁 Step 5 Document Upload Data:', {
          files: debugResult.step5DocumentUpload.files || [],
          uploadedFiles: debugResult.step5DocumentUpload.uploadedFiles || [],
          completed: debugResult.step5DocumentUpload.completed
        });
      }
    } catch (e) {
      console.log('❌ Error calling debugApplication:', e.message);
    }
  }
  
  // Check localStorage data
  const formDataRaw = localStorage.getItem('formData') || localStorage.getItem('financialFormData');
  if (formDataRaw) {
    try {
      const parsed = JSON.parse(formDataRaw);
      console.log('💾 localStorage FormData:', {
        hasStep5: !!parsed.step5DocumentUpload,
        step5Files: parsed.step5DocumentUpload?.files?.length || 0,
        step5UploadedFiles: parsed.step5DocumentUpload?.uploadedFiles?.length || 0,
        applicationId: parsed.applicationId
      });
    } catch (e) {
      console.log('❌ Error parsing localStorage:', e.message);
    }
  }
  
  // Return summary for server-side test
  return {
    hasDebugFunction: stateChecks.windowDebugFunction,
    hasLocalStorage: stateChecks.localStorage.formData || stateChecks.localStorage.financialFormData,
    debugComplete: true
  };
})();
`;

async function testStep6StateDebug() {
  console.log('🧪 STEP 6 STATE DEBUG TEST');
  console.log('📧 Using duplicate email:', TEST_EMAIL);
  
  // Step 1: Create application
  console.log('\n1️⃣ Creating application...');
  const appData = {
    step1: { requestedAmount: 50000, use_of_funds: "working_capital", businessLocation: "CA" },
    step3: { operatingName: "STATE DEBUG TEST", businessPhone: "+15559876543", businessState: "ON" },
    step4: { applicantFirstName: "Todd", applicantLastName: "StateDebug", applicantEmail: TEST_EMAIL, email: TEST_EMAIL }
  };
  
  const createResult = await makeRequest('/api/public/applications', {
    method: 'POST',
    body: JSON.stringify(appData)
  });
  
  if (!createResult.data.success) {
    console.log('❌ Application creation failed');
    return;
  }
  
  const applicationId = createResult.data.applicationId;
  console.log(`✅ Application created: ${applicationId}`);
  
  // Step 2: Upload multiple documents
  console.log('\n2️⃣ Uploading documents...');
  const testPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<<\n/Size 1\n/Root 1 0 R\n>>\nstartxref\n32\n%%EOF');
  
  const documents = [
    { name: 'bank-statement-jan.pdf', type: 'bank_statements' },
    { name: 'bank-statement-feb.pdf', type: 'bank_statements' },
    { name: 'bank-statement-mar.pdf', type: 'bank_statements' }
  ];
  
  let uploadCount = 0;
  for (const doc of documents) {
    const formData = new FormData();
    const testFile = new File([testPdf], doc.name, { type: 'application/pdf' });
    formData.append('document', testFile);
    formData.append('documentType', doc.type);
    
    const uploadResult = await makeRequest(`/api/public/upload/${applicationId}`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
    
    if (uploadResult.data.success) {
      uploadCount++;
      console.log(`   ✅ ${doc.name}: SUCCESS`);
    } else {
      console.log(`   ❌ ${doc.name}: FAILED`);
    }
  }
  
  // Step 3: Test document validation (expecting 404)
  console.log('\n3️⃣ Testing document validation...');
  const docResult = await makeRequest(`/api/public/applications/${applicationId}/documents`);
  console.log(`   Status: ${docResult.status} (404 expected)`);
  
  // Summary
  console.log('\n📊 STATE DEBUG TEST SUMMARY:');
  console.log('='*50);
  console.log(`✅ Application Created: ${applicationId}`);
  console.log(`✅ Documents Uploaded: ${uploadCount}/${documents.length}`);
  console.log(`✅ Document Validation: ${docResult.status === 404 ? 'PASS (Expected 404)' : 'UNEXPECTED'}`);
  
  console.log('\n🎯 NEXT STEPS FOR MANUAL TESTING:');
  console.log('1. Open browser and navigate to the application');
  console.log('2. Go through Steps 1-5 with the created application');
  console.log('3. On Step 6, open browser console and run:');
  console.log('   window.debugApplication()');
  console.log('4. Check console logs for file arrays:');
  console.log('   - state.step5DocumentUpload.files');
  console.log('   - state.step5DocumentUpload.uploadedFiles');
  console.log('5. Verify checkLocalUploadEvidence() returns true');
  
  console.log('\n📋 CLIENT DEBUG SCRIPT:');
  console.log('Copy and paste this in browser console on Step 6:');
  console.log(CLIENT_DEBUG_SCRIPT);
  
  return {
    applicationId,
    uploadCount,
    validationStatus: docResult.status
  };
}

testStep6StateDebug().catch(console.error);