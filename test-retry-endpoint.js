/**
 * TEST & VERIFY - S3 Upload Success Checklist
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:5000/api/public';
const APPLICATION_ID = 'aac71c9a-d154-4914-8982-4f1a33ef8259'; // Real app ID

console.log('✅ S3 Upload Success Checklist - Testing /api/public/upload/:applicationId');
console.log('📋 Expected Response: success: true, fallback: false, UUID, storageKey, checksum, storage: s3\n');

async function testRetryEndpoint() {
  // Test with a real banking document
  const testFile = 'November 2024_1751579433995.pdf';
  const filePath = path.join(__dirname, 'attached_assets', testFile);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ [ERROR] Test file not found: ${testFile}`);
    return;
  }
  
  const fileStats = fs.statSync(filePath);
  console.log(`📤 [TEST FILE] ${testFile} (${fileStats.size} bytes)`);
  console.log(`📋 [ENDPOINT] POST /api/public/upload/${APPLICATION_ID}`);
  console.log(`📄 [DOCUMENT TYPE] bank_statements\n`);
  
  try {
    const curlCommand = `curl -X POST ${API_BASE_URL}/upload/${APPLICATION_ID} \\
      -F "document=@${filePath}" \\
      -F "documentType=bank_statements"`;
    
    console.log('🔄 [EXECUTING] curl command...');
    const result = execSync(curlCommand, { encoding: 'utf8', timeout: 30000 });
    const response = JSON.parse(result);
    
    console.log('📋 [RAW RESPONSE]:');
    console.log(JSON.stringify(response, null, 2));
    console.log('');
    
    // Verify expected S3 success structure
    const checks = {
      success: response.success === true,
      fallback: response.fallback === false,
      hasUUID: response.documentId && !response.documentId.startsWith('fallback_') && 
               response.documentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
      hasStorageKey: !!(response.storageKey || response.storage_key),
      hasChecksum: !!response.checksum,
      hasStorage: response.storage === 's3',
      hasFileSize: !!(response.fileSize || response.size)
    };
    
    console.log('✅ [VERIFICATION CHECKLIST]:');
    console.log(`   success: true → ${checks.success ? '✅' : '❌'} (${response.success})`);
    console.log(`   fallback: false → ${checks.fallback ? '✅' : '❌'} (${response.fallback})`);
    console.log(`   documentId: UUID → ${checks.hasUUID ? '✅' : '❌'} (${response.documentId})`);
    console.log(`   storageKey: present → ${checks.hasStorageKey ? '✅' : '❌'} (${response.storageKey || response.storage_key || 'missing'})`);
    console.log(`   checksum: present → ${checks.hasChecksum ? '✅' : '❌'} (${response.checksum || 'missing'})`);
    console.log(`   storage: s3 → ${checks.hasStorage ? '✅' : '❌'} (${response.storage || 'missing'})`);
    console.log(`   fileSize: present → ${checks.hasFileSize ? '✅' : '❌'} (${response.fileSize || response.size || 'missing'})`);
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    if (allPassed) {
      console.log('\n🎉 [SUCCESS] All S3 upload success criteria met!');
      console.log('✅ [CONFIRMED] Staff backend S3 integration operational');
      console.log('📋 [READY] Client application upload pipeline fully functional');
    } else {
      console.log('\n❌ [FAILURE] S3 upload success criteria not met');
      console.log('📋 [STATUS] Staff backend still in fallback mode');
      console.log('🔧 [WAITING] S3 integration completion required');
    }
    
    return { response, checks, allPassed };
    
  } catch (error) {
    console.error('❌ [TEST FAILED]:', error.message);
    return { error: error.message };
  }
}

// Execute test
testRetryEndpoint()
  .then(result => {
    if (result && !result.error) {
      console.log('\n📊 [TEST COMPLETE]');
      if (result.allPassed) {
        console.log('🎯 [GOAL ACHIEVED] Expected S3 response structure confirmed');
      } else {
        console.log('⏳ [MONITORING] Continue testing for S3 completion');
      }
    }
  })
  .catch(error => {
    console.error('❌ [EXECUTION ERROR]:', error);
  });