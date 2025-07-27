/**
 * Document Upload Testing Script
 * Tests all document type mappings with real upload simulation
 */

import fetch from 'node:fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'http://localhost:5000';
const TEST_APPLICATION_ID = 'test-doc-upload-' + Date.now();

// Create a test PDF file for uploads
function createTestFile(filename) {
  const testPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n199\n%%EOF');
  const tempFile = path.join('/tmp', filename);
  fs.writeFileSync(tempFile, testPdfContent);
  return tempFile;
}

// Test document types from the mapping system
const TEST_DOCUMENT_TYPES = [
  // Official backend types
  'bank_statements',
  'financial_statements', 
  'profit_loss_statement',
  'tax_returns',
  'void_pad',
  'drivers_license_front_back',
  'equipment_quote',
  'business_license',
  'accounts_receivable',
  'accounts_payable',
  
  // Client-side variations that should map correctly
  'account_prepared_financials', // → financial_statements
  'pnl_statement', // → profit_loss_statement
  'void_cheque', // → void_pad
  'government_id', // → drivers_license_front_back
  'bank_statement', // → bank_statements
  'tax_return', // → tax_returns
];

// Invalid document types that should be rejected
const INVALID_DOCUMENT_TYPES = [
  'invalid_type',
  'unsupported_format',
  'random_string',
  '',
  null,
  undefined,
  '123',
  'special!@#$%'
];

async function testDocumentUpload(documentType, shouldSucceed = true) {
  const testFile = createTestFile(`test-${documentType || 'invalid'}.pdf`);
  
  try {
    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFile));
    if (documentType !== null && documentType !== undefined) {
      formData.append('documentType', documentType);
    }

    const response = await fetch(`${API_BASE_URL}/api/public/upload/${TEST_APPLICATION_ID}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    const result = await response.text();
    
    // Clean up test file
    fs.unlinkSync(testFile);

    if (shouldSucceed) {
      if (response.ok) {
        console.log(`✅ PASS: ${documentType} → Upload successful`);
        return { success: true, documentType, response: result };
      } else {
        console.log(`❌ FAIL: ${documentType} → Expected success but got ${response.status}: ${result}`);
        return { success: false, documentType, error: result };
      }
    } else {
      if (!response.ok) {
        console.log(`✅ PASS: ${documentType} → Correctly rejected (${response.status})`);
        return { success: true, documentType, response: result };
      } else {
        console.log(`❌ FAIL: ${documentType} → Expected rejection but upload succeeded`);
        return { success: false, documentType, error: 'Should have been rejected' };
      }
    }
  } catch (error) {
    // Clean up test file on error
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
    
    if (shouldSucceed) {
      console.log(`❌ ERROR: ${documentType} → ${error.message}`);
      return { success: false, documentType, error: error.message };
    } else {
      console.log(`✅ PASS: ${documentType} → Correctly rejected with error`);
      return { success: true, documentType, response: 'Rejected as expected' };
    }
  }
}

async function runUploadTests() {
  console.log('🧪 [DOCUMENT UPLOAD TESTS] Starting comprehensive upload testing...\n');
  
  const results = {
    validUploads: [],
    invalidRejections: [],
    failures: []
  };

  console.log('1️⃣ Testing Valid Document Types:');
  console.log('─'.repeat(60));
  
  for (const documentType of TEST_DOCUMENT_TYPES) {
    const result = await testDocumentUpload(documentType, true);
    if (result.success) {
      results.validUploads.push(result);
    } else {
      results.failures.push(result);
    }
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n2️⃣ Testing Invalid Document Types:');
  console.log('─'.repeat(60));
  
  for (const documentType of INVALID_DOCUMENT_TYPES) {
    const result = await testDocumentUpload(documentType, false);
    if (result.success) {
      results.invalidRejections.push(result);
    } else {
      results.failures.push(result);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary report
  console.log('\n📊 [TEST RESULTS SUMMARY]');
  console.log('═'.repeat(80));
  console.log(`✅ Valid uploads successful: ${results.validUploads.length}/${TEST_DOCUMENT_TYPES.length}`);
  console.log(`🚫 Invalid uploads rejected: ${results.invalidRejections.length}/${INVALID_DOCUMENT_TYPES.length}`);
  console.log(`❌ Test failures: ${results.failures.length}`);
  
  if (results.failures.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.failures.forEach(failure => {
      console.log(`   ${failure.documentType}: ${failure.error}`);
    });
  }

  const totalTests = TEST_DOCUMENT_TYPES.length + INVALID_DOCUMENT_TYPES.length;
  const passedTests = results.validUploads.length + results.invalidRejections.length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`\n🎯 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
  
  if (successRate === '100.0') {
    console.log('🎉 ALL TESTS PASSED - Document upload system verified!');
  } else {
    console.log('⚠️  Some tests failed - review and fix issues before deployment');
  }

  return results;
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runUploadTests().catch(console.error);
}

export { runUploadTests, testDocumentUpload };