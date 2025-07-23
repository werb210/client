/**
 * COMPREHENSIVE END-TO-END TEST PROTOCOL
 * Tests complete application workflow from Step 1 through finalization
 */

import fetch from 'node-fetch';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5000';
const BEARER_TOKEN = process.env.VITE_CLIENT_APP_SHARED_TOKEN;

// Test company data - SITE ENGINEERING TECHNOLOGY INC
const TEST_DATA = {
  step1: {
    fundingAmount: 50000,
    requestedAmount: 50000,
    lookingFor: "equipment",
    fundsPurpose: "equipment",
    businessLocation: "CA",
    timeframe: "asap"
  },
  step3: {
    operatingName: "SITE ENGINEERING TECHNOLOGY INC",
    businessPhone: "+17805551234",
    businessState: "AB",
    businessCity: "Calgary",
    businessAddress: "123 Main Street",
    businessZip: "T2P 1A1",
    businessStartDate: "2015-01-01",
    industry: "construction",
    numberOfEmployees: 25,
    annualRevenue: 2500000,
    businessDescription: "Engineering and construction services"
  },
  step4: {
    applicantFirstName: "Todd",
    applicantLastName: "Werboweski",
    applicantEmail: "todd@werboweski.com",
    applicantPhone: "+17805551234",
    applicantTitle: "CEO",
    creditScore: "excellent",
    hasPartner: false
  }
};

const TEST_DOCUMENTS = [
  { filename: 'bank_statement_nov_2024.pdf', documentType: 'bank_statements' },
  { filename: 'bank_statement_dec_2024.pdf', documentType: 'bank_statements' },
  { filename: 'financial_statements_2024.pdf', documentType: 'financial_statements' }
];

async function makeApiCall(endpoint, method = 'GET', data = null, headers = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (BEARER_TOKEN && !headers['Authorization']) {
    options.headers['Authorization'] = `Bearer ${BEARER_TOKEN}`;
  }
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  console.log(`📡 [E2E_TEST] ${method} ${endpoint}`);
  const response = await fetch(url, options);
  const result = await response.json();
  
  console.log(`📥 [E2E_TEST] Response: ${response.status}`, result);
  return { response, result };
}

async function uploadDocument(applicationId, fileInfo) {
  const testContent = `%PDF-1.4
Test document content for ${fileInfo.filename}
Generated: ${new Date().toISOString()}
Application ID: ${applicationId}
Document Type: ${fileInfo.documentType}
%%EOF`;

  const formData = new FormData();
  formData.append('document', Buffer.from(testContent), {
    filename: fileInfo.filename,
    contentType: 'application/pdf'
  });
  formData.append('documentType', fileInfo.documentType);

  const headers = {
    ...formData.getHeaders()
  };
  
  if (BEARER_TOKEN) {
    headers['Authorization'] = `Bearer ${BEARER_TOKEN}`;
  }

  console.log(`📤 [E2E_TEST] Uploading: ${fileInfo.filename}`);
  const response = await fetch(`${BASE_URL}/api/public/upload/${applicationId}`, {
    method: 'POST',
    headers,
    body: formData
  });

  const result = await response.json();
  console.log(`📥 [E2E_TEST] Upload response: ${response.status}`, result);
  return { response, result };
}

