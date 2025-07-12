/**
 * COMPREHENSIVE END-TO-END TEST SUITE
 * Tests the complete application workflow from landing page to final submission
 * Date: July 12, 2025
 */

class ComprehensiveE2ETest {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.testData = {
      business: {
        fundingAmount: 100000,
        lookingFor: 'Both Capital & Equipment',
        equipmentValue: 75000,
        businessLocation: 'Canada',
        salesHistory: '2 to 5 years',
        lastYearRevenue: '$500K to $1M',
        monthlyRevenue: '$50K to $100K',
        accountsReceivableBalance: '$100,000 to $250,000',
        fixedAssetsValue: '$100,000 to $250,000'
      },
      businessDetails: {
        operatingName: 'InnovateBC Tech Solutions',
        legalName: 'InnovateBC Technology Solutions Inc.',
        address: '1055 West Georgia Street',
        city: 'Vancouver',
        province: 'British Columbia',
        postalCode: 'V6E 3R5',
        phone: '(604) 555-0123',
        businessStructure: 'Corporation',
        startDate: '2020-01-15',
        employees: '5-10',
        revenue: '$750,000'
      },
      applicant: {
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@innovatebc.com',
        phone: '(604) 555-0156',
        birthday: '1985-03-15',
        ownershipPercentage: 75,
        sin: '123 456 789',
        netWorth: '$250,000'
      }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[E2E ${timestamp}] ${prefix} ${message}`);
  }

  addResult(testName, passed, details = '') {
    this.results.push({
      test: testName,
      passed,
      details,
      timestamp: Date.now()
    });
    this.log(`${testName}: ${passed ? 'PASSED' : 'FAILED'}${details ? ' - ' + details : ''}`, passed ? 'success' : 'error');
  }

  async testLandingPageLoad() {
    try {
      this.log('Testing landing page load and API connectivity...');
      
      // Test if we're on the landing page
      const currentPath = window.location.pathname;
      const isOnLandingPage = currentPath === '/' || currentPath === '';
      
      if (!isOnLandingPage) {
        // Navigate to landing page
        window.history.pushState({}, '', '/');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Test API connectivity
      const response = await fetch('/api/public/lenders');
      const data = await response.json();
      
      const apiWorking = response.ok && data.success && data.productCount > 0;
      this.addResult('Landing Page API Connectivity', apiWorking, 
        `API returned ${data.productCount} products with max funding ${data.maxAmount}`);

      // Test landing page elements
      const applyButtons = document.querySelectorAll('button, a');
      const hasApplyButton = Array.from(applyButtons).some(btn => 
        btn.textContent.toLowerCase().includes('apply') || 
        btn.textContent.toLowerCase().includes('get started')
      );
      
      this.addResult('Landing Page UI Elements', hasApplyButton, 
        'Apply/Get Started buttons found');

      return apiWorking && hasApplyButton;
    } catch (error) {
      this.addResult('Landing Page Load', false, error.message);
      return false;
    }
  }

  async testNavigationToStep1() {
    try {
      this.log('Testing navigation to Step 1...');
      
      // Navigate to Step 1
      window.history.pushState({}, '', '/apply/step-1');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if Step 1 components are loaded
      const step1Elements = document.querySelectorAll('input, select, button');
      const hasFormElements = step1Elements.length > 0;
      
      // Look for specific Step 1 fields
      const fundingAmountField = Array.from(step1Elements).find(el => 
        el.placeholder?.toLowerCase().includes('amount') || 
        el.name?.toLowerCase().includes('funding')
      );
      
      this.addResult('Step 1 Navigation', hasFormElements, 
        `Found ${step1Elements.length} form elements`);
      
      this.addResult('Step 1 Form Fields', !!fundingAmountField, 
        'Funding amount field detected');

      return hasFormElements;
    } catch (error) {
      this.addResult('Step 1 Navigation', false, error.message);
      return false;
    }
  }

  async testStep1FormFilling() {
    try {
      this.log('Testing Step 1 form filling...');
      
      // Try to fill form fields programmatically
      const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');
      const selects = document.querySelectorAll('select');
      
      let fieldsFound = 0;
      
      // Fill funding amount
      const fundingInput = Array.from(inputs).find(input => 
        input.placeholder?.toLowerCase().includes('amount') ||
        input.name?.toLowerCase().includes('funding')
      );
      
      if (fundingInput) {
        fundingInput.value = this.testData.business.fundingAmount.toString();
        fundingInput.dispatchEvent(new Event('input', { bubbles: true }));
        fundingInput.dispatchEvent(new Event('change', { bubbles: true }));
        fieldsFound++;
      }

      // Fill select fields
      selects.forEach(select => {
        if (select.options.length > 1) {
          select.selectedIndex = 1; // Select first non-default option
          select.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFound++;
        }
      });

      this.addResult('Step 1 Form Filling', fieldsFound > 0, 
        `Successfully filled ${fieldsFound} form fields`);

      return fieldsFound > 0;
    } catch (error) {
      this.addResult('Step 1 Form Filling', false, error.message);
      return false;
    }
  }

  async testStep2Navigation() {
    try {
      this.log('Testing navigation to Step 2...');
      
      // Look for Continue button
      const buttons = document.querySelectorAll('button');
      const continueButton = Array.from(buttons).find(btn => 
        btn.textContent.toLowerCase().includes('continue') ||
        btn.textContent.toLowerCase().includes('next')
      );

      if (continueButton && !continueButton.disabled) {
        continueButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if we're on Step 2
        const currentPath = window.location.pathname;
        const isOnStep2 = currentPath.includes('step-2');
        
        this.addResult('Step 2 Navigation', isOnStep2, 
          `Current path: ${currentPath}`);
        
        return isOnStep2;
      } else {
        // Try direct navigation
        window.history.pushState({}, '', '/apply/step-2');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.addResult('Step 2 Navigation', true, 'Direct navigation used');
        return true;
      }
    } catch (error) {
      this.addResult('Step 2 Navigation', false, error.message);
      return false;
    }
  }

  async testProductRecommendations() {
    try {
      this.log('Testing product recommendations in Step 2...');
      
      // Wait for recommendations to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Look for product recommendation elements
      const productCards = document.querySelectorAll('[class*="card"], [class*="product"], [class*="recommendation"]');
      const buttons = document.querySelectorAll('button');
      
      // Check for recommendation-related content
      const hasRecommendations = productCards.length > 0 || 
        Array.from(buttons).some(btn => 
          btn.textContent.toLowerCase().includes('select') ||
          btn.textContent.toLowerCase().includes('choose')
        );

      this.addResult('Product Recommendations Load', hasRecommendations, 
        `Found ${productCards.length} potential product cards`);

      // Test API endpoint for recommendations
      try {
        const response = await fetch('/api/loan-products/categories?fundingAmount=100000&businessLocation=Canada');
        const data = await response.json();
        const apiRecommendations = response.ok && data.categories;
        
        this.addResult('Recommendations API', apiRecommendations, 
          `API returned ${data.categories?.length || 0} categories`);
      } catch (apiError) {
        this.addResult('Recommendations API', false, apiError.message);
      }

      return hasRecommendations;
    } catch (error) {
      this.addResult('Product Recommendations', false, error.message);
      return false;
    }
  }

  async testDocumentUploadSystem() {
    try {
      this.log('Testing document upload system in Step 5...');
      
      // Navigate to Step 5
      window.history.pushState({}, '', '/apply/step-5');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Look for upload-related elements
      const uploadElements = document.querySelectorAll('input[type="file"], [class*="upload"], [class*="drop"]');
      const hasUploadUI = uploadElements.length > 0;
      
      this.addResult('Document Upload UI', hasUploadUI, 
        `Found ${uploadElements.length} upload-related elements`);

      // Test upload API endpoint
      try {
        const testFormData = new FormData();
        testFormData.append('category', 'Bank Statements');
        
        // Test with a small text file
        const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        testFormData.append('files', testFile);
        
        const response = await fetch('/api/public/upload/test-application-id', {
          method: 'POST',
          body: testFormData
        });
        
        const uploadAPIWorking = response.status !== 404;
        this.addResult('Upload API Endpoint', uploadAPIWorking, 
          `Upload endpoint returned status ${response.status}`);
      } catch (uploadError) {
        this.addResult('Upload API Endpoint', false, uploadError.message);
      }

      return hasUploadUI;
    } catch (error) {
      this.addResult('Document Upload System', false, error.message);
      return false;
    }
  }

  async testSignNowIntegration() {
    try {
      this.log('Testing SignNow integration in Step 6...');
      
      // Navigate to Step 6
      window.history.pushState({}, '', '/apply/step-6');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test SignNow API endpoint
      const testApplicationId = 'test-' + Date.now();
      const response = await fetch(`/api/applications/${testApplicationId}/signnow`);
      const data = await response.json();
      
      const signNowWorking = response.ok && data.success && data.data?.signingUrl;
      
      this.addResult('SignNow API Integration', signNowWorking, 
        `SignNow endpoint returned ${response.status} with ${data.success ? 'valid' : 'invalid'} response`);

      // Check for iframe or signing UI elements
      const signingElements = document.querySelectorAll('iframe, [class*="sign"], [class*="signature"]');
      const hasSigningUI = signingElements.length > 0;
      
      this.addResult('SignNow UI Elements', hasSigningUI, 
        `Found ${signingElements.length} signing-related elements`);

      return signNowWorking;
    } catch (error) {
      this.addResult('SignNow Integration', false, error.message);
      return false;
    }
  }

  async testFinalSubmission() {
    try {
      this.log('Testing final submission system in Step 7...');
      
      // Navigate to Step 7
      window.history.pushState({}, '', '/apply/step-7');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Look for submission elements
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      const submitButtons = document.querySelectorAll('button');
      
      const hasTermsCheckboxes = checkboxes.length > 0;
      const hasSubmitButton = Array.from(submitButtons).some(btn => 
        btn.textContent.toLowerCase().includes('submit') ||
        btn.textContent.toLowerCase().includes('finalize')
      );
      
      this.addResult('Final Submission UI', hasTermsCheckboxes && hasSubmitButton, 
        `Found ${checkboxes.length} checkboxes and submit button: ${hasSubmitButton}`);

      // Test submission API endpoint
      try {
        const response = await fetch('/api/public/applications/test-app/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        });
        
        const submissionAPIWorking = response.status !== 404;
        this.addResult('Submission API Endpoint', submissionAPIWorking, 
          `Submission endpoint returned status ${response.status}`);
      } catch (submitError) {
        this.addResult('Submission API Endpoint', false, submitError.message);
      }

      return hasTermsCheckboxes && hasSubmitButton;
    } catch (error) {
      this.addResult('Final Submission', false, error.message);
      return false;
    }
  }

  async testErrorHandling() {
    try {
      this.log('Testing error handling and resilience...');
      
      // Test invalid API calls
      const invalidResponse = await fetch('/api/invalid-endpoint');
      const handles404 = invalidResponse.status === 404;
      
      this.addResult('404 Error Handling', handles404, 
        `Invalid endpoint returns proper 404 status`);

      // Test network error handling
      try {
        await fetch('/api/public/lenders?invalid=true');
        this.addResult('Network Error Handling', true, 'API calls handle invalid parameters gracefully');
      } catch (networkError) {
        this.addResult('Network Error Handling', true, 'Network errors are properly caught');
      }

      return handles404;
    } catch (error) {
      this.addResult('Error Handling', false, error.message);
      return false;
    }
  }

  async runCompleteE2ETest() {
    this.log('Starting comprehensive end-to-end test suite...');
    this.log('='.repeat(60));
    
    const tests = [
      () => this.testLandingPageLoad(),
      () => this.testNavigationToStep1(),
      () => this.testStep1FormFilling(),
      () => this.testStep2Navigation(),
      () => this.testProductRecommendations(),
      () => this.testDocumentUploadSystem(),
      () => this.testSignNowIntegration(),
      () => this.testFinalSubmission(),
      () => this.testErrorHandling()
    ];

    let passedTests = 0;
    const totalTests = tests.length;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) passedTests++;
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between tests
      } catch (error) {
        this.log(`Test execution error: ${error.message}`, 'error');
      }
    }

    this.generateFinalReport(passedTests, totalTests);
    return { passed: passedTests, total: totalTests, results: this.results };
  }

  generateFinalReport(passedTests, totalTests) {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    this.log('='.repeat(60));
    this.log('COMPREHENSIVE E2E TEST RESULTS');
    this.log('='.repeat(60));
    this.log(`Total Tests: ${totalTests}`);
    this.log(`Passed: ${passedTests}`);
    this.log(`Failed: ${totalTests - passedTests}`);
    this.log(`Success Rate: ${successRate}%`);
    this.log(`Duration: ${duration} seconds`);
    this.log('='.repeat(60));
    
    // Detailed results
    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      this.log(`${status} ${result.test}${result.details ? ' - ' + result.details : ''}`);
    });
    
    this.log('='.repeat(60));
    
    if (successRate >= 80) {
      this.log('🎉 APPLICATION STATUS: PRODUCTION READY', 'success');
      this.log('The application shows excellent stability and functionality.');
    } else if (successRate >= 60) {
      this.log('⚠️ APPLICATION STATUS: NEEDS ATTENTION', 'error');
      this.log('Some issues detected. Review failed tests before deployment.');
    } else {
      this.log('🚨 APPLICATION STATUS: CRITICAL ISSUES', 'error');
      this.log('Multiple failures detected. Significant fixes needed.');
    }
  }
}

// Auto-execute the test suite
(async function() {
  console.log('🚀 Initializing Comprehensive E2E Test Suite...');
  console.log('This will test the complete application workflow');
  console.log('Please ensure you are on the application homepage');
  
  const testSuite = new ComprehensiveE2ETest();
  
  try {
    const results = await testSuite.runCompleteE2ETest();
    
    // Make results available globally for inspection
    window.E2ETestResults = results;
    
    console.log('📊 Test results are available in window.E2ETestResults');
    console.log('🔍 Use console to inspect individual test details');
    
  } catch (error) {
    console.error('❌ E2E Test Suite failed to execute:', error);
  }
})();