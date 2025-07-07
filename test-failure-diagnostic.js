/**
 * FAILURE DIAGNOSTIC TEST - Identify the 7.7% Issue
 * Pinpoint exact test failure from 92.3% success rate
 * Date: July 7, 2025
 */

async function runFailureDiagnostic() {
  console.log('🔍 FAILURE DIAGNOSTIC - Identifying 92.3% Issue');
  console.log('='.repeat(50));
  
  const diagnostics = {
    step6SignNow: { status: 'UNKNOWN', critical: true },
    step1Geolocation: { status: 'UNKNOWN', critical: false },
    apiWebhooks: { status: 'UNKNOWN', critical: true },
    formValidation: { status: 'UNKNOWN', critical: false }
  };
  
  // TEST 1: Step 6 SignNow Integration
  console.log('\n🔐 Testing Step 6 - SignNow Integration');
  try {
    // Navigate to Step 6
    window.history.pushState({}, '', '/apply/step-6');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for SignNow iframe or redirect elements
    const signNowElements = [
      document.querySelector('iframe[src*="signnow"]'),
      document.querySelector('[data-testid="signnow-container"]'),
      document.querySelector('.signnow-embed'),
      document.querySelector('button[data-action="sign"]')
    ].filter(Boolean);
    
    if (signNowElements.length > 0) {
      diagnostics.step6SignNow.status = 'PASS';
      console.log('✅ Step 6: SignNow elements found');
    } else {
      diagnostics.step6SignNow.status = 'FAIL';
      console.log('❌ Step 6: No SignNow elements detected');
    }
    
    // Test SignNow initiation API call
    try {
      const mockApplicationId = 'test-123';
      const response = await fetch(`https://staffportal.replit.app/api/public/applications/${mockApplicationId}/initiate-signing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testCall: true })
      });
      
      console.log(`📡 SignNow API Response: ${response.status}`);
      diagnostics.step6SignNow.apiResponse = response.status;
      
    } catch (apiError) {
      console.log('❌ SignNow API Call Failed:', apiError.message);
      diagnostics.step6SignNow.status = 'FAIL';
    }
    
  } catch (error) {
    console.log('❌ Step 6 Test Error:', error.message);
    diagnostics.step6SignNow.status = 'ERROR';
  }
  
  // TEST 2: Step 1 Geolocation
  console.log('\n🌍 Testing Step 1 - Geolocation Pre-fill');
  try {
    // Test geolocation API
    const geoResponse = await fetch('/api/user-country');
    if (geoResponse.ok) {
      const countryData = await geoResponse.json();
      if (countryData && countryData.country) {
        diagnostics.step1Geolocation.status = 'PASS';
        console.log(`✅ Geolocation: Detected ${countryData.country}`);
      } else {
        diagnostics.step1Geolocation.status = 'FAIL';
        console.log('❌ Geolocation: No country detected');
      }
    } else {
      diagnostics.step1Geolocation.status = 'FAIL';
      console.log(`❌ Geolocation API: ${geoResponse.status}`);
    }
  } catch (geoError) {
    console.log('❌ Geolocation Test Error:', geoError.message);
    diagnostics.step1Geolocation.status = 'FAIL';
  }
  
  // TEST 3: API Webhook Endpoints
  console.log('\n🔗 Testing API Webhook Endpoints');
  try {
    const webhookEndpoints = [
      'https://staffportal.replit.app/api/public/applications',
      'https://staffportal.replit.app/api/public/applications/test/complete',
      'https://staffportal.replit.app/api/upload/test'
    ];
    
    let webhooksPassing = 0;
    for (const endpoint of webhookEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ test: true })
        });
        
        // 200, 400, 401, 501 are all valid (endpoint exists)
        if ([200, 400, 401, 501].includes(response.status)) {
          webhooksPassing++;
          console.log(`✅ ${endpoint}: ${response.status}`);
        } else {
          console.log(`❌ ${endpoint}: ${response.status}`);
        }
      } catch (endpointError) {
        console.log(`❌ ${endpoint}: ${endpointError.message}`);
      }
    }
    
    diagnostics.apiWebhooks.status = webhooksPassing >= 2 ? 'PASS' : 'FAIL';
    
  } catch (webhookError) {
    console.log('❌ Webhook Test Error:', webhookError.message);
    diagnostics.apiWebhooks.status = 'ERROR';
  }
  
  // TEST 4: Form Validation Edge Cases
  console.log('\n📝 Testing Form Validation Edge Cases');
  try {
    // Navigate to Step 1 and test validation
    window.history.pushState({}, '', '/apply/step-1');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check for form validation elements
    const validationElements = [
      document.querySelectorAll('[aria-invalid="true"]'),
      document.querySelectorAll('.error-message'),
      document.querySelectorAll('[data-testid*="error"]')
    ].flat();
    
    // Test required field detection
    const requiredFields = document.querySelectorAll('[required], [aria-required="true"]');
    
    if (requiredFields.length > 0) {
      diagnostics.formValidation.status = 'PASS';
      console.log(`✅ Form Validation: ${requiredFields.length} required fields detected`);
    } else {
      diagnostics.formValidation.status = 'FAIL';
      console.log('❌ Form Validation: No required fields detected');
    }
    
  } catch (validationError) {
    console.log('❌ Form Validation Test Error:', validationError.message);
    diagnostics.formValidation.status = 'ERROR';
  }
  
  // ANALYSIS & REPORTING
  console.log('\n📊 DIAGNOSTIC RESULTS ANALYSIS');
  console.log('='.repeat(50));
  
  const failedTests = Object.entries(diagnostics).filter(([_, test]) => test.status === 'FAIL');
  const criticalFailures = failedTests.filter(([_, test]) => test.critical);
  
  console.log('\n🎯 FAILURE IDENTIFICATION:');
  failedTests.forEach(([testName, test]) => {
    const severity = test.critical ? '🚨 CRITICAL' : '⚠️  NON-CRITICAL';
    console.log(`${severity}: ${testName} - ${test.status}`);
  });
  
  console.log('\n🛡️ DEPLOYMENT RISK ASSESSMENT:');
  if (criticalFailures.length > 0) {
    console.log('❌ DEPLOYMENT BLOCKER DETECTED');
    console.log('Critical failures found:', criticalFailures.map(([name]) => name).join(', '));
    console.log('RECOMMENDATION: Fix critical issues before production deployment');
  } else {
    console.log('✅ NO DEPLOYMENT BLOCKERS');
    console.log('Non-critical issues can be addressed post-deployment');
  }
  
  console.log('\n📋 DETAILED DIAGNOSTIC REPORT:');
  console.log(JSON.stringify(diagnostics, null, 2));
  
  return {
    failedTests: failedTests.length,
    criticalFailures: criticalFailures.length,
    isDeploymentSafe: criticalFailures.length === 0,
    diagnostics
  };
}

// Execute diagnostic
runFailureDiagnostic();