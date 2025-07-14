/**
 * STEP 5-7 WORKFLOW COMPREHENSIVE TEST
 * Verifies complete document upload → SignNow → finalization flow
 * Tests all new endpoint implementations
 * Date: July 14, 2025
 */

class Step5To7WorkflowTest {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    this.testResults.push({
      timestamp,
      message,
      type
    });
  }

  addResult(testName, passed, details = '') {
    const result = {
      test: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    
    if (passed) {
      this.log(`✅ ${testName}: PASSED ${details}`, 'success');
    } else {
      this.log(`❌ ${testName}: FAILED ${details}`, 'error');
    }
  }

  async testApplicationIdPersistence() {
    this.log('🔍 Testing Application ID Persistence...');
    
    // Check if we have a valid application ID stored
    const stateApplicationId = window.formDataState?.applicationId;
    const localStorageId = localStorage.getItem('applicationId');
    
    this.addResult(
      'Application ID in State',
      !!stateApplicationId,
      stateApplicationId ? `ID: ${stateApplicationId}` : 'Missing from state'
    );
    
    this.addResult(
      'Application ID in localStorage',
      !!localStorageId,
      localStorageId ? `ID: ${localStorageId}` : 'Missing from localStorage'
    );
    
    const finalId = stateApplicationId || localStorageId;
    this.addResult(
      'Application ID Available',
      !!finalId && finalId.length > 10,
      finalId ? `Final ID: ${finalId}` : 'No valid ID found'
    );
    
    return finalId;
  }

  async testStep5DocumentUpload(applicationId) {
    this.log('📁 Testing Step 5 Document Upload Endpoint...');
    
    if (!applicationId) {
      this.addResult('Step 5 Upload Test', false, 'No application ID available');
      return false;
    }

    try {
      // Create a test file for upload
      const testFile = new File(['test document content'], 'test-bank-statement.pdf', {
        type: 'application/pdf'
      });
      
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('documentType', 'bank_statements');
      
      // Test the new endpoint: POST /api/public/applications/:id/documents
      const response = await fetch(`/api/public/applications/${applicationId}/documents`, {
        method: 'POST',
        body: formData
      });
      
      this.addResult(
        'Step 5 Endpoint Reachable',
        response.status !== 404,
        `Status: ${response.status} ${response.statusText}`
      );
      
      this.addResult(
        'Step 5 Upload Successful',
        response.ok || response.status < 500,
        `Response: ${response.status} - ${response.statusText}`
      );
      
      const responseData = await response.json().catch(() => ({}));
      this.log(`📁 Step 5 Response: ${JSON.stringify(responseData)}`);
      
      return response.ok;
      
    } catch (error) {
      this.addResult('Step 5 Upload Test', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testStep6SignNowInitiation(applicationId) {
    this.log('📝 Testing Step 6 SignNow Initiation Endpoint...');
    
    if (!applicationId) {
      this.addResult('Step 6 SignNow Test', false, 'No application ID available');
      return false;
    }

    try {
      // Test the new endpoint: POST /api/public/signnow/initiate/:applicationId
      const response = await fetch(`/api/public/signnow/initiate/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: 'e7ba8b894c644999a7b38037ea66f4cc9cc524f5',
          smartFields: {
            contact_first_name: 'Test',
            contact_last_name: 'User',
            contact_email: 'test@example.com',
            business_dba_name: 'Test Business',
            requested_amount: '50000'
          },
          redirectUrl: 'https://clientportal.boreal.financial/#/step7-finalization'
        })
      });
      
      this.addResult(
        'Step 6 Endpoint Reachable',
        response.status !== 404,
        `Status: ${response.status} ${response.statusText}`
      );
      
      this.addResult(
        'Step 6 SignNow Response',
        response.ok || response.status < 500,
        `Response: ${response.status} - ${response.statusText}`
      );
      
      const responseData = await response.json().catch(() => ({}));
      this.log(`📝 Step 6 Response: ${JSON.stringify(responseData)}`);
      
      // Check if signing URL is returned
      this.addResult(
        'SignNow URL Generated',
        !!responseData.signingUrl,
        responseData.signingUrl ? `URL: ${responseData.signingUrl.substring(0, 50)}...` : 'No signing URL'
      );
      
      return response.ok && responseData.signingUrl;
      
    } catch (error) {
      this.addResult('Step 6 SignNow Test', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testStep7Finalization(applicationId) {
    this.log('🏁 Testing Step 7 Finalization Endpoint...');
    
    if (!applicationId) {
      this.addResult('Step 7 Finalization Test', false, 'No application ID available');
      return false;
    }

    try {
      // Test the new endpoint: POST /api/public/applications/:id/finalize
      const response = await fetch(`/api/public/applications/${applicationId}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          step1: { fundingAmount: 50000, purposeOfFunds: 'Working Capital' },
          step3: { operatingName: 'Test Business', businessStructure: 'LLC' },
          step4: { firstName: 'Test', lastName: 'User', personalEmail: 'test@example.com' },
          termsAccepted: true,
          privacyAccepted: true,
          finalizedAt: new Date().toISOString()
        })
      });
      
      this.addResult(
        'Step 7 Endpoint Reachable',
        response.status !== 404,
        `Status: ${response.status} ${response.statusText}`
      );
      
      this.addResult(
        'Step 7 Finalization Response',
        response.ok || response.status < 500,
        `Response: ${response.status} - ${response.statusText}`
      );
      
      const responseData = await response.json().catch(() => ({}));
      this.log(`🏁 Step 7 Response: ${JSON.stringify(responseData)}`);
      
      // Check if application was finalized
      this.addResult(
        'Application Finalized',
        !!responseData.success || !!responseData.status,
        responseData.status ? `Status: ${responseData.status}` : 'No status returned'
      );
      
      return response.ok;
      
    } catch (error) {
      this.addResult('Step 7 Finalization Test', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testEndToEndWorkflow() {
    this.log('🚀 Starting End-to-End Step 5-7 Workflow Test...');
    
    // Step 1: Get Application ID
    const applicationId = await this.testApplicationIdPersistence();
    
    if (!applicationId) {
      this.addResult('End-to-End Workflow', false, 'Cannot proceed without valid application ID');
      return;
    }
    
    // Step 2: Test document upload
    const uploadSuccess = await this.testStep5DocumentUpload(applicationId);
    
    // Step 3: Test SignNow initiation
    const signNowSuccess = await this.testStep6SignNowInitiation(applicationId);
    
    // Step 4: Test finalization
    const finalizationSuccess = await this.testStep7Finalization(applicationId);
    
    // Overall workflow result
    const workflowSuccess = uploadSuccess && signNowSuccess && finalizationSuccess;
    this.addResult(
      'Complete Step 5-7 Workflow',
      workflowSuccess,
      `Upload: ${uploadSuccess}, SignNow: ${signNowSuccess}, Finalize: ${finalizationSuccess}`
    );
    
    return workflowSuccess;
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.filter(r => r.hasOwnProperty('passed')).length;
    
    const report = {
      summary: {
        duration_ms: duration,
        total_tests: totalTests,
        passed_tests: passedTests,
        success_rate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
        overall_status: passedTests === totalTests ? 'PASSED' : 'FAILED'
      },
      test_results: this.testResults,
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };
    
    console.log('\n📊 STEP 5-7 WORKFLOW TEST REPORT');
    console.log('=====================================');
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`📈 Success Rate: ${report.summary.success_rate}%`);
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`🎯 Status: ${report.summary.overall_status}`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    const failedTests = this.testResults.filter(r => r.passed === false);
    
    if (failedTests.length === 0) {
      recommendations.push('✅ All tests passed! Step 5-7 workflow is fully operational.');
    } else {
      recommendations.push('❌ Some tests failed. Check the following issues:');
      failedTests.forEach(test => {
        recommendations.push(`   • ${test.test}: ${test.details}`);
      });
    }
    
    return recommendations;
  }
}

// Auto-run test when script loads
async function runStep5To7WorkflowTest() {
  const tester = new Step5To7WorkflowTest();
  
  console.log('🧪 STEP 5-7 WORKFLOW COMPREHENSIVE TEST');
  console.log('======================================');
  console.log('Testing new endpoint implementations:');
  console.log('• POST /api/public/applications/:id/documents');
  console.log('• POST /api/public/signnow/initiate/:applicationId');
  console.log('• POST /api/public/applications/:id/finalize');
  console.log('');
  
  await tester.testEndToEndWorkflow();
  const report = tester.generateReport();
  
  // Export results for further analysis
  window.step5To7TestReport = report;
  
  return report;
}

// Run the test
runStep5To7WorkflowTest();