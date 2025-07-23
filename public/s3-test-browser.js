/**
 * BROWSER-COMPATIBLE S3 UPLOAD TEST
 * Execute S3 upload test directly from browser console
 */

// Access Vite environment variables through window object
const getEnvVar = (name) => {
  // Try multiple ways to access environment variables
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    return import.meta.env[name];
  }
  // Fallback to window object
  if (window.VITE_CLIENT_APP_SHARED_TOKEN) {
    return window.VITE_CLIENT_APP_SHARED_TOKEN;
  }
  // Final fallback - check if it's exposed anywhere
  return null;
};

const executeS3UploadTestBrowser = async () => {
  const TEST_APPLICATION_ID = '0e0b80e6-330a-4c55-8cb0-8ac788d86806';
  const UPLOAD_ENDPOINT = `/api/public/upload/${TEST_APPLICATION_ID}`;
  
  // Try to get token
  const token = getEnvVar('VITE_CLIENT_APP_SHARED_TOKEN');
  
  console.log('🚀 [S3_UPLOAD_TEST] Starting S3 upload test protocol');
  console.log('📁 [S3_UPLOAD_TEST] Application ID:', TEST_APPLICATION_ID);
  console.log('🔑 [S3_UPLOAD_TEST] Token available:', token ? 'YES' : 'NO');
  
  if (!token) {
    console.error('❌ [S3_UPLOAD_TEST] No Bearer token available');
    console.log('🔧 [S3_UPLOAD_TEST] Trying without token for testing...');
  }
  
  const TEST_FILES = [
    { filename: 'nov 2024_1753310949611.pdf', documentType: 'bank_statements' },
    { filename: 'Apr 15 2025_1753310949613.pdf', documentType: 'bank_statements' },
    { filename: 'dec 15_1753310949616.pdf', documentType: 'bank_statements' },
    { filename: 'feb 15 2025_1753310949616.pdf', documentType: 'bank_statements' },
    { filename: 'jan 15 2025_1753310949617.pdf', documentType: 'bank_statements' },
    { filename: 'mar 15 2025_1753310949617.pdf', documentType: 'bank_statements' }
  ];
  
  const results = {
    totalFiles: TEST_FILES.length,
    successful: 0,
    failed: 0,
    uploads: [],
    s3Fallbacks: 0,
    errors: []
  };

  for (let i = 0; i < TEST_FILES.length; i++) {
    const fileInfo = TEST_FILES[i];
    console.log(`\n📤 [S3_UPLOAD_TEST] Processing file ${i + 1}/${TEST_FILES.length}: ${fileInfo.filename}`);
    
    try {
      // Create test file blob
      const testContent = `Test PDF content for ${fileInfo.filename} - ${new Date().toISOString()}`;
      const blob = new Blob([testContent], { type: 'application/pdf' });
      const file = new File([blob], fileInfo.filename, { type: 'application/pdf' });
      
      // Prepare FormData
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', fileInfo.documentType);
      
      console.log(`📋 [S3_UPLOAD_TEST] FormData prepared:`, {
        filename: file.name,
        size: file.size,
        type: file.type,
        documentType: fileInfo.documentType
      });
      
      // Prepare headers
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Execute upload
      const startTime = Date.now();
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        headers,
        body: formData
      });
      
      const uploadTime = Date.now() - startTime;
      let responseData;
      
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { error: 'Failed to parse response as JSON' };
      }
      
      console.log(`📥 [S3_UPLOAD_TEST] Response received (${uploadTime}ms):`, {
        status: response.status,
        ok: response.ok,
        data: responseData
      });
      
      // Analyze response
      const uploadResult = {
        filename: fileInfo.filename,
        documentType: fileInfo.documentType,
        status: response.status,
        success: response.ok && responseData.success,
        documentId: responseData.documentId,
        storage_key: responseData.storage_key,
        uploadTime,
        s3Fallback: responseData.fallback || false,
        error: responseData.error || null
      };
      
      results.uploads.push(uploadResult);
      
      if (uploadResult.success) {
        results.successful++;
        console.log(`✅ [S3_UPLOAD_TEST] Upload successful:`, {
          documentId: uploadResult.documentId,
          storage_key: uploadResult.storage_key,
          s3Fallback: uploadResult.s3Fallback
        });
        
        if (uploadResult.s3Fallback) {
          results.s3Fallbacks++;
          console.warn(`⚠️ [S3_UPLOAD_TEST] S3 fallback detected for ${fileInfo.filename}`);
        }
      } else {
        results.failed++;
        results.errors.push(`${fileInfo.filename}: ${uploadResult.error || 'Unknown error'}`);
        console.error(`❌ [S3_UPLOAD_TEST] Upload failed:`, uploadResult.error);
      }
      
    } catch (error) {
      results.failed++;
      results.errors.push(`${fileInfo.filename}: ${error.message}`);
      console.error(`💥 [S3_UPLOAD_TEST] Upload exception:`, error);
    }
    
    // Brief pause between uploads
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Final results summary
  console.log('\n🎯 [S3_UPLOAD_TEST] COMPLETE RESULTS SUMMARY:');
  console.log('==========================================');
  console.log(`📊 Total Files: ${results.totalFiles}`);
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️ S3 Fallbacks: ${results.s3Fallbacks}`);
  console.log(`🎯 Success Rate: ${((results.successful / results.totalFiles) * 100).toFixed(1)}%`);
  
  if (results.successful > 0) {
    console.log('\n📋 [S3_UPLOAD_TEST] SUCCESSFUL UPLOADS:');
    results.uploads.filter(u => u.success).forEach((upload, i) => {
      console.log(`${i + 1}. ${upload.filename}:`);
      console.log(`   📄 Document ID: ${upload.documentId}`);
      console.log(`   🔑 Storage Key: ${upload.storage_key}`);
      console.log(`   ⏱️ Upload Time: ${upload.uploadTime}ms`);
      console.log(`   📂 S3 Fallback: ${upload.s3Fallback ? 'YES' : 'NO'}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ [S3_UPLOAD_TEST] ERRORS:');
    results.errors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });
  }
  
  return results;
};

// Make function globally available
window.executeS3UploadTestBrowser = executeS3UploadTestBrowser;
console.log('🧪 [S3_UPLOAD_TEST] Browser-compatible test ready');
console.log('🔧 [S3_UPLOAD_TEST] Run: executeS3UploadTestBrowser()');