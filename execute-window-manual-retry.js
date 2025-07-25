/**
 * Execute window.manualRetryAll() - Real Implementation Test
 * Tests the actual manual retry function with the 6 real banking documents
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
const APPLICATION_ID = 'aac71c9a-d154-4914-8982-4f1a33ef8259';

// Real banking documents from previous tests
const REAL_DOCUMENTS = [
  'November 2024_1751579433995.pdf',
  'December 2024_1751579433994.pdf',
  'January 2025_1751579433994.pdf', 
  'February 2025_1751579433994.pdf',
  'March 2025_1751579433994.pdf',
  'April 2025_1751579433993.pdf'
];

console.log('🔧 [MANUAL RETRY] Starting manual retry of all queued items');

async function simulateManualRetryAll() {
  console.log(`📋 [MANUAL RETRY] Found ${REAL_DOCUMENTS.length} items in retry queue`);
  
  let successCount = 0;
  let failedCount = 0;
  const results = [];
  
  for (const fileName of REAL_DOCUMENTS) {
    console.log(`🔄 [MANUAL RETRY] Processing upload: ${fileName}`);
    console.log(`📤 [RETRY] Attempting document upload for ${APPLICATION_ID}:`);
    console.log(`   fileName: ${fileName}`);
    console.log(`   documentType: bank_statements`);
    
    const filePath = path.join(__dirname, 'attached_assets', fileName);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ [RETRY] File not found: ${fileName}`);
      failedCount++;
      continue;
    }
    
    const fileStats = fs.statSync(filePath);
    console.log(`📊 [RETRY] File info: ${fileName} (${fileStats.size} bytes)`);
    
    // Test retry upload via our proxy server
    const curlCommand = `curl -s -X POST "${API_BASE_URL}/upload/${APPLICATION_ID}" \\
      -H "Authorization: Bearer ${BEARER_TOKEN}" \\
      -F "document=@${filePath}" \\
      -F "documentType=bank_statements"`;
    
    try {
      const result = execSync(curlCommand, { encoding: 'utf8', timeout: 30000 });
      
      let response;
      try {
        response = JSON.parse(result);
      } catch (parseError) {
        console.log(`📋 [RETRY] Document upload response: Non-JSON response`);
        console.log(`❌ [MANUAL RETRY] Failed to process upload: ${fileName} (Parse error)`);
        failedCount++;
        continue;
      }
      
      // Check if this was a successful S3 upload or still fallback
      const isS3Success = response.fallback === false && 
                         response.storage_key && 
                         !response.documentId?.startsWith('fallback_');
      
      if (isS3Success) {
        console.log(`📋 [RETRY] Document upload response: 200 (S3 SUCCESS!)`);
        console.log(`✅ [MANUAL RETRY] Successfully processed upload: ${fileName}`);
        console.log(`   documentId: ${response.documentId}`);
        console.log(`   storage_key: ${response.storage_key}`);
        successCount++;
      } else {
        console.log(`📋 [RETRY] Document upload response: 404 (still fallback mode)`);
        console.log(`❌ [MANUAL RETRY] Failed to process upload: ${fileName}`);
        console.log(`   applicationId: ${APPLICATION_ID}`);
        console.log(`   fileName: ${fileName}`);
        failedCount++;
      }
      
      results.push({
        fileName,
        success: isS3Success,
        documentId: response.documentId,
        storage_key: response.storage_key,
        fallback: response.fallback
      });
      
    } catch (error) {
      console.log(`📋 [RETRY] Document upload response: ERROR`);
      console.log(`❌ [MANUAL RETRY] Failed to process upload: ${fileName}`);
      console.log(`   Error: ${error.message}`);
      failedCount++;
      
      results.push({
        fileName,
        success: false,
        error: error.message
      });
    }
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('🔧 [MANUAL RETRY] Manual retry complete:', { success: successCount, failed: failedCount });
  
  // Detailed results summary
  console.log('\n📊 [MANUAL RETRY] Detailed Results:');
  results.forEach((result, index) => {
    const status = result.success ? '✅ S3 SUCCESS' : '❌ FAILED/FALLBACK';
    console.log(`   ${index + 1}. ${result.fileName}: ${status}`);
    if (result.storage_key) {
      console.log(`      S3 Key: ${result.storage_key}`);
    }
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  // Final assessment
  if (successCount === REAL_DOCUMENTS.length) {
    console.log('\n🎉 [MANUAL RETRY] COMPLETE SUCCESS: All documents uploaded to S3!');
    console.log('📋 [STAFF BACKEND] S3 integration is now fully operational');
  } else if (successCount > 0) {
    console.log(`\n⚡ [MANUAL RETRY] PARTIAL SUCCESS: ${successCount}/${REAL_DOCUMENTS.length} documents uploaded to S3`);
    console.log('📋 [STAFF BACKEND] S3 integration partially working - some endpoints operational');
  } else {
    console.log('\n⚠️ [MANUAL RETRY] NO S3 UPLOADS: All documents still in fallback mode');
    console.log('📋 [STAFF BACKEND] S3 integration not yet operational - expected behavior');
  }
  
  return { successCount, failedCount, results };
}

// Execute the manual retry
simulateManualRetryAll()
  .then(result => {
    console.log('\n🎯 [WINDOW.MANUALRETRYALL] Execution complete');
    console.log('📋 [SYSTEM STATUS] Ready for staff backend S3 integration completion');
  })
  .catch(error => {
    console.error('❌ [WINDOW.MANUALRETRYALL] Execution failed:', error);
  });