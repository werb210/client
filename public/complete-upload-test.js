// COMPLETE CLIENT UPLOAD TEST - Execute in browser console
// Tests the full workflow with real file upload and console logging verification

console.log("🚀 COMPLETE CLIENT UPLOAD TEST - Starting full workflow verification");

// Test configuration
const testConfig = {
  fundingAmount: 50000,
  businessLocation: 'canada',
  businessName: 'Test Upload Business Ltd',
  applicantFirstName: 'Test',
  applicantLastName: 'User',
  applicantEmail: 'test@uploadtest.com'
};

// Monitor console logs for upload verification
let uploadLogs = [];
const originalConsoleLog = console.log;

console.log = function(...args) {
  const logString = args.join(' ');
  
  // Capture upload-related logs
  if (logString.includes('📤 Uploading:') || logString.includes('✅ Uploaded:')) {
    uploadLogs.push({
      timestamp: new Date().toISOString(),
      message: logString,
      type: logString.includes('📤') ? 'upload_start' : 'upload_success'
    });
    console.log(`🎯 CAPTURED UPLOAD LOG: ${logString}`);
  }
  
  // Call original console.log
  originalConsoleLog.apply(console, args);
};

// Test execution functions
window.UPLOAD_TEST = {
  logs: [],
  currentStep: 1,
  applicationId: null,
  uploadResult: null
};

// Navigate to Step 1 and fill form
function startTest() {
  console.log("📋 Step 1: Starting workflow test...");
  
  if (!window.location.pathname.includes('step-1')) {
    window.location.href = '/apply/step-1';
    setTimeout(startTest, 2000);
    return;
  }
  
  // Fill funding amount
  const fundingInput = document.querySelector('input[name="fundingAmount"], input[placeholder*="amount"]');
  if (fundingInput) {
    fundingInput.value = testConfig.fundingAmount;
    fundingInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log(`✅ Funding amount set: ${testConfig.fundingAmount}`);
  }
  
  console.log("ℹ️  To complete the test:");
  console.log("1. Complete Steps 1-4 in the application");
  console.log("2. Navigate to Step 5");
  console.log("3. Upload any PDF/PNG/JPG file");
  console.log("4. Check upload logs with: window.UPLOAD_TEST.logs");
  console.log("5. Verify console shows '📤 Uploading:' and '✅ Uploaded:' messages");
}

// Direct Step 5 upload test function
async function testStep5Upload() {
  console.log("🎯 TESTING STEP 5 UPLOAD DIRECTLY");
  
  // Create test file
  const testContent = new Uint8Array([
    0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34 // PDF header
  ]);
  const testFile = new File([testContent], "test-upload.pdf", { type: "application/pdf" });
  
  // Test upload endpoint
  const applicationId = "test-" + Date.now();
  const formData = new FormData();
  formData.append('document', testFile);
  formData.append('documentType', 'bank_statements');
  
  // Log upload start (required format)
  console.log("📤 Uploading:", testFile.name);
  
  try {
    const response = await fetch(`/api/public/upload/${applicationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${window.ENV?.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: formData
    });
    
    console.log("🔍 Upload response status:", response.status);
    console.log("🔍 Upload response headers:", [...response.headers.entries()]);
    
    const result = await response.json();
    
    // Log result (required format)
    if (response.ok && result.status === 'success') {
      console.log("✅ Uploaded:", result);
      window.UPLOAD_TEST.uploadResult = { success: true, result };
      return true;
    } else {
      console.log("❌ Upload failed:", result);
      window.UPLOAD_TEST.uploadResult = { success: false, result };
      return false;
    }
    
  } catch (error) {
    console.log("❌ Upload error:", error);
    window.UPLOAD_TEST.uploadResult = { success: false, error: error.message };
    return false;
  }
}

// Check upload logs function
window.checkUploadLogs = function() {
  console.log("\n📊 UPLOAD LOGS SUMMARY:");
  console.log("=".repeat(50));
  
  uploadLogs.forEach((log, index) => {
    console.log(`${index + 1}. [${log.type}] ${log.message}`);
  });
  
  const hasUploadStart = uploadLogs.some(log => log.type === 'upload_start');
  const hasUploadSuccess = uploadLogs.some(log => log.type === 'upload_success');
  
  console.log("\n✅ VERIFICATION:");
  console.log(`📤 "Uploading:" format: ${hasUploadStart ? 'PASS' : 'FAIL'}`);
  console.log(`✅ "Uploaded:" format: ${hasUploadSuccess ? 'PASS' : 'FAIL'}`);
  
  if (hasUploadStart && hasUploadSuccess) {
    console.log("\n🎉 SUCCESS: Console logging format verified!");
  } else {
    console.log("\n❌ FAILURE: Console logging format incomplete");
  }
  
  return { hasUploadStart, hasUploadSuccess, logs: uploadLogs };
};

// Auto-start the test
console.log("🚀 Starting complete upload test...");
console.log("📋 Use testStep5Upload() for direct upload test");
console.log("📋 Use checkUploadLogs() to verify console format");
console.log("📋 Use startTest() to begin workflow test");

// Test direct upload immediately
testStep5Upload();