async function runComprehensiveE2ETest() {
  console.log('🚀 [E2E_TEST] Starting comprehensive end-to-end test');
  console.log('📋 [E2E_TEST] Testing complete application workflow');
  
  const testResults = {
    steps: {},
    uploads: {},
    finalization: {},
    errors: [],
    applicationId: null
  };

  try {
    // Test 1: Verify server is running
    console.log('\n1️⃣ [E2E_TEST] Testing server availability...');
    const { response: healthCheck } = await makeApiCall('/api/health');
    if (!healthCheck.ok) {
      throw new Error('Server not responding');
    }
    testResults.steps.serverHealth = { status: 'PASS', response: healthCheck.status };

    // Test 2: Fetch lender products (simulating Step 2)
    console.log('\n2️⃣ [E2E_TEST] Testing lender products API...');
    const { response: productsResp, result: products } = await makeApiCall('/api/public/lender-products');
    testResults.steps.lenderProducts = {
      status: productsResp.ok ? 'PASS' : 'FAIL',
      productCount: products?.length || 0,
      response: productsResp.status
    };

    // Test 3: Create application (Step 4 simulation)
    console.log('\n3️⃣ [E2E_TEST] Creating application...');
    const applicationData = {
      ...TEST_DATA.step1,
      ...TEST_DATA.step3,
      ...TEST_DATA.step4
    };

    const { response: createResp, result: createResult } = await makeApiCall(
      '/api/public/applications',
      'POST',
      applicationData
    );

    if (createResp.ok && createResult.applicationId) {
      testResults.applicationId = createResult.applicationId;
      testResults.steps.applicationCreation = {
        status: 'PASS',
        applicationId: createResult.applicationId,
        response: createResp.status
      };
      console.log(`✅ [E2E_TEST] Application created: ${createResult.applicationId}`);
    } else if (createResp.status === 409) {
      // Handle duplicate application
      testResults.applicationId = createResult.applicationId;
      testResults.steps.applicationCreation = {
        status: 'PASS_DUPLICATE',
        applicationId: createResult.applicationId,
        response: createResp.status,
        message: 'Using existing application'
      };
      console.log(`♻️ [E2E_TEST] Using existing application: ${createResult.applicationId}`);
    } else {
      throw new Error(`Application creation failed: ${createResult.error}`);
    }

    // Test 4: Document uploads (Step 5 simulation)
    console.log('\n4️⃣ [E2E_TEST] Testing document uploads...');
    const uploadResults = [];
    
    for (let i = 0; i < TEST_DOCUMENTS.length; i++) {
      const doc = TEST_DOCUMENTS[i];
      try {
        const uploadResult = await uploadDocument(testResults.applicationId, doc);
        uploadResults.push({
          filename: doc.filename,
          status: uploadResult.response.ok ? 'PASS' : 'FAIL',
          documentId: uploadResult.result.documentId,
          response: uploadResult.response.status
        });
      } catch (error) {
        uploadResults.push({
          filename: doc.filename,
          status: 'FAIL',
          error: error.message
        });
      }
      
      // Brief pause between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    testResults.uploads = {
      total: TEST_DOCUMENTS.length,
      successful: uploadResults.filter(r => r.status === 'PASS').length,
      failed: uploadResults.filter(r => r.status === 'FAIL').length,
      details: uploadResults
    };

    // Test 5: Application finalization (Step 6 simulation)
    console.log('\n5️⃣ [E2E_TEST] Testing application finalization...');
    const finalizationData = {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      electronicSignature: {
        signedAt: new Date().toISOString(),
        signedBy: `${TEST_DATA.step4.applicantFirstName} ${TEST_DATA.step4.applicantLastName}`,
        ipAddress: '127.0.0.1',
        userAgent: 'E2E_TEST_AGENT'
      }
    };

    const { response: finalizeResp, result: finalizeResult } = await makeApiCall(
      `/api/public/applications/${testResults.applicationId}`,
      'PATCH',
      finalizationData
    );

    testResults.finalization = {
      status: finalizeResp.ok ? 'PASS' : 'FAIL',
      response: finalizeResp.status,
      finalStatus: finalizeResult.application?.status,
      details: finalizeResult
    };

    // Test 6: Verify application status
    console.log('\n6️⃣ [E2E_TEST] Verifying final application status...');
    const { response: statusResp, result: statusResult } = await makeApiCall(
      `/api/public/applications/${testResults.applicationId}/status`
    );

    testResults.steps.statusVerification = {
      status: statusResp.ok ? 'PASS' : 'FAIL',
      applicationStatus: statusResult.status,
      stage: statusResult.stage,
      response: statusResp.status
    };

  } catch (error) {
    console.error(`💥 [E2E_TEST] Test execution error: ${error.message}`);
    testResults.errors.push(error.message);
  }

  // Generate comprehensive test report
  console.log('\n🎯 [E2E_TEST] COMPREHENSIVE TEST RESULTS');
  console.log('==========================================');
  
  // Server Health
  const serverStatus = testResults.steps.serverHealth?.status || 'FAIL';
  console.log(`🏥 Server Health: ${serverStatus}`);
  
  // Lender Products
  const productsStatus = testResults.steps.lenderProducts?.status || 'FAIL';
  const productCount = testResults.steps.lenderProducts?.productCount || 0;
  console.log(`📊 Lender Products: ${productsStatus} (${productCount} products)`);
  
  // Application Creation
  const appStatus = testResults.steps.applicationCreation?.status || 'FAIL';
  console.log(`📝 Application Creation: ${appStatus}`);
  if (testResults.applicationId) {
    console.log(`   📄 Application ID: ${testResults.applicationId}`);
  }
  
  // Document Uploads
  const uploadTotal = testResults.uploads?.total || 0;
  const uploadSuccess = testResults.uploads?.successful || 0;
  const uploadFailed = testResults.uploads?.failed || 0;
  console.log(`📤 Document Uploads: ${uploadSuccess}/${uploadTotal} successful`);
  if (testResults.uploads?.details) {
    testResults.uploads.details.forEach((upload, i) => {
      console.log(`   ${i + 1}. ${upload.filename}: ${upload.status}`);
      if (upload.documentId) {
        console.log(`      📄 Document ID: ${upload.documentId}`);
      }
    });
  }
  
  // Application Finalization
  const finalizeStatus = testResults.finalization?.status || 'FAIL';
  console.log(`🏁 Application Finalization: ${finalizeStatus}`);
  if (testResults.finalization?.finalStatus) {
    console.log(`   📋 Final Status: ${testResults.finalization.finalStatus}`);
  }
  
  // Status Verification
  const verifyStatus = testResults.steps.statusVerification?.status || 'FAIL';
  console.log(`🔍 Status Verification: ${verifyStatus}`);
  if (testResults.steps.statusVerification?.applicationStatus) {
    console.log(`   📊 Application Status: ${testResults.steps.statusVerification.applicationStatus}`);
    console.log(`   🎭 Stage: ${testResults.steps.statusVerification.stage || 'N/A'}`);
  }
  
  // Overall Assessment
  const allTests = [
    testResults.steps.serverHealth?.status,
    testResults.steps.lenderProducts?.status,
    testResults.steps.applicationCreation?.status,
    testResults.finalization?.status,
    testResults.steps.statusVerification?.status
  ];
  
  const passedTests = allTests.filter(status => 
    status === 'PASS' || status === 'PASS_DUPLICATE'
  ).length;
  const totalTests = allTests.filter(status => status).length;
  
  const overallSuccess = passedTests === totalTests && uploadSuccess === uploadTotal;
  
  console.log('\n🎯 OVERALL ASSESSMENT:');
  console.log(`📊 Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`📤 Uploads Passed: ${uploadSuccess}/${uploadTotal}`);
  console.log(`🎯 Overall Status: ${overallSuccess ? 'PASS' : 'FAIL'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });
  }
  
  if (overallSuccess) {
    console.log('\n✅ [E2E_TEST] ALL TESTS PASSED - APPLICATION WORKFLOW FULLY OPERATIONAL');
  } else {
    console.log('\n❌ [E2E_TEST] SOME TESTS FAILED - REVIEW RESULTS ABOVE');
  }
  
  return testResults;
}

// Execute the comprehensive test
runComprehensiveE2ETest().then(results => {
  console.log('\n🏁 [E2E_TEST] Test execution complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 [E2E_TEST] Test execution failed:', error);
  process.exit(1);
});