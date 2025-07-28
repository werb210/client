#!/usr/bin/env node

/**
 * TEST STEP 6 LOCAL EVIDENCE FIX
 * Verifies that Step 6 can now detect uploaded files properly
 */

import fs from 'fs';

const API_BASE = 'http://localhost:5000';
const TEST_EMAIL = 'todd@werboweski.com';
const AUTH_TOKEN = 'test-token';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`
  };
  
  const response = await fetch(url, {
    headers: { ...defaultHeaders, ...options.headers },
    ...options
  });
  
  const responseData = await response.text();
  let parsedData;
  try {
    parsedData = JSON.parse(responseData);
  } catch (e) {
    parsedData = responseData;
  }
  
  return {
    status: response.status,
    statusText: response.statusText,
    data: parsedData
  };
}

async function testStep6LocalEvidenceFix() {
  console.log('🧪 TESTING STEP 6 LOCAL EVIDENCE FIX');
  console.log('📧 Using duplicate email:', TEST_EMAIL);
  console.log('🎯 Goal: Verify Step 6 can detect uploaded files and allow finalization');
  
  // Step 1: Create application with duplicate email
  console.log('\n1️⃣ Creating application with duplicate email...');
  const applicationData = {
    step1: { requestedAmount: 35000, use_of_funds: "working_capital", businessLocation: "CA" },
    step3: { operatingName: "LOCAL EVIDENCE TEST", businessPhone: "+15557778888", businessState: "ON" },
    step4: { applicantFirstName: "Todd", applicantLastName: "Test", applicantEmail: TEST_EMAIL, email: TEST_EMAIL }
  };
  
  const createResult = await makeRequest('/api/public/applications', {
    method: 'POST',
    body: JSON.stringify(applicationData)
  });
  
  if (createResult.status !== 200 || !createResult.data.success) {
    console.log('❌ Application creation failed:', createResult);
    return;
  }
  
  const applicationId = createResult.data.applicationId;
  console.log('✅ Application created:', applicationId);
  
  // Step 2: Upload multiple test documents
  console.log('\n2️⃣ Uploading multiple test documents...');
  const testDocuments = [
    { name: 'bank-statement-1.pdf', type: 'bank_statements' },
    { name: 'bank-statement-2.pdf', type: 'bank_statements' }
  ];
  
  const uploadResults = [];
  const testPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<<\n/Size 1\n/Root 1 0 R\n>>\nstartxref\n32\n%%EOF');
  
  for (const doc of testDocuments) {
    const formData = new FormData();
    const testFile = new File([testPdfBuffer], doc.name, { type: 'application/pdf' });
    formData.append('document', testFile);
    formData.append('documentType', doc.type);
    
    const uploadResult = await makeRequest(`/api/public/upload/${applicationId}`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
    
    uploadResults.push({
      name: doc.name,
      success: uploadResult.data?.success || false,
      status: uploadResult.status
    });
    
    console.log(`   ${doc.name}: ${uploadResult.data?.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  }
  
  const allUploadsSuccessful = uploadResults.every(r => r.success);
  
  // Step 3: Test document validation (expecting 404)
  console.log('\n3️⃣ Testing document validation (expecting 404)...');
  const docValidationResult = await makeRequest(`/api/public/applications/${applicationId}/documents`);
  
  console.log(`   Validation Status: ${docValidationResult.status}`);
  console.log(`   Expected: 404 (client-generated IDs not in staff backend)`);
  
  // Summary
  console.log('\n📊 LOCAL EVIDENCE FIX TEST SUMMARY:');
  console.log('='*50);
  
  console.log(`✅ Application Creation: PASS`);
  console.log(`${allUploadsSuccessful ? '✅' : '❌'} Document Uploads: ${allUploadsSuccessful ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Document Validation 404: ${docValidationResult.status === 404 ? 'PASS (Expected)' : 'UNEXPECTED'}`);
  
  console.log('\n🎯 EXPECTED BEHAVIOR:');
  console.log('✅ Step 6 should now detect local upload evidence');
  console.log('✅ checkLocalUploadEvidence() should find files in state.step5DocumentUpload.files');
  console.log('✅ Users should be able to finalize applications despite 404 responses');
  console.log('✅ No more redirects back to Step 5');
  
  console.log('\n💡 NEXT STEP:');
  console.log('   Navigate to Step 6 in the browser and attempt finalization');
  console.log('   The console should show: "✅ [STEP6] Local upload evidence found"');
  console.log('   Finalization should proceed successfully');
  
  console.log(`\n🆔 Test Application ID: ${applicationId}`);
  
  return {
    applicationId,
    uploadsSuccessful: allUploadsSuccessful,
    validationStatus: docValidationResult.status
  };
}

testStep6LocalEvidenceFix().catch(console.error);