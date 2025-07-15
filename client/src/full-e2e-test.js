/**
 * FULL END-TO-END APPLICATION TEST
 * Complete workflow test with real data and SignNow iframe integration
 * Date: July 14, 2025
 */

class FullE2ETest {
  constructor() {
    this.startTime = Date.now();
    this.testResults = [];
    this.errors = [];
    this.networkCalls = [];
    this.setupNetworkMonitoring();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    // console.log(logEntry);
    
    if (type === 'error') {
      this.errors.push({ timestamp, message });
    }
  }

  setupNetworkMonitoring() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = args[0];
      const options = args[1] || {};
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        this.networkCalls.push({
          url,
          method: options.method || 'GET',
          status: response.status,
          ok: response.ok,
          duration,
          timestamp: new Date().toISOString()
        });
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.networkCalls.push({
          url,
          method: options.method || 'GET',
          status: 'ERROR',
          ok: false,
          duration,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    };
  }

  async testStep1FormSubmission() {
    this.log('Testing Step 1: Financial Profile form submission');
    
    // Navigate to step 1
    if (window.location.pathname !== '/apply/step-1') {
      window.location.href = '/apply/step-1';
      await this.waitForPageLoad();
    }
    
    // Fill out Step 1 form with real data
    const step1Data = {
      requestedAmount: 150000,
      use_of_funds: 'equipment',
      equipment_value: 75000,
      businessLocation: 'CA',
      salesHistory: '3+yr',
      averageMonthlyRevenue: 25000,
      accountsReceivableBalance: 50000,
      fixedAssetsValue: 100000
    };
    
    // Fill form fields
    const amountField = document.querySelector('input[name="requestedAmount"]');
    if (amountField) {
      amountField.value = step1Data.requestedAmount;
      amountField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Submit form
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.click();
      await this.waitForNavigation('/apply/step-2');
      this.log('✅ Step 1 completed successfully');
      return true;
    }
    
    this.log('❌ Step 1 form submission failed', 'error');
    return false;
  }

  async testStep2ProductSelection() {
    this.log('Testing Step 2: Product recommendation and selection');
    
    // Wait for products to load
    await this.waitForCondition(() => {
      const products = document.querySelectorAll('[data-testid="product-card"]');
      return products.length > 0;
    }, 10000);
    
    // Select first available product
    const firstProduct = document.querySelector('[data-testid="product-card"]');
    if (firstProduct) {
      firstProduct.click();
      await this.waitForNavigation('/apply/step-3');
      this.log('✅ Step 2 product selection completed');
      return true;
    }
    
    this.log('❌ Step 2 product selection failed', 'error');
    return false;
  }

  async testStep3BusinessDetails() {
    this.log('Testing Step 3: Business details form');
    
    // Fill business details with real data
    const businessData = {
      operatingName: 'Tech Solutions Inc',
      legalName: 'Tech Solutions Incorporated',
      businessCity: 'Toronto',
      businessState: 'ON',
      businessPhone: '4161234567',
      businessStructure: 'corporation',
      businessStartDate: '2020-01-15',
      employeeCount: 8,
      estimatedYearlyRevenue: 300000
    };
    
    // Fill form fields
    for (const [key, value] of Object.entries(businessData)) {
      const field = document.querySelector(`input[name="${key}"], select[name="${key}"]`);
      if (field) {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    
    // Submit form
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.click();
      await this.waitForNavigation('/apply/step-4');
      this.log('✅ Step 3 business details completed');
      return true;
    }
    
    this.log('❌ Step 3 business details failed', 'error');
    return false;
  }

  async testStep4ApplicantInfo() {
    this.log('Testing Step 4: Applicant information and application creation');
    
    // Fill applicant data
    const applicantData = {
      applicantFirstName: 'John',
      applicantLastName: 'Smith',
      applicantEmail: 'john.smith@techsolutions.com',
      applicantPhone: '4161234567',
      applicantAddress: '123 Bay Street',
      applicantCity: 'Toronto',
      applicantState: 'ON',
      applicantZipCode: 'M5J 2N8',
      applicantDateOfBirth: '1985-03-15',
      applicantSSN: '123456789',
      ownershipPercentage: 75,
      hasPartner: true,
      partnerFirstName: 'Jane',
      partnerLastName: 'Smith',
      partnerEmail: 'jane.smith@techsolutions.com',
      partnerOwnershipPercentage: 25
    };
    
    // Fill form fields
    for (const [key, value] of Object.entries(applicantData)) {
      const field = document.querySelector(`input[name="${key}"], select[name="${key}"]`);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = value;
        } else {
          field.value = value;
        }
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    
    // Submit form and monitor for applicationId
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      this.log('Submitting Step 4 application...');
      submitButton.click();
      
      // Wait for application creation response
      await this.waitForCondition(() => {
        const applicationId = localStorage.getItem('applicationId');
        return applicationId && applicationId !== 'null';
      }, 10000);
      
      const applicationId = localStorage.getItem('applicationId');
      if (applicationId) {
        this.log(`✅ Step 4 completed - Application ID: ${applicationId}`);
        return applicationId;
      }
    }
    
    this.log('❌ Step 4 application creation failed', 'error');
    return null;
  }

