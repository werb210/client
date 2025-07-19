// 🧪 COMPREHENSIVE END-TO-END TEST SCRIPT
window.testE2EWorkflow = async function() {
  console.log('🧪 Starting E2E Workflow Test...');
  
  // Step 1: Check if we're on the start page
  if (!window.location.pathname.includes('/apply')) {
    console.log('❌ Not on application page. Navigate to /apply/step-1 first');
    return;
  }
  
  // Step 2: Check for existing application ID in localStorage
  const existingAppId = localStorage.getItem('applicationId');
  if (existingAppId) {
    console.log('✅ Found existing application ID:', existingAppId);
    
    // Test document upload with existing ID
    console.log('🧪 Testing document upload...');
    const testFile = new File(['Test document content'], 'test-bank-statement.pdf', {
      type: 'application/pdf'
    });
    
    const formData = new FormData();
    formData.append('document', testFile);
    formData.append('documentType', 'bank_statements');
    
    try {
      const uploadResponse = await fetch(`/api/public/applications/${existingAppId}/documents`, {
        method: 'POST',
        body: formData
      });
      
      const uploadResult = await uploadResponse.json();
      console.log('📤 Upload result:', uploadResult);
      
      if (uploadResponse.ok) {
        console.log('✅ Document upload successful');
        
        // Test finalization
        console.log('🏁 Testing finalization...');
        const finalizePayload = {
          status: 'submitted',
          signature: {
            signedName: 'Test User',
            timestamp: new Date().toISOString(),
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            agreements: {
              applicationAuthorization: true,
              informationAccuracy: true,
              electronicSignature: true,
              creditAuthorization: true,
              dataSharing: true
            }
          }
        };
        
        const finalizeResponse = await fetch(`/api/public/applications/${existingAppId}/finalize`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalizePayload)
        });
        
        const finalizeResult = await finalizeResponse.json();
        console.log('🏁 Finalize result:', finalizeResult);
        
        if (finalizeResponse.ok) {
          console.log('✅ APPLICATION FINALIZATION SUCCESSFUL!');
          console.log('🎉 Full E2E test passed');
          return { success: true, applicationId: existingAppId };
        } else {
          console.log('❌ Finalization failed:', finalizeResult);
        }
      } else {
        console.log('❌ Document upload failed:', uploadResult);
      }
    } catch (error) {
      console.error('❌ E2E test error:', error);
    }
  } else {
    console.log('❌ No application ID found. Complete Steps 1-4 first to generate an application.');
    console.log('💡 Navigate through /apply/step-1 → step-2 → step-3 → step-4');
  }
};

console.log('🧪 E2E Test script loaded. Run testE2EWorkflow() in console after creating an application.');
