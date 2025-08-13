/**
 * STEP 4-7 TEST MONITOR
 * Real-time monitoring of Step 4-7 workflow with SignNow integration testing
 * Run this in browser console during E2E testing
 */

class Step47TestMonitor {
  constructor() {
    this.startTime = Date.now();
    this.testEvents = [];
    this.applicationId = null;
    this.signingStatus = null;
    this.networkCalls = [];
    this.webhookEvents = [];
    this.setupMonitoring();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const event = { timestamp, message, type };
    this.testEvents.push(event);
    
    const color = type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue';
    // console.log(`%c[${timestamp}] ${message}`, `color: ${color}`);
  }

  setupMonitoring() {
    // Monitor localStorage changes for applicationId
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = (key, value) => {
      if (key === 'applicationId') {
        this.applicationId = value;
        this.log(`📊 ApplicationId stored: ${value}`, 'success');
      }
      return originalSetItem.call(this, key, value);
    };

    // Monitor network calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0];
      const options = args[1] || {};
      const startTime = Date.now();
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        const call = {
          url,
          method: options.method || 'GET',
          status: response.status,
          ok: response.ok,
          duration,
          timestamp: new Date().toISOString(),
          body: options.body ? JSON.stringify(JSON.parse(options.body)) : null
        };
        
        this.networkCalls.push(call);
        
        if (url.includes('/api/public/applications') && options.method === 'POST') {
          this.log(`📤 Step 4 application submission: ${response.status} ${response.statusText}`, 
                   response.ok ? 'success' : 'error');
        }
        
        if (url.includes('/api/public/signnow/initiate/')) {
          this.log(`🖊️ SignNow initiation: ${response.status} ${response.statusText}`, 
                   response.ok ? 'success' : 'error');
        }
        
        if (url.includes('/signature-status')) {
          this.log(`📡 Signature polling: ${response.status} - Status: ${this.signingStatus}`, 'info');
        }
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        const call = {
          url,
          method: options.method || 'GET',
          status: 'ERROR',
          ok: false,
          duration,
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        this.networkCalls.push(call);
        this.log(`❌ Network error: ${url} - ${error.message}`, 'error');
        throw error;
      }
    };

    // Monitor page navigation
    const originalPushState = history.pushState;
    history.pushState = function(state, title, url) {
      this.log(`🧭 Navigation: ${url}`, 'info');
      return originalPushState.call(this, state, title, url);
    }.bind(this);

