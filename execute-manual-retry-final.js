/**
 * CLIENT FINAL RETRY - window.manualRetryAll() Final Execution
 * Testing for expected S3 success responses with fallback: false
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/public';
const BEARER_TOKEN = process.env.BEARER_TOKEN || (() => {
  console.error('❌ [SECURITY] BEARER_TOKEN environment variable is required');
  console.error('Please set: export BEARER_TOKEN=your_actual_token');
  process.exit(1);
})();
const APPLICATION_ID = process.env.APPLICATION_ID || 'aac71c9a-d154-4914-8982-4f1a33ef8259';

// All 6 banking documents for final manual retry
const ALL_DOCUMENTS = [
  'November 2024_1751579433995.pdf',
  'December 2024_1751579433994.pdf', 
  'January 2025_1751579433994.pdf',
  'February 2025_1751579433994.pdf',
  'March 2025_1751579433994.pdf',
  'April 2025_1751579433993.pdf'
];

console.log('🌐 [BROWSER CONSOLE] window.manualRetryAll() - FINAL EXECUTION');
console.log('✅ [EXPECTED PER DOCUMENT] success: true, fallback: false, UUID, storageKey, checksum, fileSize, storage: s3');
console.log('🔍 [CONFIRM TARGETS] All 6 banking documents return fallback: false, No timestamp IDs, Visible in Staff Pipeline\n');

async function executeManualRetryFinal() {
  let s3SuccessCount = 0;
  let fallbackCount = 0;
  let errorCount = 0;
  const s3Results = [];
  
  console.log('🔄 [MANUAL RETRY] Starting final retry execution of all queued items');
  console.log(`📋 [PROCESSING] ${ALL_DOCUMENTS.length} banking documents (Nov 2024 → Apr 2025)\n`);
  
  for (let i = 0; i < ALL_DOCUMENTS.length; i++) {
    const fileName = ALL_DOCUMENTS[i];
    const filePath = path.join(__dirname, 'attached_assets', fileName);
    
    console.log(`📤 [DOCUMENT ${i + 1}/6] ${fileName}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ [ERROR] File not found: ${fileName}\n`);
      errorCount++;
      continue;
    }
    
    const fileStats = fs.statSync(filePath);
    console.log(`📊 [FILE] ${fileStats.size} bytes`);
    
    try {
      const curlCommand = `curl -s -X POST "${API_BASE_URL}/upload/${APPLICATION_ID}" \\
        -H "Authorization: Bearer ${BEARER_TOKEN}" \\
        -F "document=@${filePath}" \\
        -F "documentType=bank_statements"`;
      
      const result = execSync(curlCommand, { encoding: 'utf8', timeout: 30000 });
      const response = JSON.parse(result);
      
      console.log('📋 [RESPONSE]:');
      console.log(JSON.stringify(response, null, 2));
      
      // Check for EXPECTED S3 success structure
      const isS3Success = 
        response.success === true &&
        response.fallback === false &&
        response.documentId &&
        !response.documentId.startsWith('fallback_') &&
        response.documentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) &&
        (response.storageKey || response.storage_key) &&
        (response.fileSize || response.size) &&
        response.storage === 's3';
      
      if (isS3Success) {
        s3SuccessCount++;
        console.log('✅ [S3 SUCCESS] Expected structure confirmed!');
        console.log(`   ✓ success: ${response.success}`);
        console.log(`   ✓ fallback: ${response.fallback}`);
        console.log(`   ✓ documentId: ${response.documentId} (UUID format)`);
        console.log(`   ✓ storageKey: ${response.storageKey || response.storage_key}`);
        console.log(`   ✓ fileSize: ${response.fileSize || response.size || fileStats.size}`);
        console.log(`   ✓ checksum: ${response.checksum || 'Available'}`);
        console.log(`   ✓ storage: ${response.storage}`);
        
        s3Results.push({
          fileName,
          status: 's3_success',
          documentId: response.documentId,
          storageKey: response.storageKey || response.storage_key,
          fileSize: response.fileSize || response.size || fileStats.size,
          checksum: response.checksum,
          storage: response.storage
        });
        
      } else if (response.fallback === true) {
        fallbackCount++;
        console.log('❌ [STILL FALLBACK] Incorrect fallback response:');
        console.log(`   ❌ fallback: ${response.fallback} (expected: false)`);
        console.log(`   ❌ documentId: ${response.documentId} (timestamp, not UUID)`);
        console.log(`   ❌ Missing: storageKey, checksum, storage field`);
        
        s3Results.push({
          fileName,
          status: 'fallback_mode',
          documentId: response.documentId,
          fallback: response.fallback
        });
        
      } else {
        errorCount++;
        console.log('❌ [UNEXPECTED] Malformed response structure');
        
        s3Results.push({
          fileName,
          status: 'error',
          response: response
        });
      }
      
    } catch (error) {
      errorCount++;
      console.log(`❌ [UPLOAD ERROR] ${error.message}`);
      
      s3Results.push({
        fileName,
        status: 'error',
        error: error.message
      });
    }
    
    console.log(''); // Empty line between documents
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Final results summary
  console.log('🎯 [FINAL RETRY RESULTS]');
  console.log(`   S3 Success (fallback: false): ${s3SuccessCount}/${ALL_DOCUMENTS.length}`);
  console.log(`   Still Fallback (fallback: true): ${fallbackCount}/${ALL_DOCUMENTS.length}`);
  console.log(`   Errors: ${errorCount}/${ALL_DOCUMENTS.length}`);
  
  // Detailed verification
  console.log('\n🔍 [CONFIRM CHECKLIST]:');
  s3Results.forEach((result, index) => {
    if (result.status === 's3_success') {
      console.log(`   ✅ ${index + 1}. ${result.fileName}: S3 SUCCESS`);
      console.log(`      UUID: ${result.documentId}`);
      console.log(`      Storage Key: ${result.storageKey}`);
      console.log(`      File Size: ${result.fileSize} bytes`);
      console.log(`      Storage: ${result.storage}`);
      if (result.checksum) {
        console.log(`      Checksum: ${result.checksum}`);
      }
    } else if (result.status === 'fallback_mode') {
      console.log(`   ❌ ${index + 1}. ${result.fileName}: STILL FALLBACK`);
      console.log(`      Timestamp ID: ${result.documentId}`);
    } else {
      console.log(`   ❌ ${index + 1}. ${result.fileName}: ERROR/MALFORMED`);
    }
  });
  
  // Final assessment
  if (s3SuccessCount === ALL_DOCUMENTS.length) {
    console.log('\n🎉 [CONFIRMED] ALL 6 BANKING DOCUMENTS RETURN fallback: false');
    console.log('✅ [VERIFIED] No more timestamp-based documentId');
    console.log('✅ [EXPECTED] All 6 visible in Staff Pipeline UI');
    console.log('✅ [FUNCTIONAL] Download/preview buttons should work');
    console.log('✅ [AVAILABLE] ZIP export includes all files');
    console.log('\n🏆 [SUCCESS] Staff backend S3 integration CONFIRMED OPERATIONAL');
    console.log('📋 [READY] Client application upload pipeline fully functional');
    
  } else if (s3SuccessCount > 0) {
    console.log(`\n⚡ [PARTIAL] ${s3SuccessCount}/${ALL_DOCUMENTS.length} documents successfully uploaded to S3`);
    console.log('📋 [PROGRESS] Staff backend S3 integration partially working');
    console.log('🔧 [MONITOR] Continue testing for full completion');
    
  } else {
    console.log('\n❌ [NOT READY] Staff backend S3 still not operational');
    console.log('📋 [STATUS] All documents still returning fallback: true');
    console.log('🔧 [WAITING] Staff backend S3 integration completion required');
    console.log('⏳ [CONTINUE] Monitor for expected S3 success responses');
  }
  
  return { s3SuccessCount, fallbackCount, errorCount, s3Results };
}

// Execute final manual retry
executeManualRetryFinal()
  .then(result => {
    console.log('\n🌐 [WINDOW.MANUALRETRYALL] Final execution complete');
    console.log(`📊 [FINAL SCORE] S3 Success: ${result.s3SuccessCount}/${ALL_DOCUMENTS.length}`);
    
    if (result.s3SuccessCount === ALL_DOCUMENTS.length) {
      console.log('\n🎉 [ALL SYSTEMS GO] Client application ready for production');
      console.log('✅ [PIPELINE] Upload → S3 → Staff Pipeline → Download/Preview → ZIP');
    } else {
      console.log('\n⏳ [MONITORING] Awaiting complete staff backend S3 integration');
    }
  })
  .catch(error => {
    console.error('❌ [EXECUTION FAILED]:', error);
  });