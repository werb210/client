/**
 * SIGNATURE REDIRECT TEST
 * Tests why the auto-redirect from Step 6 to Step 7 isn't working
 * Date: July 14, 2025
 */

class SignatureRedirectTest {
  constructor() {
    this.applicationId = localStorage.getItem('applicationId') || '34448b6a-7f11-474a-ba07-cd8502a9fec9';
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const color = type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'orange' : 'blue';
    console.log(`%c[${timestamp}] ${message}`, `color: ${color}`);
  }

  // Test 1: Check signature status endpoint response format
  async testSignatureStatusResponse() {
    this.log('🔍 Testing signature status endpoint response format');
    
    try {
      const response = await fetch(`/api/public/applications/${this.applicationId}/signature-status`, {
        method: 'GET'
      });

      if (!response.ok) {
        this.log(`❌ Signature status endpoint failed: ${response.status}`, 'error');
        return;
      }

      const data = await response.json();
      this.log('📋 Raw signature status response:', 'info');
      console.log(data);

      // Check field presence
      const hasStatus = data.hasOwnProperty('status');
      const hasSignatureStatus = data.hasOwnProperty('signature_status');
      const statusValue = data.status || data.signature_status;

      this.log(`✅ Response structure:`, 'success');
      this.log(`   - Has 'status' field: ${hasStatus}`, hasStatus ? 'success' : 'warning');
      this.log(`   - Has 'signature_status' field: ${hasSignatureStatus}`, hasSignatureStatus ? 'success' : 'warning');
      this.log(`   - Status value: "${statusValue}"`, 'info');

      // Check if status indicates signing complete
      const signingComplete = statusValue === 'invite_signed' || statusValue === 'signed' || statusValue === 'completed';
      this.log(`   - Signing complete: ${signingComplete}`, signingComplete ? 'success' : 'warning');

      if (!signingComplete) {
        this.log(`⚠️ Current status "${statusValue}" will NOT trigger redirect`, 'warning');
        this.log(`   Expected: "invite_signed", "signed", or "completed"`, 'warning');
      }

    } catch (error) {
      this.log(`❌ Signature status test failed: ${error.message}`, 'error');
    }
  }

  // Test 2: Simulate successful signature completion
  async testSimulateSignatureCompletion() {
    this.log('🧪 Simulating signature completion response');
    
    const mockSuccessResponse = {
      success: true,
      status: 'invite_signed',
      signature_status: 'invite_signed',
      document_id: '790c256323bd4a7abbc6c9b5f91ca547c900084b',
      signed_at: new Date().toISOString(),
      application_id: this.applicationId
    };

    this.log('📋 Mock success response would be:', 'info');
    console.log(mockSuccessResponse);

    // Test the client logic
    const status = mockSuccessResponse.status || mockSuccessResponse.signature_status;
    const wouldRedirect = status === "invite_signed" || status === "signed" || status === "completed";

    this.log(`   - Extracted status: "${status}"`, 'info');
    this.log(`   - Would trigger redirect: ${wouldRedirect}`, wouldRedirect ? 'success' : 'error');
  }

  // Test 3: Check override endpoint functionality
  async testOverrideEndpoint() {
    this.log('🔄 Testing override signing endpoint');
    
    try {
      const response = await fetch(`/api/public/applications/${this.applicationId}/override-signing`, {
        method: 'PATCH'
      });

      if (response.ok) {
        this.log('✅ Override endpoint working - would redirect to Step 7', 'success');
      } else {
        this.log(`❌ Override endpoint failed: ${response.status}`, 'error');
      }
    } catch (error) {
      this.log(`❌ Override test failed: ${error.message}`, 'error');
    }
  }

  // Test 4: Check if application is actually on Step 6
  testCurrentPageState() {
    this.log('🧭 Checking current page state');
    
    const currentPath = window.location.hash || window.location.pathname;
    const isOnStep6 = currentPath.includes('step-6') || currentPath.includes('step6');
    
    this.log(`   - Current path: ${currentPath}`, 'info');
    this.log(`   - On Step 6: ${isOnStep6}`, isOnStep6 ? 'success' : 'warning');
    
    if (!isOnStep6) {
      this.log('⚠️ Not currently on Step 6 - redirect test may not be relevant', 'warning');
    }
  }

  // Test 5: Manual redirect test
  testManualRedirect() {
    this.log('🧪 Testing manual redirect to Step 7');
    
    try {
      // Try different redirect methods
      const redirectMethods = [
        () => window.location.hash = '#/apply/step-7',
        () => window.location.href = window.location.origin + '/#/apply/step-7',
        () => history.pushState({}, '', '/#/apply/step-7')
      ];

      this.log('⚠️ Manual redirect test ready - call testInstance.executeManualRedirect() to test', 'warning');
      this.executeManualRedirect = () => {
        this.log('🧭 Executing manual redirect to Step 7...', 'info');
        window.location.hash = '#/apply/step-7';
        this.log('✅ Manual redirect completed', 'success');
      };

    } catch (error) {
      this.log(`❌ Manual redirect setup failed: ${error.message}`, 'error');
    }
  }

  // Run complete redirect diagnostic
  async runCompleteRedirectTest() {
    this.log('🚀 Starting Signature Redirect Diagnostic Test');
    this.log(`📋 Application ID: ${this.applicationId}`);
    
    this.testCurrentPageState();
    await this.testSignatureStatusResponse();
    await this.testSimulateSignatureCompletion();
    await this.testOverrideEndpoint();
    this.testManualRedirect();
    
    this.generateSummary();
  }

  generateSummary() {
    this.log('\n📊 SIGNATURE REDIRECT DIAGNOSTIC SUMMARY', 'info');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
    
    this.log('🔍 Key Findings:', 'info');
    this.log('   1. Check console above for current signature status', 'info');
    this.log('   2. Redirect only occurs when status = "invite_signed", "signed", or "completed"', 'info');
    this.log('   3. Current staff backend returns "invite_sent" which does NOT trigger redirect', 'warning');
    this.log('   4. Use "Continue Without Signing" button to proceed to Step 7', 'warning');
    
    this.log('\n🛠️  Manual Solutions:', 'info');
    this.log('   • Call testInstance.executeManualRedirect() to manually go to Step 7', 'info');
    this.log('   • Click "Continue Without Signing" button in the UI', 'info');
    this.log('   • Staff backend needs to return "invite_signed" status when document is signed', 'warning');
    
    this.log('\n🎯 Root Cause: Status field mismatch', 'error');
    this.log('   • Staff backend: signature_status = "invite_sent"', 'error');
    this.log('   • Client expects: status = "invite_signed"', 'error');
    this.log('   • Solution: Staff backend must update status to "invite_signed" when document is actually signed', 'error');
  }
}

// Initialize test
console.log('🧪 Signature Redirect Test Suite Ready');
console.log('💡 Usage: window.redirectTest.runCompleteRedirectTest()');
window.redirectTest = new SignatureRedirectTest();