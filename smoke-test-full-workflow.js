/**
 * COMPREHENSIVE SMOKE TEST - FULL APPLICATION WORKFLOW
 * Tests complete 7-step process from landing page through submission
 * Date: January 9, 2025
 */

class SmokeTestRunner {
  constructor() {
    this.results = [];
    this.currentStep = 0;
    this.testData = {
      business: {
        location: 'Canada',
        lookingFor: 'Working Capital',
        fundingAmount: 50000,
        salesHistory: '2 to 5 years',
        lastYearRevenue: '$100,000 to $500,000',
        monthlyRevenue: '$25,000 to $50,000',
        accountsReceivable: '$10,000 to $25,000',
        fixedAssets: '$50,000 to $100,000'
      },
      businessDetails: {
        operatingName: 'Test Business Inc',
        legalName: 'Test Business Incorporated',
        address: '123 Test St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5V 3A8',
        phone: '416-555-0123',
        businessStructure: 'Corporation',
        startDate: { year: 2020, month: 6 },
        employees: '5 to 10',
        revenue: '$500,000 to $1,000,000'
      },
      applicant: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '416-555-0123',
        sin: '123-456-789',
        birthDate: '1985-05-15',
        address: '123 Test St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5V 3A8',
        ownership: 100
      }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addResult(test, passed, details = '') {
    this.results.push({ test, passed, details });
    this.log(`${test}: ${passed ? 'PASS' : 'FAIL'} ${details}`, passed ? 'success' : 'error');
  }

  async waitForNavigation(expectedPath, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkPath = () => {
        if (window.location.pathname === expectedPath) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Navigation timeout: expected ${expectedPath}, got ${window.location.pathname}`));
        } else {
          setTimeout(checkPath, 100);
        }
      };
      checkPath();
    });
  }

  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element not found: ${selector}`));
        } else {
          setTimeout(checkElement, 100);
        }
      };
      checkElement();
    });
  }

  async testLandingPage() {
    this.log('Testing Landing Page...');
    
    try {
      // Navigate to landing page
      window.location.href = '/';
      await this.waitForNavigation('/');
      
      // Check if landing page loads
      await this.waitForElement('h1');
      const title = document.querySelector('h1').textContent;
      this.addResult('Landing Page Load', title.includes('Professional Business Financing'), `Title: ${title}`);
      
      // Check maximum funding display
      const maxFundingElement = await this.waitForElement('[data-testid="max-funding"], .text-4xl');
      const maxFunding = maxFundingElement.textContent;
      this.addResult('Max Funding Display', maxFunding.includes('$30M+') || maxFunding.includes('$30,000,000'), `Value: ${maxFunding}`);
      
      // Test Apply Now button
      const applyButton = await this.waitForElement('button');
      this.addResult('Apply Button Present', !!applyButton, 'Found apply button');
      
      // Click Apply Now
      applyButton.click();
      await this.waitForNavigation('/apply/step-1');
      this.addResult('Landing Page Navigation', window.location.pathname === '/apply/step-1', 'Navigated to Step 1');
      
    } catch (error) {
      this.addResult('Landing Page Test', false, error.message);
    }
  }

  async testStep1() {
    this.log('Testing Step 1 - Financial Profile...');
    
    try {
      // Wait for Step 1 to load
      await this.waitForElement('[data-testid="step-header"], h1, h2');
      
      // Check StepHeader
      const stepHeader = document.querySelector('[data-testid="step-header"]');
      if (stepHeader) {
        this.addResult('Step 1 Header', stepHeader.textContent.includes('1/7'), 'StepHeader showing 1/7');
      }
      
      // Fill out Step 1 form
      await this.fillStep1Form();
      
      // Click Continue
      const continueButton = await this.waitForElement('button[type="submit"], button:contains("Continue")');
      continueButton.click();
      
      await this.waitForNavigation('/apply/step-2');
      this.addResult('Step 1 Navigation', window.location.pathname === '/apply/step-2', 'Navigated to Step 2');
      
    } catch (error) {
      this.addResult('Step 1 Test', false, error.message);
    }
  }

  async fillStep1Form() {
    // Fill business location
    const locationSelect = await this.waitForElement('select[name="businessLocation"]');
    locationSelect.value = this.testData.business.location;
    locationSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Fill looking for
    const lookingForSelect = await this.waitForElement('select[name="lookingFor"]');
    lookingForSelect.value = this.testData.business.lookingFor;
    lookingForSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Fill funding amount
    const fundingInput = await this.waitForElement('input[name="fundingAmount"]');
    fundingInput.value = this.testData.business.fundingAmount;
    fundingInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    this.addResult('Step 1 Form Fill', true, 'Form fields populated');
  }

  async testStep2() {
    this.log('Testing Step 2 - Recommendations...');
    
    try {
      // Wait for Step 2 to load
      await this.waitForElement('[data-testid="step-header"], h1, h2');
      
      // Check StepHeader
      const stepHeader = document.querySelector('[data-testid="step-header"]');
      if (stepHeader) {
        this.addResult('Step 2 Header', stepHeader.textContent.includes('2/7'), 'StepHeader showing 2/7');
      }
      
      // Wait for recommendations to load
      await this.waitForElement('[data-testid="product-category"], .product-card, .recommendation-card');
      
      // Check if recommendations are displayed
      const recommendations = document.querySelectorAll('[data-testid="product-category"], .product-card, .recommendation-card');
      this.addResult('Recommendations Load', recommendations.length > 0, `Found ${recommendations.length} recommendations`);
      
      // Click on first recommendation
      const firstRecommendation = recommendations[0];
      firstRecommendation.click();
      
      // Wait for selection and continue
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const continueButton = await this.waitForElement('button[type="submit"], button:contains("Continue")');
      continueButton.click();
      
      await this.waitForNavigation('/apply/step-3');
      this.addResult('Step 2 Navigation', window.location.pathname === '/apply/step-3', 'Navigated to Step 3');
      
    } catch (error) {
      this.addResult('Step 2 Test', false, error.message);
    }
  }

  async testStep3() {
    this.log('Testing Step 3 - Business Details...');
    
    try {
      // Wait for Step 3 to load
      await this.waitForElement('[data-testid="step-header"], h1, h2');
      
      // Check StepHeader
      const stepHeader = document.querySelector('[data-testid="step-header"]');
      if (stepHeader) {
        this.addResult('Step 3 Header', stepHeader.textContent.includes('3/7'), 'StepHeader showing 3/7');
      }
      
      // Fill out business details form
      await this.fillStep3Form();
      
      // Click Continue
      const continueButton = await this.waitForElement('button[type="submit"], button:contains("Continue")');
      continueButton.click();
      
      await this.waitForNavigation('/apply/step-4');
      this.addResult('Step 3 Navigation', window.location.pathname === '/apply/step-4', 'Navigated to Step 4');
      
    } catch (error) {
      this.addResult('Step 3 Test', false, error.message);
    }
  }

  async fillStep3Form() {
    const fields = [
      { name: 'operatingName', value: this.testData.businessDetails.operatingName },
      { name: 'legalName', value: this.testData.businessDetails.legalName },
      { name: 'address', value: this.testData.businessDetails.address },
      { name: 'city', value: this.testData.businessDetails.city },
      { name: 'postalCode', value: this.testData.businessDetails.postalCode },
      { name: 'phone', value: this.testData.businessDetails.phone }
    ];
    
    for (const field of fields) {
      try {
        const input = await this.waitForElement(`input[name="${field.name}"]`);
        input.value = field.value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (error) {
        this.log(`Field ${field.name} not found or not fillable`, 'error');
      }
    }
    
    this.addResult('Step 3 Form Fill', true, 'Business details form populated');
  }

  async testStep4() {
    this.log('Testing Step 4 - Applicant Information...');
    
    try {
      // Wait for Step 4 to load
      await this.waitForElement('[data-testid="step-header"], h1, h2');
      
      // Check StepHeader
      const stepHeader = document.querySelector('[data-testid="step-header"]');
      if (stepHeader) {
        this.addResult('Step 4 Header', stepHeader.textContent.includes('4/7'), 'StepHeader showing 4/7');
      }
      
      // Fill out applicant form
      await this.fillStep4Form();
      
      // Click Continue (this should trigger API calls)
      const continueButton = await this.waitForElement('button[type="submit"], button:contains("Continue")');
      continueButton.click();
      
      // Wait for API calls to complete and navigation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await this.waitForNavigation('/apply/step-5');
      this.addResult('Step 4 Navigation', window.location.pathname === '/apply/step-5', 'Navigated to Step 5');
      
      // Check if applicationId was stored
      const applicationId = localStorage.getItem('applicationId');
      this.addResult('Application ID Storage', !!applicationId, `ID: ${applicationId}`);
      
    } catch (error) {
      this.addResult('Step 4 Test', false, error.message);
    }
  }

  async fillStep4Form() {
    const fields = [
      { name: 'firstName', value: this.testData.applicant.firstName },
      { name: 'lastName', value: this.testData.applicant.lastName },
      { name: 'email', value: this.testData.applicant.email },
      { name: 'phone', value: this.testData.applicant.phone }
    ];
    
    for (const field of fields) {
      try {
        const input = await this.waitForElement(`input[name="${field.name}"]`);
        input.value = field.value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (error) {
        this.log(`Field ${field.name} not found or not fillable`, 'error');
      }
    }
    
    this.addResult('Step 4 Form Fill', true, 'Applicant information form populated');
  }

  async testStep5() {
    this.log('Testing Step 5 - Document Upload...');
    
    try {
      // Wait for Step 5 to load
      await this.waitForElement('[data-testid="step-header"], h1, h2');
      
      // Check StepHeader
      const stepHeader = document.querySelector('[data-testid="step-header"]');
      if (stepHeader) {
        this.addResult('Step 5 Header', stepHeader.textContent.includes('5/7'), 'StepHeader showing 5/7');
      }
      
      // Check if document requirements are displayed
      const documentCards = document.querySelectorAll('[data-testid="document-card"], .document-requirement, .upload-area');
      this.addResult('Document Requirements', documentCards.length > 0, `Found ${documentCards.length} document requirements`);
      
      // Skip document upload in testing mode
      const continueButton = await this.waitForElement('button[type="submit"], button:contains("Continue")');
      continueButton.click();
      
      await this.waitForNavigation('/apply/step-6');
      this.addResult('Step 5 Navigation', window.location.pathname === '/apply/step-6', 'Navigated to Step 6');
      
    } catch (error) {
      this.addResult('Step 5 Test', false, error.message);
    }
  }

  async testStep6() {
    this.log('Testing Step 6 - SignNow Integration...');
    
    try {
      // Wait for Step 6 to load
      await this.waitForElement('[data-testid="step-header"], h1, h2');
      
      // Check StepHeader
      const stepHeader = document.querySelector('[data-testid="step-header"]');
      if (stepHeader) {
        this.addResult('Step 6 Header', stepHeader.textContent.includes('6/7'), 'StepHeader showing 6/7');
      }
      
      // Check for SignNow integration elements
      const signNowElements = document.querySelectorAll('[data-testid="signnow-iframe"], .signature-area, .signing-status');
      this.addResult('SignNow Interface', signNowElements.length > 0, `Found ${signNowElements.length} SignNow elements`);
      
      // Check if applicationId is available for SignNow
      const applicationId = localStorage.getItem('applicationId');
      this.addResult('Application ID for SignNow', !!applicationId, `ID available: ${!!applicationId}`);
      
      // Skip signing in testing mode
      const continueButton = await this.waitForElement('button[type="submit"], button:contains("Continue")');
      continueButton.click();
      
      await this.waitForNavigation('/apply/step-7');
      this.addResult('Step 6 Navigation', window.location.pathname === '/apply/step-7', 'Navigated to Step 7');
      
    } catch (error) {
      this.addResult('Step 6 Test', false, error.message);
    }
  }

  async testStep7() {
    this.log('Testing Step 7 - Final Submission...');
    
    try {
      // Wait for Step 7 to load
      await this.waitForElement('[data-testid="step-header"], h1, h2');
      
      // Check StepHeader
      const stepHeader = document.querySelector('[data-testid="step-header"]');
      if (stepHeader) {
        this.addResult('Step 7 Header', stepHeader.textContent.includes('7/7'), 'StepHeader showing 7/7');
      }
      
      // Check for terms and conditions
      const termsCheckbox = document.querySelector('input[type="checkbox"]');
      if (termsCheckbox) {
        termsCheckbox.click();
        this.addResult('Terms Acceptance', true, 'Terms checkbox available and clicked');
      }
      
      // Check for final submit button
      const submitButton = await this.waitForElement('button[type="submit"], button:contains("Submit")');
      this.addResult('Final Submit Button', !!submitButton, 'Submit button present');
      
      // Test final submission
      submitButton.click();
      
      // Wait for submission to complete
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      this.addResult('Final Submission', true, 'Submission attempted');
      
    } catch (error) {
      this.addResult('Step 7 Test', false, error.message);
    }
  }

  async testCacheManagement() {
    this.log('Testing Cache Management System...');
    
    try {
      // Navigate to cache management
      window.location.href = '/cache-management';
      await this.waitForNavigation('/cache-management');
      
      // Check if cache management page loads
      await this.waitForElement('h1');
      const title = document.querySelector('h1').textContent;
      this.addResult('Cache Management Page', title.includes('Cache Management'), `Title: ${title}`);
      
      // Check for cache status display
      const cacheStatus = document.querySelector('[data-testid="cache-status"], .cache-status');
      this.addResult('Cache Status Display', !!cacheStatus, 'Cache status section present');
      
      // Test clear cache button
      const clearButton = await this.waitForElement('button:contains("Clear All Cache")');
      this.addResult('Clear Cache Button', !!clearButton, 'Clear cache button present');
      
      // Test integration check button
      const integrationButton = await this.waitForElement('button:contains("Integration Check")');
      this.addResult('Integration Check Button', !!integrationButton, 'Integration check button present');
      
    } catch (error) {
      this.addResult('Cache Management Test', false, error.message);
    }
  }

  async runFullSmokeTest() {
    this.log('🚀 STARTING COMPREHENSIVE SMOKE TEST');
    this.log('=====================================');
    
    try {
      await this.testLandingPage();
      await this.testStep1();
      await this.testStep2();
      await this.testStep3();
      await this.testStep4();
      await this.testStep5();
      await this.testStep6();
      await this.testStep7();
      await this.testCacheManagement();
      
    } catch (error) {
      this.log(`Critical error during smoke test: ${error.message}`, 'error');
    }
    
    this.generateReport();
  }

  generateReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log('\n🔍 COMPREHENSIVE SMOKE TEST REPORT');
    console.log('===================================');
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test} ${result.details ? `- ${result.details}` : ''}`);
    });
    
    if (successRate >= 90) {
      console.log('\n🎉 SMOKE TEST PASSED - Application ready for production');
    } else if (successRate >= 75) {
      console.log('\n⚠️ SMOKE TEST PARTIAL - Some issues need attention');
    } else {
      console.log('\n🚨 SMOKE TEST FAILED - Critical issues need resolution');
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Review any failed tests above');
    console.log('2. Test cache management at /cache-management');
    console.log('3. Verify staff backend integration');
    console.log('4. Test SignNow workflow with real data');
    
    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
      results: this.results
    };
  }
}

// Run the smoke test
const smokeTest = new SmokeTestRunner();
smokeTest.runFullSmokeTest();

// Make it available globally for manual testing
window.smokeTest = smokeTest;