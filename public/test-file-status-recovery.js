// File Status Recovery Debug Script
// Run this in browser console to debug and recover file status issues

console.log('🧪 Loading File Status Recovery Debug Tools');

// Function to check and recover file status
window.debugFileStatus = function() {
  console.log('\n=== FILE STATUS RECOVERY DEBUG ===');
  
  // Try to access application state
  let appState = null;
  try {
    appState = window.debugApplication?.();
    if (appState) {
      console.log('📊 Application state found');
    } else {
      console.log('⚠️  No application state debug function found');
    }
  } catch (error) {
    console.log('❌ Could not access application state:', error.message);
  }
  
  // Check localStorage for uploaded files
  const uploadedFiles = localStorage.getItem('uploadedFiles');
  if (uploadedFiles) {
    try {
      const files = JSON.parse(uploadedFiles);
      console.log(`📁 Found ${files.length} files in localStorage`);
      
      const errorFiles = files.filter(f => f.status === 'error');
      const completedFiles = files.filter(f => f.status === 'completed');
      const uploadingFiles = files.filter(f => f.status === 'uploading');
      
      console.log(`   - ✅ Completed: ${completedFiles.length}`);
      console.log(`   - ❌ Error: ${errorFiles.length}`);
      console.log(`   - ⏳ Uploading: ${uploadingFiles.length}`);
      
      if (errorFiles.length > 0) {
        console.log('\n🔍 ERROR FILES ANALYSIS:');
        errorFiles.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.name}`);
          console.log(`      - Status: ${file.status}`);
          console.log(`      - Document Type: ${file.documentType || 'undefined'}`);
          console.log(`      - Upload Time: ${file.uploadedAt || 'undefined'}`);
          console.log(`      - File ID: ${file.id || 'undefined'}`);
        });
      }
      
      return {
        total: files.length,
        completed: completedFiles.length,
        errors: errorFiles.length,
        uploading: uploadingFiles.length,
        errorFiles: errorFiles
      };
    } catch (error) {
      console.log('❌ Could not parse localStorage files:', error.message);
    }
  } else {
    console.log('📁 No uploaded files found in localStorage');
  }
  
  // Check for DOM elements showing error status
  const errorElements = document.querySelectorAll('[class*="text-red"], [class*="text-destructive"]');
  console.log(`🔍 Found ${errorElements.length} elements with error styling`);
  
  // Check for specific error icons
  const errorIcons = document.querySelectorAll('svg[class*="text-red-500"]');
  console.log(`❌ Found ${errorIcons.length} red error icons`);
  
  errorIcons.forEach((icon, index) => {
    const parentText = icon.closest('.flex, .card, .border')?.textContent?.slice(0, 100) || 'Unknown';
    console.log(`   ${index + 1}. Error icon in: ${parentText}...`);
  });
  
  return {
    errorElements: errorElements.length,
    errorIcons: errorIcons.length
  };
};

// Function to attempt status recovery
window.recoverFileStatus = function(fileName) {
  console.log(`\n🔧 Attempting to recover status for file: ${fileName}`);
  
  const uploadedFiles = localStorage.getItem('uploadedFiles');
  if (!uploadedFiles) {
    console.log('❌ No uploaded files found in localStorage');
    return false;
  }
  
  try {
    const files = JSON.parse(uploadedFiles);
    const targetFile = files.find(f => f.name === fileName);
    
    if (!targetFile) {
      console.log(`❌ File ${fileName} not found in localStorage`);
      return false;
    }
    
    if (targetFile.status === 'error') {
      console.log(`🔧 File ${fileName} has error status, attempting recovery...`);
      
      // Check if file has upload indicators
      if (targetFile.uploadedAt || targetFile.id) {
        console.log(`💡 File ${fileName} has upload data - marking as completed`);
        targetFile.status = 'completed';
        targetFile.recoveredAt = new Date().toISOString();
        
        // Save back to localStorage
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
        
        // Try to trigger a React state update
        if (window.location.pathname.includes('step-5')) {
          console.log('🔄 Triggering page refresh to update UI...');
          // Force a small delay then refresh
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        
        return true;
      } else {
        console.log(`❌ File ${fileName} lacks upload data - cannot recover`);
        return false;
      }
    } else {
      console.log(`✅ File ${fileName} status is already: ${targetFile.status}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Error during recovery:', error.message);
    return false;
  }
};

// Function to recover all error files
window.recoverAllErrorFiles = function() {
  console.log('\n🔧 Attempting to recover all error files...');
  
  const uploadedFiles = localStorage.getItem('uploadedFiles');
  if (!uploadedFiles) {
    console.log('❌ No uploaded files found in localStorage');
    return { recovered: 0, total: 0 };
  }
  
  try {
    const files = JSON.parse(uploadedFiles);
    const errorFiles = files.filter(f => f.status === 'error');
    
    console.log(`🔍 Found ${errorFiles.length} files with error status`);
    
    let recoveredCount = 0;
    
    errorFiles.forEach(file => {
      if (file.uploadedAt || file.id) {
        console.log(`💡 Recovering ${file.name}...`);
        file.status = 'completed';
        file.recoveredAt = new Date().toISOString();
        recoveredCount++;
      }
    });
    
    if (recoveredCount > 0) {
      // Save back to localStorage
      localStorage.setItem('uploadedFiles', JSON.stringify(files));
      console.log(`✅ Recovered ${recoveredCount} files`);
      
      // Trigger UI update
      if (window.location.pathname.includes('step-5')) {
        console.log('🔄 Refreshing page to update UI...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } else {
      console.log('❌ No files could be recovered');
    }
    
    return { recovered: recoveredCount, total: errorFiles.length };
  } catch (error) {
    console.log('❌ Error during bulk recovery:', error.message);
    return { recovered: 0, total: 0 };
  }
};

// Function to test file upload status
window.testFileUpload = async function(applicationId) {
  if (!applicationId) {
    applicationId = localStorage.getItem('applicationId') || prompt('Enter application ID:');
  }
  
  console.log('\n🧪 Testing file upload status...');
  
  // Create test file
  const testFile = new File(['Test content'], 'test-status-recovery.pdf', {
    type: 'application/pdf'
  });
  
  const formData = new FormData();
  formData.append('document', testFile);
  formData.append('documentType', 'personal_financial_statement');
  
  try {
    const response = await fetch(`/api/public/applications/${applicationId}/documents`, {
      method: 'POST',
      body: formData
    });
    
    console.log('📤 Upload response:', response.status, response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Upload successful:', data);
      
      // Check for success indicators
      if (data.success === true || data.documentId) {
        console.log('💡 Upload has success indicators - should be marked as completed');
      } else {
        console.log('⚠️  Upload response lacks clear success indicators');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Upload failed:', errorText);
    }
    
    return response;
  } catch (error) {
    console.log('❌ Upload error:', error.message);
    throw error;
  }
};

console.log('🚀 File Status Recovery tools loaded:');
console.log('- debugFileStatus() - Check file status issues');
console.log('- recoverFileStatus(fileName) - Recover specific file');
console.log('- recoverAllErrorFiles() - Recover all error files');
console.log('- testFileUpload(applicationId) - Test upload status');