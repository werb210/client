/**
 * BROWSER CONSOLE TEST - Upload 6 Bank Statements
 * Copy and paste this into browser console to test bank statement uploads
 * Uses the file collection system implemented in Step 5
 */

async function testBankStatementUpload() {
  console.log('🚀 STARTING BANK STATEMENT UPLOAD TEST');
  console.log('=====================================');
  
  const applicationId = "123e4567-e89b-12d3-a456-426614174000";
  const uploadResults = [];
  
  // Navigate to Step 5 if not already there
  if (!window.location.pathname.includes('/step5')) {
    console.log('📍 Navigating to Step 5...');
    window.location.href = '/step5';
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Create test bank statement files
  const bankStatements = [
    'April_2025_Bank_Statement.pdf',
    'March_2025_Bank_Statement.pdf', 
    'February_2025_Bank_Statement.pdf',
    'January_2025_Bank_Statement.pdf',
    'December_2024_Bank_Statement.pdf',
    'November_2024_Bank_Statement.pdf'
  ];
  
  console.log(`📄 Creating ${bankStatements.length} bank statement files...`);
  
  const testFiles = bankStatements.map(fileName => {
    // Create mock PDF content
    const pdfContent = `Mock PDF content for ${fileName}`;
    return new File([pdfContent], fileName, { type: 'application/pdf' });
  });
  
  console.log('✅ Test files created successfully');
  
  // Test each upload using our file collection system
  for (let i = 0; i < testFiles.length; i++) {
    const file = testFiles[i];
    const fileName = file.name;
    
    console.log(`\n📤 Testing upload ${i + 1}/6: ${fileName}`);
    
    try {
      // Use the actual API endpoint from our implementation
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'bank_statements');
      
      const uploadUrl = `/api/public/applications/${applicationId}/documents`;
      
      console.log(`🔗 Uploading to: ${uploadUrl}`);
      console.log(`📋 Application ID: ${applicationId}`);
      console.log(`📄 Document Type: bank_statements`);
      console.log(`📁 File: ${fileName} (${file.size} bytes)`);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      let responseBody;
      try {
        responseBody = await response.json();
      } catch (e) {
        responseBody = await response.text();
      }
      
      const result = {
        fileName: fileName,
        applicationId: applicationId,
        status: response.status,
        success: response.ok,
        responseBody: responseBody,
        timestamp: new Date().toISOString()
      };
      
      uploadResults.push(result);
      
      console.log(`📊 Upload result:`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Success: ${response.ok}`);
      console.log(`   Response: ${JSON.stringify(responseBody, null, 2)}`);
      
      if (response.ok) {
        console.log(`✅ ${fileName} uploaded successfully`);
      } else {
        console.log(`❌ ${fileName} upload failed`);
      }
      
    } catch (error) {
      console.log(`❌ Upload error for ${fileName}: ${error.message}`);
      
      uploadResults.push({
        fileName: fileName,
        applicationId: applicationId,
        status: 'ERROR',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate ChatGPT Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 CHATGPT REPORT - BANK STATEMENT UPLOAD TEST COMPLETE');
  console.log('='.repeat(60));
  
  const successfulUploads = uploadResults.filter(r => r.success);
  const failedUploads = uploadResults.filter(r => !r.success);
  
  console.log(`📁 Total Files Tested: ${uploadResults.length}`);
  console.log(`✅ Successful Uploads: ${successfulUploads.length}`);
  console.log(`❌ Failed Uploads: ${failedUploads.length}`);
  console.log(`🆔 Application ID: ${applicationId}`);
  
  console.log('\n📝 DETAILED RESULTS FOR CHATGPT:');
  console.log('='.repeat(40));
  
  uploadResults.forEach((result, index) => {
    console.log(`${index + 1}. 🔢 File: ${result.fileName}`);
    console.log(`   📎 Application ID: ${result.applicationId}`);
    console.log(`   📤 Status Code: ${result.status}`);
    console.log(`   🧾 Response Body: ${JSON.stringify(result.responseBody || result.error, null, 2)}`);
    console.log(`   ✅ Success: ${result.success ? 'YES' : 'NO'}`);
    if (result.error) {
      console.log(`   ⚠️ Error Details: ${result.error}`);
    }
    console.log('');
  });
  
  console.log('\n🎯 FINAL ASSESSMENT:');
  console.log('='.repeat(30));
  console.log(`Upload Success Rate: ${Math.round((successfulUploads.length / uploadResults.length) * 100)}%`);
  console.log(`API Endpoint: ${successfulUploads.length > 0 ? '✅ WORKING' : '❌ BROKEN'}`);
  console.log(`Document Processing: ${successfulUploads.length === 6 ? '✅ ALL 6 PROCESSED' : '⚠️ PARTIAL SUCCESS'}`);
  console.log(`Staff Backend: ${successfulUploads.length > 0 ? '✅ RECEIVING DOCUMENTS' : '❌ NOT RESPONDING'}`);
  
  if (failedUploads.length > 0) {
    console.log('\n⚠️ ISSUES ENCOUNTERED:');
    failedUploads.forEach(failure => {
      console.log(`- ${failure.fileName}: ${failure.error || 'HTTP ' + failure.status}`);
    });
  }
  
  console.log('\n📋 CHATGPT SUMMARY REPORT:');
  console.log('='.repeat(35));
  console.log(`✅ Actions: Tested upload of ${uploadResults.length} bank statement PDFs using Step 5 file collection system`);
  console.log(`⚠️ Issues: ${failedUploads.length > 0 ? `${failedUploads.length} uploads failed` : 'None'}`);
  console.log(`📦 API Calls: POST /api/public/applications/${applicationId}/documents with multipart/form-data`);
  console.log(`🟢 Outcome: ${successfulUploads.length}/${uploadResults.length} documents successfully uploaded to staff backend`);
  
  // Test if documents appear in Sales Pipeline
  console.log('\n🔍 CHECKING SALES PIPELINE STATUS:');
  try {
    const pipelineResponse = await fetch(`/api/public/applications/${applicationId}/documents`);
    if (pipelineResponse.ok) {
      const documents = await pipelineResponse.json();
      console.log(`✅ Documents in Sales Pipeline: ${documents.length || 0}`);
      console.log(`📋 Document Types: ${documents.map(d => d.document_type).join(', ')}`);
    } else {
      console.log(`⚠️ Could not verify Sales Pipeline status: ${pipelineResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Pipeline check failed: ${error.message}`);
  }
  
  return {
    totalFiles: uploadResults.length,
    successfulUploads: successfulUploads.length,
    failedUploads: failedUploads.length,
    applicationId: applicationId,
    results: uploadResults,
    isComplete: successfulUploads.length === 6
  };
}

// Test the file collection system specifically
async function testFileCollectionSystem() {
  console.log('\n🧪 TESTING FILE COLLECTION SYSTEM');
  console.log('='.repeat(35));
  
  // Check if file collection elements exist
  const fileInputs = document.querySelectorAll('input[type="file"]');
  const fileCollectionArea = document.querySelector('.files-ready-for-upload') || 
                           document.querySelector('[data-testid="file-collection"]');
  const continueButton = document.querySelector('button:contains("Continue")');
  
  console.log(`📄 File inputs found: ${fileInputs.length}`);
  console.log(`📦 File collection area: ${fileCollectionArea ? 'Present' : 'Missing'}`);
  console.log(`▶️ Continue button: ${continueButton ? 'Present' : 'Missing'}`);
  
  // Test adding files to collection
  if (fileInputs.length > 0) {
    console.log('✅ File collection system is ready for testing');
    return true;
  } else {
    console.log('❌ File collection system not found');
    return false;
  }
}

// Run the comprehensive test
console.log('🚀 Bank Statement Upload Test Ready');
console.log('Run: testBankStatementUpload()');
console.log('Or test file collection: testFileCollectionSystem()');

// Auto-run file collection test
testFileCollectionSystem();