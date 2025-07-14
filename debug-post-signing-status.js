/**
 * DEBUG POST-SIGNING STATUS
 * Investigate why signed document isn't updating status
 * Date: July 14, 2025
 */

async function debugPostSigningStatus() {
  const applicationId = localStorage.getItem('applicationId') || '34448b6a-7f11-474a-ba07-cd8502a9fec9';
  
  console.log('🔍 DEBUGGING POST-SIGNING STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Test 1: Check current signature status
    console.log('\n📡 1. Checking current signature status...');
    const statusResponse = await fetch(`/api/public/applications/${applicationId}/signature-status`);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('📋 Raw status response:', statusData);
      
      const currentStatus = statusData.status || statusData.signature_status;
      const signedAt = statusData.signed_at;
      const documentId = statusData.document_id;
      
      console.log(`📊 Current Status: "${currentStatus}"`);
      console.log(`📅 Signed At: ${signedAt}`);
      console.log(`📄 Document ID: ${documentId}`);
      
      if (currentStatus === 'invite_signed' || currentStatus === 'signed' || currentStatus === 'completed') {
        console.log('✅ Status indicates document is signed - redirect should work');
      } else {
        console.log('❌ Status does not indicate signing completion');
        console.log('   Expected: "invite_signed", "signed", or "completed"');
        console.log(`   Actual: "${currentStatus}"`);
      }
    } else {
      console.log(`❌ Status check failed: ${statusResponse.status}`);
    }
    
    // Test 2: Check if webhook was received
    console.log('\n🔗 2. Checking webhook processing...');
    console.log('   NOTE: Webhooks go to staff backend, not client');
    console.log('   SignNow should have sent webhook to staff backend after signing');
    
    // Test 3: Try to get signing URL again (should show completed state)
    console.log('\n📝 3. Checking signing URL endpoint...');
    const signingResponse = await fetch(`/api/public/applications/${applicationId}/signing-status`);
    
    if (signingResponse.ok) {
      const signingData = await signingResponse.json();
      console.log('📋 Signing URL response:', signingData);
      
      if (signingData.fallback) {
        console.log('⚠️ Using fallback URL - staff backend may not be processing webhooks');
      }
    }
    
    // Test 4: Force refresh of signature status
    console.log('\n🔄 4. Force refreshing signature status...');
    
    // Make multiple calls to see if status changes
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const refreshResponse = await fetch(`/api/public/applications/${applicationId}/signature-status?refresh=${Date.now()}`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const refreshStatus = refreshData.status || refreshData.signature_status;
        console.log(`📊 Refresh ${i + 1}: Status = "${refreshStatus}"`);
        
        if (refreshStatus === 'invite_signed' || refreshStatus === 'signed' || refreshStatus === 'completed') {
          console.log('✅ Status updated - redirect should now work!');
          break;
        }
      }
    }
    
    // Test 5: Manual override test
    console.log('\n🛠️ 5. Testing manual override option...');
    console.log('   Use this if automatic redirect still fails:');
    console.log('   debugPostSigningStatus.forceRedirect()');
    
    window.debugPostSigningStatus = {
      forceRedirect: () => {
        console.log('🧭 Forcing redirect to Step 7...');
        window.location.hash = '#/apply/step-7';
      },
      checkStatus: () => debugPostSigningStatus()
    };
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
  
  console.log('\n🎯 SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('If status is still not "invite_signed":');
  console.log('1. SignNow webhook may not have reached staff backend');
  console.log('2. Staff backend may not be processing webhooks correctly');
  console.log('3. There may be a delay in status propagation');
  console.log('');
  console.log('Solutions:');
  console.log('• Click "Continue Without Signing" button');
  console.log('• Call debugPostSigningStatus.forceRedirect()');
  console.log('• Contact staff backend team about webhook processing');
}

// Run immediately
debugPostSigningStatus();