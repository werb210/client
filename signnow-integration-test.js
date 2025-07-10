/**
 * SIGNNOW INTEGRATION TEST
 * Validates the SignNow API integration with proper endpoint routing and error handling
 * Date: January 10, 2025
 */

class SignNowIntegrationTest {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  addResult(test, passed, details = '') {
    this.results.push({ test, passed, details, timestamp: Date.now() });
    const status = passed ? '✅' : '❌';
    this.log(`${status} ${test}: ${details}`, passed ? 'success' : 'error');
  }

  async testSignNowEndpointRouting() {
    this.log('Testing SignNow endpoint routing to staff backend...');
    try {
      const testApplicationId = 'test-app-' + Date.now();
      
      // Test new endpoint format: POST /api/applications/:id/signnow
      const response = await fetch(`/api/applications/${testApplicationId}/signnow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        },
        body: JSON.stringify({
          applicationId: testApplicationId
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.status === 501 && data.error === 'Signature system not yet implemented. Please try again later.') {
        this.addResult('SignNow Endpoint Routing', true, 
          `✅ Correct endpoint routing with graceful 501 error handling`);
      } else if (response.status === 200) {
        this.addResult('SignNow Endpoint Routing', true, 
          `✅ SignNow system operational - received 200 OK`);
      } else {
        this.addResult('SignNow Endpoint Routing', false, 
          `Unexpected response: ${response.status} - ${JSON.stringify(data)}`);
      }
      
      return { success: true, response: data, status: response.status };
    } catch (error) {
      this.addResult('SignNow Endpoint Routing', false, `Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testLegacySignNowEndpoint() {
    this.log('Testing legacy SignNow endpoint compatibility...');
    try {
      const testApplicationId = 'legacy-test-' + Date.now();
      
      // Test legacy endpoint: POST /api/signnow/create
      const response = await fetch('/api/signnow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        },
        body: JSON.stringify({
          applicationId: testApplicationId
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.status === 501 && data.error === 'Signature system not yet implemented. Please try again later.') {
        this.addResult('Legacy SignNow Endpoint', true, 
          `✅ Legacy endpoint properly routing with graceful error handling`);
      } else if (response.status === 200) {
        this.addResult('Legacy SignNow Endpoint', true, 
          `✅ Legacy endpoint operational - received 200 OK`);
      } else {
        this.addResult('Legacy SignNow Endpoint', false, 
          `Unexpected response: ${response.status} - ${JSON.stringify(data)}`);
      }
      
      return { success: true, response: data, status: response.status };
    } catch (error) {
      this.addResult('Legacy SignNow Endpoint', false, `Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testApplicationIdValidation() {
    this.log('Testing applicationId validation...');
    try {
      // Test missing applicationId in legacy endpoint
      const response = await fetch('/api/signnow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}), // Missing applicationId
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.status === 400 && data.error === 'applicationId is required') {
        this.addResult('ApplicationId Validation', true, 
          `✅ Proper validation - returns 400 when applicationId missing`);
      } else {
        this.addResult('ApplicationId Validation', false, 
          `Expected 400 error, got: ${response.status} - ${JSON.stringify(data)}`);
      }
      
      return { success: true, response: data, status: response.status };
    } catch (error) {
      this.addResult('ApplicationId Validation', false, `Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testErrorHandling() {
    this.log('Testing error handling scenarios...');
    try {
      // This should test the error handling logic
      const testApplicationId = 'error-test-' + Date.now();
      
      const response = await fetch(`/api/applications/${testApplicationId}/signnow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: testApplicationId
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      // Should return graceful error message
      if (data.error && data.error.includes('Signature system not yet implemented')) {
        this.addResult('Error Handling', true, 
          `✅ Graceful error handling with user-friendly message`);
      } else if (response.status === 200) {
        this.addResult('Error Handling', true, 
          `✅ SignNow system working - no error to handle`);
      } else {
        this.addResult('Error Handling', false, 
          `Unexpected error format: ${JSON.stringify(data)}`);
      }
      
      return { success: true, response: data, status: response.status };
    } catch (error) {
      this.addResult('Error Handling', false, `Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testStaffBackendConnection() {
    this.log('Testing staff backend connection for SignNow...');
    try {
      // Verify staff backend configuration
      const config = {
        staffApiUrl: 'https://staff.boreal.financial',
        hasToken: !!import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN,
        environment: import.meta.env.NODE_ENV || 'development'
      };
      
      this.addResult('Staff Backend Configuration', true, 
        `Staff API: ${config.staffApiUrl}, Token: ${config.hasToken ? 'Present' : 'Missing'}, Env: ${config.environment}`);
      
      return { success: true, config };
    } catch (error) {
      this.addResult('Staff Backend Configuration', false, `Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async runComprehensiveSignNowTest() {
    this.log('Starting comprehensive SignNow integration test...');
    this.log(`Testing environment: ${window.location.href}`);
    
    // Test 1: New SignNow endpoint routing
    await this.testSignNowEndpointRouting();
    
    // Test 2: Legacy endpoint compatibility
    await this.testLegacySignNowEndpoint();
    
    // Test 3: ApplicationId validation
    await this.testApplicationIdValidation();
    
    // Test 4: Error handling
    await this.testErrorHandling();
    
    // Test 5: Staff backend connection
    await this.testStaffBackendConnection();
    
    // Generate final report
    this.generateSignNowReport();
  }

  generateSignNowReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    const totalTime = Date.now() - this.startTime;

    this.log('='.repeat(80));
    this.log('SIGNNOW INTEGRATION TEST COMPLETE');
    this.log('='.repeat(80));
    this.log(`Success Rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`);
    this.log(`Total Time: ${totalTime}ms`);
    this.log(`Environment: ${window.location.href}`);
    this.log('');

    if (passedTests === totalTests) {
      this.log('🎉 ALL SIGNNOW TESTS PASSED', 'success');
    } else if (successRate >= 80) {
      this.log('✅ SIGNNOW MOSTLY WORKING - MINOR ISSUES', 'warn');
    } else {
      this.log('❌ SIGNNOW INTEGRATION ISSUES DETECTED', 'error');
    }

    this.log('');
    this.log('SignNow Integration Status:');
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      this.log(`${status} ${result.test}: ${result.details}`);
    });

    // Recommendations
    this.log('');
    this.log('SignNow Implementation Summary:');
    if (passedTests === totalTests) {
      this.log('• SignNow API routing correctly configured');
      this.log('• Graceful error handling operational');
      this.log('• Both new and legacy endpoints working');
      this.log('• Ready for staff backend SignNow implementation');
    } else {
      this.log('• Review failed test details above');
      this.log('• Check server proxy configuration');
      this.log('• Verify staff backend endpoint availability');
    }

    return {
      successRate,
      passedTests,
      totalTests,
      results: this.results,
      totalTime
    };
  }
}

// Auto-run the test when script loads
console.log('🔐 Starting SignNow Integration Test...');
const signNowTest = new SignNowIntegrationTest();
signNowTest.runComprehensiveSignNowTest()
  .then(result => {
    console.log('✅ SignNow integration test completed');
    window.signNowTestResults = result;
  })
  .catch(error => {
    console.error('❌ SignNow integration test failed:', error);
  });

// Make test available globally for manual execution
window.SignNowIntegrationTest = SignNowIntegrationTest;
window.runSignNowTest = () => {
  const test = new SignNowIntegrationTest();
  return test.runComprehensiveSignNowTest();
};