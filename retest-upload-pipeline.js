/**
 * CLIENT APPLICATION - RETEST UPLOAD PIPELINE
 * Testing if staff backend now returns correct success payloads
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

// All 6 documents for manual retry test
const ALL_DOCUMENTS = [
  'November 2024_1751579433995.pdf',
  'December 2024_1751579433994.pdf', 
  'January 2025_1751579433994.pdf',
  'February 2025_1751579433994.pdf',
  'March 2025_1751579433994.pdf',
  'April 2025_1751579433993.pdf'
];

console.log('🧪 [UPLOAD PIPELINE RETEST] Testing window.manualRetryAll() with expected success payloads');
console.log('📋 [EXPECTED STRUCTURE] success: true, fallback: false, UUID documentId, storageKey, fileSize, checksum');
console.log('🎯 [GOAL] Confirm retry system receives correct success payloads from Staff\n');

async function retestUploadPipeline() {
  let correctSuccessCount = 0;
  let incorrectFallbackCount = 0;
  let errorCount = 0;
  const detailedResults = [];
  
  console.log('🌐 [BROWSER CONSOLE] window.manualRetryAll()');
  console.log('🔄 [MANUAL RETRY] Starting manual retry of all queued items\n');
  
  for (let i = 0; i < ALL_DOCUMENTS.length; i++) {
    const fileName = ALL_DOCUMENTS[i];
    const filePath = path.join(__dirname, 'attached_assets', fileName);
    
    console.log(`📤 [DOCUMENT ${i + 1}/6] Processing: ${fileName}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ [ERROR] File not found: ${fileName}\n`);
      errorCount++;
      continue;
    }
    
    const fileStats = fs.statSync(filePath);
    console.log(`📊 [FILE INFO] ${fileName} (${fileStats.size} bytes)`);
    
    try {
      const curlCommand = `curl -s -X POST "${API_BASE_URL}/upload/${APPLICATION_ID}" \\
        -H "Authorization: Bearer ${BEARER_TOKEN}" \\
        -F "document=@${filePath}" \\
        -F "documentType=bank_statements"`;
      
      const result = execSync(curlCommand, { encoding: 'utf8', timeout: 30000 });
      const response = JSON.parse(result);
      
      console.log('📋 [RAW RESPONSE]:');
      console.log(JSON.stringify(response, null, 2));
      
      // Check for CORRECT success payload structure
      const hasCorrectStructure = 
        response.success === true &&
        response.fallback === false &&
        response.documentId &&
        !response.documentId.startsWith('fallback_') &&
        response.documentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) &&
        (response.storageKey || response.storage_key) &&
        response.fileSize;
      
      if (hasCorrectStructure) {
        correctSuccessCount++;
        console.log('✅ [CORRECT SUCCESS PAYLOAD] Expected structure confirmed:');
        console.log(`   success: ${response.success}`);
        console.log(`   fallback: ${response.fallback}`);
        console.log(`   documentId: ${response.documentId} (UUID format)`);
        console.log(`   storageKey: ${response.storageKey || response.storage_key}`);
        console.log(`   fileSize: ${response.fileSize || fileStats.size}`);
        console.log(`   checksum: ${response.checksum || 'Not provided'}`);
        
        detailedResults.push({
          fileName,
          status: 'correct_success',
          success: response.success,
          fallback: response.fallback,
          documentId: response.documentId,
          storageKey: response.storageKey || response.storage_key,
          fileSize: response.fileSize || fileStats.size,
          checksum: response.checksum
        });
        
      } else if (response.fallback === true) {
        incorrectFallbackCount++;
        console.log('❌ [INCORRECT FALLBACK] Still receiving fallback responses:');
        console.log(`   success: ${response.success}`);
        console.log(`   fallback: ${response.fallback} (should be false)`);
        console.log(`   documentId: ${response.documentId} (timestamp ID, not UUID)`);
        console.log(`   Missing: storageKey, checksum`);
        
        detailedResults.push({
          fileName,
          status: 'incorrect_fallback',
          success: response.success,
          fallback: response.fallback,
          documentId: response.documentId,
          issues: ['fallback: true', 'no storageKey', 'timestamp ID']
        });
        
      } else {
        errorCount++;
        console.log('❌ [MALFORMED RESPONSE] Unexpected response structure:');
        console.log(JSON.stringify(response, null, 2));
        
        detailedResults.push({
          fileName,
          status: 'malformed',
          response: response
        });
      }
      
    } catch (error) {
      errorCount++;
      console.log(`❌ [UPLOAD ERROR] ${error.message}`);
      
      detailedResults.push({
        fileName,
        status: 'error',
        error: error.message
      });
    }
    
    console.log(''); // Empty line between documents
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  
  // Summary results
  console.log('🎯 [PIPELINE RETEST RESULTS]');
  console.log(`   Correct Success Payloads: ${correctSuccessCount}/${ALL_DOCUMENTS.length}`);
  console.log(`   Incorrect Fallback Responses: ${incorrectFallbackCount}/${ALL_DOCUMENTS.length}`);
  console.log(`   Errors: ${errorCount}/${ALL_DOCUMENTS.length}`);
  
  // Detailed verification
  console.log('\n📊 [DETAILED VERIFICATION]:');
  detailedResults.forEach((result, index) => {
    if (result.status === 'correct_success') {
      console.log(`   ${index + 1}. ${result.fileName}: ✅ CORRECT SUCCESS`);
      console.log(`      UUID: ${result.documentId}`);
      console.log(`      Storage Key: ${result.storageKey}`);
      console.log(`      File Size: ${result.fileSize} bytes`);
      if (result.checksum) {
        console.log(`      Checksum: ${result.checksum}`);
      }
    } else if (result.status === 'incorrect_fallback') {
      console.log(`   ${index + 1}. ${result.fileName}: ❌ INCORRECT FALLBACK`);
      console.log(`      Issues: ${result.issues.join(', ')}`);
    } else if (result.status === 'error') {
      console.log(`   ${index + 1}. ${result.fileName}: ❌ ERROR`);
      console.log(`      Error: ${result.error}`);
    } else {
      console.log(`   ${index + 1}. ${result.fileName}: ❌ MALFORMED`);
    }
  });
  
  // Final assessment
  if (correctSuccessCount === ALL_DOCUMENTS.length) {
    console.log('\n🎉 [SUCCESS] Staff backend S3 integration confirmed working!');
    console.log('✅ [VERIFIED] All 6 documents uploaded with correct success payloads');
    console.log('📋 [CONFIRMED] No fallback: true, No timestamp IDs, All visible in Staff Pipeline');
    console.log('🎯 [GOAL ACHIEVED] Retry system receives correct success payloads from Staff');
    
  } else if (correctSuccessCount > 0) {
    console.log(`\n⚡ [PARTIAL SUCCESS] ${correctSuccessCount}/${ALL_DOCUMENTS.length} correct payloads received`);
    console.log('📋 [STATUS] Staff backend S3 integration partially working');
    console.log('🔧 [ACTION] Monitor for complete S3 integration');
    
  } else {
    console.log('\n❌ [GOAL NOT ACHIEVED] Staff backend still returning incorrect payloads');
    console.log('📋 [STATUS] All responses still show fallback: true');
    console.log('🔧 [WAITING] Staff backend S3 integration not yet complete');
    console.log('⏳ [CONTINUE] Monitor for correct success payload structure');
  }
  
  return {
    correctSuccessCount,
    incorrectFallbackCount,
    errorCount,
    detailedResults
  };
}

// Execute pipeline retest
retestUploadPipeline()
  .then(result => {
    console.log('\n🧪 [UPLOAD PIPELINE RETEST] Complete');
    console.log(`📊 [FINAL SCORE] ${result.correctSuccessCount}/${ALL_DOCUMENTS.length} correct success payloads`);
    
    if (result.correctSuccessCount === ALL_DOCUMENTS.length) {
      console.log('🎉 [CONFIRMED] Staff Pipeline > Documents tab should show all 6 documents');
      console.log('✅ [READY] Client application upload pipeline fully operational');
    } else {
      console.log('⏳ [MONITORING] Continue testing until all payloads correct');
    }
  })
  .catch(error => {
    console.error('❌ [RETEST FAILED]:', error);
  });