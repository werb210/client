/**
 * SERVER-SIDE S3 UPLOAD TEST EXECUTION
 * Direct execution of S3 upload test with comprehensive logging
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const TEST_APPLICATION_ID = '0e0b80e6-330a-4c55-8cb0-8ac788d86806';
const UPLOAD_ENDPOINT = `http://localhost:5000/api/public/upload/${TEST_APPLICATION_ID}`;
const BEARER_TOKEN = process.env.VITE_CLIENT_APP_SHARED_TOKEN;

// Test files provided by user
const TEST_FILES = [
  { filename: 'nov 2024_1753310949611.pdf', documentType: 'bank_statements' },
  { filename: 'Apr 15 2025_1753310949613.pdf', documentType: 'bank_statements' },
  { filename: 'dec 15_1753310949616.pdf', documentType: 'bank_statements' },
  { filename: 'feb 15 2025_1753310949616.pdf', documentType: 'bank_statements' },
  { filename: 'jan 15 2025_1753310949617.pdf', documentType: 'bank_statements' },
  { filename: 'mar 15 2025_1753310949617.pdf', documentType: 'bank_statements' }
];

async function executeS3UploadTest() {
  console.log('🚀 [S3_UPLOAD_TEST] Starting complete S3 upload test protocol');
  console.log('📁 [S3_UPLOAD_TEST] Application ID:', TEST_APPLICATION_ID);
  console.log('📄 [S3_UPLOAD_TEST] Files to upload:', TEST_FILES.length);
  console.log('🔑 [S3_UPLOAD_TEST] Bearer token:', BEARER_TOKEN ? 'Present' : 'Missing');
  console.log('🎯 [S3_UPLOAD_TEST] Target endpoint:', UPLOAD_ENDPOINT);
  
  const results = {
    totalFiles: TEST_FILES.length,
    successful: 0,
    failed: 0,
    uploads: [],
    s3Fallbacks: 0,
    errors: []
  };

  for (let i = 0; i < TEST_FILES.length; i++) {
    const fileInfo = TEST_FILES[i];
    console.log(`\n📤 [S3_UPLOAD_TEST] Processing file ${i + 1}/${TEST_FILES.length}: ${fileInfo.filename}`);
    
    try {
      // Create test file content (simulating PDF upload)
      const testContent = `%PDF-1.4
Test bank statement content for ${fileInfo.filename}
Generated: ${new Date().toISOString()}
Application ID: ${TEST_APPLICATION_ID}
Document Type: ${fileInfo.documentType}
File Size: Simulated PDF content
%%EOF`;
      
      // Create FormData
      const formData = new FormData();
      formData.append('document', Buffer.from(testContent), {
        filename: fileInfo.filename,
        contentType: 'application/pdf'
      });
      formData.append('documentType', fileInfo.documentType);
      
      console.log(`📋 [S3_UPLOAD_TEST] FormData prepared:`, {
        filename: fileInfo.filename,
        size: testContent.length,
        type: 'application/pdf',
        documentType: fileInfo.documentType
      });
      
      // Execute upload
      const startTime = Date.now();
      const headers = {
        ...formData.getHeaders()
      };
      
      if (BEARER_TOKEN) {
        headers['Authorization'] = `Bearer ${BEARER_TOKEN}`;
      }
      
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        headers,
        body: formData
      });
      
      const uploadTime = Date.now() - startTime;
      let responseData;
      
      try {
        const responseText = await response.text();
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { error: 'Failed to parse response as JSON', rawResponse: responseText };
      }
      
      console.log(`📥 [S3_UPLOAD_TEST] Response received (${uploadTime}ms):`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: responseData
      });
      
      // Analyze response
      const uploadResult = {
        filename: fileInfo.filename,
        documentType: fileInfo.documentType,
        status: response.status,
        success: response.ok && (responseData.success === true || response.status === 201),
        documentId: responseData.documentId,
        storage_key: responseData.storage_key,
        uploadTime,
        s3Fallback: responseData.fallback || false,
        error: responseData.error || null,
        rawResponse: responseData
      };
      
      results.uploads.push(uploadResult);
      
      if (uploadResult.success) {
        results.successful++;
        console.log(`✅ [S3_UPLOAD_TEST] Upload successful:`, {
          documentId: uploadResult.documentId,
          storage_key: uploadResult.storage_key,
          s3Fallback: uploadResult.s3Fallback
        });
        
        if (uploadResult.s3Fallback) {
          results.s3Fallbacks++;
          console.warn(`⚠️ [S3_UPLOAD_TEST] S3 fallback detected for ${fileInfo.filename}`);
        }
      } else {
        results.failed++;
        results.errors.push(`${fileInfo.filename}: ${uploadResult.error || 'HTTP ' + uploadResult.status}`);
        console.error(`❌ [S3_UPLOAD_TEST] Upload failed:`, {
          status: uploadResult.status,
          error: uploadResult.error,
          response: uploadResult.rawResponse
        });
      }
      
    } catch (error) {
      results.failed++;
      results.errors.push(`${fileInfo.filename}: ${error.message}`);
      console.error(`💥 [S3_UPLOAD_TEST] Upload exception:`, error.message);
    }
    
    // Brief pause between uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Final results summary
  console.log('\n🎯 [S3_UPLOAD_TEST] COMPLETE RESULTS SUMMARY:');
  console.log('==========================================');
  console.log(`📊 Total Files: ${results.totalFiles}`);
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️ S3 Fallbacks: ${results.s3Fallbacks}`);
  console.log(`🎯 Success Rate: ${((results.successful / results.totalFiles) * 100).toFixed(1)}%`);
  
  if (results.successful > 0) {
    console.log('\n📋 [S3_UPLOAD_TEST] SUCCESSFUL UPLOADS:');
    results.uploads.filter(u => u.success).forEach((upload, i) => {
      console.log(`${i + 1}. ${upload.filename}:`);
      console.log(`   📄 Document ID: ${upload.documentId || 'N/A'}`);
      console.log(`   🔑 Storage Key: ${upload.storage_key || 'N/A'}`);
      console.log(`   ⏱️ Upload Time: ${upload.uploadTime}ms`);
      console.log(`   📂 S3 Fallback: ${upload.s3Fallback ? 'YES' : 'NO'}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ [S3_UPLOAD_TEST] ERRORS:');
    results.errors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });
  }
  
  // Test finalization if uploads were successful
  if (results.successful > 0) {
    console.log('\n🔄 [S3_UPLOAD_TEST] Testing application finalization...');
    try {
      const finalizeResponse = await fetch(`http://localhost:5000/api/public/applications/${TEST_APPLICATION_ID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEARER_TOKEN}`
        },
        body: JSON.stringify({
          status: 'submitted',
          submittedAt: new Date().toISOString()
        })
      });
      
      const finalizeData = await finalizeResponse.json();
      console.log(`📋 [S3_UPLOAD_TEST] Finalization response: ${finalizeResponse.status}`, finalizeData);
      
      if (finalizeResponse.ok) {
        console.log('✅ [S3_UPLOAD_TEST] Application finalization successful');
      } else {
        console.log('❌ [S3_UPLOAD_TEST] Application finalization failed');
      }
    } catch (error) {
      console.error('💥 [S3_UPLOAD_TEST] Finalization error:', error.message);
    }
  }
  
  return results;
}

// Execute the test
executeS3UploadTest().then(results => {
  console.log('\n🏁 [S3_UPLOAD_TEST] Test execution complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 [S3_UPLOAD_TEST] Test execution failed:', error);
  process.exit(1);
});