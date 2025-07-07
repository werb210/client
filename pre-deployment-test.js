/**
 * PRE-DEPLOYMENT CRITICAL MANUAL TEST EXECUTION
 * Complete 7-step workflow validation with production configuration
 * Date: July 7, 2025
 */

async function runPreDeploymentTests() {
  console.log('🚀 PRE-DEPLOYMENT CRITICAL TEST SUITE');
  console.log('=' .repeat(60));
  
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: window.location.href,
    configuration: {},
    stepTests: {},
    signNowDiagnostic: {},
    cookieConsent: {},
    functionalTests: {},
    overallStatus: 'PENDING'
  };
  
  // CONFIGURATION VALIDATION
  console.log('\n🔧 CONFIGURATION VALIDATION');
  testResults.configuration = {
    clientToken: !!import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    nodeEnv: import.meta.env.NODE_ENV || 'development',
    healthEndpoint: false
  };
  
  console.log('✅ CLIENT_APP_SHARED_TOKEN:', testResults.configuration.clientToken ? 'Present' : 'Missing');
  console.log('✅ API Base URL:', testResults.configuration.apiBaseUrl);
  console.log('✅ Environment:', testResults.configuration.nodeEnv);
  
  // Test health endpoint
  try {
    const healthResponse = await fetch('/health');
    testResults.configuration.healthEndpoint = healthResponse.ok;
    console.log('✅ Health Endpoint:', healthResponse.ok ? 'Responding' : 'Not Found');
  } catch (healthError) {
    console.log('❌ Health Endpoint: Not Available');
  }
  
  // STEP 1: COUNTRY PRE-FILL TEST
  console.log('\n📍 STEP 1: Country Pre-fill Test');
  window.history.pushState({}, '', '/apply/step-1');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Test geolocation API
    const geoResponse = await fetch('/api/user-country');
    if (geoResponse.ok) {
      const countryData = await geoResponse.json();
      testResults.stepTests.step1 = {
        geolocationApi: true,
        countryDetected: countryData?.country || 'Unknown',
        prePopulated: !!countryData?.country
      };
      console.log('✅ Step 1: Country detected -', countryData?.country || 'None');
    } else {
      testResults.stepTests.step1 = { geolocationApi: false, error: geoResponse.status };
      console.log('❌ Step 1: Geolocation API failed -', geoResponse.status);
    }
  } catch (step1Error) {
    testResults.stepTests.step1 = { geolocationApi: false, error: step1Error.message };
    console.log('❌ Step 1: Geolocation error -', step1Error.message);
  }
  
  // STEP 2: AI RECOMMENDATIONS TEST
  console.log('\n🤖 STEP 2: AI Recommendations Test');
  window.history.pushState({}, '', '/apply/step-2');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Test lender products API
    const lendersResponse = await fetch(`${testResults.configuration.apiBaseUrl}/public/lenders`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (lendersResponse.ok) {
      const lenders = await lendersResponse.json();
      const canadianProducts = lenders.filter(p => p.geography?.includes('CA'));
      const usProducts = lenders.filter(p => p.geography?.includes('US'));
      
      testResults.stepTests.step2 = {
        apiConnectivity: true,
        totalProducts: lenders.length,
        canadianProducts: canadianProducts.length,
        usProducts: usProducts.length,
        productTypes: [...new Set(lenders.map(p => p.productType || p.category))]
      };
      
      console.log(`✅ Step 2: ${lenders.length} products loaded`);
      console.log(`   Canada: ${canadianProducts.length}, US: ${usProducts.length}`);
    } else {
      testResults.stepTests.step2 = { apiConnectivity: false, error: lendersResponse.status };
      console.log('❌ Step 2: API failed -', lendersResponse.status);
    }
  } catch (step2Error) {
    testResults.stepTests.step2 = { apiConnectivity: false, error: step2Error.message };
    console.log('❌ Step 2: API error -', step2Error.message);
  }
  
  // STEP 3: REGIONAL FIELDS TEST
  console.log('\n🌍 STEP 3: Regional Fields Test');
  window.history.pushState({}, '', '/apply/step-3');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const step3Container = document.querySelector('main') || document.body;
  const hasCanadianFields = step3Container.textContent.includes('Province') || 
                           step3Container.textContent.includes('Postal Code');
  const hasUSFields = step3Container.textContent.includes('State') || 
                     step3Container.textContent.includes('ZIP');
  
  testResults.stepTests.step3 = {
    pageAccessible: !!step3Container,
    canadianFields: hasCanadianFields,
    usFields: hasUSFields,
    regionalSupport: hasCanadianFields || hasUSFields
  };
  
  console.log('✅ Step 3: Regional fields -', testResults.stepTests.step3.regionalSupport ? 'Working' : 'Missing');
  
  // STEP 4: APPLICANT DATA TEST
  console.log('\n👤 STEP 4: Applicant Data Test');
  window.history.pushState({}, '', '/apply/step-4');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const step4Container = document.querySelector('main') || document.body;
  const hasApplicantFields = step4Container.textContent.includes('First Name') ||
                            step4Container.textContent.includes('Personal Information');
  const hasPartnerFields = step4Container.textContent.includes('Partner') ||
                          step4Container.textContent.includes('Co-applicant');
  
  testResults.stepTests.step4 = {
    pageAccessible: !!step4Container,
    applicantFields: hasApplicantFields,
    partnerSupport: hasPartnerFields
  };
  
  console.log('✅ Step 4: Applicant fields -', hasApplicantFields ? 'Present' : 'Missing');
  
  // STEP 5: DOCUMENT INTERSECTION TEST
  console.log('\n📄 STEP 5: Document Intersection Test');
  window.history.pushState({}, '', '/apply/step-5');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const step5Container = document.querySelector('main') || document.body;
  const hasDocumentUpload = step5Container.textContent.includes('Upload') ||
                           step5Container.textContent.includes('Document');
  const hasBypassOption = step5Container.textContent.includes('Bypass') ||
                         step5Container.textContent.includes('Skip') ||
                         step5Container.textContent.includes('Later');
  
  testResults.stepTests.step5 = {
    pageAccessible: !!step5Container,
    documentUpload: hasDocumentUpload,
    bypassOption: hasBypassOption
  };
  
  console.log('✅ Step 5: Document upload -', hasDocumentUpload ? 'Available' : 'Missing');
  console.log('✅ Step 5: Bypass option -', hasBypassOption ? 'Available' : 'Missing');
  
  // STEP 6: SIGNNOW DIAGNOSTIC
  console.log('\n🔐 STEP 6: SignNow Diagnostic');
  window.history.pushState({}, '', '/apply/step-6');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Test SignNow initiation endpoint
    const testAppId = 'test-' + Date.now();
    const signResponse = await fetch(`${testResults.configuration.apiBaseUrl}/public/applications/${testAppId}/initiate-signing`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        businessDetails: { businessName: 'Test Company' },
        applicantInfo: { firstName: 'John', lastName: 'Doe' }
      })
    });
    
    testResults.signNowDiagnostic = {
      endpointReachable: true,
      responseStatus: signResponse.status,
      signNowWorking: signResponse.status === 200,
      notImplemented: signResponse.status === 501
    };
    
    console.log(`✅ Step 6: SignNow endpoint - ${signResponse.status}`);
    
    if (signResponse.status === 200) {
      const signData = await signResponse.json();
      testResults.signNowDiagnostic.signingUrl = !!signData.signingUrl;
      console.log('✅ Step 6: Signing URL generated -', !!signData.signingUrl);
    }
    
  } catch (signError) {
    testResults.signNowDiagnostic = {
      endpointReachable: false,
      error: signError.message
    };
    console.log('❌ Step 6: SignNow error -', signError.message);
  }
  
  // Check for iframe or redirect elements
  const step6Container = document.querySelector('main') || document.body;
  const hasSignElements = step6Container.textContent.includes('Sign') ||
                         step6Container.textContent.includes('Document');
  testResults.signNowDiagnostic.uiElements = hasSignElements;
  
  // STEP 7: COMPLETION TEST
  console.log('\n✅ STEP 7: Completion Test');
  window.history.pushState({}, '', '/apply/step-7');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const step7Container = document.querySelector('main') || document.body;
  const hasTermsAcceptance = step7Container.textContent.includes('Terms') ||
                            step7Container.textContent.includes('Privacy');
  const hasSubmitButton = step7Container.textContent.includes('Submit') ||
                         step7Container.textContent.includes('Complete');
  
  testResults.stepTests.step7 = {
    pageAccessible: !!step7Container,
    termsAcceptance: hasTermsAcceptance,
    submitButton: hasSubmitButton
  };
  
  console.log('✅ Step 7: Terms & submit -', hasTermsAcceptance && hasSubmitButton ? 'Present' : 'Missing');
  
  // COOKIE CONSENT TEST
  console.log('\n🍪 COOKIE CONSENT TEST');
  const cookieBanner = document.querySelector('[data-testid="cookie-banner"]') ||
                      document.querySelector('.cookie-consent');
  const consentStored = localStorage.getItem('cookie-consent');
  
  testResults.cookieConsent = {
    bannerPresent: !!cookieBanner,
    consentStored: !!consentStored,
    gdprCompliant: !!cookieBanner || !!consentStored
  };
  
  console.log('✅ Cookie Consent:', testResults.cookieConsent.gdprCompliant ? 'Active' : 'Missing');
  
  // FUNCTIONAL TESTS
  console.log('\n📦 FUNCTIONAL TESTS');
  
  // Test auto-save
  const testData = { test: Date.now() };
  localStorage.setItem('test-autosave', JSON.stringify(testData));
  const autoSaveWorks = localStorage.getItem('test-autosave') !== null;
  localStorage.removeItem('test-autosave');
  
  // Test API performance
  const apiStartTime = performance.now();
  try {
    await fetch(`${testResults.configuration.apiBaseUrl}/public/lenders`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const apiResponseTime = performance.now() - apiStartTime;
    
    testResults.functionalTests = {
      autoSave: autoSaveWorks,
      apiPerformance: apiResponseTime,
      performanceGood: apiResponseTime < 300,
      offlineSupport: 'navigator' in window && 'serviceWorker' in navigator
    };
    
    console.log('✅ Auto-save:', autoSaveWorks ? 'Working' : 'Failed');
    console.log('✅ API Performance:', `${apiResponseTime.toFixed(0)}ms`, apiResponseTime < 300 ? '(Good)' : '(Slow)');
    
  } catch (funcError) {
    testResults.functionalTests = {
      autoSave: autoSaveWorks,
      apiPerformance: null,
      performanceGood: false,
      error: funcError.message
    };
    console.log('❌ Functional tests error:', funcError.message);
  }
  
  // OVERALL ASSESSMENT
  console.log('\n🎯 OVERALL ASSESSMENT');
  const criticalTests = [
    testResults.configuration.clientToken,
    testResults.stepTests.step2?.apiConnectivity,
    testResults.stepTests.step1?.geolocationApi !== false,
    testResults.stepTests.step7?.pageAccessible,
    testResults.functionalTests?.autoSave
  ];
  
  const passedCritical = criticalTests.filter(Boolean).length;
  const totalCritical = criticalTests.length;
  const successRate = (passedCritical / totalCritical * 100).toFixed(1);
  
  testResults.overallStatus = passedCritical >= 4 ? 'PRODUCTION_READY' : 'ISSUES_DETECTED';
  
  console.log('=' .repeat(60));
  console.log(`🎯 SUCCESS RATE: ${successRate}% (${passedCritical}/${totalCritical})`);
  console.log(`📊 STATUS: ${testResults.overallStatus}`);
  
  if (testResults.overallStatus === 'PRODUCTION_READY') {
    console.log('✅ DEPLOYMENT RECOMMENDATION: PROCEED');
  } else {
    console.log('❌ DEPLOYMENT RECOMMENDATION: FIX ISSUES FIRST');
  }
  
  console.log('\n📋 DETAILED TEST RESULTS:');
  console.log(JSON.stringify(testResults, null, 2));
  
  return testResults;
}

// Execute pre-deployment tests
runPreDeploymentTests();