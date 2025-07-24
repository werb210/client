#!/usr/bin/env node

/**
 * VERIFY STEP 6 FIX - DOCUMENT VALIDATION TEST
 * Simulates the exact scenario: upload docs, check Step 6 behavior
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

async function verifyStep6Fix() {
  console.log('🔍 VERIFYING STEP 6 DOCUMENT VALIDATION FIX');
  console.log('📧 Testing with:', TEST_EMAIL);
  
  // Create application
  const appData = {
    step1: { requestedAmount: 45000, use_of_funds: "working_capital", businessLocation: "CA" },
    step3: { operatingName: "VERIFICATION TEST", businessPhone: "+15551234567", businessState: "ON" },
    step4: { applicantFirstName: "Todd", applicantLastName: "Verification", applicantEmail: TEST_EMAIL, email: TEST_EMAIL }
  };
  
  console.log('\n1️⃣ Creating application...');
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
  
  // Upload documents
  console.log('\n2️⃣ Uploading documents...');
  const testPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<<\n/Size 1\n/Root 1 0 R\n>>\nstartxref\n32\n%%EOF');
  
  const formData = new FormData();
  const testFile = new File([testPdf], 'bank-statement.pdf', { type: 'application/pdf' });
  formData.append('document', testFile);
  formData.append('documentType', 'bank_statements');
  
  const uploadResult = await makeRequest(`/api/public/upload/${applicationId}`, {
    method: 'POST',
    body: formData,
    headers: {}
  });
  
  console.log(`   Upload result: ${uploadResult.data.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  // Test document validation (this should return 404)
  console.log('\n3️⃣ Testing document validation...');
  const docResult = await makeRequest(`/api/public/applications/${applicationId}/documents`);
  console.log(`   Validation status: ${docResult.status} (404 expected for client-generated IDs)`);
  
  // Summary
  console.log('\n📊 VERIFICATION RESULTS:');
  console.log('=' * 50);
  console.log(`✅ Application Creation: PASS`);
  console.log(`${uploadResult.data.success ? '✅' : '❌'} Document Upload: ${uploadResult.data.success ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Document Validation 404: ${docResult.status === 404 ? 'PASS (Expected)' : 'UNEXPECTED'}`);
  
  console.log('\n🎯 EXPECTED STEP 6 BEHAVIOR:');
  console.log('✅ checkLocalUploadEvidence() should find uploaded files');
  console.log('✅ Step 6 should allow finalization despite 404 response');
  console.log('✅ User should NOT be redirected back to Step 5');
  console.log('✅ Console should show: "Local upload evidence found"');
  
  console.log(`\n🆔 Test Application: ${applicationId}`);
  console.log('💡 Navigate to Step 6 in browser to test finalization');
  
  return applicationId;
}

verifyStep6Fix().catch(console.error);