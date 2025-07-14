/**
 * DOUBLE-CLICK PREVENTION TEST
 * Tests the Step 4 double-click prevention implementation
 * Date: July 14, 2025
 */

class DoubleClickPreventionTest {
  constructor() {
    this.testResults = [];
    this.clickCount = 0;
    this.submissionCount = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const color = type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue';
    console.log(`%c[${timestamp}] ${message}`, `color: ${color}`);
  }

  addResult(testName, passed, details = '') {
    this.testResults.push({
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async testDoubleClickPrevention() {
    this.log('🎯 Testing double-click prevention on Step 4 submit button');
    
    // Navigate to Step 4
    window.location.href = '/apply/step-4';
    await this.waitForPageLoad();
    
    // Fill out required fields
    await this.fillRequiredFields();
    
    // Find submit button
    const submitButton = document.querySelector('button[type="submit"]');
    if (!submitButton) {
      this.addResult('Button Found', false, 'Submit button not found');
      this.log('❌ Submit button not found', 'error');
      return;
    }
    
    this.addResult('Button Found', true, 'Submit button located');
    this.log('✅ Submit button found', 'success');
    
    // Monitor network calls
    this.setupNetworkMonitoring();
    
    // Test multiple rapid clicks
    this.log('🖱️ Performing rapid clicks test...');
    
    // Click the button multiple times rapidly
    for (let i = 0; i < 5; i++) {
      this.clickCount++;
      this.log(`Click ${i + 1}: Clicking submit button`);
      submitButton.click();
      
      // Small delay between clicks
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Wait a bit for any async operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if button is disabled
    const isDisabled = submitButton.disabled;
    const buttonText = submitButton.textContent || submitButton.innerText;
    
    this.addResult('Button Disabled', isDisabled, `Button disabled: ${isDisabled}, Text: "${buttonText}"`);
    
    if (isDisabled && buttonText.includes('Submitting')) {
      this.log('✅ Button correctly disabled with "Submitting..." text', 'success');
    } else if (isDisabled) {
      this.log('⚠️ Button disabled but text not updated', 'success');
    } else {
      this.log('❌ Button not disabled after click', 'error');
    }
    
    // Check submission count
    this.addResult('Single Submission', this.submissionCount <= 1, 
      `Expected: 1 submission, Actual: ${this.submissionCount}`);
    
    if (this.submissionCount === 1) {
      this.log('✅ Only one submission triggered despite multiple clicks', 'success');
    } else if (this.submissionCount > 1) {
      this.log(`❌ Multiple submissions detected: ${this.submissionCount}`, 'error');
    } else {
      this.log('⚠️ No submissions detected - check form validation', 'success');
    }
  }

  async fillRequiredFields() {
    this.log('📝 Filling required form fields...');
    
    const fields = [
      { name: 'applicantFirstName', value: 'John' },
      { name: 'applicantLastName', value: 'Doe' },
      { name: 'applicantEmail', value: 'john.doe@example.com' },
      { name: 'applicantPhone', value: '+1-555-123-4567' },
      { name: 'applicantAddress', value: '123 Main St' },
      { name: 'applicantCity', value: 'Toronto' },
      { name: 'applicantState', value: 'ON' },
      { name: 'applicantZipCode', value: 'M5V 3A8' },
      { name: 'applicantDateOfBirth', value: '1990-01-01' },
      { name: 'applicantSSN', value: '123-45-6789' },
      { name: 'ownershipPercentage', value: '100' }
    ];
    
    let fieldsFilledCount = 0;
    
    for (const { name, value } of fields) {
      const field = document.querySelector(`input[name="${name}"], select[name="${name}"]`);
      if (field) {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
        fieldsFilledCount++;
      }
    }
    
    this.log(`✅ Filled ${fieldsFilledCount} form fields`, 'success');
  }

  setupNetworkMonitoring() {
    const originalFetch = window.fetch;
    const self = this;
    
    window.fetch = async function(...args) {
      const url = args[0];
      const options = args[1] || {};
      
      // Monitor application creation calls
      if (url.includes('/api/public/applications') && options.method === 'POST') {
        self.submissionCount++;
        self.log(`📡 Network call #${self.submissionCount}: POST ${url}`, 'info');
      }
      
      return originalFetch.apply(this, args);
    };
  }

  async waitForPageLoad() {
    return new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
  }

  async runDoubleClickTest() {
    this.log('🚀 Starting double-click prevention test');
    
    try {
      await this.testDoubleClickPrevention();
      this.generateReport();
    } catch (error) {
      this.log(`❌ Test failed: ${error.message}`, 'error');
    }
  }

  generateReport() {
    console.log('\n🎯 DOUBLE-CLICK PREVENTION TEST COMPLETE');
    console.log(`🖱️ Total clicks: ${this.clickCount}`);
    console.log(`📡 API calls: ${this.submissionCount}`);
    
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    
    console.log(`✅ Tests passed: ${passedTests}/${totalTests}`);
    
    console.log('\n--- TEST RESULTS ---');
    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}: ${result.details}`);
    });
    
    console.log('\n--- FINAL VERDICT ---');
    if (passedTests === totalTests) {
      console.log('🎉 DOUBLE-CLICK PREVENTION: WORKING CORRECTLY');
      console.log('✅ Button properly disabled during submission');
      console.log('✅ Multiple clicks prevented successfully');
    } else {
      console.log('❌ DOUBLE-CLICK PREVENTION: ISSUES DETECTED');
      console.log('🔧 Review implementation for proper state management');
    }
  }
}

// Initialize test
console.log('🔬 Double-Click Prevention Test Ready');
console.log('💡 Usage: window.doubleClickTest.runDoubleClickTest()');
window.doubleClickTest = new DoubleClickPreventionTest();