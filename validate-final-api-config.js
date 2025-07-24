/**
 * FINAL API CONFIG VALIDATION
 * This will confirm once and for all what the app is actually using
 */

console.log('🎯 FINAL API CONFIGURATION VALIDATION');
console.log('====================================');

console.log('Browser environment:');
console.log('- VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('- DEV mode:', import.meta.env.DEV);
console.log('- TOKEN available:', !!import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN);

// Test the exact API call that Step 4 uses for application submission
async function validateStep4Workflow() {
  console.log('\n📋 VALIDATING STEP 4 APPLICATION SUBMISSION');
  
  const testPayload = {
    step1: {
      businessLocation: "CA",
      fundingAmount: 50000,
      fundsPurpose: "working_capital"
    },
    step3: {
      operatingName: "Final Test Company",
      businessStructure: "corporation",
      businessState: "AB"
    },
    step4: {
      applicantFirstName: "Final",
      applicantLastName: "Test",
      applicantEmail: "final.test@example.com",
      applicantPhone: "+15555551234"
    }
  };
  
  try {
    console.log('📤 Making POST to /api/public/applications...');
    
    const startTime = performance.now();
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(testPayload)
    });
    const endTime = performance.now();
    
    console.log('📊 Response details:');
    console.log('- Status:', response.status, response.statusText);
    console.log('- URL:', response.url);
    console.log('- Time:', Math.round(endTime - startTime), 'ms');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS - Application created!');
      console.log('- Application ID:', data.applicationId);
      console.log('- Status:', data.status);
      console.log('- Message:', data.message);
      
      // Critical check: Verify this is a real UUID (not a fallback ID)
      if (data.applicationId && data.applicationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        console.log('✅ VERIFIED: Proper UUID format');
      } else {
        console.log('❌ WARNING: Unexpected ID format');
      }
      
      return { success: true, applicationId: data.applicationId };
      
    } else {
      const errorText = await response.text();
      console.log('❌ FAILED - Response:', errorText);
      return { success: false, error: errorText };
    }
    
  } catch (error) {
    console.log('❌ EXCEPTION:', error.message);
    return { success: false, error: error.message };
  }
}

// Validate lender products fetch
async function validateLenderProducts() {
  console.log('\n📊 VALIDATING LENDER PRODUCTS FETCH');
  
  try {
    const response = await fetch('/api/public/lenders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });
    
    console.log('- Status:', response.status);
    console.log('- URL:', response.url);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS - Products loaded:', data.products?.length || 0);
      return { success: true, count: data.products?.length || 0 };
    } else {
      console.log('❌ FAILED - Status:', response.status);
      return { success: false };
    }
    
  } catch (error) {
    console.log('❌ EXCEPTION:', error.message);
    return { success: false };
  }
}

// Run complete validation
async function runFinalValidation() {
  console.log('🚀 Running final API configuration validation...\n');
  
  const step4Result = await validateStep4Workflow();
  const lendersResult = await validateLenderProducts();
  
  console.log('\n🏁 FINAL VALIDATION RESULTS:');
  console.log('==========================================');
  
  if (step4Result.success && lendersResult.success) {
    console.log('✅ VERDICT: API CONFIGURATION IS WORKING CORRECTLY');
    console.log('✅ Application submission: OPERATIONAL');
    console.log('✅ Lender products: OPERATIONAL');
    console.log('✅ Staff backend integration: CONFIRMED');
    console.log('✅ Authentication: WORKING');
    
    if (step4Result.applicationId) {
      console.log('✅ Real application created:', step4Result.applicationId);
    }
    
  } else {
    console.log('❌ VERDICT: API CONFIGURATION HAS ISSUES');
    console.log('❌ Application submission:', step4Result.success ? 'OK' : 'FAILED');
    console.log('❌ Lender products:', lendersResult.success ? 'OK' : 'FAILED');
    console.log('❌ Issue requires investigation');
  }
  
  return {
    step4: step4Result.success,
    lenders: lendersResult.success,
    overall: step4Result.success && lendersResult.success
  };
}

// Make globally available and auto-run
window.runFinalValidation = runFinalValidation;
runFinalValidation();