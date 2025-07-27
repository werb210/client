#!/usr/bin/env node

/**
 * 🤖 AUTOMATED DOCUMENT UPLOAD TEST - ALL 22 TYPES
 * Systematically tests upload endpoints for every document type
 */

const fetch = require('node-fetch');
const FormData = require('form-data');

const ALL_DOCUMENT_TYPES = [
  'accounts_payable',
  'accounts_receivable', 
  'articles_of_incorporation',
  'balance_sheet',
  'bank_statements',
  'business_license',
  'business_plan',
  'cash_flow_statement',
  'collateral_docs',
  'drivers_license_front_back',
  'equipment_quote',
  'financial_statements',
  'invoice_samples',
  'other',
  'personal_financial_statement',
  'personal_guarantee',
  'profit_loss_statement',
  'proof_of_identity',
  'signed_application',
  'supplier_agreement',
  'tax_returns',
  'void_pad'
];

const TEST_APPLICATION_ID = 'test-upload-diagnostic-1753650254760';
const API_BASE = 'http://localhost:5000';

async function testDocumentUpload(documentType) {
  try {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('document', Buffer.from(`Test content for ${documentType}`), {
      filename: `${documentType}_test.pdf`,
      contentType: 'application/pdf'
    });

    const response = await fetch(`${API_BASE}/api/public/upload/${TEST_APPLICATION_ID}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${process.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      }
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { error: 'Non-JSON response', raw: responseText };
    }

    return {
      documentType,
      status: response.status,
      success: response.ok,
      data: responseData,
      error: response.ok ? null : `HTTP ${response.status}: ${responseData.error || responseText}`
    };
  } catch (error) {
    return {
      documentType,
      status: 0,
      success: false,
      data: null,
      error: error.message
    };
  }
}

async function runComprehensiveTest() {
  console.log('🤖 AUTOMATED DOCUMENT UPLOAD TEST - ALL 22 TYPES');
  console.log('='.repeat(70));
  
  console.log(`\n🎯 Test Application ID: ${TEST_APPLICATION_ID}`);
  console.log(`🌐 API Base URL: ${API_BASE}`);
  
  console.log('\n📊 TESTING ALL DOCUMENT TYPES...');
  console.log('='.repeat(50));

  const results = [];
  let successCount = 0;
  let failureCount = 0;
  
  for (const docType of ALL_DOCUMENT_TYPES) {
    process.stdout.write(`Testing ${docType}... `);
    
    const result = await testDocumentUpload(docType);
    results.push(result);
    
    if (result.success) {
      console.log('✅ PASS');
      successCount++;
    } else {
      console.log('❌ FAIL');
      failureCount++;
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📋 DETAILED RESULTS MATRIX:');
  console.log('='.repeat(70));
  console.log('| Document Type                        | Status | Result | Error/Message          |');
  console.log('|--------------------------------------|--------|--------|------------------------|');
  
  results.forEach(result => {
    const docType = result.documentType.padEnd(36);
    const status = result.status.toString().padEnd(6);
    const resultIcon = result.success ? '✅ PASS' : '❌ FAIL';
    const error = result.error ? result.error.substring(0, 20) + '...' : result.data?.message || 'OK';
    
    console.log(`| ${docType} | ${status} | ${resultIcon} | ${error.padEnd(22)} |`);
  });

  console.log('\n📊 SUMMARY STATISTICS:');
  console.log('='.repeat(30));
  console.log(`✅ Successful uploads: ${successCount}/${ALL_DOCUMENT_TYPES.length}`);
  console.log(`❌ Failed uploads: ${failureCount}/${ALL_DOCUMENT_TYPES.length}`);
  console.log(`📈 Success rate: ${((successCount / ALL_DOCUMENT_TYPES.length) * 100).toFixed(1)}%`);

  console.log('\n🔍 FAILED DOCUMENT TYPES:');
  console.log('='.repeat(30));
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    failures.forEach(failure => {
      console.log(`❌ ${failure.documentType}: ${failure.error}`);
    });
  } else {
    console.log('🎉 No failures detected!');
  }

  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('='.repeat(20));
  if (successCount === ALL_DOCUMENT_TYPES.length) {
    console.log('✅ ALL DOCUMENT TYPES WORKING CORRECTLY');
    console.log('✅ Upload system is production ready');
  } else {
    console.log('⚠️  Some document types need attention:');
    console.log('• Check DOCUMENT_TYPE_MAP in docNormalization.ts');
    console.log('• Verify server endpoint accepts all enum values');
    console.log('• Test UI dropdown includes all document types');
  }

  console.log('\n🚀 NEXT STEPS:');
  console.log('='.repeat(15));
  console.log('1. Review failed document types above');
  console.log('2. Test UI dropdown presence for each type');
  console.log('3. Verify uploaded files appear in correct categories');
  console.log('4. Run manual UI tests for validation');
}

// Run the test
runComprehensiveTest().catch(console.error);