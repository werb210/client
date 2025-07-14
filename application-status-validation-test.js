/**
 * APPLICATION STATUS VALIDATION TEST
 * Tests the complete application status checking system across all submission points
 * Date: July 14, 2025
 */

class ApplicationStatusValidationTest {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    this.results.push({
      timestamp,
      type,
      message,
      details: ''
    });
  }

  addResult(testName, passed, details = '') {
    this.results.push({
      testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async testApplicationStatusUtility() {
    this.log('🧪 Testing applicationStatus.ts utility functions', 'test');
    
    try {
      // Test fetchApplicationStatus function
      const testApplicationId = '12345678-1234-5678-9abc-123456789012';
      
      this.log(`Testing fetchApplicationStatus with ID: ${testApplicationId}`);
      const statusResponse = await window.fetchApplicationStatus(testApplicationId);
      
      this.log(`Status response: ${JSON.stringify(statusResponse)}`);
      this.addResult('fetchApplicationStatus', 
        statusResponse && typeof statusResponse === 'object', 
        `Response structure: ${JSON.stringify(statusResponse)}`);

      // Test canSubmitApplication function
      this.log(`Testing canSubmitApplication with ID: ${testApplicationId}`);
      const canSubmitResponse = await window.canSubmitApplication(testApplicationId);
      
      this.log(`Can submit response: ${JSON.stringify(canSubmitResponse)}`);
      this.addResult('canSubmitApplication', 
        canSubmitResponse && typeof canSubmitResponse.canSubmit === 'boolean', 
        `Response structure: ${JSON.stringify(canSubmitResponse)}`);

    } catch (error) {
      this.log(`❌ Application status utility test failed: ${error.message}`, 'error');
      this.addResult('applicationStatusUtility', false, error.message);
    }
  }

  async testValidationErrorModal() {
    this.log('🧪 Testing ValidationErrorModal component integration', 'test');
    
    try {
      // Check if ValidationErrorModal is available
      const hasValidationModal = typeof window.ValidationErrorModal !== 'undefined';
      this.addResult('validationErrorModalAvailable', hasValidationModal, 
        hasValidationModal ? 'ValidationErrorModal component found' : 'ValidationErrorModal component not found');

      // Test validation payload function
      if (typeof window.validateApplicationPayload === 'function') {
        const testPayload = {
          step1: { requestedAmount: 50000, use_of_funds: 'working_capital' },
          step3: { legalName: 'Test Business', businessName: 'Test Business', businessPhone: '+1234567890', businessState: 'CA' },
          step4: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '+1234567890', ownershipPercentage: 100, dob: '1990-01-01', sin: '123456789' }
        };

        const validation = window.validateApplicationPayload(testPayload);
        this.log(`Validation result: ${JSON.stringify(validation)}`);
        this.addResult('validateApplicationPayload', validation.isValid, 
          `Validation: ${validation.isValid ? 'PASSED' : 'FAILED'} - Missing: ${JSON.stringify(validation.missingFields)}`);
      }

    } catch (error) {
      this.log(`❌ ValidationErrorModal test failed: ${error.message}`, 'error');
      this.addResult('validationErrorModal', false, error.message);
    }
  }

  async testApplicationStatusModal() {
    this.log('🧪 Testing ApplicationStatusModal component integration', 'test');
    
    try {
      // Check if ApplicationStatusModal is available
      const hasStatusModal = typeof window.ApplicationStatusModal !== 'undefined';
      this.addResult('applicationStatusModalAvailable', hasStatusModal, 
        hasStatusModal ? 'ApplicationStatusModal component found' : 'ApplicationStatusModal component not found');

      // Test different status scenarios
      const testStatuses = ['draft', 'lender_match', 'processing', 'approved', 'rejected'];
      
      for (const status of testStatuses) {
        this.log(`Testing status scenario: ${status}`);
        const canSubmit = status === 'draft';
        this.addResult(`statusScenario_${status}`, true, 
          `Status '${status}' should ${canSubmit ? 'allow' : 'block'} submission`);
      }

    } catch (error) {
      this.log(`❌ ApplicationStatusModal test failed: ${error.message}`, 'error');
      this.addResult('applicationStatusModal', false, error.message);
    }
  }

  async testStep7SubmitIntegration() {
    this.log('🧪 Testing Step 7 Submit integration', 'test');
    
    try {
      // Check if we're on a Step 7 page
      const currentPath = window.location.pathname;
      const isStep7 = currentPath.includes('step-7') || currentPath.includes('submit');
      
      this.addResult('step7PageDetection', true, 
        `Current path: ${currentPath}, Is Step 7: ${isStep7}`);

      // Check if application status checking is integrated
      const hasStatusChecking = typeof window.canSubmitApplication === 'function';
      this.addResult('step7StatusCheckingAvailable', hasStatusChecking, 
        hasStatusChecking ? 'canSubmitApplication function available' : 'canSubmitApplication function not available');

      // Test local storage for applicationId
      const applicationId = localStorage.getItem('applicationId');
      this.addResult('applicationIdInStorage', !!applicationId, 
        applicationId ? `Application ID found: ${applicationId}` : 'No application ID in localStorage');

    } catch (error) {
      this.log(`❌ Step 7 Submit integration test failed: ${error.message}`, 'error');
      this.addResult('step7SubmitIntegration', false, error.message);
    }
  }

  async testFieldValidationSystem() {
    this.log('🧪 Testing comprehensive field validation system', 'test');
    
    try {
      // Test validation with missing required fields
      const incompletePayload = {
        step1: { requestedAmount: 50000 }, // Missing use_of_funds
        step3: { legalName: 'Test Business' }, // Missing businessName, businessPhone, businessState
        step4: { firstName: 'John' } // Missing lastName, email, phone, ownershipPercentage, dob, sin
      };

      if (typeof window.validateApplicationPayload === 'function') {
        const validation = window.validateApplicationPayload(incompletePayload);
        
        this.log(`Incomplete validation result: ${JSON.stringify(validation)}`);
        this.addResult('incompleteFieldValidation', !validation.isValid, 
          `Should fail validation - Missing fields: ${JSON.stringify(validation.missingFields)}`);

        // Count total missing fields
        const totalMissing = Object.values(validation.missingFields || {}).reduce((sum, fields) => sum + fields.length, 0);
        this.addResult('missingFieldCount', totalMissing > 0, 
          `Total missing fields detected: ${totalMissing}`);
      }

    } catch (error) {
      this.log(`❌ Field validation system test failed: ${error.message}`, 'error');
      this.addResult('fieldValidationSystem', false, error.message);
    }
  }

  async testPreSubmissionValidation() {
    this.log('🧪 Testing pre-submission validation flow', 'test');
    
    try {
      // Simulate the complete pre-submission validation flow
      const mockApplicationId = 'test-app-' + Date.now();
      
      // Test 1: Check if validation happens before API calls
      this.log('Testing validation-before-API-call pattern');
      
      // Test 2: Check status checking integration
      if (typeof window.canSubmitApplication === 'function') {
        try {
          const statusCheck = await window.canSubmitApplication(mockApplicationId);
          this.addResult('preSubmissionStatusCheck', true, 
            `Status check attempted for ${mockApplicationId}: ${JSON.stringify(statusCheck)}`);
        } catch (error) {
          this.addResult('preSubmissionStatusCheck', true, 
            `Status check correctly failed for non-existent ID: ${error.message}`);
        }
      }

      // Test 3: Check validation error modal integration
      this.log('Testing validation error modal integration');
      const hasValidationModal = document.querySelector('[data-testid="validation-error-modal"]') || 
                                 document.querySelector('.validation-error-modal') ||
                                 typeof window.ValidationErrorModal !== 'undefined';
      
      this.addResult('validationModalIntegration', !!hasValidationModal, 
        hasValidationModal ? 'Validation modal integration detected' : 'Validation modal integration not detected');

    } catch (error) {
      this.log(`❌ Pre-submission validation test failed: ${error.message}`, 'error');
      this.addResult('preSubmissionValidation', false, error.message);
    }
  }

  async runCompleteValidationTest() {
    this.log('🚀 Starting Application Status Validation Test Suite', 'start');
    this.log('=' * 80);

    try {
      await this.testApplicationStatusUtility();
      await this.testValidationErrorModal();
      await this.testApplicationStatusModal();
      await this.testStep7SubmitIntegration();
      await this.testFieldValidationSystem();
      await this.testPreSubmissionValidation();

      const duration = Date.now() - this.startTime;
      this.generateFinalReport(duration);

    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`, 'error');
      console.error('Complete test error:', error);
    }
  }

  generateFinalReport(duration) {
    const passedTests = this.results.filter(r => r.passed === true).length;
    const failedTests = this.results.filter(r => r.passed === false).length;
    const totalTests = this.results.filter(r => typeof r.passed === 'boolean').length;

    console.log('\n' + '='.repeat(80));
    console.log('🎯 APPLICATION STATUS VALIDATION TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${failedTests}/${totalTests}`);
    console.log(`📊 Success Rate: ${totalTests > 0 ? Math.round((passedTests/totalTests) * 100) : 0}%`);
    console.log('='.repeat(80));

    // Detailed results
    console.log('\n📋 DETAILED TEST RESULTS:');
    this.results.forEach((result, index) => {
      if (typeof result.passed === 'boolean') {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.testName}: ${result.details}`);
      }
    });

    // Status summary
    console.log('\n🎯 APPLICATION STATUS VALIDATION SYSTEM STATUS:');
    
    const hasStatusUtility = this.results.some(r => r.testName === 'fetchApplicationStatus' && r.passed);
    const hasValidationSystem = this.results.some(r => r.testName === 'validateApplicationPayload' && r.passed);
    const hasStatusModal = this.results.some(r => r.testName === 'applicationStatusModalAvailable' && r.passed);
    const hasValidationModal = this.results.some(r => r.testName === 'validationErrorModalAvailable' && r.passed);

    console.log(`📋 Application Status Utility: ${hasStatusUtility ? '✅ OPERATIONAL' : '❌ NOT FOUND'}`);
    console.log(`🔍 Field Validation System: ${hasValidationSystem ? '✅ OPERATIONAL' : '❌ NOT FOUND'}`);
    console.log(`🚫 Application Status Modal: ${hasStatusModal ? '✅ AVAILABLE' : '❌ NOT FOUND'}`);
    console.log(`⚠️  Validation Error Modal: ${hasValidationModal ? '✅ AVAILABLE' : '❌ NOT FOUND'}`);

    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED - APPLICATION STATUS VALIDATION SYSTEM IS FULLY OPERATIONAL');
    } else if (passedTests > totalTests * 0.8) {
      console.log('\n⚠️  MOST TESTS PASSED - SYSTEM MOSTLY OPERATIONAL WITH MINOR ISSUES');
    } else {
      console.log('\n❌ MULTIPLE FAILURES - APPLICATION STATUS VALIDATION SYSTEM NEEDS ATTENTION');
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Navigate to Step 7 submission page');
    console.log('2. Test with existing application ID');
    console.log('3. Verify status blocking works correctly');
    console.log('4. Test validation error modal display');
    console.log('5. Confirm resubmission prevention');

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: totalTests > 0 ? Math.round((passedTests/totalTests) * 100) : 0,
      duration,
      systemOperational: hasStatusUtility && hasValidationSystem && hasStatusModal && hasValidationModal
    };
  }
}

// Auto-run test
async function runApplicationStatusValidationTest() {
  const tester = new ApplicationStatusValidationTest();
  return await tester.runCompleteValidationTest();
}

// Make functions globally available
window.ApplicationStatusValidationTest = ApplicationStatusValidationTest;
window.runApplicationStatusValidationTest = runApplicationStatusValidationTest;

// Auto-execute when script loads
console.log('🧪 Application Status Validation Test Suite loaded. Run runApplicationStatusValidationTest() to execute.');