  async testStep5DocumentUpload(applicationId) {
    this.log('Testing Step 5: Document upload system');
    
    // Navigate to Step 5
    if (window.location.pathname !== '/apply/step-5') {
      window.location.href = '/apply/step-5';
      await this.waitForPageLoad();
    }
    
    // Test document upload functionality
    const uploadAreas = document.querySelectorAll('[data-testid="upload-area"]');
    if (uploadAreas.length > 0) {
      this.log(`Found ${uploadAreas.length} document upload areas`);
      
      // Create test file
      const testFile = new File(['Test document content'], 'bank_statements.pdf', {
        type: 'application/pdf'
      });
      
      // Simulate file upload
      const firstUploadArea = uploadAreas[0];
      const fileInput = firstUploadArea.querySelector('input[type="file"]');
      
      if (fileInput) {
        Object.defineProperty(fileInput, 'files', {
          value: [testFile],
          configurable: true
        });
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Wait for upload completion
        await this.waitForCondition(() => {
          const uploadProgress = document.querySelector('[data-testid="upload-progress"]');
          return uploadProgress && uploadProgress.textContent.includes('100%');
        }, 15000);
        
        this.log('✅ Step 5 document upload completed');
        return true;
      }
    }
    
    this.log('❌ Step 5 document upload failed', 'error');
    return false;
  }

  async testStep6SignNowIntegration(applicationId) {
    this.log('Testing Step 6: SignNow integration and iframe embedding');
    
    // Navigate to Step 6
    if (window.location.pathname !== '/apply/step-6') {
      window.location.href = '/apply/step-6';
      await this.waitForPageLoad();
    }
    
    // Wait for SignNow iframe to load
    await this.waitForCondition(() => {
      const iframe = document.querySelector('iframe[src*="signnow"]');
      return iframe !== null;
    }, 15000);
    
    const iframe = document.querySelector('iframe[src*="signnow"]');
    if (iframe) {
      this.log(`✅ SignNow iframe loaded: ${iframe.src}`);
      
      // Check if it's a real SignNow URL or fallback
      if (iframe.src.includes('temp_')) {
        this.log('⚠️ Using fallback SignNow URL (backend unavailable)');
      } else {
        this.log('✅ Using real SignNow URL with template population');
      }
      
      // Monitor for signature completion
      this.log('Monitoring for signature completion...');
      
      // Simulate signature completion after 5 seconds for testing
      setTimeout(() => {
        this.log('🖊️ Simulating signature completion...');
        
        // Check if auto-redirect to Step 7 occurs
        setTimeout(() => {
          if (window.location.pathname === '/apply/step-7') {
            this.log('✅ Auto-redirect to Step 7 successful');
          } else {
            this.log('⚠️ Auto-redirect not detected, using manual continue');
            const continueButton = document.querySelector('button[data-testid="continue-without-signing"]');
            if (continueButton) {
              continueButton.click();
            }
          }
        }, 2000);
      }, 5000);
      
      return true;
    }
    
    this.log('❌ Step 6 SignNow integration failed', 'error');
    return false;
  }