    // Monitor iframe loading
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'IFRAME' && node.src.includes('signnow')) {
            this.log(`🖼️ SignNow iframe loaded: ${node.src}`, 'success');
            
            if (node.src.includes('temp_')) {
              this.log('⚠️ Using fallback URL - backend unavailable', 'error');
            } else {
              this.log('✅ Using real SignNow URL with template fields', 'success');
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.log('🔍 Step 4-7 monitoring started', 'success');
  }

  // Test Step 4 application creation
  async testStep4ApplicationCreation() {
    this.log('🧪 Testing Step 4 application creation', 'info');
    
    const formData = this.getFormData();
    if (!formData.step1 || !formData.step3 || !formData.step4) {
      this.log('❌ Missing required form data for Step 4', 'error');
      return false;
    }

    this.log('✅ Form data validation passed', 'success');
    this.log(`📊 Step 1 fields: ${Object.keys(formData.step1).length}`, 'info');
    this.log(`📊 Step 3 fields: ${Object.keys(formData.step3).length}`, 'info');
    this.log(`📊 Step 4 fields: ${Object.keys(formData.step4).length}`, 'info');

    // Submit Step 4 form
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      this.log('🚀 Submitting Step 4 application', 'info');
      submitButton.click();
      
      // Wait for response
      await this.waitForCondition(() => {
        return this.applicationId !== null;
      }, 15000);
      
      if (this.applicationId) {
        this.log(`✅ Application created successfully: ${this.applicationId}`, 'success');
        return true;
      }
    }
    
    this.log('❌ Step 4 application creation failed', 'error');
    return false;
  }

  // Test Step 6 SignNow integration
  async testStep6SignNowIntegration() {
    this.log('🧪 Testing Step 6 SignNow integration', 'info');
    
    if (!this.applicationId) {
      this.log('❌ No applicationId available for SignNow test', 'error');
      return false;
    }

    // Navigate to Step 6
    window.location.href = '/apply/step-6';
    await this.waitForPageLoad();

    // Wait for SignNow iframe to load
    await this.waitForCondition(() => {
      const iframe = document.querySelector('iframe[src*="signnow"]');
      return iframe !== null;
    }, 20000);

    const iframe = document.querySelector('iframe[src*="signnow"]');
    if (iframe) {
      this.log(`✅ SignNow iframe loaded: ${iframe.src}`, 'success');
      
      // Test iframe functionality
      this.testSignNowIframe(iframe);
      
      // Monitor for signature completion
      this.monitorSignatureCompletion();
      
      return true;
    }
    
    this.log('❌ SignNow iframe failed to load', 'error');
    return false;
  }

  testSignNowIframe(iframe) {
    this.log('🧪 Testing SignNow iframe functionality', 'info');
    
    // Check if it's a real or fallback URL
    if (iframe.src.includes('temp_')) {
      this.log('⚠️ Using fallback URL - template fields not populated', 'error');
      this.log('🔗 Backend SignNow endpoint not available', 'error');
    } else {
      this.log('✅ Using real SignNow URL with populated template fields', 'success');
    }
    
    // Test iframe events
    iframe.addEventListener('load', () => {
      this.log('📄 SignNow iframe loaded successfully', 'success');
    });
    
    iframe.addEventListener('error', (e) => {
      this.log(`❌ SignNow iframe error: ${e.message}`, 'error');
    });
  }

  monitorSignatureCompletion() {
    this.log('👁️ Monitoring signature completion and auto-redirect', 'info');
    
    // Check for signature status changes
    const statusInterval = setInterval(() => {
      // Monitor for redirect to Step 7
      if (window.location.pathname === '/apply/step-7') {
        this.log('✅ Auto-redirect to Step 7 detected', 'success');
        clearInterval(statusInterval);
        this.testStep7Finalization();
      }
    }, 2000);
    
    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(statusInterval);
      if (window.location.pathname !== '/apply/step-7') {
        this.log('⚠️ Auto-redirect timeout - testing manual continue', 'error');
        this.testManualContinue();
      }
    }, 120000);
  }

  testManualContinue() {
    this.log('🧪 Testing manual continue button', 'info');
    
    const continueButton = document.querySelector('button[data-testid="continue-without-signing--step4-7-monitor"]') ||
                          document.querySelector('button:contains("Continue")');
    
    if (continueButton) {
      this.log('🖱️ Clicking manual continue button', 'info');
      continueButton.click();
      
      setTimeout(() => {
        if (window.location.pathname === '/apply/step-7') {
          this.log('✅ Manual continue successful', 'success');
          this.testStep7Finalization();
        }
      }, 2000);
    }
  }

  async testStep7Finalization() {
    this.log('🧪 Testing Step 7 final submission', 'info');
    
    if (!this.applicationId) {
      this.log('❌ No applicationId for Step 7 submission', 'error');
      return false;
    }

    // Wait for Step 7 page to load
    await this.waitForPageLoad();
    
    // Find and click submit button
    const submitButton = document.querySelector('button[data-testid="final-submit--step4-7-monitor"]') ||
                        document.querySelector('button[type="submit"]');
    
    if (submitButton) {
      this.log('🚀 Submitting final application', 'info');
      submitButton.click();
      
      // Wait for submission completion
      await this.waitForCondition(() => {
        const successMessage = document.querySelector('[data-testid="success-message--step4-7-monitor-v1"]');
        return successMessage !== null;
      }, 15000);
      
      const successMessage = document.querySelector('[data-testid="success-message--step4-7-monitor-v2"]');
      if (successMessage) {
        this.log('✅ Step 7 final submission completed', 'success');
        return true;
      }
    }
    
    this.log('❌ Step 7 final submission failed', 'error');
    return false;
  }

  // Get current form data from context
  getFormData() {
    try {
      const formDataStr = localStorage.getItem('formData');
      if (formDataStr) {
        return JSON.parse(formDataStr);
      }
      return {};
    } catch (error) {
      this.log('❌ Error parsing form data from localStorage', 'error');
      return {};
    }
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

  async waitForPageLoad() {
    return new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
  }

  // Generate comprehensive test report
  generateTestReport() {
    const duration = Date.now() - this.startTime;
    const durationMins = Math.floor(duration / 60000);
    const durationSecs = Math.floor((duration % 60000) / 1000);
    
    // console.log('\n📊 STEP 4-7 TEST REPORT');
    // console.log(`⏱️  Duration: ${durationMins}m ${durationSecs}s`);
    // console.log(`📊 Events logged: ${this.testEvents.length}`);
    // console.log(`📊 Network calls: ${this.networkCalls.length}`);
    // console.log(`🆔 Application ID: ${this.applicationId || 'None'}`);
    
    // console.log('\n--- STEP 4 ANALYSIS ---');
    const step4Calls = this.networkCalls.filter(call => 
      call.url.includes('/api/public/applications') && call.method === 'POST'
    );
    
    if (step4Calls.length > 0) {
      const call = step4Calls[0];
      // console.log(`Status: ${call.status} ${call.ok ? '✅' : '❌'}`);
      // console.log(`Duration: ${call.duration}ms`);
      if (call.body) {
        // console.log('Payload structure:', JSON.parse(call.body));
      }
    }
    
    // console.log('\n--- STEP 6 ANALYSIS ---');
    const signNowCalls = this.networkCalls.filter(call => 
      call.url.includes('signnow')
    );
    
    // console.log(`SignNow calls: ${signNowCalls.length}`);
    signNowCalls.forEach((call, index) => {
      // console.log(`${index + 1}. ${call.method} ${call.url} - ${call.status}`);
    });
    
    // console.log('\n--- SIGNATURE POLLING ---');
    const pollingCalls = this.networkCalls.filter(call => 
      call.url.includes('signature-status')
    );
    
    // console.log(`Polling calls: ${pollingCalls.length}`);
    
    // console.log('\n--- ERRORS ---');
    const errors = this.testEvents.filter(event => event.type === 'error');
    // console.log(`Total errors: ${errors.length}`);
    errors.forEach((error, index) => {
      // console.log(`${index + 1}. ${error.message}`);
    });
  }
}

// Initialize the test monitor
// console.log('🔍 Step 4-7 Test Monitor Ready');
// console.log('💡 Usage:');
// console.log('  - window.testMonitor.testStep4ApplicationCreation()');
// console.log('  - window.testMonitor.testStep6SignNowIntegration()');
// console.log('  - window.testMonitor.generateTestReport()');

window.testMonitor = new Step47TestMonitor();