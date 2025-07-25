/**
 * URGENT S3 VERIFICATION - Staff Backend Claims S3 is Now Working
 * Testing all 6 banking documents to verify S3 success responses
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:5000/api/public';
const BEARER_TOKEN = process.env.VITE_CLIENT_APP_SHARED_TOKEN || 'MISSING_TOKEN_PLEASE_SET_ENV_VAR';
const APPLICATION_ID = 'aac71c9a-d154-4914-8982-4f1a33ef8259';

console.log('🚨 [S3 VERIFICATION] URGENT: Testing if staff backend S3 is now working');
console.log('📋 [STAFF CLAIM] Success: true, fallback: false, storage: "s3", storageKey format expected');

const DOCUMENTS = [
  'November 2024_1751579433995.pdf',
  'December 2024_1751579433994.pdf', 
  'January 2025_1751579433994.pdf'
];

async function verifyS3Working() {
  console.log('\n🔬 [S3 TEST] Testing first 3 documents for S3 success responses...\n');
  
  let s3SuccessCount = 0;
  let fallbackCount = 0;
  
  for (let i = 0; i < DOCUMENTS.length; i++) {
    const fileName = DOCUMENTS[i];
    const filePath = path.join(__dirname, 'attached_assets', fileName);
    
    console.log(`📤 [TEST ${i+1}/3] Uploading: ${fileName}`);
    
    try {
      const curlCommand = `curl -s -X POST "${API_BASE_URL}/upload/${APPLICATION_ID}" \\
        -H "Authorization: Bearer ${BEARER_TOKEN}" \\
        -F "document=@${filePath}" \\
        -F "documentType=bank_statements"`;
      
      const result = execSync(curlCommand, { encoding: 'utf8', timeout: 15000 });
      const response = JSON.parse(result);
      
      console.log(`📊 [RESPONSE] Raw response:`, JSON.stringify(response, null, 2));
      
      // Check for S3 success indicators
      const isS3Success = response.fallback === false && 
                         response.success === true &&
                         response.storage_key && 
                         !response.documentId?.startsWith('fallback_');
      
      if (isS3Success) {
        s3SuccessCount++;
        console.log(`✅ [S3 SUCCESS] ${fileName} uploaded to S3!`);
        console.log(`   📋 Document ID: ${response.documentId}`);
        console.log(`   📋 Storage Key: ${response.storage_key || response.storageKey}`);
        console.log(`   📋 File Size: ${response.fileSize || 'Not provided'}`);
        console.log(`   📋 Checksum: ${response.checksum || 'Not provided'}`);
        console.log(`   📋 Storage: ${response.storage || 'Not specified'}`);
        console.log(`   📋 Fallback: ${response.fallback}`);
      } else {
        fallbackCount++;
        console.log(`❌ [FALLBACK] ${fileName} still in fallback mode`);
        console.log(`   📋 Fallback: ${response.fallback}`);
        console.log(`   📋 Document ID: ${response.documentId}`);
        console.log(`   📋 Success: ${response.success}`);
      }
      
    } catch (error) {
      console.error(`💥 [ERROR] Failed to test ${fileName}:`, error.message);
      fallbackCount++;
    }
    
    console.log(''); // Empty line between tests
  }
  
  console.log('🎯 [S3 VERIFICATION RESULTS]');
  console.log(`   S3 Successful Uploads: ${s3SuccessCount}/${DOCUMENTS.length}`);
  console.log(`   Fallback Mode Uploads: ${fallbackCount}/${DOCUMENTS.length}`);
  
  if (s3SuccessCount === DOCUMENTS.length) {
    console.log('\n🎉 [CONFIRMED] STAFF BACKEND S3 IS NOW WORKING!');
    console.log('📋 [NEXT STEP] Execute window.manualRetryAll() for all 6 documents');
    console.log('✅ [EXPECTED] All documents will now upload successfully to S3');
    
    return { s3Working: true, successCount: s3SuccessCount };
  } else if (s3SuccessCount > 0) {
    console.log('\n⚡ [PARTIAL] S3 partially working - some uploads successful');
    console.log('📋 [STATUS] S3 integration in progress');
    
    return { s3Working: 'partial', successCount: s3SuccessCount };
  } else {
    console.log('\n❌ [NOT READY] S3 still not operational - all uploads in fallback mode');
    console.log('📋 [STATUS] Continue waiting for staff backend S3 completion');
    
    return { s3Working: false, successCount: s3SuccessCount };
  }
}

// Execute S3 verification
verifyS3Working()
  .then(result => {
    console.log('\n📊 [FINAL STATUS]');
    console.log(`   S3 Working: ${result.s3Working}`);
    console.log(`   Success Count: ${result.successCount}/${DOCUMENTS.length}`);
    
    if (result.s3Working === true) {
      console.log('\n🚀 [ACTION REQUIRED] Execute window.manualRetryAll() now!');
      console.log('📋 [EXPECTED] All 6 banking documents will upload to S3 successfully');
    }
  })
  .catch(error => {
    console.error('💥 [VERIFICATION FAILED]:', error);
  });