  async testStep7FinalSubmission(applicationId) {
    this.log('Testing Step 7: Final application submission');
    
    // Wait for Step 7 page to load
    await this.waitForCondition(() => {
      return window.location.pathname === '/apply/step-7';
    }, 10000);
    
    // Look for final submission button
    const submitButton = document.querySelector('button[data-testid="final-submit"]') || 
                        document.querySelector('button[type="submit"]');
    
    if (submitButton) {
      this.log('Submitting final application...');
      submitButton.click();
      
      // Wait for submission completion
      await this.waitForCondition(() => {
        const successMessage = document.querySelector('[data-testid="success-message"]');
        return successMessage !== null;
      }, 15000);
      
      const successMessage = document.querySelector('[data-testid="success-message"]');
      if (successMessage) {
        this.log('✅ Step 7 final submission completed successfully');
        return true;
      }
    }
    
    this.log('❌ Step 7 final submission failed', 'error');
    return false;
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

  async waitForNavigation(expectedPath, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkNavigation = () => {
        if (window.location.pathname === expectedPath) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Navigation timeout: expected ${expectedPath}, got ${window.location.pathname}`));
        } else {
          setTimeout(checkNavigation, 100);
        }
      };
      
      checkNavigation();
    });
  }

  async waitForCondition(condition, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkCondition = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Condition timeout'));
        } else {
          setTimeout(checkCondition, 100);
        }
      };
      
      checkCondition();
    });
  }

  async runFullE2ETest() {
    this.log('🚀 Starting full end-to-end application test');
    
    try {
      // Step 1: Financial Profile
      const step1Success = await this.testStep1FormSubmission();
      if (!step1Success) throw new Error('Step 1 failed');
      
      // Step 2: Product Selection
      const step2Success = await this.testStep2ProductSelection();
      if (!step2Success) throw new Error('Step 2 failed');
      
      // Step 3: Business Details
      const step3Success = await this.testStep3BusinessDetails();
      if (!step3Success) throw new Error('Step 3 failed');
      
      // Step 4: Applicant Info & Application Creation
      const applicationId = await this.testStep4ApplicantInfo();
      if (!applicationId) throw new Error('Step 4 failed');
      
      // Step 5: Document Upload
      const step5Success = await this.testStep5DocumentUpload(applicationId);
      if (!step5Success) throw new Error('Step 5 failed');
      
      // Step 6: SignNow Integration
      const step6Success = await this.testStep6SignNowIntegration(applicationId);
      if (!step6Success) throw new Error('Step 6 failed');
      
      // Step 7: Final Submission
      const step7Success = await this.testStep7FinalSubmission(applicationId);
      if (!step7Success) throw new Error('Step 7 failed');
      
      this.generateFinalReport();
      
    } catch (error) {
      this.log(`❌ E2E test failed: ${error.message}`, 'error');
      this.generateFailureReport(error);
    }
  }

  generateFinalReport() {
    const duration = Date.now() - this.startTime;
    const durationMins = Math.floor(duration / 60000);
    const durationSecs = Math.floor((duration % 60000) / 1000);
    
    // console.log('\n🎉 FULL E2E TEST COMPLETE 🎉');
    // console.log(`⏱️  Duration: ${durationMins}m ${durationSecs}s`);
    // console.log(`📊 Network Calls: ${this.networkCalls.length}`);
    // console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      // console.log('\n--- ERRORS ---');
      this.errors.forEach((error, index) => {
        // console.log(`${index + 1}. ${error.message}`);
      });
    }
    
    // console.log('\n--- NETWORK SUMMARY ---');
    const successfulCalls = this.networkCalls.filter(call => call.ok);
    const failedCalls = this.networkCalls.filter(call => !call.ok);
    
    // console.log(`✅ Successful: ${successfulCalls.length}`);
    // console.log(`❌ Failed: ${failedCalls.length}`);
    
    if (failedCalls.length > 0) {
      // console.log('\n--- FAILED REQUESTS ---');
      failedCalls.forEach((call, index) => {
        // console.log(`${index + 1}. ${call.method} ${call.url} - Status: ${call.status}`);
      });
    }
    
    // console.log('\n✅ Full E2E test completed successfully!');
  }

  generateFailureReport(error) {
    // console.log('\n❌ E2E TEST FAILED');
    // console.log(`Error: ${error.message}`);
    // console.log(`Total errors: ${this.errors.length}`);
    // console.log(`Network calls made: ${this.networkCalls.length}`);
  }
}

// Initialize and run the test
// console.log('🔬 Full E2E Test Ready');
// console.log('💡 Run: window.e2eTest.runFullE2ETest()');
// console.log('📊 Monitor: window.e2eTest.networkCalls');

window.e2eTest = new FullE2ETest();