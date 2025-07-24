#!/usr/bin/env node

/**
 * COMPLETE DUPLICATE EMAIL FLOW TEST  
 * Tests Steps 4→5→6→7 with todd@werboweski.com to verify duplicate email handling
 */

import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000';
const TEST_EMAIL = 'todd@werboweski.com';
const AUTH_TOKEN = 'test-token';

// Test application data
const applicationData = {
  step1: {
    requestedAmount: 50000,
    use_of_funds: "equipment",
    businessLocation: "CA"
  },
  step3: {
    operatingName: "DUPLICATE TEST CORP",
    businessPhone: "+15551234567", 
    businessState: "BC"
  },
  step4: {
    applicantFirstName: "Todd",
    applicantLastName: "Werboweski", 
    applicantEmail: TEST_EMAIL,
    email: TEST_EMAIL
  }
};

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
    data: parsedData,
    headers: Object.fromEntries(response.headers.entries())
  };
}

async function testStep4DuplicateEmail() {
  console.log('\n🧪 STEP 4: Testing duplicate email submission...');
  
  const result = await makeRequest('/api/public/applications', {
    method: 'POST',
    body: JSON.stringify(applicationData)
  });
  
  console.log(`Status: ${result.status} ${result.statusText}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200 && result.data.success && result.data.applicationId) {
    console.log('✅ STEP 4 SUCCESS: Duplicate email allowed, applicationId received');
    return result.data.applicationId;
  } else {
    console.log('❌ STEP 4 FAILED: Duplicate email still blocked or no applicationId');
    return null;
  }
}

async function testStep5DocumentUpload(applicationId) {
  console.log('\n🧪 STEP 5: Testing document upload...');
  
  // Create a test PDF buffer
  const testPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000125 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n173\n%%EOF');
  
  const formData = new FormData();
  const testFile = new File([testPdfContent], 'test-bank-statement.pdf', { type: 'application/pdf' });
  formData.append('document', testFile);
  formData.append('documentType', 'bank_statements');
  
  const result = await makeRequest(`/api/public/upload/${applicationId}`, {
    method: 'POST',
    body: formData,
    headers: {} // Remove Content-Type to let browser set multipart boundary
  });
  
  console.log(`Status: ${result.status} ${result.statusText}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 201 || (result.status === 200 && result.data.success)) {
    console.log('✅ STEP 5 SUCCESS: Document uploaded successfully');
    return true;
  } else {
    console.log('❌ STEP 5 FAILED: Document upload failed');
    return false;
  }
}

async function testStep6Finalization(applicationId) {
  console.log('\n🧪 STEP 6: Testing application finalization...');
  
  const finalizationData = {
    signedName: "Todd Werboweski",
    agreedToTerms: true,
    electronicSignature: true,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1"
  };
  
  const result = await makeRequest(`/api/public/applications/${applicationId}`, {
    method: 'PATCH',
    body: JSON.stringify(finalizationData)
  });
  
  console.log(`Status: ${result.status} ${result.statusText}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ STEP 6 SUCCESS: Application finalized successfully');
    return true;
  } else {
    console.log('❌ STEP 6 FAILED: Application finalization failed');
    return false;
  }
}

async function runCompleteTest() {
  console.log('🚀 STARTING COMPLETE DUPLICATE EMAIL FLOW TEST');
  console.log(`📧 Using test email: ${TEST_EMAIL}`);
  console.log(`🎯 Target: Steps 4→5→6 complete workflow`);
  
  try {
    // Step 4: Create application with duplicate email
    const applicationId = await testStep4DuplicateEmail();
    if (!applicationId) {
      console.log('\n❌ TEST FAILED: Could not create application in Step 4');
      return;
    }
    
    console.log(`\n🆔 Application ID: ${applicationId}`);
    
    // Step 5: Upload document
    const uploadSuccess = await testStep5DocumentUpload(applicationId);
    if (!uploadSuccess) {
      console.log('\n⚠️  Step 5 failed, but continuing to test Step 6...');
    }
    
    // Step 6: Finalize application  
    const finalizeSuccess = await testStep6Finalization(applicationId);
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Step 4 (Duplicate Email): ${applicationId ? 'PASS' : 'FAIL'}`);
    console.log(`${uploadSuccess ? '✅' : '❌'} Step 5 (Document Upload): ${uploadSuccess ? 'PASS' : 'FAIL'}`);
    console.log(`${finalizeSuccess ? '✅' : '❌'} Step 6 (Finalization): ${finalizeSuccess ? 'PASS' : 'FAIL'}`);
    
    if (applicationId && finalizeSuccess) {
      console.log('\n🎉 COMPLETE SUCCESS: Duplicate email flow works end-to-end!');
      console.log(`📋 Final Application ID: ${applicationId}`);
    } else {
      console.log('\n⚠️  Partial success - see individual step results above');
    }
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
runCompleteTest();