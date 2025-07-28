/**
 * Complete Document Upload Routine Test
 * Re-run full upload for application ID: 0e0b80e6-330a-4c55-8cb0-8ac788d86806
 * Log each file's upload result and raw API response
 */

const APPLICATION_ID = '0e0b80e6-330a-4c55-8cb0-8ac788d86806';
const UPLOAD_ENDPOINT = `http://localhost:5000/api/public/upload/${APPLICATION_ID}`;

// Files to upload from attached_assets
const FILES_TO_UPLOAD = [
  'nov 2024_1753309140916.pdf',
  'dec 15_1753309140916.pdf', 
  'jan 15 2025_1753309140918.pdf',
  'feb 15 2025_1753309140917.pdf',
  'mar 15 2025_1753309140918.pdf',
  'Apr 15 2025_1753309140914.pdf'
];

async function uploadSingleDocument(filename) {
  console.log(`📤 Uploading: ${filename}`);
  
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    
    // Fetch the file from attached_assets
    const fileResponse = await fetch(`/attached_assets/${filename}`);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.status}`);
    }
    
    const fileBlob = await fileResponse.blob();
    formData.append('document', fileBlob, filename);
    formData.append('documentType', 'bank_statements');
    
    // Upload to the server
    const uploadResponse = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: formData
    });
    
    console.log(`📊 Response Status: ${uploadResponse.status} ${uploadResponse.statusText}`);
    
    const responseData = await uploadResponse.json();
    console.log(`📋 Raw API Response:`, responseData);
    
    if (responseData.success) {
      console.log(`✅ Success: ${filename} - Document ID: ${responseData.documentId || 'N/A'}`);
      return { filename, success: true, response: responseData };
    } else {
      console.log(`❌ Failed: ${filename} - Error: ${JSON.stringify(responseData)}`);
      return { filename, success: false, response: responseData };
    }
    
  } catch (error) {
    console.log(`❌ Failed: ${filename} - Error: ${error.message}`);
    return { filename, success: false, error: error.message };
  }
}

async function runFullUploadRoutine() {
  console.log("🚨 RE-RUNNING FULL DOCUMENT UPLOAD ROUTINE");
  console.log(`📍 Application ID: ${APPLICATION_ID}`);
  console.log(`🎯 Upload Endpoint: ${UPLOAD_ENDPOINT}`);
  console.log(`📁 Files to Upload: ${FILES_TO_UPLOAD.length}`);
  console.log("=" * 60);
  
  const results = [];
  
  // Upload each file sequentially
  for (const filename of FILES_TO_UPLOAD) {
    const result = await uploadSingleDocument(filename);
    results.push(result);
    console.log("-" * 40);
  }
  
  // Summary
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log("\n📊 UPLOAD SUMMARY:");
  console.log("=" * 60);
  console.log(`✅ Successful uploads: ${successCount}/${FILES_TO_UPLOAD.length}`);
  console.log(`❌ Failed uploads: ${failCount}/${FILES_TO_UPLOAD.length}`);
  
  if (successCount > 0) {
    console.log("\n✅ CONFIRMED RECEIVED BY STAFF BACKEND:");
    results.filter(r => r.success).forEach(r => {
      console.log(`   - ${r.filename}: success: true, documentId: ${r.response?.documentId || 'N/A'}`);
    });
  }
  
  if (failCount > 0) {
    console.log("\n❌ FAILED UPLOADS:");
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.filename}: ${r.error || JSON.stringify(r.response)}`);
    });
  }
  
  return results;
}

// Execute the routine
runFullUploadRoutine().then(results => {
  console.log("\n🎯 FINAL RESULT:");
  const successCount = results.filter(r => r.success).length;
  console.log(`${successCount} documents were confirmed received ("success": true) by the Staff backend.`);
  
  // Store results for further analysis
  window.uploadTestResults = results;
}).catch(error => {
  console.error("Upload routine failed:", error);
});