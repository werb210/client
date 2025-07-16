/**
 * EXECUTE COMPREHENSIVE TEST
 * Run this in browser console to test the complete 7-step workflow
 */

console.log('🚀 Starting Comprehensive End-to-End Test');
console.log('Current URL:', window.location.href);

// Test data matching the user's requirements
const testData = {
  businessName: 'End2End Ventures',
  contactName: 'Ava Thorough',
  amountRequested: 100000,
  industry: 'transportation',
  useOfFunds: 'equipment',
  firstName: 'Ava',
  lastName: 'Thorough',
  email: 'ava@end2end.com',
  phone: '555-789-1234'
};

// Step 1: Navigate to home and check Step 2 products
async function testStep2ProductDisplay() {
  console.log('\n📊 TESTING STEP 2 PRODUCT DISPLAY');
  
  // Navigate to Step 2
  window.location.href = '/step2';
  
  // Wait for page load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check for product cards
  const productCards = document.querySelectorAll('[data-testid="product-card"], .product-card, .recommendation-card, .bg-white.border, .border.rounded');
  console.log(`Found ${productCards.length} product cards`);
  
  // Check for loading states
  const loadingElements = document.querySelectorAll('[data-testid="loading"], .loading, .spinner');
  console.log(`Found ${loadingElements.length} loading elements`);
  
  // Check for error messages
  const errorElements = document.querySelectorAll('.error, [data-testid="error"]');
  console.log(`Found ${errorElements.length} error elements`);
  
  // Check console for product debug logs
  console.log('🔍 Checking for product filtering debug logs...');
  
  // Look for specific elements that might contain products
  const allDivs = document.querySelectorAll('div');
  let productRelatedDivs = 0;
  allDivs.forEach(div => {
    if (div.textContent && (
      div.textContent.includes('loan') ||
      div.textContent.includes('credit') ||
      div.textContent.includes('financing') ||
      div.textContent.includes('capital')
    )) {
      productRelatedDivs++;
    }
  });
  console.log(`Found ${productRelatedDivs} divs with product-related content`);
  
  // Check if any text mentions "41 products"
  const bodyText = document.body.textContent;
  if (bodyText.includes('41')) {
    console.log('✅ Found reference to 41 products in page content');
  } else {
    console.log('❌ No reference to 41 products found');
  }
  
  return {
    productCards: productCards.length,
    loading: loadingElements.length,
    errors: errorElements.length,
    productRelated: productRelatedDivs,
    hasProducts: productCards.length > 0
  };
}

// Step 2: Test document upload with fixed endpoint
async function testDocumentUpload() {
  console.log('\n📁 TESTING DOCUMENT UPLOAD ENDPOINT');
  
  // Test the corrected endpoint
  const applicationId = '2d10f4b1-1887-4e7d-a475-a09639307079'; // From console logs
  const testFile = new File(['test content'], 'test-document.pdf', { type: 'application/pdf' });
  
  const formData = new FormData();
  formData.append('document', testFile);
  formData.append('documentType', 'bank_statements');
  
  const correctEndpoint = `/api/public/applications/${applicationId}/documents`;
  console.log(`Testing endpoint: ${correctEndpoint}`);
  
  try {
    const response = await fetch(correctEndpoint, {
      method: 'POST',
      body: formData
    });
    
    console.log(`Upload test response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Document upload endpoint is working');
      return { success: true, status: response.status };
    } else {
      const errorText = await response.text();
      console.log('❌ Document upload failed:', errorText);
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.log('❌ Document upload error:', error.message);
    return { success: false, error: error.message };
  }
}

// Main test execution
async function runComprehensiveTest() {
  console.log('🧪 Running Comprehensive Workflow Test');
  
  const results = {
    step2: null,
    upload: null,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Test Step 2 Product Display
    results.step2 = await testStep2ProductDisplay();
    
    // Test Document Upload
    results.upload = await testDocumentUpload();
    
    // Generate report
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(60));
    
    console.log('\n🎯 STEP 2 PRODUCT DISPLAY:');
    console.log(`Product Cards Found: ${results.step2.productCards}`);
    console.log(`Loading Elements: ${results.step2.loading}`);
    console.log(`Error Elements: ${results.step2.errors}`);
    console.log(`Product-Related Content: ${results.step2.productRelated}`);
    console.log(`Status: ${results.step2.hasProducts ? '✅ WORKING' : '❌ NEEDS FIX'}`);
    
    console.log('\n📁 DOCUMENT UPLOAD:');
    console.log(`Endpoint Test: ${results.upload.success ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Status Code: ${results.upload.status || 'N/A'}`);
    if (results.upload.error) {
      console.log(`Error: ${results.upload.error}`);
    }
    
    console.log('\n🎯 CRITICAL ISSUES:');
    if (!results.step2.hasProducts) {
      console.log('• Step 2 products not displaying - 41 products available but not showing');
      console.log('• Check browser console for product filtering debug logs');
      console.log('• Verify Step 1 form data is being passed to Step 2');
    }
    
    if (!results.upload.success) {
      console.log('• Document upload endpoint still not working');
      console.log('• Check if staff backend has implemented the endpoint');
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Fix Step 2 product display issue');
    console.log('2. Verify document upload endpoint on staff backend');
    console.log('3. Test complete workflow from Step 1 to Step 7');
    
    return results;
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return { error: error.message };
  }
}

// Execute the test
runComprehensiveTest().then(results => {
  console.log('\n🏁 Test completed. Results:', results);
  window.testResults = results; // Store for further analysis
});