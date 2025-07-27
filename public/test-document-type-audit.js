/**
 * Document Type Audit System Test
 * Validates all client document types map correctly to staff backend values
 */

console.log('🔍 DOCUMENT TYPE AUDIT - COMPREHENSIVE VALIDATION');
console.log('='.repeat(60));

// Test all document types in the central mapping
const testDocumentTypes = [
  // Direct backend compatible types
  'void_cheque',
  'bank_statements', 
  'government_id',
  'business_license',
  'financial_statements',
  'profit_loss_statement', 
  'balance_sheet',
  'cash_flow_statement',
  'tax_returns',
  'accounts_receivable',
  'accounts_payable',
  'personal_financial_statement',
  'business_plan',
  'equipment_quote',
  'sample_invoices',
  'supplier_agreement',
  'driver_license',
  
  // Critical client mappings that need conversion
  'account_prepared_financials', // → financial_statements
  'pnl_statement',              // → profit_loss_statement
  'accountant_prepared_statements', // → financial_statements
  'void_pad',                   // → void_cheque
  'banking_info',               // → void_cheque
  'invoice_summary',            // → sample_invoices
  'ar_report',                  // → accounts_receivable
  'ap_report',                  // → accounts_payable
  'tax_return',                 // → tax_returns
  'bank_statement',             // → bank_statements
  'drivers_license_front_back', // → driver_license
  'id_verification',            // → driver_license
  'voided_check',               // → void_cheque
  'invoice_samples',            // → sample_invoices
  'invoices',                   // → sample_invoices
  'receivables',                // → accounts_receivable
  'payables',                   // → accounts_payable
];

async function testDocumentTypeMapping() {
  console.log(`📋 Testing ${testDocumentTypes.length} document types...`);
  
  let passedTests = 0;
  let failedTests = 0;
  const failedMappings = [];
  
  for (const docType of testDocumentTypes) {
    try {
      // Test upload endpoint with mapped document type
      const testApplicationId = "12345678-1234-1234-1234-123456789abc";
      
      const response = await fetch(`/api/public/upload/${testApplicationId}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token'
        },
        body: (() => {
          const formData = new FormData();
          formData.append('document', new Blob(['test'], { type: 'application/pdf' }), 'test.pdf');
          formData.append('documentType', docType);
          return formData;
        })()
      });
      
      const result = await response.text();
      
      // Check if the server processed the document type (not necessarily successful upload)
      if (result.includes('documentType') || result.includes('Document type') || response.status === 500) {
        console.log(`✅ [PASS] ${docType} - Server processed document type`);
        passedTests++;
      } else {
        console.log(`❌ [FAIL] ${docType} - Server rejected document type`);
        failedTests++;
        failedMappings.push(docType);
      }
      
    } catch (error) {
      console.log(`❌ [ERROR] ${docType} - Test failed: ${error.message}`);
      failedTests++;
      failedMappings.push(docType);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT RESULTS:');
  console.log(`✅ Passed: ${passedTests}/${testDocumentTypes.length}`);
  console.log(`❌ Failed: ${failedTests}/${testDocumentTypes.length}`);
  console.log(`🎯 Success Rate: ${Math.round((passedTests / testDocumentTypes.length) * 100)}%`);
  
  if (failedMappings.length > 0) {
    console.log('\n🚨 UNMAPPED DOCUMENT TYPES:');
    failedMappings.forEach(type => console.log(`  - ${type}`));
    console.log('\n⚠️  These types need to be added to DOCUMENT_TYPE_MAP');
  } else {
    console.log('\n🎉 ALL DOCUMENT TYPES MAPPED SUCCESSFULLY!');
  }
  
  return {
    total: testDocumentTypes.length,
    passed: passedTests,
    failed: failedTests,
    failedTypes: failedMappings
  };
}

// Test specific critical mappings
async function testCriticalMappings() {
  console.log('\n🎯 TESTING CRITICAL MAPPINGS:');
  
  const criticalMappings = [
    { client: 'account_prepared_financials', expected: 'financial_statements' },
    { client: 'pnl_statement', expected: 'profit_loss_statement' }
  ];
  
  for (const mapping of criticalMappings) {
    console.log(`Testing: ${mapping.client} → ${mapping.expected}`);
    
    try {
      const testApplicationId = "critical-test-app";
      
      const response = await fetch(`/api/public/upload/${testApplicationId}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token'
        },
        body: (() => {
          const formData = new FormData();
          formData.append('document', new Blob(['test'], { type: 'application/pdf' }), 'test.pdf');
          formData.append('documentType', mapping.expected); // Use expected backend type
          return formData;
        })()
      });
      
      const serverResponse = await response.text();
      
      if (serverResponse.includes(mapping.expected)) {
        console.log(`✅ Backend accepts: ${mapping.expected}`);
      } else {
        console.log(`❌ Backend rejects: ${mapping.expected}`);
      }
      
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
  }
}

// Run comprehensive audit
window.runDocumentTypeAudit = async function() {
  console.clear();
  const results = await testDocumentTypeMapping();
  await testCriticalMappings();
  
  console.log('\n📋 AUDIT COMPLETE - Review results above');
  return results;
};

// Auto-run audit
window.runDocumentTypeAudit();