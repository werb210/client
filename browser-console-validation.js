// BROWSER CONSOLE VALIDATION SCRIPT
// Copy and paste this into browser console on Step 6

(function() {
  console.log('🧪 CLIENT UPLOAD VALIDATION SCRIPT');
  console.log('='*50);
  
  const APPLICATION_ID = 'e039e596-53da-4031-b1fc-bd3f8d49a035';
  
  // Step 1: Network Tab Validation (Manual Check Required)
  console.log('🧪 STEP 1: NETWORK TAB VALIDATION');
  console.log('✅ Expected: 6 POST /api/public/upload/' + APPLICATION_ID + ' requests');
  console.log('✅ Expected: All responses should be 200 OK');
  console.log('✅ Expected: documentType = "bank_statements" for all uploads');
  console.log('📋 ApplicationId used: ' + APPLICATION_ID);
  
  // Step 2: FormData Context Validation
  console.log('\n🧪 STEP 2: FORMDATA CONTEXT VALIDATION');
  
  let contextValid = false;
  let localStorageValid = false;
  let filesFound = 0;
  
  // Check if debugApplication exists
  if (typeof window.debugApplication === 'function') {
    try {
      const state = window.debugApplication();
      
      if (state.step5DocumentUpload) {
        const uploadedFiles = state.step5DocumentUpload.uploadedFiles || [];
        const files = state.step5DocumentUpload.files || [];
        
        console.log('✅ FormDataContext check:');
        console.log('   - state.step5DocumentUpload exists:', !!state.step5DocumentUpload);
        console.log('   - uploadedFiles array length:', uploadedFiles.length);
        console.log('   - files array length:', files.length);
        
        if (uploadedFiles.length > 0) {
          contextValid = true;
          filesFound = uploadedFiles.length;
          
          console.log('✅ PASS: state.step5DocumentUpload.uploadedFiles has', uploadedFiles.length, 'files');
          
          // Show file details
          uploadedFiles.slice(0, 3).forEach((file, i) => {
            console.log(`   File ${i+1}: ${file.name} (type: ${file.documentType}, status: ${file.status})`);
          });
        } else {
          console.log('❌ FAIL: state.step5DocumentUpload.uploadedFiles is empty');
        }
      } else {
        console.log('❌ FAIL: state.step5DocumentUpload does not exist');
      }
    } catch (e) {
      console.log('❌ Error accessing FormDataContext:', e.message);
    }
  } else {
    console.log('❌ window.debugApplication not available');
  }
  
  // Check localStorage fallback
  const localData = localStorage.getItem('formData') || localStorage.getItem('financialFormData');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      const localUploadedFiles = parsed.step5DocumentUpload?.uploadedFiles || [];
      
      console.log('✅ localStorage fallback check:');
      console.log('   - localStorage.step5DocumentUpload.uploadedFiles length:', localUploadedFiles.length);
      
      if (localUploadedFiles.length > 0) {
        localStorageValid = true;
        console.log('✅ PASS: localStorage has', localUploadedFiles.length, 'uploaded files');
        
        // Show first few files
        localUploadedFiles.slice(0, 3).forEach((file, i) => {
          console.log(`   File ${i+1}: ${file.name} (type: ${file.documentType}, status: ${file.status})`);
        });
      } else {
        console.log('❌ FAIL: localStorage uploadedFiles is empty');
      }
    } catch (e) {
      console.log('❌ Error parsing localStorage:', e.message);
    }
  } else {
    console.log('❌ No localStorage formData found');
  }
  
  // Step 3: Visual Validation Instructions
  console.log('\n🧪 STEP 3: VISUAL VALIDATION (MANUAL CHECK)');
  console.log('✅ Question: Were uploaded files visually listed in Step 5 UI?');
  console.log('✅ Expected: File cards showing uploaded documents with green checkmarks');
  console.log('✅ Expected: Document completion status showing "6/6 COMPLETE"');
  console.log('❌ If files not visible: Upload UI dispatch or rendering is broken');
  
  // Summary
  console.log('\n📊 VALIDATION SUMMARY:');
  console.log('='*50);
  console.log('Context Storage Valid:', contextValid);
  console.log('localStorage Valid:', localStorageValid);
  console.log('Files Found:', filesFound);
  console.log('Overall Status:', (contextValid || localStorageValid) ? 'PASS' : 'FAIL');
  
  if (contextValid || localStorageValid) {
    console.log('✅ CLIENT UPLOAD TRACKING: WORKING');
    console.log('✅ Files properly stored in FormDataContext');
    console.log('✅ Step 6 should find upload evidence');
  } else {
    console.log('❌ CLIENT UPLOAD TRACKING: BROKEN');
    console.log('❌ Files not stored in context or localStorage');
    console.log('❌ Step 6 will redirect back to Step 5');
  }
  
  return {
    contextValid,
    localStorageValid,
    filesFound,
    overallValid: contextValid || localStorageValid
  };
})();