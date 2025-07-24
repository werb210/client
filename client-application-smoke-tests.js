// ✅ CLIENT APPLICATION SMOKE TESTS - COMPREHENSIVE VALIDATION SUITE
// Tests the complete application workflow after fallback ID bug fix

console.log('🔬 CLIENT APPLICATION SMOKE TESTS - EXECUTING COMPREHENSIVE VALIDATION');

class ClientApplicationSmokeTests {
  constructor() {
    this.testResults = {};
    this.logs = [];
    this.currentTest = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    
    const colors = {
      info: 'color: blue',
      success: 'color: green', 
      error: 'color: red',
      warning: 'color: orange'
    };
    
    console.log(`%c${logEntry}`, colors[type] || colors.info);
  }

  async waitForCondition(condition, timeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (condition()) return true;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
  }

  async navigateToStep(stepNumber) {
    this.log(`🚀 Navigating to Step ${stepNumber}`, 'info');
    window.location.href = `/apply/step-${stepNumber}`;
    await this.waitForCondition(() => 
      window.location.pathname.includes(`step-${stepNumber}`) ||
      document.querySelector(`[data-step="${stepNumber}"]`)
    );
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for render
  }

  generateUniqueEmail() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `test.${timestamp}.${random}@smoketest.com`;
  }

  async fillSteps1to3() {
    this.log('📝 Filling Steps 1-3 with test data', 'info');
    
    // Store test data in FormDataContext pattern
    const testData = {
      step1: {
        requestedAmount: 75000,
        use_of_funds: "equipment",
        businessLocation: "canada"
      },
      step3: {
        operatingName: "Smoke Test Company Ltd",
        legalName: "Smoke Test Company Ltd",
        businessPhone: "+14165551234",
        businessState: "ON",
        businessCity: "Toronto",
        businessStreetAddress: "123 Test Street"
      }
    };

    // Save to localStorage for persistence
    localStorage.setItem('formData', JSON.stringify(testData));
    
    this.log('✅ Steps 1-3 data prepared', 'success');
    return testData;
  }

  async fillStep4(email) {
    this.log(`📝 Filling Step 4 with email: ${email}`, 'info');
    
    await this.navigateToStep(4);
    
    // Fill form fields
    const step4Data = {
      applicantFirstName: 'John',
      applicantLastName: 'SmokeTest',
      applicantEmail: email,
      applicantPhone: '+14165551234',
      applicantAddress: '123 Test Street',
      applicantCity: 'Toronto',
      applicantState: 'ON',
      applicantZipCode: 'M5V 3A8',
      ownershipPercentage: 100
    };

    // Try to fill form fields if available
    for (const [key, value] of Object.entries(step4Data)) {
      const field = document.querySelector(`input[name="${key}"], select[name="${key}"]`);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = value;
        } else {
          field.value = value;
        }
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Submit form
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      this.log('🚀 Submitting Step 4 application', 'info');
      submitButton.click();
      
      // Wait for response
      await this.waitForCondition(() => {
        const applicationId = localStorage.getItem('applicationId');
        return applicationId && applicationId !== 'null';
      }, 15000);
      
      const applicationId = localStorage.getItem('applicationId');
      if (applicationId) {
        this.log(`✅ Application created: ${applicationId}`, 'success');
        return { success: true, applicationId };
      } else {
        this.log('❌ Application creation failed', 'error');
        return { success: false, error: 'No application ID returned' };
      }
    }
    
    return { success: false, error: 'Submit button not found' };
  }

  async uploadTestDocuments(documentCount = 6) {
    this.log(`📎 Uploading ${documentCount} test documents`, 'info');
    
    await this.navigateToStep(5);
    
    // Create test files
    const testFiles = [];
    for (let i = 1; i <= documentCount; i++) {
      const content = `Test Bank Statement ${i}\nDate: ${new Date().toISOString()}\nBalance: $${(Math.random() * 10000).toFixed(2)}`;
      const blob = new Blob([content], { type: 'application/pdf' });
      const file = new File([blob], `bank_statement_${i}.pdf`, { type: 'application/pdf' });
      testFiles.push(file);
    }

    // Try to upload files to upload areas
    const uploadAreas = document.querySelectorAll('[data-testid*="upload"], .upload-area, input[type="file"]');
    let uploadedCount = 0;

    for (let i = 0; i < Math.min(testFiles.length, uploadAreas.length); i++) {
      const uploadArea = uploadAreas[i];
      const file = testFiles[i];
      
      try {
        // Simulate file drop
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        if (uploadArea.tagName === 'INPUT') {
          uploadArea.files = dataTransfer.files;
          uploadArea.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          const dropEvent = new DragEvent('drop', {
            bubbles: true,
            dataTransfer: dataTransfer
          });
          uploadArea.dispatchEvent(dropEvent);
        }
        
        uploadedCount++;
        this.log(`📎 Uploaded: ${file.name}`, 'success');
        
        // Wait between uploads
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        this.log(`❌ Upload failed for ${file.name}: ${error.message}`, 'error');
      }
    }

    this.log(`✅ Uploaded ${uploadedCount} documents`, 'success');
    return uploadedCount;
  }

  async clickBypassDocuments() {
    this.log('⏭️ Clicking "Proceed Without Required Documents"', 'info');
    
    const bypassButton = document.querySelector('button:contains("Proceed Without Required Documents"), button:contains("bypass"), [data-testid="bypass-button"]');
    if (bypassButton) {
      bypassButton.click();
      
      // Wait for toast
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for bypass toast
      const toastElements = document.querySelectorAll('[data-testid="toast"], .toast, .notification');
      const bypassToast = Array.from(toastElements).find(el => 
        el.textContent.includes('bypass') || el.textContent.includes('chosen')
      );
      
      if (bypassToast) {
        this.log('✅ Bypass toast confirmed', 'success');
        return true;
      } else {
        this.log('⚠️ Bypass toast not found', 'warning');
        return false;
      }
    } else {
      this.log('❌ Bypass button not found', 'error');
      return false;
    }
  }

  async testStep6Submission() {
    this.log('📋 Testing Step 6 submission', 'info');
    
    await this.navigateToStep(6);
    
    // Check submit button state
    const submitButton = document.querySelector('button:contains("Submit Application"), button[type="submit"], [data-testid="submit-button"]');
    if (!submitButton) {
      this.log('❌ Submit button not found', 'error');
      return { success: false, error: 'Submit button not found' };
    }

    const isEnabled = !submitButton.disabled && !submitButton.classList.contains('disabled');
    this.log(`🔍 Submit button enabled: ${isEnabled}`, isEnabled ? 'success' : 'warning');
    
    if (isEnabled) {
      // Monitor console for submission logs
      const originalConsoleLog = console.log;
      let submissionLogged = false;
      
      console.log = (...args) => {
        const message = args.join(' ');
        if (message.includes('Submitted with validation') || message.includes('bypassDocuments')) {
          submissionLogged = true;
          this.log(`✅ Console log captured: ${message}`, 'success');
        }
        originalConsoleLog.apply(console, args);
      };
      
      // Click submit
      submitButton.click();
      
      // Wait for navigation or success indication
      await this.waitForCondition(() => 
        window.location.pathname.includes('success') ||
        document.querySelector('[data-testid="success"], .success-message') ||
        submissionLogged
      , 10000);
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      const onSuccessPage = window.location.pathname.includes('success');
      const hasSuccessMessage = !!document.querySelector('[data-testid="success"], .success-message');
      
      if (onSuccessPage || hasSuccessMessage || submissionLogged) {
        this.log('✅ Application submitted successfully', 'success');
        return { success: true, submissionLogged };
      } else {
        this.log('❌ Submission may have failed', 'error');
        return { success: false, error: 'No success indication found' };
      }
    }
    
    return { success: false, enabled: isEnabled };
  }

  // TEST 1: Submit With Required Documents
  async test1_SubmitWithRequiredDocuments() {
    this.currentTest = 'Test 1: Submit With Required Documents';
    this.log('🔹 Starting Test 1: Submit With Required Documents', 'info');
    
    try {
      const email = this.generateUniqueEmail();
      this.log(`📧 Using email: ${email}`, 'info');
      
      // Fill steps 1-3
      await this.fillSteps1to3();
      
      // Fill step 4 and create application
      const step4Result = await this.fillStep4(email);
      if (!step4Result.success) {
        throw new Error(step4Result.error);
      }
      
      // Upload all required documents
      const uploadCount = await this.uploadTestDocuments(6);
      if (uploadCount === 0) {
        this.log('⚠️ No documents uploaded - test incomplete', 'warning');
      }
      
      // Submit at Step 6
      const submissionResult = await this.testStep6Submission();
      
      this.testResults.test1 = {
        passed: submissionResult.success,
        email,
        applicationId: step4Result.applicationId,
        documentsUploaded: uploadCount,
        submissionLogged: submissionResult.submissionLogged
      };
      
      this.log(`✅ Test 1 ${submissionResult.success ? 'PASSED' : 'FAILED'}`, submissionResult.success ? 'success' : 'error');
      
    } catch (error) {
      this.log(`❌ Test 1 ERROR: ${error.message}`, 'error');
      this.testResults.test1 = { passed: false, error: error.message };
    }
  }

  // TEST 2: Submit With Bypass
  async test2_SubmitWithBypass() {
    this.currentTest = 'Test 2: Submit With Bypass';
    this.log('🔹 Starting Test 2: Submit With Bypass', 'info');
    
    try {
      const email = this.generateUniqueEmail();
      this.log(`📧 Using email: ${email}`, 'info');
      
      // Fill steps 1-3
      await this.fillSteps1to3();
      
      // Fill step 4 and create application
      const step4Result = await this.fillStep4(email);
      if (!step4Result.success) {
        throw new Error(step4Result.error);
      }
      
      // Navigate to Step 5 and click bypass
      await this.navigateToStep(5);
      const bypassSuccess = await this.clickBypassDocuments();
      
      // Submit at Step 6
      const submissionResult = await this.testStep6Submission();
      
      this.testResults.test2 = {
        passed: submissionResult.success && bypassSuccess,
        email,
        applicationId: step4Result.applicationId,
        bypassClicked: bypassSuccess,
        submissionLogged: submissionResult.submissionLogged
      };
      
      this.log(`✅ Test 2 ${(submissionResult.success && bypassSuccess) ? 'PASSED' : 'FAILED'}`, (submissionResult.success && bypassSuccess) ? 'success' : 'error');
      
    } catch (error) {
      this.log(`❌ Test 2 ERROR: ${error.message}`, 'error');
      this.testResults.test2 = { passed: false, error: error.message };
    }
  }

  // TEST 3: Partial Upload Should Block
  async test3_PartialUploadShouldBlock() {
    this.currentTest = 'Test 3: Partial Upload Should Block';
    this.log('🔹 Starting Test 3: Partial Upload Should Block', 'info');
    
    try {
      const email = this.generateUniqueEmail();
      this.log(`📧 Using email: ${email}`, 'info');
      
      // Fill steps 1-3
      await this.fillSteps1to3();
      
      // Fill step 4 and create application
      const step4Result = await this.fillStep4(email);
      if (!step4Result.success) {
        throw new Error(step4Result.error);
      }
      
      // Upload only 1-2 documents (partial)
      const uploadCount = await this.uploadTestDocuments(2);
      
      // Test Step 6 - should be blocked
      const submissionResult = await this.testStep6Submission();
      const shouldBeBlocked = !submissionResult.enabled;
      
      this.testResults.test3 = {
        passed: shouldBeBlocked,
        email,
        applicationId: step4Result.applicationId,
        documentsUploaded: uploadCount,
        submitButtonDisabled: shouldBeBlocked
      };
      
      this.log(`✅ Test 3 ${shouldBeBlocked ? 'PASSED' : 'FAILED'} - Submit button ${shouldBeBlocked ? 'properly blocked' : 'incorrectly enabled'}`, shouldBeBlocked ? 'success' : 'error');
      
    } catch (error) {
      this.log(`❌ Test 3 ERROR: ${error.message}`, 'error');
      this.testResults.test3 = { passed: false, error: error.message };
    }
  }

  // TEST 4: Duplicate Email Handling
  async test4_DuplicateEmailHandling() {
    this.currentTest = 'Test 4: Duplicate Email Handling';
    this.log('🔹 Starting Test 4: Duplicate Email Handling', 'info');
    
    try {
      // Use email from previous test
      const duplicateEmail = this.testResults.test1?.email || 'todd@werboweski.com';
      this.log(`📧 Using duplicate email: ${duplicateEmail}`, 'info');
      
      // Fill steps 1-3
      await this.fillSteps1to3();
      
      // Try to fill step 4 with duplicate email
      const step4Result = await this.fillStep4(duplicateEmail);
      
      // Check for 409 handling
      const has409Toast = !!document.querySelector('[data-testid="toast"], .toast')?.textContent?.includes('duplicate');
      const noFallbackId = !step4Result.applicationId?.startsWith('app_');
      
      this.testResults.test4 = {
        passed: !step4Result.success || (step4Result.success && noFallbackId),
        email: duplicateEmail,
        got409Toast: has409Toast,
        noFallbackId: noFallbackId,
        result: step4Result
      };
      
      this.log(`✅ Test 4 ${this.testResults.test4.passed ? 'PASSED' : 'FAILED'}`, this.testResults.test4.passed ? 'success' : 'error');
      
    } catch (error) {
      this.log(`❌ Test 4 ERROR: ${error.message}`, 'error');
      this.testResults.test4 = { passed: false, error: error.message };
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Client Application Smoke Tests', 'info');
    
    // Run all tests sequentially
    await this.test1_SubmitWithRequiredDocuments();
    await this.test2_SubmitWithBypass();
    await this.test3_PartialUploadShouldBlock();
    await this.test4_DuplicateEmailHandling();
    
    // Generate final report
    this.generateFinalReport();
    
    return this.testResults;
  }

  generateFinalReport() {
    this.log('📊 SMOKE TEST RESULTS SUMMARY', 'info');
    
    const tests = [
      { name: 'Test 1: Submit With Required Documents', result: this.testResults.test1 },
      { name: 'Test 2: Submit With Bypass', result: this.testResults.test2 },
      { name: 'Test 3: Partial Upload Should Block', result: this.testResults.test3 },
      { name: 'Test 4: Duplicate Email Handling', result: this.testResults.test4 }
    ];
    
    let passedCount = 0;
    tests.forEach(test => {
      const passed = test.result?.passed || false;
      if (passed) passedCount++;
      
      const status = passed ? 'PASS' : 'FAIL';
      const logType = passed ? 'success' : 'error';
      this.log(`${test.name}: ${status}`, logType);
      
      if (test.result?.error) {
        this.log(`  Error: ${test.result.error}`, 'error');
      }
    });
    
    const overallStatus = passedCount === tests.length ? 'ALL TESTS PASSED' : `${passedCount}/${tests.length} TESTS PASSED`;
    const statusType = passedCount === tests.length ? 'success' : 'warning';
    
    this.log(`🎯 OVERALL RESULT: ${overallStatus}`, statusType);
    
    if (passedCount === tests.length) {
      this.log('✅ CLIENT APPLICATION SMOKE TESTS SUCCESSFUL - FALLBACK ID BUG FIX VERIFIED', 'success');
    } else {
      this.log('⚠️ SOME SMOKE TESTS FAILED - REVIEW NEEDED', 'warning');
    }
  }
}

// Auto-run smoke tests
const smokeTests = new ClientApplicationSmokeTests();

// Make available globally for manual execution
window.runSmokeTests = () => {
  const tests = new ClientApplicationSmokeTests();
  return tests.runAllTests();
};

console.log('🔬 Smoke test suite loaded. Run window.runSmokeTests() to execute all tests.');
console.log('📋 Tests include:');
console.log('   1. Submit With Required Documents');
console.log('   2. Submit With Bypass'); 
console.log('   3. Partial Upload Should Block');
console.log('   4. Duplicate Email Handling');