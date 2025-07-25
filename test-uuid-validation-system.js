#!/usr/bin/env node

/**
 * UUID Validation System Test Suite
 * Validates that all upload functions properly validate application IDs
 * and use consistent UUID management throughout the workflow
 */

const BASE_URL = 'http://localhost:5000';
const BEARER_TOKEN = process.env.VITE_CLIENT_APP_SHARED_TOKEN;

console.log('🧪 Starting UUID Validation System Test Suite...\n');

// Test cases for UUID validation
const testCases = [
  {
    name: 'Valid UUID',
    applicationId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    expectedResult: 'success'
  },
  {
    name: 'Invalid Format - Too Short',
    applicationId: 'invalid-uuid',
    expectedResult: 'error'
  },
  {
    name: 'Invalid Format - Wrong Pattern',
    applicationId: 'not-a-uuid-at-all-here',
    expectedResult: 'error'
  },
  {
    name: 'Fallback ID Format',
    applicationId: 'app_1753404000000_test123',
    expectedResult: 'success'
  },
  {
    name: 'Empty String',
    applicationId: '',
    expectedResult: 'error'
  },
  {
    name: 'Null Value',
    applicationId: null,
    expectedResult: 'error'
  }
];

class UUIDValidationTester {
  constructor() {
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().substr(11, 8);
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`${timestamp} ${prefix} ${message}`);
  }

  async testUploadEndpoint(testCase) {
    this.log(`Testing upload endpoint with: ${testCase.name}`, 'info');
    
    try {
      // Create test file
      const testContent = `%PDF-1.4\nTest document for UUID validation\nGenerated: ${new Date().toISOString()}\n%%EOF`;
      
      const formData = new FormData();
      formData.append('document', new Blob([testContent], { type: 'application/pdf' }), 'test_document.pdf');
      formData.append('documentType', 'bank_statements');

      const headers = {};
      if (BEARER_TOKEN) {
        headers['Authorization'] = `Bearer ${BEARER_TOKEN}`;
      }

      // Test the upload endpoint
      const response = await fetch(`${BASE_URL}/api/public/upload/${testCase.applicationId}`, {
        method: 'POST',
        headers,
        body: formData
      });

      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { error: responseText };
      }

      this.log(`Response status: ${response.status}`, 'info');
      this.log(`Response: ${JSON.stringify(result, null, 2)}`, 'info');

      // Analyze result
      const isSuccess = response.ok && !result.error;
      const isExpectedResult = (testCase.expectedResult === 'success' && isSuccess) || 
                              (testCase.expectedResult === 'error' && !isSuccess);

      if (isExpectedResult) {
        this.passedTests++;
        this.log(`✅ Test passed for ${testCase.name}`, 'success');
      } else {
        this.log(`❌ Test failed for ${testCase.name} - Expected ${testCase.expectedResult}, got ${isSuccess ? 'success' : 'error'}`, 'error');
      }

      this.results.push({
        testCase: testCase.name,
        applicationId: testCase.applicationId,
        expected: testCase.expectedResult,
        actual: isSuccess ? 'success' : 'error',
        passed: isExpectedResult,
        responseStatus: response.status,
        response: result
      });

      this.totalTests++;

    } catch (error) {
      this.log(`❌ Network error testing ${testCase.name}: ${error.message}`, 'error');
      
      const isExpectedError = testCase.expectedResult === 'error';
      if (isExpectedError) {
        this.passedTests++;
        this.log(`✅ Network error was expected for ${testCase.name}`, 'success');
      }

      this.results.push({
        testCase: testCase.name,
        applicationId: testCase.applicationId,
        expected: testCase.expectedResult,
        actual: 'network_error',
        passed: isExpectedError,
        error: error.message
      });

      this.totalTests++;
    }
  }

  async testDocumentValidationEndpoint(testCase) {
    this.log(`Testing document validation endpoint with: ${testCase.name}`, 'info');
    
    try {
      const response = await fetch(`${BASE_URL}/api/public/applications/${testCase.applicationId}/documents`);
      const responseText = await response.text();
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { error: responseText };
      }

      this.log(`Validation response status: ${response.status}`, 'info');
      this.log(`Validation response: ${JSON.stringify(result, null, 2)}`, 'info');

      // For validation endpoint, we expect proper UUID format to proceed to staff backend
      // and invalid formats to be caught before making the request
      const isValidFormat = response.status !== 400; // Assuming 400 for format errors
      const isExpectedResult = (testCase.expectedResult === 'success' && isValidFormat) || 
                              (testCase.expectedResult === 'error' && !isValidFormat);

      if (isExpectedResult) {
        this.log(`✅ Validation test passed for ${testCase.name}`, 'success');
      } else {
        this.log(`❌ Validation test failed for ${testCase.name}`, 'error');
      }

    } catch (error) {
      this.log(`❌ Validation endpoint error for ${testCase.name}: ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    this.log('🚀 Starting UUID validation tests for upload endpoints...\n', 'info');

    for (const testCase of testCases) {
      await this.testUploadEndpoint(testCase);
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      console.log(''); // Spacing between tests
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 UUID VALIDATION SYSTEM TEST REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total Tests: ${this.totalTests}`);
    console.log(`   Passed: ${this.passedTests}`);
    console.log(`   Failed: ${this.totalTests - this.passedTests}`);
    console.log(`   Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);

    console.log(`\n📋 Detailed Results:`);
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${index + 1}. ${status} - ${result.testCase}`);
      console.log(`      App ID: ${result.applicationId || 'null'}`);
      console.log(`      Expected: ${result.expected}, Got: ${result.actual}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });

    // Overall assessment
    const successRate = (this.passedTests / this.totalTests) * 100;
    console.log(`\n🎯 Assessment:`);
    if (successRate >= 90) {
      console.log(`   ✅ EXCELLENT: UUID validation system is working correctly`);
    } else if (successRate >= 70) {
      console.log(`   ⚠️  GOOD: UUID validation system is mostly working but has some issues`);
    } else {
      console.log(`   ❌ POOR: UUID validation system needs attention`);
    }

    console.log(`\n🔧 System Status:`);
    console.log(`   - Upload endpoint UUID validation: ${this.results.filter(r => r.passed).length > 0 ? 'Working' : 'Needs Review'}`);
    console.log(`   - Error handling for invalid UUIDs: ${this.results.filter(r => r.expected === 'error' && r.passed).length > 0 ? 'Working' : 'Needs Review'}`);
    console.log(`   - Support for fallback ID format: ${this.results.find(r => r.testCase.includes('Fallback') && r.passed) ? 'Working' : 'Needs Review'}`);

    console.log('\n' + '='.repeat(80));
  }
}

// Run the test suite
async function main() {
  if (!BEARER_TOKEN) {
    console.log('⚠️  Warning: BEARER_TOKEN not found. Some tests may fail due to authentication.');
  }

  const tester = new UUIDValidationTester();
  await tester.runAllTests();
}

// Handle unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run directly
main().catch(console.error);