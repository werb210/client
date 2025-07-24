// DEBUG SCRIPT TO RUN IN BROWSER CONSOLE ON STEP 6
// Copy and paste this entire script into browser console when on Step 6

(function() {
  console.log('🧪 MANUAL STEP 6 DEBUG SCRIPT EXECUTED');
  
  // Try to access the global state
  let applicationState = null;
  
  // Check if debugApplication function exists
  if (typeof window.debugApplication === 'function') {
    try {
      applicationState = window.debugApplication();
      console.log('🧠 State from debugApplication():', applicationState);
    } catch (e) {
      console.log('❌ Error calling debugApplication:', e.message);
    }
  }
  
  // Check localStorage directly
  const formDataKeys = ['formData', 'financialFormData'];
  for (const key of formDataKeys) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`💾 localStorage["${key}"]:`);
        console.log('  - step5DocumentUpload exists:', !!parsed.step5DocumentUpload);
        
        if (parsed.step5DocumentUpload) {
          console.log('  - step5DocumentUpload keys:', Object.keys(parsed.step5DocumentUpload));
          console.log('  - files array length:', (parsed.step5DocumentUpload.files || []).length);
          console.log('  - uploadedFiles array length:', (parsed.step5DocumentUpload.uploadedFiles || []).length);
          
          // Show first few files for verification
          const allFiles = [
            ...(parsed.step5DocumentUpload.files || []),
            ...(parsed.step5DocumentUpload.uploadedFiles || [])
          ];
          
          if (allFiles.length > 0) {
            console.log('  - Sample files:', allFiles.slice(0, 3).map(f => ({
              name: f.name,
              status: f.status,
              documentType: f.documentType
            })));
          }
        }
      } catch (e) {
        console.log(`❌ Error parsing ${key}:`, e.message);
      }
    }
  }
  
  // Manual simulation of checkLocalUploadEvidence function
  const manualCheck = () => {
    let totalFiles = 0;
    let evidence = [];
    
    // Check applicationState if available
    if (applicationState && applicationState.step5DocumentUpload) {
      const contextFiles = applicationState.step5DocumentUpload.files || [];
      const contextUploadedFiles = applicationState.step5DocumentUpload.uploadedFiles || [];
      
      if (contextFiles.length > 0) {
        totalFiles += contextFiles.length;
        evidence.push(`Context files: ${contextFiles.length}`);
      }
      
      if (contextUploadedFiles.length > 0) {
        totalFiles += contextUploadedFiles.length;
        evidence.push(`Context uploadedFiles: ${contextUploadedFiles.length}`);
      }
    }
    
    // Check localStorage
    const localData = localStorage.getItem('formData') || localStorage.getItem('financialFormData');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        const localFiles = parsed.step5DocumentUpload?.files || [];
        const localUploadedFiles = parsed.step5DocumentUpload?.uploadedFiles || [];
        
        if (localFiles.length > 0) {
          totalFiles = Math.max(totalFiles, localFiles.length);
          evidence.push(`localStorage files: ${localFiles.length}`);
        }
        
        if (localUploadedFiles.length > 0) {
          totalFiles = Math.max(totalFiles, localUploadedFiles.length);
          evidence.push(`localStorage uploadedFiles: ${localUploadedFiles.length}`);
        }
      } catch (e) {
        console.log('❌ Error parsing localStorage in manual check:', e.message);
      }
    }
    
    console.log('🎯 MANUAL CHECK RESULT:');
    console.log('  - Total files found:', totalFiles);
    console.log('  - Evidence sources:', evidence);
    console.log('  - Should allow finalization:', totalFiles > 0 ? 'YES' : 'NO');
    
    return totalFiles > 0;
  };
  
  const result = manualCheck();
  
  console.log('✅ MANUAL DEBUG COMPLETE');
  console.log('🎯 RECOMMENDATION:', result ? 'Files found - finalization should work' : 'No files found - will be blocked');
  
  return {
    hasFiles: result,
    debugComplete: true
  };
})();