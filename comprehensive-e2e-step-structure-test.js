/**
 * COMPREHENSIVE END-TO-END STEP-BASED STRUCTURE COMPLIANCE TEST
 * Tests complete application workflow to verify all submissions use {step1, step3, step4} format
 * Validates fixes from root cause analysis in attached documentation
 * Date: July 14, 2025
 */

class ComprehensiveE2EStepStructureTest {
  constructor() {
    this.results = [];
    this.passedTests = 0;
    this.totalTests = 0;
    this.structureViolations = [];
    this.console.log('🚀 Starting Comprehensive E2E Step-Based Structure Test');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    if (type === 'error') {
      console.error(logMessage);
    } else if (type === 'warn') {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  addResult(testName, passed, details = '') {
    this.totalTests++;
    if (passed) {
      this.passedTests++;
      this.log(`✅ ${testName}: PASSED`, 'info');
    } else {
      this.log(`❌ ${testName}: FAILED - ${details}`, 'error');
      this.structureViolations.push({ testName, details });
    }
    
    this.results.push({
      testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async testLandingPageLoad() {
    this.log('🌐 Testing Landing Page Load & Cache Status');
    
    try {
      // Navigate to landing page
      if (!window.location.pathname.includes('/')) {
        window.location.href = '/';
        await this.waitForNavigation('/', 3000);
      }

      // Check if products are loaded in cache
      const cacheSize = await this.checkCacheSize();
      this.addResult(
        'Landing Page Cache Load',
        cacheSize >= 40,
        cacheSize >= 40 ? `${cacheSize} products cached` : `Only ${cacheSize} products cached`
      );

      // Verify no flat field references in landing page
      const flatFieldElements = document.querySelectorAll('[data-field*="firstName"], [data-field*="businessName"]');
      this.addResult(
        'Landing Page Structure Compliance',
        flatFieldElements.length === 0,
        flatFieldElements.length > 0 ? `Found ${flatFieldElements.length} flat field references` : 'No flat field references found'
      );

    } catch (error) {
      this.addResult('Landing Page Load', false, error.message);
    }
  }

  async testStep1FormSubmission() {
    this.log('📝 Testing Step 1 Form Submission Structure');
    
    try {
      // Navigate to Step 1
      window.location.href = '/apply/step-1';
      await this.waitForNavigation('/apply/step-1', 3000);

      // Fill form with test data
      await this.fillStep1Form();
      
      // Monitor form submission for step-based structure
      const submissionPromise = this.monitorFormSubmission();
      
      // Submit form
      const continueButton = document.querySelector('button[type="submit"], button:contains("Continue")');
      if (continueButton) {
        continueButton.click();
        
        const submissionData = await submissionPromise;
        this.addResult(
          'Step 1 Structure Compliance',
          submissionData && submissionData.step1,
          submissionData ? 'Uses step-based structure' : 'Missing step1 structure'
        );
      } else {
        this.addResult('Step 1 Form Submission', false, 'Continue button not found');
      }

    } catch (error) {
      this.addResult('Step 1 Form Submission', false, error.message);
    }
  }

  async testStep4ApplicationCreation() {
    this.log('🔧 Testing Step 4 Application Creation API Call');
    
    try {
      // Navigate to Step 4
      window.location.href = '/apply/step-4';
      await this.waitForNavigation('/apply/step-4', 3000);

      // Fill form with test data
      await this.fillStep4Form();
      
      // Monitor API calls for step-based structure
      const originalFetch = window.fetch;
      let apiPayload = null;
      
      window.fetch = async (url, options) => {
        if (url.includes('/api/public/applications') && options.method === 'POST') {
          try {
            const body = JSON.parse(options.body);
            apiPayload = body;
            this.log(`📤 Captured Step 4 API Payload: ${JSON.stringify(body, null, 2)}`);
          } catch (e) {
            this.log('❌ Failed to parse API payload', 'error');
          }
        }
        return originalFetch(url, options);
      };
      
      // Submit form
      const submitButton = document.querySelector('button[type="submit"], button:contains("Continue")');
      if (submitButton) {
        submitButton.click();
        
        // Wait for API call
        await this.waitForCondition(() => apiPayload !== null, 5000);
        
        // Restore original fetch
        window.fetch = originalFetch;
        
        // Verify step-based structure
        const hasCorrectStructure = apiPayload && 
          apiPayload.step1 && 
          apiPayload.step3 && 
          apiPayload.step4 &&
          !apiPayload.firstName &&
          !apiPayload.businessName;
          
        this.addResult(
          'Step 4 API Structure Compliance',
          hasCorrectStructure,
          hasCorrectStructure ? 
            'Uses {step1, step3, step4} structure without flat fields' : 
            'Missing step-based structure or contains flat fields'
        );
        
        if (apiPayload) {
          this.log(`📋 Step 4 payload verification:
            - step1 present: ${!!apiPayload.step1}
            - step3 present: ${!!apiPayload.step3}
            - step4 present: ${!!apiPayload.step4}
            - flat firstName: ${!!apiPayload.firstName}
            - flat businessName: ${!!apiPayload.businessName}`);
        }
        
      } else {
        this.addResult('Step 4 Application Creation', false, 'Submit button not found');
      }

    } catch (error) {
      this.addResult('Step 4 Application Creation', false, error.message);
    }
  }

  async testStep6SignNowIntegration() {
    this.log('📝 Testing Step 6 SignNow Integration Structure');
    
    try {
      // Ensure we have an applicationId in localStorage
      const applicationId = localStorage.getItem('applicationId');
      if (!applicationId) {
        localStorage.setItem('applicationId', 'test-' + Date.now());
      }
      
      // Navigate to Step 6
      window.location.href = '/apply/step-6';
      await this.waitForNavigation('/apply/step-6', 3000);
      
      // Monitor SignNow API calls for structure compliance
      const originalFetch = window.fetch;
      let signNowPayload = null;
      
      window.fetch = async (url, options) => {
        if (url.includes('/signnow') && options.method === 'POST') {
          try {
            const body = JSON.parse(options.body);
            signNowPayload = body;
            this.log(`📤 Captured SignNow API Payload: ${JSON.stringify(body, null, 2)}`);
          } catch (e) {
            this.log('❌ Failed to parse SignNow payload', 'error');
          }
        }
        return originalFetch(url, options);
      };
      
      // Wait for SignNow initialization
      await this.waitForCondition(() => 
        document.querySelector('.signnow-container, [data-testid="signnow"]') !== null, 
        5000
      );
      
      // Wait for potential API call
      await this.waitForCondition(() => signNowPayload !== null, 3000);
      
      // Restore original fetch
      window.fetch = originalFetch;
      
      // Check for flat field usage in smart fields
      const hasProblematicSmartFields = signNowPayload && (
        signNowPayload.smartFields?.applicantFirstName ||
        signNowPayload.smartFields?.businessName ||
        signNowPayload.firstName ||
        signNowPayload.legalName
      );
      
      this.addResult(
        'Step 6 SignNow Structure Compliance',
        !hasProblematicSmartFields,
        hasProblematicSmartFields ? 
          'Contains problematic flat field references in smart fields' : 
          'No flat field references in SignNow integration'
      );
      
    } catch (error) {
      this.addResult('Step 6 SignNow Integration', false, error.message);
    }
  }

  async testStep7FinalSubmission() {
    this.log('🏁 Testing Step 7 Final Submission Structure');
    
    try {
      // Navigate to Step 7
      window.location.href = '/apply/step-7';
      await this.waitForNavigation('/apply/step-7', 3000);
      
      // Monitor final submission API calls
      const originalFetch = window.fetch;
      let finalPayload = null;
      
      window.fetch = async (url, options) => {
        if (url.includes('/submit') && options.method === 'POST') {
          try {
            const body = options.body instanceof FormData ? 
              JSON.parse(options.body.get('applicationData')) : 
              JSON.parse(options.body);
            finalPayload = body;
            this.log(`📤 Captured Final Submission Payload: ${JSON.stringify(body, null, 2)}`);
          } catch (e) {
            this.log('❌ Failed to parse final submission payload', 'error');
          }
        }
        return originalFetch(url, options);
      };
      
      // Accept terms if present
      const termsCheckbox = document.querySelector('input[type="checkbox"][id*="terms"]');
      const privacyCheckbox = document.querySelector('input[type="checkbox"][id*="privacy"]');
      
      if (termsCheckbox && !termsCheckbox.checked) termsCheckbox.click();
      if (privacyCheckbox && !privacyCheckbox.checked) privacyCheckbox.click();
      
      // Submit final application
      const submitButton = document.querySelector('button[type="submit"], button:contains("Submit")');
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
        
        // Wait for API call
        await this.waitForCondition(() => finalPayload !== null, 5000);
        
        // Restore original fetch
        window.fetch = originalFetch;
        
        // Verify step-based structure in final submission
        const hasCorrectFinalStructure = finalPayload && 
          finalPayload.step1 && 
          finalPayload.step3 && 
          finalPayload.step4 &&
          !finalPayload.firstName &&
          !finalPayload.businessName;
          
        this.addResult(
          'Step 7 Final Submission Structure Compliance',
          hasCorrectFinalStructure,
          hasCorrectFinalStructure ? 
            'Final submission uses {step1, step3, step4} structure' : 
            'Final submission missing step-based structure or contains flat fields'
        );
        
      } else {
        this.addResult('Step 7 Final Submission', false, 'Submit button not found or disabled');
      }
      
    } catch (error) {
      this.addResult('Step 7 Final Submission', false, error.message);
    }
  }

  async testStaffApiValidation() {
    this.log('🔒 Testing Staff API Structure Validation');
    
    try {
      // Test API with correct structure
      const correctPayload = {
        step1: { fundingAmount: 50000, businessLocation: 'US' },
        step3: { operatingName: 'Test Business', businessPhone: '555-0123' },
        step4: { firstName: 'John', lastName: 'Doe', personalEmail: 'test@example.com' }
      };
      
      const response1 = await fetch('/api/public/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify(correctPayload)
      });
      
      this.addResult(
        'Staff API Accepts Correct Structure',
        response1.status === 200 || response1.status === 201,
        `Status: ${response1.status}`
      );
      
      // Test API with incorrect flat structure
      const incorrectPayload = {
        firstName: 'John',
        lastName: 'Doe', 
        businessName: 'Test Business',
        fundingAmount: 50000
      };
      
      const response2 = await fetch('/api/public/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify(incorrectPayload)
      });
      
      this.addResult(
        'Staff API Rejects Flat Structure',
        response2.status >= 400,
        `Status: ${response2.status} (should reject flat fields)`
      );
      
    } catch (error) {
      this.addResult('Staff API Validation', false, error.message);
    }
  }

  async testRetryFlowCompliance() {
    this.log('🔄 Testing Retry Flow Structure Compliance');
    
    try {
      // Check if retry flows exist and use correct structure
      const retryComponents = document.querySelectorAll('[data-testid*="retry"], [class*="retry"]');
      
      // Monitor any retry API calls
      const originalFetch = window.fetch;
      let retryPayload = null;
      
      window.fetch = async (url, options) => {
        if (url.includes('/retry') || url.includes('/resubmit')) {
          try {
            const body = JSON.parse(options.body);
            retryPayload = body;
            this.log(`📤 Captured Retry Payload: ${JSON.stringify(body, null, 2)}`);
          } catch (e) {
            this.log('❌ Failed to parse retry payload', 'error');
          }
        }
        return originalFetch(url, options);
      };
      
      // Trigger retry if available
      const retryButton = document.querySelector('button:contains("Retry"), button[data-action="retry"]');
      if (retryButton) {
        retryButton.click();
        await this.waitForCondition(() => retryPayload !== null, 3000);
      }
      
      // Restore original fetch
      window.fetch = originalFetch;
      
      // Verify retry flows don't use flat fields
      const retryUsesCorrectStructure = !retryPayload || (
        retryPayload.step1 || retryPayload.step3 || retryPayload.step4
      );
      
      this.addResult(
        'Retry Flow Structure Compliance',
        retryUsesCorrectStructure,
        retryPayload ? 
          'Retry flow uses step-based structure' : 
          'No retry flows detected or uses correct structure'
      );
      
    } catch (error) {
      this.addResult('Retry Flow Compliance', false, error.message);
    }
  }

  // Helper methods
  async waitForNavigation(expectedPath, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkNavigation = () => {
        if (window.location.pathname.includes(expectedPath)) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Navigation timeout: expected ${expectedPath}, got ${window.location.pathname}`));
        } else {
          setTimeout(checkNavigation, 100);
        }
      };
      checkNavigation();
    });
  }

  async waitForCondition(condition, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkCondition = () => {
        if (condition()) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Condition timeout'));
        } else {
          setTimeout(checkCondition, 100);
        }
      };
      checkCondition();
    });
  }

  async checkCacheSize() {
    try {
      const { get } = await import('idb-keyval');
      const cachedProducts = await get('lender-products');
      return Array.isArray(cachedProducts) ? cachedProducts.length : 0;
    } catch (error) {
      return 0;
    }
  }

  async fillStep1Form() {
    // Fill Step 1 form with test data
    const fundingInput = document.querySelector('input[name="fundingAmount"], input[id*="funding"]');
    if (fundingInput) fundingInput.value = '50000';
    
    const locationSelect = document.querySelector('select[name="businessLocation"], select[id*="location"]');
    if (locationSelect) locationSelect.value = 'US';
    
    const industrySelect = document.querySelector('select[name="industry"], select[id*="industry"]');
    if (industrySelect) industrySelect.value = 'retail';
  }

  async fillStep4Form() {
    // Fill Step 4 form with test data
    const firstNameInput = document.querySelector('input[name="firstName"], input[id*="firstName"]');
    if (firstNameInput) firstNameInput.value = 'John';
    
    const lastNameInput = document.querySelector('input[name="lastName"], input[id*="lastName"]');
    if (lastNameInput) lastNameInput.value = 'Doe';
    
    const emailInput = document.querySelector('input[name="personalEmail"], input[type="email"]');
    if (emailInput) emailInput.value = 'john.doe@example.com';
  }

  async monitorFormSubmission() {
    return new Promise((resolve) => {
      const originalFetch = window.fetch;
      window.fetch = async (url, options) => {
        const result = originalFetch(url, options);
        if (options.method === 'POST' && options.body) {
          try {
            const body = JSON.parse(options.body);
            resolve(body);
          } catch (e) {
            resolve(null);
          }
        }
        return result;
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        window.fetch = originalFetch;
        resolve(null);
      }, 5000);
    });
  }

  async runCompleteE2ETest() {
    this.log('🚀 Starting Comprehensive End-to-End Step-Based Structure Test');
    this.log('📋 Testing compliance with root cause analysis findings');
    
    const startTime = Date.now();
    
    try {
      await this.testLandingPageLoad();
      await this.testStep1FormSubmission();
      await this.testStep4ApplicationCreation();
      await this.testStep6SignNowIntegration();
      await this.testStep7FinalSubmission();
      await this.testStaffApiValidation();
      await this.testRetryFlowCompliance();
      
    } catch (error) {
      this.log(`❌ Test suite error: ${error.message}`, 'error');
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    return this.generateChatGPTReport(duration);
  }

  generateChatGPTReport(duration) {
    const successRate = Math.round((this.passedTests / this.totalTests) * 100);
    
    const report = {
      timestamp: new Date().toISOString(),
      testSuite: 'Comprehensive E2E Step-Based Structure Compliance',
      duration: `${duration} seconds`,
      summary: {
        totalTests: this.totalTests,
        passedTests: this.passedTests,
        failedTests: this.totalTests - this.passedTests,
        successRate: `${successRate}%`,
        complianceStatus: successRate >= 90 ? 'COMPLIANT' : 'NON-COMPLIANT'
      },
      rootCauseFindings: {
        stepBasedStructureEnforced: this.passedTests >= 5,
        flatFieldsEliminated: this.structureViolations.length === 0,
        apiValidationWorking: this.results.some(r => r.testName.includes('Staff API') && r.passed),
        signNowIntegrationFixed: this.results.some(r => r.testName.includes('SignNow') && r.passed),
        retryFlowsCompliant: this.results.some(r => r.testName.includes('Retry') && r.passed)
      },
      detailedResults: this.results,
      structureViolations: this.structureViolations,
      recommendations: this.generateRecommendations(),
      chatGPTHandoff: {
        status: successRate >= 90 ? 'READY_FOR_PRODUCTION' : 'REQUIRES_FIXES',
        priority: successRate < 80 ? 'HIGH' : successRate < 90 ? 'MEDIUM' : 'LOW',
        nextSteps: this.generateNextSteps()
      }
    };
    
    this.log('📊 COMPREHENSIVE E2E TEST RESULTS:');
    this.log(`✅ Passed: ${this.passedTests}/${this.totalTests} (${successRate}%)`);
    this.log(`🎯 Compliance Status: ${report.summary.complianceStatus}`);
    this.log(`⏱️ Duration: ${duration} seconds`);
    
    if (this.structureViolations.length > 0) {
      this.log('❌ Structure Violations Found:');
      this.structureViolations.forEach(violation => {
        this.log(`  - ${violation.testName}: ${violation.details}`);
      });
    }
    
    console.log('\n📋 DETAILED REPORT FOR CHATGPT:');
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.structureViolations.some(v => v.testName.includes('Step 4'))) {
      recommendations.push('Fix Step 4 application creation to use {step1, step3, step4} structure');
    }
    
    if (this.structureViolations.some(v => v.testName.includes('Step 6'))) {
      recommendations.push('Remove flat field references from SignNow smart fields integration');
    }
    
    if (this.structureViolations.some(v => v.testName.includes('Step 7'))) {
      recommendations.push('Update final submission to use step-based structure exclusively');
    }
    
    if (this.structureViolations.some(v => v.testName.includes('Staff API'))) {
      recommendations.push('Enhance staff API validation to reject flat field submissions');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All step-based structure compliance tests passed - ready for production');
    }
    
    return recommendations;
  }

  generateNextSteps() {
    const successRate = Math.round((this.passedTests / this.totalTests) * 100);
    
    if (successRate >= 90) {
      return [
        'Deploy to production environment',
        'Monitor submission success rates',
        'Conduct user acceptance testing'
      ];
    } else if (successRate >= 80) {
      return [
        'Address remaining structure violations',
        'Re-run comprehensive test suite',
        'Deploy to staging for final validation'
      ];
    } else {
      return [
        'Critical fixes required for step-based structure compliance',
        'Review and fix all failing test cases',
        'Implement additional validation layers',
        'Re-run full test suite before deployment'
      ];
    }
  }
}

// Export for use in browser console
window.ComprehensiveE2EStepStructureTest = ComprehensiveE2EStepStructureTest;

// Auto-run test when script is loaded
async function runTest() {
  const tester = new ComprehensiveE2EStepStructureTest();
  return await tester.runCompleteE2ETest();
}

// Make available globally
window.runComprehensiveE2ETest = runTest;

console.log('🚀 Comprehensive E2E Step-Based Structure Test loaded');
console.log('Run: window.runComprehensiveE2ETest() to start testing');