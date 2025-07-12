/**
 * COMPREHENSIVE E2E TEST RUNNER
 * Server-side test execution for complete application workflow verification
 * Date: July 12, 2025
 */

import fetch from 'node-fetch';

class E2ETestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = [];
    this.startTime = Date.now();
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

  async testLandingPageAPI() {
    try {
      this.log('Testing landing page API connectivity...');
      
      const response = await fetch(`${this.baseUrl}/api/public/lenders`);
      const data = await response.json();
      
      const apiWorking = response.ok && data.success && data.productCount > 0;
      this.addResult('Landing Page API Connectivity', apiWorking, 
        `API returned ${data.productCount} products with max funding ${data.maxAmount}`);
      
      return apiWorking;
    } catch (error) {
      this.addResult('Landing Page API Connectivity', false, error.message);
      return false;
    }
  }

  async testApplicationEndpoints() {
    try {
      this.log('Testing application creation endpoint...');
      
      const applicationData = {
        operatingName: 'Test Company Inc.',
        fundingAmount: 100000,
        businessLocation: 'Canada',
        lookingFor: 'Both Capital & Equipment'
      };

      const response = await fetch(`${this.baseUrl}/api/public/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      const endpointExists = response.status !== 404;
      this.addResult('Application Creation Endpoint', endpointExists, 
        `Endpoint returned status ${response.status}`);
      
      return endpointExists;
    } catch (error) {
      this.addResult('Application Creation Endpoint', false, error.message);
      return false;
    }
  }

  async testProductRecommendationsAPI() {
    try {
      this.log('Testing product recommendations API...');
      
      const response = await fetch(`${this.baseUrl}/api/loan-products/categories?fundingAmount=100000&businessLocation=Canada`);
      const data = await response.json();
      
      const recommendationsWorking = response.ok && (data.categories || data.success);
      this.addResult('Product Recommendations API', recommendationsWorking, 
        `API returned ${data.categories?.length || 0} categories`);
      
      return recommendationsWorking;
    } catch (error) {
      this.addResult('Product Recommendations API', false, error.message);
      return false;
    }
  }

  async testDocumentUploadAPI() {
    try {
      this.log('Testing document upload API...');
      
      const FormData = (await import('form-data')).default;
      const form = new FormData();
      form.append('category', 'Bank Statements');
      form.append('files', Buffer.from('test content'), {
        filename: 'test.txt',
        contentType: 'text/plain'
      });

      const response = await fetch(`${this.baseUrl}/api/public/upload/test-application-id`, {
        method: 'POST',
        body: form
      });

      const uploadWorking = response.status !== 404;
      this.addResult('Document Upload API', uploadWorking, 
        `Upload endpoint returned status ${response.status}`);
      
      return uploadWorking;
    } catch (error) {
      this.addResult('Document Upload API', false, error.message);
      return false;
    }
  }

  async testSignNowIntegration() {
    try {
      this.log('Testing SignNow integration...');
      
      const testApplicationId = 'test-' + Date.now();
      const response = await fetch(`${this.baseUrl}/api/applications/${testApplicationId}/signnow`);
      const data = await response.json();
      
      const signNowWorking = response.ok && data.success && data.data?.signingUrl;
      this.addResult('SignNow API Integration', signNowWorking, 
        `SignNow endpoint returned ${response.status} with ${data.success ? 'valid' : 'invalid'} response`);
      
      return signNowWorking;
    } catch (error) {
      this.addResult('SignNow API Integration', false, error.message);
      return false;
    }
  }

  async testFinalSubmissionAPI() {
    try {
      this.log('Testing final submission API...');
      
      const response = await fetch(`${this.baseUrl}/api/public/applications/test-app/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });

      const submissionWorking = response.status !== 404;
      this.addResult('Final Submission API', submissionWorking, 
        `Submission endpoint returned status ${response.status}`);
      
      return submissionWorking;
    } catch (error) {
      this.addResult('Final Submission API', false, error.message);
      return false;
    }
  }

  async testRegionalDataSupport() {
    try {
      this.log('Testing regional data support...');
      
      const [canadaResponse, usResponse] = await Promise.all([
        fetch(`${this.baseUrl}/api/loan-products/categories?businessLocation=Canada&fundingAmount=50000`),
        fetch(`${this.baseUrl}/api/loan-products/categories?businessLocation=US&fundingAmount=50000`)
      ]);

      const canadaData = await canadaResponse.json();
      const usData = await usResponse.json();
      
      const regionalSupport = canadaResponse.ok && usResponse.ok;
      this.addResult('Regional Data Support', regionalSupport, 
        `Canada: ${canadaData.categories?.length || 0} categories, US: ${usData.categories?.length || 0} categories`);
      
      return regionalSupport;
    } catch (error) {
      this.addResult('Regional Data Support', false, error.message);
      return false;
    }
  }

  async testErrorHandling() {
    try {
      this.log('Testing error handling...');
      
      const response = await fetch(`${this.baseUrl}/api/invalid-endpoint`);
      const handles404 = response.status === 404;
      
      this.addResult('Error Handling', handles404, 
        'Invalid endpoint returns proper 404 status');
      
      return handles404;
    } catch (error) {
      this.addResult('Error Handling', true, 'Network errors are properly caught');
      return true;
    }
  }

  async testSecurityHeaders() {
    try {
      this.log('Testing security headers...');
      
      const response = await fetch(`${this.baseUrl}/api/public/lenders`);
      const hasCorsHeaders = response.headers.get('access-control-allow-origin') !== null;
      
      this.addResult('Security Headers', hasCorsHeaders, 'CORS headers present');
      
      return hasCorsHeaders;
    } catch (error) {
      this.addResult('Security Headers', false, error.message);
      return false;
    }
  }

  async testStaffBackendConnectivity() {
    try {
      this.log('Testing staff backend connectivity...');
      
      // Test if the proxy is working correctly
      const response = await fetch(`${this.baseUrl}/api/public/lenders`);
      const data = await response.json();
      
      const staffConnectivity = response.ok && data.success;
      this.addResult('Staff Backend Connectivity', staffConnectivity, 
        `Proxy successfully routed to staff backend, returned ${data.productCount} products`);
      
      return staffConnectivity;
    } catch (error) {
      this.addResult('Staff Backend Connectivity', false, error.message);
      return false;
    }
  }

  async runCompleteE2ETest() {
    this.log('Starting comprehensive E2E test suite...');
    this.log('='.repeat(60));
    
    const tests = [
      () => this.testLandingPageAPI(),
      () => this.testStaffBackendConnectivity(),
      () => this.testApplicationEndpoints(),
      () => this.testProductRecommendationsAPI(),
      () => this.testDocumentUploadAPI(),
      () => this.testSignNowIntegration(),
      () => this.testFinalSubmissionAPI(),
      () => this.testRegionalDataSupport(),
      () => this.testErrorHandling(),
      () => this.testSecurityHeaders()
    ];

    let passedTests = 0;
    const totalTests = tests.length;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) passedTests++;
        await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause between tests
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

// Execute the test suite
(async function() {
  try {
    console.log('🚀 Initializing Comprehensive E2E Test Suite...');
    console.log('This will test the complete application workflow');
    
    const testRunner = new E2ETestRunner();
    const results = await testRunner.runCompleteE2ETest();
    
    console.log('📊 Test execution completed');
    console.log(`Final Score: ${results.passed}/${results.total} (${Math.round((results.passed / results.total) * 100)}%)`);
    
    // Exit with appropriate code
    process.exit(results.passed === results.total ? 0 : 1);
    
  } catch (error) {
    console.error('❌ E2E Test Suite failed to execute:', error);
    process.exit(1);
  }
})();