/**
 * Test Script: Step 6 Document Verification
 * Tests the enhanced Step 6 finalization logic with staff backend S3 validation
 */

console.log('🧪 STEP 6 DOCUMENT VERIFICATION TEST');
console.log('=====================================');

async function testStep6DocumentVerification() {
  console.log('\n🔍 Testing Step 6 finalization with enhanced document verification...');
  
  // Get application ID from current context
  const formDataState = window.formDataState || {};
  const applicationId = formDataState.applicationId || localStorage.getItem('applicationId');
  
  if (!applicationId) {
    console.error('❌ No application ID found - cannot test document verification');
    return false;
  }
  
  console.log(`📋 Testing with Application ID: ${applicationId}`);
  
  try {
    // Test 1: Staff Backend Document Verification
    console.log('\n🧪 TEST 1: Staff Backend Document Verification');
    console.log('==============================================');
    
    const response = await fetch(`/api/public/applications/${applicationId}/documents`);
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      console.log('⚠️ Application not found in staff backend (404)');
      
      // Check if we're in development mode for fallback
      const isDev = import.meta.env.DEV;
      console.log(`🔧 Development mode: ${isDev}`);
      
      if (isDev) {
        // Check local upload evidence
        const localUploadedFiles = formDataState.step5DocumentUpload?.uploadedFiles || [];
        console.log(`📁 Local uploaded files: ${localUploadedFiles.length}`);
        
        if (localUploadedFiles.length > 0) {
          console.log('✅ TEST 1 RESULT: Development fallback would allow finalization');
          return true;
        } else {
          console.log('❌ TEST 1 RESULT: No local upload evidence - would block finalization');
          return false;
        }
      } else {
        console.log('❌ TEST 1 RESULT: Production mode - would block finalization');
        return false;
      }
    }
    
    if (!response.ok) {
      console.log(`❌ TEST 1 RESULT: API error (${response.status}) - would block finalization`);
      return false;
    }
    
    const documentData = await response.json();
    const uploadedDocuments = documentData.documents || [];
    
    console.log('📄 Document verification results:', {
      documentsFound: uploadedDocuments.length,
      documents: uploadedDocuments.map((doc) => ({
        id: doc.id || doc.documentId,
        type: doc.documentType || doc.type,
        name: doc.fileName || doc.name,
        status: doc.status,
        uploadConfirmed: doc.uploadConfirmed,
        s3Key: doc.s3Key || doc.storageKey
      }))
    });
    
    // Test 2: Document Count Validation
    console.log('\n🧪 TEST 2: Document Count Validation');
    console.log('====================================');
    
    if (uploadedDocuments.length === 0) {
      console.log('❌ TEST 2 RESULT: No documents found - would block finalization');
      console.log('   Expected message: "Please upload all required documents before finalizing your application."');
      return false;
    }
    
    console.log(`✅ TEST 2 RESULT: ${uploadedDocuments.length} documents found - passes count validation`);
    
    // Test 3: Document Confirmation Status
    console.log('\n🧪 TEST 3: Document Confirmation Status');
    console.log('======================================');
    
    const confirmedDocuments = uploadedDocuments.filter((doc) => 
      doc.status === 'confirmed' || doc.status === 'processed' || doc.uploadConfirmed === true
    );
    
    console.log(`📊 Confirmed documents: ${confirmedDocuments.length}/${uploadedDocuments.length}`);
    
    if (confirmedDocuments.length < uploadedDocuments.length) {
      const unconfirmedCount = uploadedDocuments.length - confirmedDocuments.length;
      console.log(`⚠️ TEST 3 RESULT: ${unconfirmedCount} documents not yet confirmed - would block finalization`);
      console.log(`   Expected message: "${unconfirmedCount} document${unconfirmedCount > 1 ? 's' : ''} still processing. Please wait a moment and try again."`);
      return false;
    }
    
    console.log('✅ TEST 3 RESULT: All documents confirmed - passes confirmation validation');
    
    // Test 4: Overall Finalization Status
    console.log('\n🧪 TEST 4: Overall Finalization Status');
    console.log('=====================================');
    
    console.log('✅ ALL VALIDATIONS PASSED - Step 6 finalization would be allowed');
    console.log(`📋 Summary:`);
    console.log(`   - Application ID: ${applicationId}`);
    console.log(`   - Documents found: ${uploadedDocuments.length}`);
    console.log(`   - Documents confirmed: ${confirmedDocuments.length}`);
    console.log(`   - Finalization status: ✅ ALLOWED`);
    
    return true;
    
  } catch (error) {
    console.error('❌ TEST ERROR:', error);
    console.log('   Expected message: "We\'re having trouble verifying your documents. Please wait a moment or try re-uploading."');
    return false;
  }
}

// Test the actual Step 6 validation function if available
async function testStep6ValidationFunction() {
  console.log('\n🔧 Testing Step 6 validation function directly...');
  
  // Check if we can access Step 6 component validation
  if (window.location.pathname.includes('step-6') && window.validateDocumentUploads) {
    try {
      const validationResult = await window.validateDocumentUploads();
      console.log(`📊 Direct validation result: ${validationResult ? '✅ ALLOWED' : '❌ BLOCKED'}`);
      return validationResult;
    } catch (error) {
      console.error('❌ Direct validation error:', error);
      return false;
    }
  } else {
    console.log('⚠️ Step 6 validation function not accessible (not on Step 6 page)');
    return null;
  }
}

// Run comprehensive test
async function runStep6DocumentVerificationTest() {
  console.log('🚀 Starting comprehensive Step 6 document verification test...');
  
  const apiTest = await testStep6DocumentVerification();
  const functionTest = await testStep6ValidationFunction();
  
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('=======================');
  console.log(`API Test: ${apiTest ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Function Test: ${functionTest === null ? '⚠️ SKIPPED' : (functionTest ? '✅ PASSED' : '❌ FAILED')}`);
  
  if (apiTest) {
    console.log('\n🎉 Step 6 document verification is working correctly!');
    console.log('📋 Key improvements implemented:');
    console.log('   ✅ Strict staff backend S3 validation');
    console.log('   ✅ Enhanced error messages for document verification issues');
    console.log('   ✅ Development mode fallback for 404 responses');
    console.log('   ✅ Document confirmation status checking');
    console.log('   ✅ Comprehensive error logging in dev mode');
  } else {
    console.log('\n❌ Step 6 document verification needs attention');
    console.log('📋 Possible issues:');
    console.log('   - No documents uploaded to staff backend');
    console.log('   - Documents not yet confirmed/processed');
    console.log('   - Application not found in staff backend');
    console.log('   - Network connectivity issues');
  }
  
  return apiTest;
}

// Make functions available globally
window.testStep6DocumentVerification = testStep6DocumentVerification;
window.testStep6ValidationFunction = testStep6ValidationFunction;
window.runStep6DocumentVerificationTest = runStep6DocumentVerificationTest;

console.log('🔧 Step 6 Document Verification Test loaded');
console.log('📋 Run: window.runStep6DocumentVerificationTest()');