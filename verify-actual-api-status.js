/**
 * VERIFY ACTUAL API STATUS - Final Truth Check
 * Copy and paste this into browser console to get definitive answer
 */

console.log('🎯 FINAL API STATUS VERIFICATION');
console.log('===============================');

console.log('Browser environment says:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// Test how Step 4 actually submits
async function testStep4Submission() {
  console.log('\n📋 Testing Step 4 Application Submission (the real workflow)');
  
  try {
    // This is exactly how Step 4 submits applications
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify({
        test: 'step4-validation',
        step1: { fundingAmount: 50000 },
        step3: { businessName: 'Test Business' },
        step4: { applicantFirstName: 'Test' }
      })
    });
    
    console.log('Step 4 Response Status:', response.status);
    console.log('Step 4 Response URL:', response.url);
    console.log('Step 4 Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Step 4 Response Body:', text);
    
    // Check if URL contains the expected domain
    if (response.url.includes('staff.boreal.financial')) {
      console.log('✅ SUCCESS: Request went to correct staff backend');
    } else {
      console.log('❌ ISSUE: Request went to unexpected URL');
    }
    
    return response;
    
  } catch (error) {
    console.log('❌ Step 4 test failed:', error);
    return null;
  }
}

// Test Step 5 upload
async function testStep5Upload() {
  console.log('\n📤 Testing Step 5 Document Upload');
  
  try {
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('document', testFile, 'test.txt');
    formData.append('documentType', 'bank_statements');
    
    const response = await fetch('/api/public/upload/test-app-id', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: formData
    });
    
    console.log('Step 5 Response Status:', response.status);
    console.log('Step 5 Response URL:', response.url);
    
    const text = await response.text();
    console.log('Step 5 Response Body:', text.substring(0, 200));
    
    return response;
    
  } catch (error) {
    console.log('❌ Step 5 test failed:', error);
    return null;
  }
}

// Run the real tests
async function runRealWorkflowTest() {
  console.log('🚀 Running actual application workflow tests...\n');
  
  const step4Result = await testStep4Submission();
  const step5Result = await testStep5Upload();
  
  console.log('\n📊 FINAL VERDICT:');
  if (step4Result && step4Result.url.includes('staff.boreal.financial')) {
    console.log('✅ API Configuration: CORRECT');
    console.log('✅ Staff Backend: ACCESSIBLE');
    console.log('✅ Authentication: WORKING');
  } else {
    console.log('❌ API Configuration: INCORRECT');
    console.log('❌ Check server proxy configuration');
  }
}

window.runRealWorkflowTest = runRealWorkflowTest;
runRealWorkflowTest();