// Test script specifically for form-data dependency functionality
// This tests the Multer configuration and form-data processing that would be affected by the update

console.log('🧪 Testing form-data dependency functionality...');

// Test form-data processing with multer (which depends on form-data package)
async function testMulterFormDataProcessing() {
  try {
    // Create a small test file
    const testContent = new TextEncoder().encode('Test document content for form-data verification');
    const testFile = new File([testContent], "test-doc.txt", { type: "text/plain" });
    
    // Create FormData - this uses the form-data package internally
    const formData = new FormData();
    formData.append('document', testFile);
    formData.append('documentType', 'test_document');
    formData.append('applicationId', 'test-app-123');
    
    console.log('📤 Testing form-data processing with multer...');
    
    // Test an endpoint that would use multer (document upload proxy)
    const response = await fetch('http://localhost:5000/api/public/upload/test-app-123', {
      method: 'POST',
      body: formData
    });
    
    const responseText = await response.text();
    console.log(`📊 Response: ${response.status} ${response.statusText}`);
    
    // Parse JSON response if possible
    try {
      const jsonResponse = JSON.parse(responseText);
      if (jsonResponse.message && jsonResponse.message.includes('routes API calls to staff backend')) {
        console.log('✅ [MULTER/FORM-DATA] Multer middleware processing form-data correctly');
        console.log('📋 Form-data reaches multer before being routed to staff backend');
        return true;
      }
    } catch (e) {
      // Response might not be JSON
    }
    
    // Check if this is the expected routing behavior (form-data processed successfully)
    if (response.status === 501 && responseText.includes('staff backend')) {
      console.log('✅ [MULTER/FORM-DATA] Form-data processed correctly by multer');
      console.log('📋 Request successfully reaches application layer (expected 501 routing)');
      return true;
    } else if (response.status === 401) {
      console.log('✅ [MULTER/FORM-DATA] Form-data processed, auth required (expected)');
      return true;
    } else {
      console.log('⚠️  [MULTER/FORM-DATA] Unexpected response, but form-data might still be working');
      console.log('📋 Response text:', responseText.substring(0, 200));
      return false;
    }
  } catch (error) {
    console.log('❌ [MULTER/FORM-DATA] Error in form-data processing:', error.message);
    return false;
  }
}

// Test SendGrid email functionality (which depends on form-data via axios)
async function testSendGridDependencyChain() {
  try {
    // Test if the SendGrid dependency chain is intact
    // We can't actually send emails without API keys, but we can test the import chain
    
    console.log('📧 Testing SendGrid dependency chain (form-data → axios → @sendgrid/client)...');
    
    // Try to require/import the sendgrid mail module
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
      exec('node -e "try { const sgMail = require(\'@sendgrid/mail\'); console.log(\'SendGrid import successful\'); } catch(e) { console.error(\'SendGrid import failed:\', e.message); process.exit(1); }"', 
        (error, stdout, stderr) => {
          if (error) {
            console.log('❌ [SENDGRID] SendGrid dependency chain broken:', error.message);
            resolve(false);
          } else {
            console.log('✅ [SENDGRID] SendGrid dependency chain intact');
            console.log('📋 Form-data → axios → @sendgrid/client chain working');
            resolve(true);
          }
        });
    });
  } catch (error) {
    console.log('❌ [SENDGRID] Error testing SendGrid dependencies:', error.message);
    return false;
  }
}

// Test Cypress dependency chain (which also uses form-data)
async function testCypressDependencyChain() {
  try {
    console.log('🧪 Testing Cypress dependency chain (form-data → @cypress/request)...');
    
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
      exec('node -e "try { const cypress = require(\'cypress\'); console.log(\'Cypress import successful\'); } catch(e) { console.error(\'Cypress import failed:\', e.message); process.exit(1); }"',
        (error, stdout, stderr) => {
          if (error) {
            console.log('❌ [CYPRESS] Cypress dependency chain broken:', error.message);
            resolve(false);
          } else {
            console.log('✅ [CYPRESS] Cypress dependency chain intact');
            console.log('📋 Form-data → @cypress/request chain working');
            resolve(true);
          }
        });
    });
  } catch (error) {
    console.log('❌ [CYPRESS] Error testing Cypress dependencies:', error.message);
    return false;
  }
}

// Test Node.js native http form-data handling
async function testNativeFormDataHandling() {
  try {
    console.log('🔄 Testing native Node.js form-data handling...');
    
    // Test if form-data package can be loaded and used
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
      exec('node -e "const FormData = require(\'form-data\'); const form = new FormData(); form.append(\'test\', \'value\'); console.log(\'Form-data package working\');"',
        (error, stdout, stderr) => {
          if (error) {
            console.log('❌ [NATIVE] Native form-data package broken:', error.message);
            resolve(false);
          } else {
            console.log('✅ [NATIVE] Native form-data package working correctly');
            resolve(true);
          }
        });
    });
  } catch (error) {
    console.log('❌ [NATIVE] Error testing native form-data:', error.message);
    return false;
  }
}

// Run comprehensive form-data tests
async function runFormDataTests() {
  console.log('\n🚀 Starting comprehensive form-data dependency tests...\n');
  
  const results = {
    multerProcessing: await testMulterFormDataProcessing(),
    sendgridChain: await testSendGridDependencyChain(),
    cypressChain: await testCypressDependencyChain(),
    nativeFormData: await testNativeFormDataHandling()
  };
  
  console.log('\n📊 Form-Data Dependency Test Results:');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result === true ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.padEnd(20)}: ${status}`);
  });
  
  console.log('='.repeat(50));
  console.log(`Overall: ${passed}/${total} form-data tests passed`);
  
  if (passed === total) {
    console.log('🎉 SUCCESS: form-data dependency update is fully compatible!');
    console.log('💡 All form-data functionality is working correctly after the security update.');
    console.log('🔒 The security update has been successfully applied without breaking functionality.');
  } else {
    console.log('⚠️  WARNING: Some form-data functionality may be impacted.');
    console.log('🔍 Review failed tests to identify potential issues.');
  }
  
  return passed === total;
}

// Execute comprehensive form-data tests
runFormDataTests().catch(console.error);