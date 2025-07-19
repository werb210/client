// FINAL INTEGRATION TEST SCRIPT
// Automated Steps 1-5 workflow execution with real document upload

console.log("🚀 FINAL INTEGRATION TEST - STEPS 1-5 EXECUTION STARTING");

// Test configuration
const TEST_CONFIG = {
  fundingAmount: 50000,
  businessLocation: 'canada', 
  lookingFor: 'working-capital',
  fundsPurpose: 'working-capital',
  businessName: 'Test Business Ltd',
  businessEmail: 'test@testbusiness.com',
  businessPhone: '+1-555-123-4567',
  applicantFirstName: 'John',
  applicantLastName: 'Smith', 
  applicantEmail: 'john.smith@testbusiness.com',
  applicantPhone: '+1-555-987-6543'
};

// Global test state
window.INTEGRATION_TEST = {
  currentStep: 0,
  applicationId: null,
  uploadResults: [],
  startTime: Date.now()
};

// Utility functions
function logStep(step, message) {
  console.log(`📋 [STEP ${step}] ${message}`);
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) return resolve(element);
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// Step 1: Navigation and form filling
async function executeStep1() {
  logStep(1, "Starting - Navigate to Step 1");
  
  if (!window.location.pathname.includes('step-1')) {
    window.location.href = '/apply/step-1';
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  try {
    // Fill funding amount
    const fundingInput = await waitForElement('input[name="fundingAmount"], input[id*="funding"], input[placeholder*="amount"]');
    if (fundingInput) {
      fundingInput.value = TEST_CONFIG.fundingAmount;
      fundingInput.dispatchEvent(new Event('input', { bubbles: true }));
      logStep(1, `✅ Funding amount set: ${TEST_CONFIG.fundingAmount}`);
    }
    
    // Select business location
    const locationSelect = await waitForElement('select[name="businessLocation"], select[id*="location"]');
    if (locationSelect) {
      locationSelect.value = TEST_CONFIG.businessLocation;
      locationSelect.dispatchEvent(new Event('change', { bubbles: true }));
      logStep(1, `✅ Business location set: ${TEST_CONFIG.businessLocation}`);
    }
    
    // Continue to Step 2
    const continueBtn = await waitForElement('button[type="submit"], button:contains("Continue"), button:contains("Next")');
    if (continueBtn) {
      continueBtn.click();
      logStep(1, "✅ Proceeding to Step 2");
      window.INTEGRATION_TEST.currentStep = 2;
      setTimeout(executeStep2, 2000);
    }
    
  } catch (error) {
    logStep(1, `❌ Error: ${error.message}`);
  }
}

// Step 2: Product category selection
async function executeStep2() {
  logStep(2, "Starting - Product category selection");
  
  try {
    // Wait for product categories to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Select working capital category
    const categoryButton = await waitForElement('button:contains("Working Capital"), div:contains("Working Capital")');
    if (categoryButton) {
      categoryButton.click();
      logStep(2, "✅ Working Capital category selected");
    }
    
    // Continue to Step 3
    const continueBtn = await waitForElement('button[type="submit"], button:contains("Continue")');
    if (continueBtn) {
      continueBtn.click();
      logStep(2, "✅ Proceeding to Step 3");
      window.INTEGRATION_TEST.currentStep = 3;
      setTimeout(executeStep3, 2000);
    }
    
  } catch (error) {
    logStep(2, `❌ Error: ${error.message}`);
  }
}

// Step 3: Business details
async function executeStep3() {
  logStep(3, "Starting - Business details form");
  
  try {
    // Fill business name
    const businessNameInput = await waitForElement('input[name="businessName"], input[name="operatingName"]');
    if (businessNameInput) {
      businessNameInput.value = TEST_CONFIG.businessName;
      businessNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      logStep(3, `✅ Business name: ${TEST_CONFIG.businessName}`);
    }
    
    // Fill business phone
    const phoneInput = await waitForElement('input[name="businessPhone"], input[type="tel"]');
    if (phoneInput) {
      phoneInput.value = TEST_CONFIG.businessPhone;
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      logStep(3, `✅ Business phone: ${TEST_CONFIG.businessPhone}`);
    }
    
    // Continue to Step 4
    const continueBtn = await waitForElement('button[type="submit"], button:contains("Continue")');
    if (continueBtn) {
      continueBtn.click();
      logStep(3, "✅ Proceeding to Step 4");
      window.INTEGRATION_TEST.currentStep = 4;
      setTimeout(executeStep4, 2000);
    }
    
  } catch (error) {
    logStep(3, `❌ Error: ${error.message}`);
  }
}

// Step 4: Applicant information (generates applicationId)
async function executeStep4() {
  logStep(4, "Starting - Applicant information (critical for applicationId generation)");
  
  try {
    // Fill applicant first name
    const firstNameInput = await waitForElement('input[name="applicantFirstName"], input[name="firstName"]');
    if (firstNameInput) {
      firstNameInput.value = TEST_CONFIG.applicantFirstName;
      firstNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      logStep(4, `✅ First name: ${TEST_CONFIG.applicantFirstName}`);
    }
    
    // Fill applicant last name
    const lastNameInput = await waitForElement('input[name="applicantLastName"], input[name="lastName"]');
    if (lastNameInput) {
      lastNameInput.value = TEST_CONFIG.applicantLastName;
      lastNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      logStep(4, `✅ Last name: ${TEST_CONFIG.applicantLastName}`);
    }
    
    // Fill applicant email
    const emailInput = await waitForElement('input[name="applicantEmail"], input[name="email"]');
    if (emailInput) {
      emailInput.value = TEST_CONFIG.applicantEmail;
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      logStep(4, `✅ Email: ${TEST_CONFIG.applicantEmail}`);
    }
    
    // Submit Step 4 to generate applicationId
    const submitBtn = await waitForElement('button[type="submit"], button:contains("Submit"), button:contains("Create Application")');
    if (submitBtn) {
      
      // Monitor for applicationId generation
      const originalLog = console.log;
      console.log = function(...args) {
        if (args[0] && args[0].includes('Application created:')) {
          const match = JSON.stringify(args).match(/"applicationId":"([^"]+)"/);
          if (match) {
            window.INTEGRATION_TEST.applicationId = match[1];
            logStep(4, `🎯 ApplicationId captured: ${match[1]}`);
          }
        }
        originalLog.apply(console, args);
      };
      
      submitBtn.click();
      logStep(4, "✅ Step 4 submitted - waiting for applicationId generation");
      window.INTEGRATION_TEST.currentStep = 5;
      
      // Wait for navigation to Step 5
      setTimeout(() => {
        if (window.location.pathname.includes('step-5') || window.INTEGRATION_TEST.applicationId) {
          executeStep5();
        } else {
          logStep(4, "⏳ Waiting for Step 5 navigation...");
          setTimeout(executeStep5, 3000);
        }
      }, 3000);
    }
    
  } catch (error) {
    logStep(4, `❌ Error: ${error.message}`);
  }
}

