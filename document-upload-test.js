/**
 * DOCUMENT UPLOAD API TEST
 * Tests the complete document upload workflow to staff backend
 * Date: July 14, 2025
 */

class DocumentUploadTest {
  constructor() {
    this.testResults = [];
    this.apiBaseUrl = '/api';
    this.applicationId = localStorage.getItem('applicationId') || '1a41a431-0f82-40ac-be3a-09643fe37169';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const color = type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'orange' : 'blue';
    console.log(`%c[${timestamp}] ${message}`, `color: ${color}`);
  }

  addResult(test, status, details = '') {
    this.testResults.push({
      test,
      status,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Create a test file blob for upload testing
  createTestFile(fileName = 'test-document.pdf', type = 'application/pdf') {
    const content = 'This is a test document for upload verification';
    const blob = new Blob([content], { type });
    return new File([blob], fileName, { type });
  }

  // Test 1: Document upload endpoint availability
  async testUploadEndpointAvailability() {
    this.log('🔍 Testing document upload endpoint availability');
    
    try {
      // Test the Step 5 upload endpoint structure
      const testResponse = await fetch(`${this.apiBaseUrl}/public/documents/${this.applicationId}`, {
        method: 'OPTIONS'
      });
      
      if (testResponse.status === 200 || testResponse.status === 204) {
        this.addResult('Upload Endpoint Availability', 'pass', 'Endpoint responds to OPTIONS request');
        this.log('✅ Upload endpoint is available', 'success');
      } else {
        this.addResult('Upload Endpoint Availability', 'warning', `OPTIONS returned ${testResponse.status}`);
        this.log(`⚠️ Upload endpoint OPTIONS: ${testResponse.status}`, 'warning');
      }
    } catch (error) {
      this.addResult('Upload Endpoint Availability', 'fail', `Network error: ${error.message}`);
      this.log(`❌ Upload endpoint test failed: ${error.message}`, 'error');
    }
  }

  // Test 2: Step 5 document upload (Dynamic Document Requirements)
  async testStep5DocumentUpload() {
    this.log('🔍 Testing Step 5 document upload workflow');
    
    try {
      const testFile = this.createTestFile('bank-statement.pdf');
      const formData = new FormData();
      
      formData.append('document', testFile);
      formData.append('documentType', 'bank_statements');
      
      this.log(`📤 Uploading to: ${this.apiBaseUrl}/public/documents/${this.applicationId}`);
      this.log(`📄 File: ${testFile.name} (${testFile.size} bytes)`);
      this.log(`📋 Document Type: bank_statements`);
      
      const response = await fetch(`${this.apiBaseUrl}/public/documents/${this.applicationId}`, {
        method: 'POST',
        body: formData
        // No Authorization headers for public upload
      });
      
      this.log(`📡 Response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const responseData = await response.json();
        this.addResult('Step 5 Document Upload', 'pass', `Upload successful: ${JSON.stringify(responseData)}`);
        this.log('✅ Step 5 document upload successful', 'success');
        this.log(`✅ Response data: ${JSON.stringify(responseData)}`, 'success');
      } else {
        const errorText = await response.text();
        this.addResult('Step 5 Document Upload', 'fail', `Upload failed: ${response.status} - ${errorText}`);
        this.log(`❌ Step 5 upload failed: ${response.status} - ${errorText}`, 'error');
      }
    } catch (error) {
      this.addResult('Step 5 Document Upload', 'fail', `Network error: ${error.message}`);
      this.log(`❌ Step 5 upload error: ${error.message}`, 'error');
    }
  }

  // Test 3: Legacy upload endpoint (for comparison)
  async testLegacyUploadEndpoint() {
    this.log('🔍 Testing legacy upload endpoint');
    
    try {
      const testFile = this.createTestFile('financial-statement.pdf');
      const formData = new FormData();
      
      formData.append('document', testFile);
      formData.append('documentType', 'financial_statements');
      
      this.log(`📤 Uploading to: ${this.apiBaseUrl}/public/upload/${this.applicationId}`);
      
      const response = await fetch(`${this.apiBaseUrl}/public/upload/${this.applicationId}`, {
        method: 'POST',
        body: formData
      });
      
      this.log(`📡 Legacy endpoint response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const responseData = await response.json();
        this.addResult('Legacy Upload Endpoint', 'pass', `Legacy upload successful: ${JSON.stringify(responseData)}`);
        this.log('✅ Legacy upload endpoint working', 'success');
      } else {
        const errorText = await response.text();
        this.addResult('Legacy Upload Endpoint', 'fail', `Legacy upload failed: ${response.status} - ${errorText}`);
        this.log(`❌ Legacy upload failed: ${response.status} - ${errorText}`, 'error');
      }
    } catch (error) {
      this.addResult('Legacy Upload Endpoint', 'fail', `Network error: ${error.message}`);
      this.log(`❌ Legacy upload error: ${error.message}`, 'error');
    }
  }

  // Test 4: Staff backend connectivity for uploads
  async testStaffBackendConnectivity() {
    this.log('🔍 Testing staff backend upload connectivity');
    
    try {
      // Test direct staff backend upload endpoint
      const response = await fetch(`${this.apiBaseUrl}/public/lenders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.addResult('Staff Backend Connectivity', 'pass', `Staff backend responsive: ${data.length} products`);
        this.log(`✅ Staff backend connected: ${data.length} products available`, 'success');
      } else {
        this.addResult('Staff Backend Connectivity', 'warning', `Staff backend status: ${response.status}`);
        this.log(`⚠️ Staff backend status: ${response.status}`, 'warning');
      }
    } catch (error) {
      this.addResult('Staff Backend Connectivity', 'fail', `Staff backend unreachable: ${error.message}`);
      this.log(`❌ Staff backend unreachable: ${error.message}`, 'error');
    }
  }

  // Test 5: File type validation
  async testFileTypeValidation() {
    this.log('🔍 Testing file type validation');
    
    const testFiles = [
      { name: 'valid-document.pdf', type: 'application/pdf', shouldPass: true },
      { name: 'valid-image.jpg', type: 'image/jpeg', shouldPass: true },
      { name: 'invalid-script.js', type: 'application/javascript', shouldPass: false }
    ];
    
    for (const testFile of testFiles) {
      try {
        const file = this.createTestFile(testFile.name, testFile.type);
        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', 'test_validation');
        
        const response = await fetch(`${this.apiBaseUrl}/public/documents/${this.applicationId}`, {
          method: 'POST',
          body: formData
        });
        
        const passed = testFile.shouldPass ? response.ok : !response.ok;
        const status = passed ? 'pass' : 'fail';
        
        this.addResult(`File Type Validation (${testFile.name})`, status, 
          `Expected ${testFile.shouldPass ? 'success' : 'failure'}, got ${response.status}`);
        
        if (passed) {
          this.log(`✅ File validation correct for ${testFile.name}`, 'success');
        } else {
          this.log(`❌ File validation incorrect for ${testFile.name}`, 'error');
        }
      } catch (error) {
        this.addResult(`File Type Validation (${testFile.name})`, 'fail', `Error: ${error.message}`);
        this.log(`❌ File validation error for ${testFile.name}: ${error.message}`, 'error');
      }
    }
  }

  // Test 6: Multiple file upload
  async testMultipleFileUpload() {
    this.log('🔍 Testing multiple file upload');
    
    try {
      const files = [
        this.createTestFile('statement-1.pdf'),
        this.createTestFile('statement-2.pdf'),
        this.createTestFile('statement-3.pdf')
      ];
      
      const formData = new FormData();
      files.forEach(file => formData.append('document', file));
      formData.append('documentType', 'bank_statements');
      
      const response = await fetch(`${this.apiBaseUrl}/public/documents/${this.applicationId}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const responseData = await response.json();
        this.addResult('Multiple File Upload', 'pass', `${files.length} files uploaded successfully`);
        this.log(`✅ Multiple file upload successful: ${files.length} files`, 'success');
      } else {
        const errorText = await response.text();
        this.addResult('Multiple File Upload', 'fail', `Multiple upload failed: ${response.status} - ${errorText}`);
        this.log(`❌ Multiple upload failed: ${response.status}`, 'error');
      }
    } catch (error) {
      this.addResult('Multiple File Upload', 'fail', `Error: ${error.message}`);
      this.log(`❌ Multiple upload error: ${error.message}`, 'error');
    }
  }

  // Run complete document upload test suite
  async runCompleteUploadTest() {
    this.log('🚀 Starting Document Upload Test Suite');
    this.log(`📋 Application ID: ${this.applicationId}`);
    this.log(`🌐 API Base URL: ${this.apiBaseUrl}`);
    
    await this.testUploadEndpointAvailability();
    await this.testStaffBackendConnectivity();
    await this.testStep5DocumentUpload();
    await this.testLegacyUploadEndpoint();
    await this.testFileTypeValidation();
    await this.testMultipleFileUpload();
    
    this.generateFinalReport();
  }

  generateFinalReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'pass').length;
    const failedTests = this.testResults.filter(r => r.status === 'fail').length;
    const warningTests = this.testResults.filter(r => r.status === 'warning').length;
    
    console.log('\n📊 DOCUMENT UPLOAD TEST RESULTS');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${failedTests}/${totalTests}`);
    console.log(`⚠️ Warnings: ${warningTests}/${totalTests}`);
    
    console.log('\n--- DETAILED RESULTS ---');
    this.testResults.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`${icon} ${result.test}: ${result.details}`);
    });
    
    const uploadScore = Math.round((passedTests / totalTests) * 100);
    console.log(`\n📈 UPLOAD FUNCTIONALITY SCORE: ${uploadScore}%`);
    
    if (failedTests === 0 && uploadScore >= 90) {
      console.log('🎉 DOCUMENT UPLOAD SYSTEM FULLY OPERATIONAL');
    } else if (failedTests <= 2 && uploadScore >= 70) {
      console.log('⚠️ DOCUMENT UPLOAD WORKING WITH MINOR ISSUES');
    } else {
      console.log('❌ DOCUMENT UPLOAD SYSTEM NEEDS ATTENTION');
    }
    
    return {
      score: uploadScore,
      passed: passedTests,
      failed: failedTests,
      warnings: warningTests,
      working: uploadScore >= 70
    };
  }
}

// Initialize upload test
console.log('📁 Document Upload Test Suite Ready');
console.log('💡 Usage: window.documentUploadTest.runCompleteUploadTest()');
window.documentUploadTest = new DocumentUploadTest();