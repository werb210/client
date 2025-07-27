// Test Step 5 Document Upload System
// Goal: Verify account_prepared_financials and pnl_statement uploads work

console.log('🧪 Testing Step 5 Document Upload System');

// Test configuration
const TEST_CONFIG = {
  applicationId: 'test-app-' + Date.now(),
  documentTypes: ['account_prepared_financials', 'pnl_statement'],
  endpoint: '/api/public/upload/:applicationId'
};

console.log('Test Configuration:', TEST_CONFIG);

// Function to create test files
function createTestFile(name, type) {
  const content = type === 'application/pdf' 
    ? new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]) // PDF header
    : 'Test document content for ' + name;
  
  return new File([content], name, { type });
}

// Function to test document upload
async function testDocumentUpload(documentType, fileName) {
  console.log(`\n📤 Testing ${documentType} upload...`);
  
  try {
    // Create test file
    const testFile = createTestFile(fileName, 'application/pdf');
    console.log(`✅ Created test file: ${testFile.name} (${testFile.size} bytes)`);
    
    // Prepare FormData
    const formData = new FormData();
    formData.append('document', testFile); // Note: using 'document' not 'file'
    formData.append('documentType', documentType);
    
    console.log(`📋 FormData prepared:`);
    console.log(`  - document: ${testFile.name}`);
    console.log(`  - documentType: ${documentType}`);
    
    // Test the upload endpoint
    const uploadUrl = `/api/public/upload/${TEST_CONFIG.applicationId}`;
    console.log(`🎯 Target URL: ${uploadUrl}`);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env?.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: formData
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`📊 Response Body: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    
    // Analyze results
    if (response.ok) {
      console.log(`✅ ${documentType} upload SUCCESSFUL`);
      return { success: true, status: response.status, response: responseText };
    } else {
      console.log(`❌ ${documentType} upload FAILED`);
      return { success: false, status: response.status, error: responseText };
    }
    
  } catch (error) {
    console.error(`❌ ${documentType} upload ERROR:`, error);
    return { success: false, error: error.message };
  }
}

// Main test execution
async function runUploadTests() {
  console.log('\n🚀 Starting Step 5 Upload Tests...');
  
  const results = [];
  
  // Test 1: Account Prepared Financials
  const accountResult = await testDocumentUpload(
    'account_prepared_financials', 
    'test_account_prepared_financials.pdf'
  );
  results.push({ type: 'account_prepared_financials', ...accountResult });
  
  // Test 2: P&L Statement
  const pnlResult = await testDocumentUpload(
    'pnl_statement', 
    'test_pnl_statement.pdf'
  );
  results.push({ type: 'pnl_statement', ...pnlResult });
  
  // Summary
  console.log('\n📋 TEST RESULTS SUMMARY:');
  console.log('=' .repeat(50));
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.type}: HTTP ${result.status || 'ERROR'}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const passCount = results.filter(r => r.success).length;
  console.log(`\n🎯 Overall Result: ${passCount}/${results.length} tests passed`);
  
  return results;
}

// Check if we're in browser environment and run tests
if (typeof window !== 'undefined') {
  window.testStep5Uploads = runUploadTests;
  console.log('💡 Run window.testStep5Uploads() to execute tests');
} else {
  // Node.js environment - run immediately
  runUploadTests().then(results => {
    console.log('Tests completed.');
    process.exit(results.every(r => r.success) ? 0 : 1);
  });
}