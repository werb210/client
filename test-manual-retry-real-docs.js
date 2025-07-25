/**
 * Test Manual Retry with Real Documents
 * Simulates browser console execution of window.manualRetryAll()
 * Tests the 6 real PDF documents from the previous test
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:5000/api/public';
const STAFF_API_URL = 'https://staff.boreal.financial/api/public';
const BEARER_TOKEN = process.env.VITE_CLIENT_APP_SHARED_TOKEN || 'MISSING_TOKEN_PLEASE_SET_ENV_VAR';
const APPLICATION_ID = 'aac71c9a-d154-4914-8982-4f1a33ef8259'; // From previous test

console.log('🔄 [MANUAL RETRY] Testing window.manualRetryAll() with real banking documents');

// Real banking documents from previous test
const REAL_DOCUMENTS = [
  'November 2024_1751579433995.pdf',
  'December 2024_1751579433994.pdf', 
  'January 2025_1751579433994.pdf',
  'February 2025_1751579433994.pdf',
  'March 2025_1751579433994.pdf',
  'April 2025_1751579433993.pdf'
];

// Step 1: Test staff backend document endpoint availability
async function testStaffBackendEndpoint() {
  console.log('🔍 [RETRY TEST] Step 1: Testing staff backend document endpoint...');
  
  const testCommand = `curl -s -w "%{http_code}" -o /dev/null -X GET "${STAFF_API_URL}/applications/${APPLICATION_ID}/documents" -H "Authorization: Bearer ${BEARER_TOKEN}"`;
  
  try {
    const httpCode = execSync(testCommand, { encoding: 'utf8' }).trim();
    console.log(`📋 [RETRY TEST] Staff backend document endpoint response: ${httpCode}`);
    
    if (httpCode === '200') {
      console.log('✅ [RETRY TEST] Staff backend document endpoint is operational');
      return true;
    } else if (httpCode === '404') {
      console.log('❌ [RETRY TEST] Staff backend document endpoint still returns 404');
      return false;
    } else {
      console.log(`⚠️ [RETRY TEST] Staff backend document endpoint returned: ${httpCode}`);
      return false;
    }
  } catch (error) {
    console.error('❌ [RETRY TEST] Failed to test staff backend endpoint:', error.message);
    return false;
  }
}

// Step 2: Test upload endpoint with one document
async function testUploadEndpoint() {
  console.log('🔍 [RETRY TEST] Step 2: Testing upload endpoint with sample document...');
  
  const testFile = REAL_DOCUMENTS[0]; // November 2024 PDF
  const filePath = path.join(__dirname, 'attached_assets', testFile);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ [RETRY TEST] Test file not found: ${filePath}`);
    return false;
  }
  
  const fileStats = fs.statSync(filePath);
  console.log(`📄 [RETRY TEST] Testing with: ${testFile} (${fileStats.size} bytes)`);
  
  const curlCommand = `curl -s -X POST "${API_BASE_URL}/upload/${APPLICATION_ID}" \\
    -H "Authorization: Bearer ${BEARER_TOKEN}" \\
    -F "document=@${filePath}" \\
    -F "documentType=bank_statements"`;
  
  try {
    const result = execSync(curlCommand, { encoding: 'utf8' });
    console.log(`📊 [RETRY TEST] Upload test response:`, result);
    
    const response = JSON.parse(result);
    
    // Check if we got a real S3 response (not fallback)
    if (response.fallback === false && response.storage_key && !response.documentId?.startsWith('fallback_')) {
      console.log('✅ [RETRY TEST] REAL S3 UPLOAD SUCCESS - Staff backend S3 is working!');
      console.log(`📋 [RETRY TEST] Document details:`, {
        documentId: response.documentId,
        storage_key: response.storage_key,
        s3_key: response.s3_key
      });
      return true;
    } else if (response.fallback === true || response.documentId?.startsWith('fallback_')) {
      console.log('⚠️ [RETRY TEST] Still in fallback mode - S3 not ready yet');
      return false;
    } else {
      console.log('🤔 [RETRY TEST] Unclear response - investigating...');
      return false;
    }
    
  } catch (error) {
    console.error('❌ [RETRY TEST] Upload test failed:', error.message);
    return false;
  }
}

// Step 3: Execute full manual retry simulation
async function executeManualRetryAll() {
  console.log('🔄 [RETRY TEST] Step 3: Executing manual retry of all 6 documents...');
  
  let successCount = 0;
  let failedCount = 0;
  const results = [];
  
  for (const fileName of REAL_DOCUMENTS) {
    console.log(`📤 [RETRY TEST] Retrying upload: ${fileName}`);
    
    const filePath = path.join(__dirname, 'attached_assets', fileName);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ [RETRY TEST] File not found: ${filePath}`);
      failedCount++;
      continue;
    }
    
    const fileStats = fs.statSync(filePath);
    console.log(`📊 [RETRY TEST] Processing: ${fileName} (${fileStats.size} bytes)`);
    
    const curlCommand = `curl -s -X POST "${API_BASE_URL}/upload/${APPLICATION_ID}" \\
      -H "Authorization: Bearer ${BEARER_TOKEN}" \\
      -F "document=@${filePath}" \\
      -F "documentType=bank_statements"`;
    
    try {
      const result = execSync(curlCommand, { encoding: 'utf8', timeout: 30000 });
      console.log(`📋 [RETRY TEST] Response for ${fileName}:`, result);
      
      const response = JSON.parse(result);
      
      // Determine if this was a real S3 upload
      const isS3Upload = response.fallback === false && 
                        response.storage_key && 
                        !response.documentId?.startsWith('fallback_');
      
      if (isS3Upload) {
        successCount++;
        console.log(`✅ [RETRY TEST] S3 SUCCESS: ${fileName}`, {
          documentId: response.documentId,
          storage_key: response.storage_key
        });
      } else {
        failedCount++;
        console.log(`⚠️ [RETRY TEST] FALLBACK: ${fileName} still in fallback mode`);
      }
      
      results.push({
        fileName,
        success: isS3Upload,
        documentId: response.documentId,
        storage_key: response.storage_key,
        fallback: response.fallback
      });
      
    } catch (error) {
      failedCount++;
      console.error(`❌ [RETRY TEST] Failed to retry ${fileName}:`, error.message);
      results.push({
        fileName,
        success: false,
        error: error.message
      });
    }
  }
  
  console.log('📊 [RETRY TEST] Manual retry complete:', {
    totalDocuments: REAL_DOCUMENTS.length,
    successfulS3Uploads: successCount,
    fallbacksRemaining: failedCount,
    results: results.length
  });
  
  return { successCount, failedCount, results };
}

// Step 4: Verify documents in staff backend
async function verifyDocumentsInStaff() {
  console.log('🔍 [RETRY TEST] Step 4: Verifying documents appear in staff backend...');
  
  const curlCommand = `curl -s -X GET "${STAFF_API_URL}/applications/${APPLICATION_ID}/documents" \\
    -H "Authorization: Bearer ${BEARER_TOKEN}"`;
  
  try {
    const result = execSync(curlCommand, { encoding: 'utf8' });
    console.log(`📋 [RETRY TEST] Staff backend document verification:`, result);
    
    // Try to parse as JSON
    try {
      const response = JSON.parse(result);
      if (response.documents && Array.isArray(response.documents)) {
        console.log(`✅ [RETRY TEST] Found ${response.documents.length} documents in staff backend`);
        response.documents.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.fileName || doc.filename} (${doc.documentId})`);
        });
        return response.documents.length;
      }
    } catch (parseError) {
      console.log('📋 [RETRY TEST] Non-JSON response - analyzing...');
      if (result.includes('<!DOCTYPE html>')) {
        console.log('❌ [RETRY TEST] Staff backend returned HTML error page');
        return 0;
      }
    }
    
    return 0;
  } catch (error) {
    console.error('❌ [RETRY TEST] Failed to verify documents in staff backend:', error.message);
    return 0;
  }
}

// Main execution
async function runManualRetryTest() {
  console.log('🚀 [MANUAL RETRY TEST] Starting comprehensive retry test');
  
  try {
    // Test staff backend availability
    const staffEndpointWorking = await testStaffBackendEndpoint();
    
    // Test upload endpoint
    const uploadWorking = await testUploadEndpoint();
    
    if (!uploadWorking) {
      console.log('⚠️ [RETRY TEST] Upload endpoint still in fallback mode - staff S3 not ready');
      console.log('💡 [RETRY TEST] This is expected if staff backend S3 integration is still being fixed');
      return;
    }
    
    // Execute full retry
    const retryResults = await executeManualRetryAll();
    
    // Verify in staff backend
    const documentsInStaff = await verifyDocumentsInStaff();
    
    // Final summary
    console.log('🎯 [MANUAL RETRY TEST] FINAL RESULTS:', {
      staffBackendWorking: staffEndpointWorking,
      s3UploadsSuccessful: retryResults.successCount,
      documentsInStaffBackend: documentsInStaff,
      testComplete: true
    });
    
    if (retryResults.successCount === 6 && documentsInStaff >= 6) {
      console.log('🎉 [MANUAL RETRY TEST] SUCCESS: All documents uploaded to S3 and visible in staff backend!');
    } else {
      console.log('⚠️ [MANUAL RETRY TEST] PARTIAL: Some documents may still be in fallback mode');
    }
    
  } catch (error) {
    console.error('❌ [MANUAL RETRY TEST] Test failed:', error.message);
  }
}

// Execute the test
runManualRetryTest();