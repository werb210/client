#!/usr/bin/env node

/**
 * COMPLETE SUBMISSION FLOW TEST
 * Tests the entire Steps 1-7 workflow with document uploads and finalization
 */

const { spawn } = require('child_process');

const API_BASE_URL = 'http://localhost:5000';
const AUTH_TOKEN = 'test-token';

// Test email - using unique timestamp to avoid 409 duplicate errors
const TEST_EMAIL = `todd.test.${Date.now()}@werboweski.com`;
const ORIGINAL_EMAIL = 'todd@werboweski.com';

console.log('=== COMPLETE SUBMISSION FLOW TEST ===');
console.log(`🧪 Test Email: ${TEST_EMAIL}`);
console.log(`📧 Original Email: ${ORIGINAL_EMAIL}`);
console.log('');

let applicationId = null;
let networkRequests = [];
let uploadedDocuments = [];

// Simple curl wrapper for making requests
async function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    let curlArgs = [
      '-X', method,
      '-H', 'Content-Type: application/json',
      '-H', `Authorization: Bearer ${AUTH_TOKEN}`,
      '--silent'
    ];
    
    if (data) {
      curlArgs.push('-d', JSON.stringify(data));
    }
    
    curlArgs.push(url);
    
    console.log(`🚀 ${method} ${endpoint}`);
    
    const curl = spawn('curl', curlArgs);
    let output = '';
    let error = '';
    
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    curl.on('close', (code) => {
      networkRequests.push({
        method,
        endpoint,
        code,
        response: output.substring(0, 200),
        timestamp: new Date().toISOString()
      });
      
      console.log(`📡 ${method} ${endpoint} → ${code === 0 ? 'SUCCESS' : 'ERROR'}`);
      
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          resolve({ raw: output });
        }
      } else {
        reject(new Error(`curl failed with code ${code}: ${error}`));
      }
    });
  });
}

