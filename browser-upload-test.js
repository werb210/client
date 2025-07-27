/**
 * 🧪 BROWSER-BASED DOCUMENT UPLOAD TEST
 * Run this script in browser console to test all 22 document types
 * Usage: Copy and paste into browser console on any application page
 */

(async function runDocumentUploadDiagnostic() {
  const ALL_DOCUMENT_TYPES = [
    'accounts_payable', 'accounts_receivable', 'articles_of_incorporation',
    'balance_sheet', 'bank_statements', 'business_license', 'business_plan',
    'cash_flow_statement', 'collateral_docs', 'drivers_license_front_back',
    'equipment_quote', 'financial_statements', 'invoice_samples', 'other',
    'personal_financial_statement', 'personal_guarantee', 'profit_loss_statement',
    'proof_of_identity', 'signed_application', 'supplier_agreement', 'tax_returns', 'void_pad'
  ];

  const TEST_APP_ID = 'test-upload-diagnostic-1753650254760';
  
  console.log('🧪 DOCUMENT UPLOAD DIAGNOSTIC - ALL 22 TYPES');
  console.log('='.repeat(60));
  console.log(`🎯 Test Application ID: ${TEST_APP_ID}`);
  
  const results = [];
  let successCount = 0;
  
  for (const docType of ALL_DOCUMENT_TYPES) {
    try {
      console.log(`📤 Testing ${docType}...`);
      
      const formData = new FormData();
      formData.append('documentType', docType);
      formData.append('document', new File(['test content'], `${docType}_test.pdf`, { type: 'application/pdf' }));
      
      const response = await fetch(`/api/public/upload/${TEST_APP_ID}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      const success = response.ok;
      
      if (success) {
        console.log(`✅ ${docType}: SUCCESS`);
        successCount++;
      } else {
        console.log(`❌ ${docType}: FAILED - ${data.error || 'Unknown error'}`);
      }
      
      results.push({
        documentType: docType,
        success: success,
        status: response.status,
        message: data.message || data.error || 'OK'
      });
      
    } catch (error) {
      console.log(`❌ ${docType}: ERROR - ${error.message}`);
      results.push({
        documentType: docType,
        success: false,
        status: 0,
        message: error.message
      });
    }
    
    // Small delay to avoid overwhelming server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 UPLOAD TEST MATRIX:');
  console.log('='.repeat(60));
  console.log('| Document Type                   | Status | Result | Message           |');
  console.log('|---------------------------------|--------|--------|-------------------|');
  
  results.forEach(result => {
    const type = result.documentType.padEnd(31);
    const status = result.status.toString().padEnd(6);
    const resultIcon = result.success ? '✅ PASS' : '❌ FAIL';
    const message = result.message.substring(0, 17).padEnd(17);
    console.log(`| ${type} | ${status} | ${resultIcon} | ${message} |`);
  });
  
  console.log('\n📈 SUMMARY:');
  console.log(`✅ Successful: ${successCount}/${ALL_DOCUMENT_TYPES.length}`);
  console.log(`❌ Failed: ${ALL_DOCUMENT_TYPES.length - successCount}/${ALL_DOCUMENT_TYPES.length}`);
  console.log(`📊 Success Rate: ${((successCount / ALL_DOCUMENT_TYPES.length) * 100).toFixed(1)}%`);
  
  if (successCount < ALL_DOCUMENT_TYPES.length) {
    console.log('\n❌ FAILED DOCUMENT TYPES:');
    results.filter(r => !r.success).forEach(failure => {
      console.log(`   • ${failure.documentType}: ${failure.message}`);
    });
  }
  
  return results;
})();