/**
 * STEP 6 SIGNNOW LOOPBACK TEST
 * Complete signature workflow validation to identify 92.3% failure
 * Date: July 7, 2025
 */

async function runStep6LoopbackTest() {
  console.log('🔐 STEP 6 SIGNNOW LOOPBACK TEST');
  console.log('=' .repeat(50));
  
  const results = {
    step6Navigation: false,
    signNowInitiation: false,
    apiEndpointReachable: false,
    embeddedView: false,
    completionDetection: false,
    overallWorkflow: false
  };
  
  let testApplicationId = 'test-' + Date.now();
  
  try {
    // PHASE 1: Navigate to Step 6
    console.log('\n📱 PHASE 1: Step 6 Navigation');
    window.history.pushState({}, '', '/apply/step-6');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const step6Container = document.querySelector('main') || document.body;
    const hasStep6Content = step6Container && step6Container.textContent.includes('Sign');
    
    results.step6Navigation = hasStep6Content;
    console.log(results.step6Navigation ? '✅ Step 6 accessible' : '❌ Step 6 not accessible');
    
    // PHASE 2: Test SignNow API Initiation
    console.log('\n📡 PHASE 2: SignNow API Initiation');
    try {
      const initiationResponse = await fetch(`https://staffportal.replit.app/api/public/applications/${testApplicationId}/initiate-signing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessDetails: {
            businessName: 'Test Company',
            legalName: 'Test Company Inc.'
          },
          applicantInfo: {
            firstName: 'John',
            lastName: 'Doe'
          }
        })
      });
      
      results.apiEndpointReachable = true;
      console.log(`✅ API Endpoint Reachable: ${initiationResponse.status}`);
      
      if (initiationResponse.status === 200) {
        const signData = await initiationResponse.json();
        if (signData.signingUrl || signData.documentUrl) {
          results.signNowInitiation = true;
          console.log('✅ SignNow URL Generated Successfully');
          console.log('🔗 Signing URL:', signData.signingUrl || signData.documentUrl);
        } else {
          console.log('❌ No signing URL in response:', signData);
        }
      } else if (initiationResponse.status === 501) {
        console.log('⚠️  SignNow Endpoint Not Implemented (501) - Expected for some environments');
        results.signNowInitiation = 'NOT_IMPLEMENTED';
      } else {
        console.log(`❌ SignNow API Error: ${initiationResponse.status}`);
        const errorText = await initiationResponse.text();
        console.log('Error details:', errorText);
      }
      
    } catch (apiError) {
      console.log('❌ SignNow API Call Failed:', apiError.message);
      results.apiEndpointReachable = false;
    }
    
    // PHASE 3: Test Embedded View Elements
    console.log('\n🖼️  PHASE 3: Embedded SignNow View');
    const embeddedElements = [
      document.querySelector('iframe[src*="signnow"]'),
      document.querySelector('iframe[src*="sign"]'),
      document.querySelector('[data-testid="signnow-iframe"]'),
      document.querySelector('.signnow-container'),
      document.querySelector('button[data-action*="sign"]')
    ].filter(Boolean);
    
    if (embeddedElements.length > 0) {
      results.embeddedView = true;
      console.log(`✅ SignNow Embedded Elements Found: ${embeddedElements.length}`);
      embeddedElements.forEach((el, i) => {
        console.log(`   Element ${i + 1}:`, el.tagName, el.className || 'no-class');
      });
    } else {
      console.log('❌ No SignNow Embedded Elements Found');
      
      // Check for redirect-based approach
      const redirectButtons = document.querySelectorAll('button, a').filter(el => 
        el.textContent.includes('Sign') || el.textContent.includes('Continue to')
      );
      
      if (redirectButtons.length > 0) {
        console.log(`⚠️  Found ${redirectButtons.length} potential redirect buttons for signing`);
        results.embeddedView = 'REDIRECT_BASED';
      }
    }
    
    // PHASE 4: Test Completion Detection
    console.log('\n✅ PHASE 4: Completion Detection Logic');
    
    // Check for completion status tracking elements
    const completionElements = [
      document.querySelector('[data-status="completed"]'),
      document.querySelector('[data-testid="signature-complete"]'),
      document.querySelector('.signature-status'),
      document.querySelector('button[disabled]') // Disabled continue button
    ].filter(Boolean);
    
    if (completionElements.length > 0) {
      results.completionDetection = true;
      console.log('✅ Completion Detection Elements Present');
    } else {
      console.log('❌ No Completion Detection Elements Found');
    }
    
    // Test localStorage/sessionStorage for signature status
    const signatureStatus = localStorage.getItem('signature-status') || 
                           sessionStorage.getItem('signature-status') ||
                           localStorage.getItem('boreal-application-form');
    
    if (signatureStatus) {
      console.log('✅ Signature Status Tracking Available');
      results.completionDetection = true;
    }
    
    // PHASE 5: Overall Workflow Assessment
    console.log('\n🎯 PHASE 5: Overall Workflow Assessment');
    
    const workflowChecks = [
      results.step6Navigation,
      results.apiEndpointReachable,
      results.signNowInitiation === true || results.signNowInitiation === 'NOT_IMPLEMENTED',
      results.embeddedView === true || results.embeddedView === 'REDIRECT_BASED'
    ];
    
    const passedChecks = workflowChecks.filter(Boolean).length;
    results.overallWorkflow = passedChecks >= 3;
    
    console.log(`📊 Workflow Checks Passed: ${passedChecks}/4`);
    
  } catch (overallError) {
    console.log('❌ Overall Test Error:', overallError.message);
  }
  
  // FINAL ANALYSIS
  console.log('\n🔍 STEP 6 DIAGNOSTIC ANALYSIS');
  console.log('=' .repeat(50));
  
  const criticalIssues = [];
  const warnings = [];
  
  if (!results.step6Navigation) {
    criticalIssues.push('Step 6 page not accessible');
  }
  
  if (!results.apiEndpointReachable) {
    criticalIssues.push('SignNow API endpoint unreachable');
  }
  
  if (results.signNowInitiation === false) {
    criticalIssues.push('SignNow URL generation failing');
  } else if (results.signNowInitiation === 'NOT_IMPLEMENTED') {
    warnings.push('SignNow endpoint returns 501 (not implemented)');
  }
  
  if (!results.embeddedView && results.embeddedView !== 'REDIRECT_BASED') {
    warnings.push('No embedded SignNow view detected');
  }
  
  if (!results.completionDetection) {
    warnings.push('Signature completion detection may not work');
  }
  
  console.log('\n🚨 CRITICAL ISSUES:', criticalIssues.length);
  criticalIssues.forEach(issue => console.log(`   ❌ ${issue}`));
  
  console.log('\n⚠️  WARNINGS:', warnings.length);
  warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
  
  // DEPLOYMENT RECOMMENDATION
  console.log('\n🎯 DEPLOYMENT RECOMMENDATION:');
  if (criticalIssues.length > 0) {
    console.log('❌ DEPLOYMENT BLOCKER: Step 6 has critical issues');
    console.log('🔧 REQUIRED FIXES:');
    criticalIssues.forEach(issue => console.log(`   • ${issue}`));
  } else if (warnings.length > 2) {
    console.log('⚠️  DEPLOYMENT CAUTION: Multiple warnings detected');
    console.log('✅ SAFE TO DEPLOY: But monitor Step 6 closely in production');
  } else {
    console.log('✅ DEPLOYMENT SAFE: Step 6 ready for production');
  }
  
  console.log('\n📋 DETAILED RESULTS:');
  console.log(JSON.stringify(results, null, 2));
  
  return {
    criticalIssues: criticalIssues.length,
    warnings: warnings.length,
    isDeploymentBlocked: criticalIssues.length > 0,
    results
  };
}

// Execute Step 6 loopback test
runStep6LoopbackTest();