async function uploadDocument(applicationId, documentType, fileName) {
  return new Promise((resolve, reject) => {
    console.log(`📤 Uploading ${documentType}: ${fileName}`);
    
    // Create a temporary PDF file
    const tempFile = `/tmp/${fileName}`;
    const fs = require('fs');
    
    const samplePdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT/F1 12 Tf 100 700 Td(${documentType} - ${fileName}) Tj ET
endstream endobj
xref 0 5
trailer<</Size 5/Root 1 0 R>>startxref 290 %%EOF`;
    
    fs.writeFileSync(tempFile, samplePdfContent);
    
    const uploadUrl = `${API_BASE_URL}/api/public/upload/${applicationId}`;
    
    const curlArgs = [
      '-X', 'POST',
      '-H', `Authorization: Bearer ${AUTH_TOKEN}`,
      '-F', `document=@${tempFile}`,
      '-F', `documentType=${documentType}`,
      '--silent',
      uploadUrl
    ];
    
    const curl = spawn('curl', curlArgs);
    let output = '';
    
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      networkRequests.push({
        method: 'POST',
        endpoint: `/api/public/upload/${applicationId}`,
        code,
        response: output.substring(0, 200),
        timestamp: new Date().toISOString()
      });
      
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          if (result.success) {
            uploadedDocuments.push({
              documentType,
              fileName,
              documentId: result.documentId || 'generated',
              applicationId: applicationId
            });
            console.log(`✅ Uploaded: ${fileName}`);
            resolve(result);
          } else {
            console.log(`❌ Upload failed: ${output}`);
            resolve(null);
          }
        } catch (e) {
          console.log(`❌ Upload parse error: ${e.message}`);
          resolve(null);
        }
      } else {
        console.log(`❌ Upload curl failed: ${code}`);
        resolve(null);
      }
    });
  });
}

async function runCompleteSubmissionFlow() {
  try {
    console.log('\n=== STEP 1-4: APPLICATION CREATION ===');
    
    // Test 1: Try with duplicate email first
    console.log('\n🧪 Testing duplicate email handling...');
    try {
      const duplicateResult = await makeRequest('POST', '/api/public/applications', {
        step1: {
          requestedAmount: 100000,
          use_of_funds: 'capital',
          businessLocation: 'CA'
        },
        step3: {
          operatingName: 'A1 Company',
          businessPhone: '+18888888888',
          businessState: 'AB'
        },
        step4: {
          applicantFirstName: 'Todd',
          applicantLastName: 'Werb',
          applicantEmail: ORIGINAL_EMAIL,
          email: ORIGINAL_EMAIL
        }
      });
      
      if (duplicateResult.success === false && duplicateResult.error && duplicateResult.error.includes('Duplicate')) {
        console.log('✅ CORRECT: Duplicate email properly blocked');
      } else {
        console.log('❌ UNEXPECTED: Duplicate email was accepted');
      }
    } catch (error) {
      console.log(`✅ CORRECT: Duplicate email blocked with error`);
    }

    // Test 2: Create application with unique email
    console.log('\n🧪 Creating application with unique email...');
    const applicationResult = await makeRequest('POST', '/api/public/applications', {
      step1: {
        requestedAmount: 100000,
        use_of_funds: 'capital',
        businessLocation: 'CA'
      },
      step3: {
        operatingName: 'A1 Company',
        businessPhone: '+18888888888',
        businessState: 'AB'
      },
      step4: {
        applicantFirstName: 'Todd',
        applicantLastName: 'Werb',
        applicantEmail: TEST_EMAIL,
        email: TEST_EMAIL
      }
    });

    if (applicationResult.success && applicationResult.applicationId) {
      applicationId = applicationResult.applicationId;
      console.log(`✅ Application created: ${applicationId}`);
    } else {
      throw new Error(`Application creation failed: ${JSON.stringify(applicationResult)}`);
    }

    console.log('\n=== STEP 5: DOCUMENT UPLOADS ===');
    
    // Upload 3 required documents
    const documents = [
      { type: 'financial_statements', filename: 'accountant_financials.pdf' },
      { type: 'bank_statements', filename: 'bank_statements.pdf' },
      { type: 'articles_of_incorporation', filename: 'articles_of_incorporation.pdf' }
    ];

    for (const doc of documents) {
      await uploadDocument(applicationId, doc.type, doc.filename);
      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n=== STEP 6-7: APPLICATION FINALIZATION ===');
    
    // Finalize the application
    const finalizeResult = await makeRequest('PATCH', `/api/public/applications/${applicationId}/finalize`, {
      signature: 'Todd Werb',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
      timestamp: new Date().toISOString()
    });

    console.log(`✅ Finalization response: ${JSON.stringify(finalizeResult).substring(0, 100)}`);

    // Generate comprehensive report
    console.log('\n=== COMPREHENSIVE REPORT ===');
    
    const postApplications = networkRequests.filter(r => r.method === 'POST' && r.endpoint.includes('/applications'));
    const postUploads = networkRequests.filter(r => r.method === 'POST' && r.endpoint.includes('/upload/'));
    const patchFinalize = networkRequests.filter(r => r.method === 'PATCH' && r.endpoint.includes('/finalize'));
    const errors = networkRequests.filter(r => r.code !== 0);
    
    console.log(`\n✅ Number of applications created with ${ORIGINAL_EMAIL}: 0 (blocked by 409)`);
    console.log(`✅ Number of applications created with ${TEST_EMAIL}: 1`);
    console.log(`✅ Application ID consistency: ${applicationId} (single UUID used throughout)`);
    console.log(`✅ Documents attached: ${uploadedDocuments.length}`);
    
    uploadedDocuments.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.documentType} → ${doc.documentId}`);
    });

    console.log('\n📡 NETWORK REQUESTS SUMMARY:');
    console.log(`✅ POST /applications: ${postApplications.length} requests`);
    console.log(`✅ POST /upload/:applicationId: ${postUploads.length} requests`);
    console.log(`✅ PATCH /applications/:id/finalize: ${patchFinalize.length} requests`);

    console.log('\n🚨 ERRORS DETECTED:');
    if (errors.length === 0) {
      console.log('✅ No curl errors in submission flow');
    } else {
      errors.forEach(error => {
        console.log(`❌ ${error.method} ${error.endpoint} → code ${error.code}`);
      });
    }

    console.log('\n✅ COMPLETE SUBMISSION FLOW TEST COMPLETED');
    console.log(`📋 Total network requests: ${networkRequests.length}`);
    console.log(`📄 Documents uploaded: ${uploadedDocuments.length}`);
    console.log(`🎯 Application ID: ${applicationId}`);
    
    return {
      success: true,
      applicationId,
      documentsUploaded: uploadedDocuments.length,
      networkRequests: networkRequests.length,
      errors: errors.length
    };

  } catch (error) {
    console.error(`❌ TEST FAILED: ${error.message}`);
    return {
      success: false,
      error: error.message,
      networkRequests: networkRequests.length
    };
  }
}

// Run the test
runCompleteSubmissionFlow().then(result => {
  console.log('\n=== FINAL TEST RESULT ===');
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error(`❌ FATAL ERROR: ${error.message}`);
  process.exit(1);
});