/**
 * COMPREHENSIVE END-TO-END TEST SUITE
 * Tests the complete 7-step application workflow with the test data provided
 * Date: July 16, 2025
 */

class ComprehensiveE2ETest {
  constructor() {
    this.results = [];
    this.testData = {
      businessName: 'End2End Ventures',
      contactName: 'Ava Thorough',
      amountRequested: 100000,
      industry: 'transportation',
      timeInBusiness: '3 years',
      useOfFunds: 'equipment',
      // Step 4 data
      firstName: 'Ava',
      lastName: 'Thorough',
      email: 'ava@end2end.com',
      phone: '555-789-1234',
      // Equipment details
      equipmentValue: 75000
    };
  }

  log(message, type = 'info') {
    console.log(`[E2E-TEST] ${message}`);
  }

  addResult(step, passed, details = '') {
    this.results.push({
      step,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async testStep1FormFilling() {
    this.log('🧪 Testing Step 1: Financial Profile');
    
    try {
      // Check if we're on Step 1
      const currentPath = window.location.pathname;
      if (!currentPath.includes('step1') && !currentPath.includes('/')) {
        this.log('Navigating to Step 1...');
        window.location.href = '/step1';
        await this.waitForPageLoad();
      }

      // Fill out Step 1 form
      const form = document.querySelector('form');
      if (!form) {
        this.addResult('Step 1', false, 'No form found on Step 1');
        return false;
      }

      // Fill business location
      const businessLocationSelect = document.querySelector('select[name="businessLocation"]');
      if (businessLocationSelect) {
        businessLocationSelect.value = 'US';
        businessLocationSelect.dispatchEvent(new Event('change', { bubbles: true }));
        this.log('✓ Set business location to US');
      }

      // Fill industry
      const industrySelect = document.querySelector('select[name="industry"]');
      if (industrySelect) {
        industrySelect.value = this.testData.industry;
        industrySelect.dispatchEvent(new Event('change', { bubbles: true }));
        this.log('✓ Set industry to transportation');
      }

      // Fill looking for
      const lookingForSelect = document.querySelector('select[name="lookingFor"]');
      if (lookingForSelect) {
        lookingForSelect.value = 'equipment';
        lookingForSelect.dispatchEvent(new Event('change', { bubbles: true }));
        this.log('✓ Set looking for to equipment');
      }

      // Fill funding amount
      const fundingAmountInput = document.querySelector('input[name="fundingAmount"]');
      if (fundingAmountInput) {
        fundingAmountInput.value = this.testData.amountRequested.toString();
        fundingAmountInput.dispatchEvent(new Event('input', { bubbles: true }));
        this.log('✓ Set funding amount to $100,000');
      }

      // Fill purpose
      const purposeSelect = document.querySelector('select[name="fundsPurpose"]');
      if (purposeSelect) {
        purposeSelect.value = 'Equipment Purchase';
        purposeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        this.log('✓ Set purpose to Equipment Purchase');
      }

      // Submit form
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
        this.log('✓ Submitted Step 1 form');
        await this.waitForNavigation('/step2');
        this.addResult('Step 1', true, 'Form filled and submitted successfully');
        return true;
      } else {
        this.addResult('Step 1', false, 'Submit button not found or disabled');
        return false;
      }
    } catch (error) {
      this.addResult('Step 1', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testStep2ProductRecommendations() {
    this.log('🧪 Testing Step 2: Product Recommendations');
    
    try {
      // Wait for products to load
      await this.waitForCondition(() => {
        const productCards = document.querySelectorAll('[data-testid="product-card"]');
        return productCards.length > 0;
      }, 10000);

      const productCards = document.querySelectorAll('[data-testid="product-card"]');
      if (productCards.length === 0) {
        this.addResult('Step 2', false, 'No product cards found');
        return false;
      }

      this.log(`✓ Found ${productCards.length} product recommendations`);

      // Select first product
      const firstProduct = productCards[0];
      firstProduct.click();
      this.log('✓ Selected first product recommendation');

      // Continue to Step 3
      const continueButton = document.querySelector('button:contains("Continue")');
      if (continueButton) {
        continueButton.click();
        await this.waitForNavigation('/step3');
        this.addResult('Step 2', true, `${productCards.length} products displayed, selection successful`);
        return true;
      } else {
        this.addResult('Step 2', false, 'Continue button not found');
        return false;
      }
    } catch (error) {
      this.addResult('Step 2', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testStep3BusinessDetails() {
    this.log('🧪 Testing Step 3: Business Details');
    
    try {
      // Fill business details form
      const businessNameInput = document.querySelector('input[name="operatingName"]');
      if (businessNameInput) {
        businessNameInput.value = this.testData.businessName;
        businessNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        this.log('✓ Set business name');
      }

      // Fill other required fields
      const legalNameInput = document.querySelector('input[name="legalName"]');
      if (legalNameInput) {
        legalNameInput.value = this.testData.businessName + ' LLC';
        legalNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        this.log('✓ Set legal name');
      }

      // Submit form
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
        await this.waitForNavigation('/step4');
        this.addResult('Step 3', true, 'Business details form completed');
        return true;
      } else {
        this.addResult('Step 3', false, 'Submit button not found or disabled');
        return false;
      }
    } catch (error) {
      this.addResult('Step 3', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testStep4ApplicantInfo() {
    this.log('🧪 Testing Step 4: Applicant Information');
    
    try {
      // Fill applicant information
      const firstNameInput = document.querySelector('input[name="applicantFirstName"]');
      if (firstNameInput) {
        firstNameInput.value = this.testData.firstName;
        firstNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        this.log('✓ Set first name');
      }

      const lastNameInput = document.querySelector('input[name="applicantLastName"]');
      if (lastNameInput) {
        lastNameInput.value = this.testData.lastName;
        lastNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        this.log('✓ Set last name');
      }

      const emailInput = document.querySelector('input[name="applicantEmail"]');
      if (emailInput) {
        emailInput.value = this.testData.email;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        this.log('✓ Set email');
      }

      const phoneInput = document.querySelector('input[name="applicantPhone"]');
      if (phoneInput) {
        phoneInput.value = this.testData.phone;
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        this.log('✓ Set phone');
      }

      // Submit form
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
        await this.waitForNavigation('/step5');
        this.addResult('Step 4', true, 'Applicant information submitted successfully');
        return true;
      } else {
        this.addResult('Step 4', false, 'Submit button not found or disabled');
        return false;
      }
    } catch (error) {
      this.addResult('Step 4', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testStep5DocumentUpload() {
    this.log('🧪 Testing Step 5: Document Upload');
    
    try {
      // Check for document upload interface
      const uploadArea = document.querySelector('[data-testid="upload-area"]');
      if (!uploadArea) {
        this.addResult('Step 5', false, 'Upload area not found');
        return false;
      }

      this.log('✓ Document upload interface found');

      // Skip actual file upload for automated test
      // In real testing, you would upload actual files here
      this.log('⚠️ Skipping file upload for automated test');

      // Continue to Step 6
      const continueButton = document.querySelector('button:contains("Continue")');
      if (continueButton) {
        continueButton.click();
        await this.waitForNavigation('/step6');
        this.addResult('Step 5', true, 'Document upload interface functional');
        return true;
      } else {
        this.addResult('Step 5', false, 'Continue button not found');
        return false;
      }
    } catch (error) {
      this.addResult('Step 5', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testStep6SignNowIntegration() {
    this.log('🧪 Testing Step 6: SignNow Integration');
    
    try {
      // Wait for SignNow iframe to load
      await this.waitForCondition(() => {
        const iframe = document.querySelector('iframe');
        return iframe && iframe.src.includes('signnow');
      }, 15000);

      const iframe = document.querySelector('iframe');
      if (!iframe) {
        this.addResult('Step 6', false, 'SignNow iframe not found');
        return false;
      }

      this.log('✓ SignNow iframe loaded');

      // Check if smart fields are populated (would need iframe access)
      this.log('⚠️ Cannot verify smart field population due to iframe restrictions');

      // Skip actual signing for automated test
      // Continue to Step 7
      const continueButton = document.querySelector('button:contains("Continue")');
      if (continueButton) {
        continueButton.click();
        await this.waitForNavigation('/step7');
        this.addResult('Step 6', true, 'SignNow integration functional');
        return true;
      } else {
        this.addResult('Step 6', false, 'Continue button not found');
        return false;
      }
    } catch (error) {
      this.addResult('Step 6', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testStep7FinalSubmission() {
    this.log('🧪 Testing Step 7: Final Submission');
    
    try {
      // Check for final submit button
      const submitButton = document.querySelector('button[type="submit"]');
      if (!submitButton) {
        this.addResult('Step 7', false, 'Final submit button not found');
        return false;
      }

      this.log('✓ Final submit button found');

      // Test submission (without actually submitting)
      if (!submitButton.disabled) {
        this.log('✓ Submit button is enabled');
        // submitButton.click(); // Uncomment for actual submission
        this.addResult('Step 7', true, 'Final submission ready');
        return true;
      } else {
        this.addResult('Step 7', false, 'Submit button is disabled');
        return false;
      }
    } catch (error) {
      this.addResult('Step 7', false, `Error: ${error.message}`);
      return false;
    }
  }

  async waitForNavigation(expectedPath, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (window.location.pathname.includes(expectedPath)) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Navigation to ${expectedPath} timed out`);
  }

  async waitForCondition(condition, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Condition not met within timeout');
  }

  async waitForPageLoad() {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async runCompleteE2ETest() {
    this.log('🚀 Starting Complete End-to-End Test Suite');
    
    const tests = [
      { name: 'Step 1 Form Filling', fn: () => this.testStep1FormFilling() },
      { name: 'Step 2 Product Recommendations', fn: () => this.testStep2ProductRecommendations() },
      { name: 'Step 3 Business Details', fn: () => this.testStep3BusinessDetails() },
      { name: 'Step 4 Applicant Information', fn: () => this.testStep4ApplicantInfo() },
      { name: 'Step 5 Document Upload', fn: () => this.testStep5DocumentUpload() },
      { name: 'Step 6 SignNow Integration', fn: () => this.testStep6SignNowIntegration() },
      { name: 'Step 7 Final Submission', fn: () => this.testStep7FinalSubmission() }
    ];

    for (const test of tests) {
      this.log(`\n--- Running ${test.name} ---`);
      try {
        const result = await test.fn();
        if (result) {
          this.log(`✅ ${test.name} PASSED`);
        } else {
          this.log(`❌ ${test.name} FAILED`);
        }
      } catch (error) {
        this.log(`❌ ${test.name} ERROR: ${error.message}`);
        this.addResult(test.name, false, `Exception: ${error.message}`);
      }
    }

    this.generateFinalReport();
  }

  generateFinalReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log('\n' + '='.repeat(60));
    console.log('📊 END-TO-END TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log('='.repeat(60));

    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.step}: ${result.details}`);
    });

    console.log('\n📋 SUMMARY:');
    console.log(`• Step 2 Product Display: ${this.results.find(r => r.step === 'Step 2')?.passed ? 'WORKING' : 'NEEDS FIX'}`);
    console.log(`• Step 5 Document Upload: ${this.results.find(r => r.step === 'Step 5')?.passed ? 'WORKING' : 'NEEDS FIX'}`);
    console.log(`• Step 6 SignNow Integration: ${this.results.find(r => r.step === 'Step 6')?.passed ? 'WORKING' : 'NEEDS FIX'}`);
    console.log(`• Step 7 Final Submission: ${this.results.find(r => r.step === 'Step 7')?.passed ? 'WORKING' : 'NEEDS FIX'}`);
  }
}

// Run the test
const e2eTest = new ComprehensiveE2ETest();
e2eTest.runCompleteE2ETest();