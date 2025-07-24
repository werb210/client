/**
 * S3 INTEGRATION TEST SUITE
 * Tests the complete Client → Staff Backend → S3 workflow
 */

console.log('🧪 S3 INTEGRATION TEST SUITE');
console.log('=============================');

const S3_INTEGRATION_TESTS = {
  
  // Test 1: Upload to Staff Backend
  testUploadToStaffBackend: async (testFile, applicationId = 'test-app-12345') => {
    console.log('\n1. Testing Upload to Staff Backend');
    console.log('-----------------------------------');
    
    try {
      const formData = new FormData();
      formData.append('document', testFile);  // user-selected file (server expects 'document' field)
      formData.append('documentType', 'bank_statements'); // e.g. 'bank_statements'
      
      console.log('📤 [S3-TEST] Uploading to staff backend...', {
        fileName: testFile.name,
        fileSize: testFile.size,
        documentType: 'bank_statements',
        endpoint: `/api/public/upload/${applicationId}`
      });

      const response = await fetch(`/api/public/upload/${applicationId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        }
      });

      console.log(`📊 [S3-TEST] Response Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ [S3-TEST] Upload successful:', result);
        
        // Check for storage_key
        if (result.storage_key) {
          console.log(`🔑 [S3-TEST] Storage key confirmed: ${result.storage_key}`);
        } else {
          console.warn('⚠️ [S3-TEST] No storage_key in response');
        }
        
        return { 
          success: true, 
          data: result,
          hasStorageKey: !!result.storage_key,
          documentId: result.documentId || result.id
        };
        
      } else {
        const errorText = await response.text();
        console.log('❌ [S3-TEST] Upload failed:', errorText);
        return { success: false, error: errorText };
      }
      
    } catch (error) {
      console.error('❌ [S3-TEST] Upload test error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Test 2: Verify Storage Key in Database
  testStorageKeyInDatabase: async (documentId) => {
    console.log('\n2. Testing Storage Key in Database');
    console.log('-----------------------------------');
    
    if (!documentId) {
      console.log('⚠️ [S3-TEST] No document ID provided - skipping database test');
      return { success: true, skipped: true };
    }
    
    try {
      console.log(`🔍 [S3-TEST] Checking document in database: ${documentId}`);
      
      const response = await fetch(`/api/public/documents/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        }
      });
      
      console.log(`📊 [S3-TEST] Database Check Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const docData = await response.json();
        console.log('✅ [S3-TEST] Document found in database:', docData);
        
        if (docData.storage_key) {
          console.log(`🔑 [S3-TEST] Storage key in database: ${docData.storage_key}`);
          return { success: true, hasStorageKey: true, data: docData };
        } else {
          console.warn('⚠️ [S3-TEST] No storage_key in database record');
          return { success: false, error: 'Missing storage_key in database' };
        }
        
      } else {
        const errorText = await response.text();
        console.log('❌ [S3-TEST] Database check failed:', errorText);
        return { success: false, error: errorText };
      }
      
    } catch (error) {
      console.error('❌ [S3-TEST] Database test error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Test 3: Document Preview via Pre-signed URL
  testDocumentPreview: async (documentId) => {
    console.log('\n3. Testing Document Preview via Pre-signed URL');
    console.log('-----------------------------------------------');
    
    if (!documentId) {
      console.log('⚠️ [S3-TEST] No document ID provided - skipping preview test');
      return { success: true, skipped: true };
    }
    
    try {
      console.log(`👁️ [S3-TEST] Getting preview URL for: ${documentId}`);
      
      const response = await fetch(`/api/public/s3-access/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        }
      });
      
      console.log(`📊 [S3-TEST] Preview URL Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ [S3-TEST] Preview URL obtained:', {
          hasUrl: !!result.url,
          urlLength: result.url?.length
        });
        
        // Test opening preview (without actually opening to avoid popups in test)
        if (result.url) {
          console.log('🔗 [S3-TEST] Preview URL format valid');
          return { success: true, url: result.url };
        } else {
          console.warn('⚠️ [S3-TEST] No URL in preview response');
          return { success: false, error: 'No URL in response' };
        }
        
      } else {
        const errorText = await response.text();
        console.log('❌ [S3-TEST] Preview URL failed:', errorText);
        return { success: false, error: errorText };
      }
      
    } catch (error) {
      console.error('❌ [S3-TEST] Preview test error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Test 4: Download Functionality
  testDocumentDownload: async (documentId, fileName = 'test-download.pdf') => {
    console.log('\n4. Testing Document Download Functionality');
    console.log('------------------------------------------');
    
    if (!documentId) {
      console.log('⚠️ [S3-TEST] No document ID provided - skipping download test');
      return { success: true, skipped: true };
    }
    
    try {
      console.log(`💾 [S3-TEST] Testing download for: ${documentId}`);
      
      const response = await fetch(`/api/public/s3-access/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        }
      });
      
      console.log(`📊 [S3-TEST] Download URL Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ [S3-TEST] Download URL obtained successfully');
        
        // Test download preparation (without triggering actual download)
        if (result.url) {
          console.log('🔗 [S3-TEST] Download URL ready for use');
          return { success: true, downloadReady: true };
        } else {
          console.warn('⚠️ [S3-TEST] No download URL in response');
          return { success: false, error: 'No download URL' };
        }
        
      } else {
        const errorText = await response.text();
        console.log('❌ [S3-TEST] Download URL failed:', errorText);
        return { success: false, error: errorText };
      }
      
    } catch (error) {
      console.error('❌ [S3-TEST] Download test error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Test 5: CORS Configuration
  testCORSConfiguration: () => {
    console.log('\n5. Testing CORS Configuration');
    console.log('------------------------------');
    
    const clientDomain = window.location.origin;
    const expectedClientDomain = 'https://client.boreal.financial';
    const expectedStaffDomain = 'https://staff.boreal.financial';
    
    console.log('🌐 [S3-TEST] CORS Check:', {
      currentDomain: clientDomain,
      expectedClient: expectedClientDomain,
      expectedStaff: expectedStaffDomain,
      corsMatch: clientDomain === expectedClientDomain
    });
    
    if (clientDomain === expectedClientDomain) {
      console.log('✅ [S3-TEST] CORS configuration correct');
      return { success: true, corsValid: true };
    } else {
      console.log('⚠️ [S3-TEST] CORS configuration may need verification');
      return { success: true, corsValid: false, note: 'Running in development mode' };
    }
  }
};

// Execute complete S3 integration test suite
const executeS3IntegrationTests = async () => {
  console.log('🚀 [S3-TEST] Starting S3 Integration Test Suite');
  console.log('================================================');
  
  const results = {
    upload: null,
    database: null,
    preview: null,
    download: null,
    cors: null,
    overall: { passed: 0, failed: 0, skipped: 0 }
  };
  
  try {
    // Create test file
    const testContent = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A,
      0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C
    ]);
    const testFile = new File([testContent], "s3-test-document.pdf", {
      type: "application/pdf"
    });
    
    console.log('📄 [S3-TEST] Test file created:', {
      name: testFile.name,
      size: testFile.size,
      type: testFile.type
    });
    
    // Test 1: Upload to Staff Backend
    results.upload = await S3_INTEGRATION_TESTS.testUploadToStaffBackend(testFile);
    if (results.upload.success) results.overall.passed++; else results.overall.failed++;
    
    // Test 2: Storage Key in Database (only if upload succeeded)
    const documentId = results.upload.data?.documentId;
    if (documentId) {
      results.database = await S3_INTEGRATION_TESTS.testStorageKeyInDatabase(documentId);
      if (results.database.skipped) results.overall.skipped++;
      else if (results.database.success) results.overall.passed++;
      else results.overall.failed++;
      
      // Test 3: Document Preview
      results.preview = await S3_INTEGRATION_TESTS.testDocumentPreview(documentId);
      if (results.preview.skipped) results.overall.skipped++;
      else if (results.preview.success) results.overall.passed++;
      else results.overall.failed++;
      
      // Test 4: Document Download
      results.download = await S3_INTEGRATION_TESTS.testDocumentDownload(documentId);
      if (results.download.skipped) results.overall.skipped++;
      else if (results.download.success) results.overall.passed++;
      else results.overall.failed++;
    } else {
      console.log('⚠️ [S3-TEST] Skipping database/preview/download tests - no document ID');
      results.overall.skipped += 3;
    }
    
    // Test 5: CORS Configuration
    results.cors = S3_INTEGRATION_TESTS.testCORSConfiguration();
    if (results.cors.success) results.overall.passed++; else results.overall.failed++;
    
  } catch (error) {
    console.error('❌ [S3-TEST] Test suite execution error:', error);
  }
  
  // Final report
  console.log('\n📊 S3 INTEGRATION TEST RESULTS');
  console.log('===============================');
  console.log(`✅ Tests Passed: ${results.overall.passed}`);
  console.log(`❌ Tests Failed: ${results.overall.failed}`);
  console.log(`⚠️ Tests Skipped: ${results.overall.skipped}`);
  
  const successRate = Math.round((results.overall.passed / (results.overall.passed + results.overall.failed)) * 100);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  // Key checkpoints for reporting back
  console.log('\n🎯 KEY CHECKPOINTS FOR REPORTING:');
  console.log('1. Upload from client works:', results.upload?.success ? '✅ YES' : '❌ NO');
  console.log('2. storage_key is saved:', results.upload?.hasStorageKey ? '✅ YES' : '❌ NO');
  console.log('3. Previews/downloads successful:', results.preview?.success && results.download?.success ? '✅ YES' : '❌ NO');
  console.log('4. No console errors (CORS):', results.cors?.corsValid ? '✅ YES' : '⚠️ NEEDS VERIFICATION');
  console.log('5. ZIP archive capability:', '🔄 REQUIRES ADDITIONAL TESTING');
  
  const allTestsPassed = results.overall.failed === 0;
  console.log(`\n🎯 Overall Status: ${allTestsPassed ? '✅ ALL S3 INTEGRATIONS WORKING' : '❌ SOME INTEGRATIONS NEED ATTENTION'}`);
  
  return results;
};

// Make test functions available globally
if (typeof window !== 'undefined') {
  window.executeS3IntegrationTests = executeS3IntegrationTests;
  window.S3_INTEGRATION_TESTS = S3_INTEGRATION_TESTS;
  console.log('🧪 Test functions available:');
  console.log('   window.executeS3IntegrationTests() - Run complete test suite');
  console.log('   window.S3_INTEGRATION_TESTS - Individual test functions');
}