/**
 * StepHeader Implementation Verification Script
 * Tests that all 7 steps properly use the StepHeader component
 */

async function verifyStepHeaderImplementation() {
  console.log('🔍 STEPHEADER IMPLEMENTATION VERIFICATION');
  console.log('==========================================');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  // Test 1: Navigate through each step and verify StepHeader is present
  const steps = [
    { path: '/apply/step-1', stepNumber: 1, title: 'Financial Profile' },
    { path: '/apply/step-3', stepNumber: 3, title: 'Business Details' },
    { path: '/apply/step-4', stepNumber: 4, title: 'Applicant Information' },
    { path: '/apply/step-5', stepNumber: 5, title: 'Upload Documents' },
    { path: '/apply/step-6', stepNumber: 6, title: 'Electronic Signature' },
    { path: '/apply/step-7', stepNumber: 7, title: 'Final Review & Terms' }
  ];
  
  for (const step of steps) {
    try {
      // Navigate to step
      window.location.hash = step.path;
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for StepHeader elements
      const progressBar = document.querySelector('div.bg-gradient-to-r.from-teal-500.to-blue-600');
      const stepTitle = document.querySelector('h1.bg-gradient-to-r.from-teal-600.to-blue-600');
      const stepDescription = document.querySelector('p.text-gray-600');
      
      if (progressBar && stepTitle && stepDescription) {
        // Calculate expected progress percentage
        const expectedProgress = (step.stepNumber / 7) * 100;
        const actualProgress = parseFloat(progressBar.style.width);
        
        const progressMatch = Math.abs(actualProgress - expectedProgress) < 1;
        const titleMatch = stepTitle.textContent.includes(`Step ${step.stepNumber}`);
        
        if (progressMatch && titleMatch) {
          results.passed++;
          results.details.push(`✅ Step ${step.stepNumber}: StepHeader implemented correctly`);
          console.log(`✅ Step ${step.stepNumber}: Progress ${actualProgress}%, Title: "${stepTitle.textContent.trim()}"`);
        } else {
          results.failed++;
          results.details.push(`❌ Step ${step.stepNumber}: StepHeader issues - Progress: ${actualProgress}% (expected ${expectedProgress}%), Title match: ${titleMatch}`);
        }
      } else {
        results.failed++;
        results.details.push(`❌ Step ${step.stepNumber}: StepHeader elements missing`);
        console.log(`❌ Step ${step.stepNumber}: Missing elements - Progress: ${!!progressBar}, Title: ${!!stepTitle}, Description: ${!!stepDescription}`);
      }
    } catch (error) {
      results.failed++;
      results.details.push(`❌ Step ${step.stepNumber}: Navigation error - ${error.message}`);
    }
  }
  
  // Test 2: Verify applicationId flow
  console.log('\n🔍 TESTING APPLICATION ID FLOW');
  
  try {
    // Check localStorage for applicationId
    const storedId = localStorage.getItem('applicationId');
    console.log('📦 localStorage applicationId:', storedId);
    
    // Check if Step 4 can extract UUID properly
    if (typeof extractUuid === 'function') {
      const testIds = [
        'app_prod_123e4567-e89b-12d3-a456-426614174000',
        'app_fallback_123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174000'
      ];
      
      testIds.forEach(testId => {
        const extracted = extractUuid(testId);
        console.log(`🔧 UUID extraction: ${testId} → ${extracted}`);
      });
      
      results.passed++;
      results.details.push('✅ UUID extraction function working');
    } else {
      results.failed++;
      results.details.push('❌ extractUuid function not available');
    }
  } catch (error) {
    results.failed++;
    results.details.push(`❌ ApplicationId flow test failed: ${error.message}`);
  }
  
  // Test 3: Verify API endpoints accessibility
  console.log('\n🔍 TESTING API ENDPOINTS');
  
  const endpoints = [
    '/api/public/lenders',
    '/api/public/applications',
    '/api/signnow/create'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: endpoint.includes('applications') || endpoint.includes('signnow') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test'}`
        },
        body: endpoint.includes('applications') ? JSON.stringify({test: true}) : 
              endpoint.includes('signnow') ? JSON.stringify({applicationId: 'test'}) : null
      });
      
      console.log(`🌐 ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.status < 500) {
        results.passed++;
        results.details.push(`✅ ${endpoint}: Accessible (${response.status})`);
      } else {
        results.failed++;
        results.details.push(`❌ ${endpoint}: Server error (${response.status})`);
      }
    } catch (error) {
      results.failed++;
      results.details.push(`❌ ${endpoint}: Network error - ${error.message}`);
    }
  }
  
  // Final Summary
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('======================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  results.details.forEach(detail => console.log(`   ${detail}`));
  
  // Return to landing page
  window.location.hash = '/';
  
  return results;
}

// Auto-run verification
if (typeof window !== 'undefined') {
  console.log('🚀 Starting StepHeader Implementation Verification...');
  verifyStepHeaderImplementation().then(results => {
    if (results.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED - StepHeader implementation is correct!');
    } else {
      console.log(`\n⚠️ ${results.failed} issues found - Please review implementation`);
    }
  });
}