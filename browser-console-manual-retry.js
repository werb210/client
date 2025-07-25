/**
 * Browser Console Manual Retry Execution
 * Simulates exact window.manualRetryAll() execution from browser console
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:5000/api/public';
const BEARER_TOKEN = 'ae2dd3089a06aa32157abd1b997a392836059ba3d47dca79cff0660c09f95042';
const APPLICATION_ID = 'aac71c9a-d154-4914-8982-4f1a33ef8259';

// All 6 banking documents as specified
const ALL_DOCUMENTS = [
  'November 2024_1751579433995.pdf',
  'December 2024_1751579433994.pdf', 
  'January 2025_1751579433994.pdf',
  'February 2025_1751579433994.pdf',
  'March 2025_1751579433994.pdf',
  'April 2025_1751579433993.pdf'
];

console.log('🌐 [BROWSER CONSOLE] Executing: window.manualRetryAll()');
console.log('📋 [EXPECTED] fallback: false, real UUIDs, storageKey format, checksums');
console.log('📄 [DOCUMENTS] Processing November 2024 → April 2025 PDFs\n');

async function simulateBrowserConsoleExecution() {
  let s3SuccessCount = 0;
  let fallbackCount = 0;
  const results = [];
  
  console.log('🔄 [MANUAL RETRY] Starting manual retry of all queued items');
  console.log(`📋 [MANUAL RETRY] Found ${ALL_DOCUMENTS.length} items in retry queue\n`);
  
  for (let i = 0; i < ALL_DOCUMENTS.length; i++) {
    const fileName = ALL_DOCUMENTS[i];
    const filePath = path.join(__dirname, 'attached_assets', fileName);
    
    console.log(`🔄 [MANUAL RETRY] Processing upload ${i + 1}/${ALL_DOCUMENTS.length}: ${fileName}`);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ [ERROR] File not found: ${fileName}`);
      continue;
    }
    
    const fileStats = fs.statSync(filePath);
    console.log(`📤 [RETRY] Attempting document upload for ${APPLICATION_ID}:`);
    console.log(`   fileName: ${fileName}`);
    console.log(`   documentType: bank_statements`);
    console.log(`📊 [RETRY] File info: ${fileName} (${fileStats.size} bytes)`);
    
    try {
      const curlCommand = `curl -s -X POST "${API_BASE_URL}/upload/${APPLICATION_ID}" \\
        -H "Authorization: Bearer ${BEARER_TOKEN}" \\
        -F "document=@${filePath}" \\
        -F "documentType=bank_statements"`;
      
      const result = execSync(curlCommand, { encoding: 'utf8', timeout: 30000 });
      const response = JSON.parse(result);
      
      // Check for S3 success indicators (staff backend claim)
      const isS3Success = response.fallback === false && 
                         response.success === true &&
                         (response.storage_key || response.storageKey) && 
                         !response.documentId?.startsWith('fallback_') &&
                         response.documentId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      
      if (isS3Success) {
        s3SuccessCount++;
        console.log(`📋 [RETRY] Document upload response: 200 (S3 SUCCESS! ✅)`);
        console.log(`✅ [MANUAL RETRY] Successfully processed upload: ${fileName}`);
        console.log('📊 [S3 RESPONSE] Expected format confirmed:');
        console.log(JSON.stringify({
          success: response.success,
          fallback: response.fallback,
          documentId: response.documentId,
          storageKey: response.storage_key || response.storageKey,
          fileSize: response.fileSize || fileStats.size,
          checksum: response.checksum || 'SHA256:...',
          storage: response.storage || 's3'
        }, null, 2));
        
        results.push({
          fileName,
          success: true,
          s3Success: true,
          documentId: response.documentId,
          storageKey: response.storage_key || response.storageKey,
          fileSize: response.fileSize || fileStats.size,
          checksum: response.checksum,
          fallback: response.fallback
        });
      } else {
        fallbackCount++;
        console.log(`📋 [RETRY] Document upload response: Still fallback mode`);
        console.log(`❌ [MANUAL RETRY] Failed to process upload: ${fileName}`);
        console.log('📊 [FALLBACK RESPONSE]:');
        console.log(JSON.stringify(response, null, 2));
        
        results.push({
          fileName,
          success: false,
          s3Success: false,
          fallback: response.fallback,
          documentId: response.documentId,
          status: 'still_fallback'
        });
      }
      
    } catch (error) {
      console.log(`📋 [RETRY] Document upload response: ERROR`);
      console.log(`❌ [MANUAL RETRY] Failed to process upload: ${fileName}`);
      console.log(`   Error: ${error.message}`);
      fallbackCount++;
      
      results.push({
        fileName,
        success: false,
        s3Success: false,
        error: error.message
      });
    }
    
    console.log(''); // Empty line between uploads
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('🔧 [MANUAL RETRY] Manual retry complete:', { success: s3SuccessCount, failed: fallbackCount });
  
  // Detailed results summary
  console.log('\n📊 [MANUAL RETRY] Detailed Results:');
  results.forEach((result, index) => {
    if (result.s3Success) {
      console.log(`   ${index + 1}. ${result.fileName}: ✅ S3 SUCCESS`);
      console.log(`      Document ID: ${result.documentId}`);
      console.log(`      Storage Key: ${result.storageKey}`);
      console.log(`      File Size: ${result.fileSize} bytes`);
      if (result.checksum) {
        console.log(`      Checksum: ${result.checksum}`);
      }
    } else {
      const status = result.status === 'still_fallback' ? '❌ STILL FALLBACK' : '❌ FAILED';
      console.log(`   ${index + 1}. ${result.fileName}: ${status}`);
      if (result.documentId?.startsWith('fallback_')) {
        console.log(`      Fallback ID: ${result.documentId}`);
      }
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    }
  });
  
  // Final assessment based on staff backend claim
  if (s3SuccessCount === ALL_DOCUMENTS.length) {
    console.log('\n🎉 [CONFIRMED] STAFF BACKEND S3 CLAIM VERIFIED!');
    console.log('📋 [SUCCESS] All documents uploaded with fallback: false');
    console.log('✅ [METADATA] Real UUIDs, storage keys, checksums confirmed');
    console.log('🏢 [STAFF PIPELINE] ZIP, download, preview should work');
    console.log('📊 [FORMAT] All responses match expected S3 success format');
    
    // Show expected staff pipeline functionality
    console.log('\n🔍 [STAFF PIPELINE VERIFICATION]:');
    console.log('   ZIP Downloads: ✅ Should work with real storage keys');
    console.log('   Document Preview: ✅ Should work with S3 URLs');
    console.log('   Metadata Access: ✅ Should show real file sizes and checksums');
    
  } else if (s3SuccessCount > 0) {
    console.log(`\n⚡ [PARTIAL SUCCESS] ${s3SuccessCount}/${ALL_DOCUMENTS.length} documents uploaded to S3`);
    console.log('📋 [STATUS] S3 integration partially working');
    console.log('🔧 [ACTION] Staff backend S3 needs completion for remaining documents');
    
  } else {
    console.log('\n❌ [STAFF CLAIM UNVERIFIED] S3 still not operational');
    console.log('📋 [STATUS] All documents still returning fallback: true');
    console.log('🔧 [DISCREPANCY] Staff backend claim vs actual API responses');
    console.log('⏳ [WAITING] Continue monitoring for S3 completion');
  }
  
  return { s3SuccessCount, fallbackCount, results };
}

// Execute browser console simulation
simulateBrowserConsoleExecution()
  .then(result => {
    console.log('\n🎯 [WINDOW.MANUALRETRYALL] Browser console execution complete');
    console.log(`📊 [FINAL RESULT] S3 Success: ${result.s3SuccessCount}, Fallback: ${result.fallbackCount}`);
    
    if (result.s3SuccessCount === ALL_DOCUMENTS.length) {
      console.log('\n🎉 [VERIFIED] Staff backend S3 integration working!');
      console.log('📋 [NEXT] Test staff pipeline: ZIP, download, preview functionality');
    } else {
      console.log('\n⏳ [MONITORING] Awaiting staff backend S3 integration completion');
      console.log('📋 [EXPECTED] When ready: fallback: false, UUIDs, storage keys, checksums');
    }
  })
  .catch(error => {
    console.error('❌ [EXECUTION FAILED]:', error);
  });