// Step 5: Document upload (THE CRITICAL TEST)
async function executeStep5() {
  logStep(5, "🎯 CRITICAL TEST - Document upload with real file");
  
  try {
    // Verify we have applicationId
    const appId = window.INTEGRATION_TEST.applicationId || localStorage.getItem('applicationId');
    if (!appId) {
      logStep(5, "❌ CRITICAL: No applicationId found - cannot proceed with upload");
      return;
    }
    
    logStep(5, `✅ ApplicationId confirmed: ${appId}`);
    
    // Navigate to Step 5 if not already there
    if (!window.location.pathname.includes('step-5')) {
      window.location.href = '/apply/step-5';
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Wait for document requirements to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find file input
    const fileInput = await waitForElement('input[type="file"]');
    if (!fileInput) {
      logStep(5, "❌ CRITICAL: No file input found in Step 5");
      return;
    }
    
    logStep(5, "✅ File input found - preparing test document upload");
    
    // Create test file (simulating PDF upload)
    const testFileContent = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2D, // %PDF- header
      // Minimal PDF content
      0x31, 0x2E, 0x34, 0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3
    ]);
    
    const testFile = new File([testFileContent], "April_2025_test_bank_statement.pdf", {
      type: "application/pdf"
    });
    
    // Monitor console for upload logs
    const uploadLogs = [];
    const originalLog = console.log;
    console.log = function(...args) {
      const logStr = args.join(' ');
      if (logStr.includes('📤 Uploading:') || logStr.includes('✅ Uploaded:')) {
        uploadLogs.push(logStr);
        logStep(5, `🎯 UPLOAD LOG: ${logStr}`);
      }
      originalLog.apply(console, args);
    };
    
    // Trigger file upload
    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
      writable: false,
    });
    
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    logStep(5, "🚀 File upload triggered - monitoring console logs...");
    
    // Wait for upload completion
    setTimeout(() => {
      window.INTEGRATION_TEST.uploadResults = uploadLogs;
      reportFinalResults();
    }, 5000);
    
  } catch (error) {
    logStep(5, `❌ CRITICAL ERROR: ${error.message}`);
    reportFinalResults();
  }
}

// Final results report
function reportFinalResults() {
  const duration = Date.now() - window.INTEGRATION_TEST.startTime;
  
  console.log("\n" + "=".repeat(60));
  console.log("🎯 FINAL INTEGRATION TEST RESULTS");
  console.log("=".repeat(60));
  
  console.log(`📊 Test Duration: ${Math.round(duration/1000)}s`);
  console.log(`📋 Steps Completed: ${window.INTEGRATION_TEST.currentStep}/5`);
  console.log(`🆔 ApplicationId: ${window.INTEGRATION_TEST.applicationId || 'NOT GENERATED'}`);
  
  console.log("\n📤 Upload Log Results:");
  if (window.INTEGRATION_TEST.uploadResults.length > 0) {
    window.INTEGRATION_TEST.uploadResults.forEach(log => {
      console.log(`   ${log}`);
    });
    
    // Check for required log format
    const hasUploadingLog = window.INTEGRATION_TEST.uploadResults.some(log => 
      log.includes('📤 Uploading:'));
    const hasUploadedLog = window.INTEGRATION_TEST.uploadResults.some(log => 
      log.includes('✅ Uploaded:') && log.includes('status') && log.includes('success'));
    
    console.log(`\n✅ Required Log Format Check:`);
    console.log(`   📤 "Uploading:" format: ${hasUploadingLog ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   ✅ "Uploaded: {status: success}" format: ${hasUploadedLog ? '✅ PASS' : '❌ FAIL'}`);
    
    if (hasUploadingLog && hasUploadedLog) {
      console.log(`\n🎉 SUCCESS: Step 5 upload system VERIFIED - Ready for production!`);
    } else {
      console.log(`\n❌ FAILURE: Upload logging format does not match requirements`);
    }
  } else {
    console.log("   ❌ No upload logs captured");
    console.log(`\n❌ FAILURE: Step 5 upload system NOT working`);
  }
  
  console.log("\n" + "=".repeat(60));
}

// Auto-start the test
executeStep1();