/**
 * STEP 4-7 TESTING MONITOR
 * Run this in browser console to track errors during Step 4 → Step 7 workflow
 * Date: July 14, 2025
 */

class Step4to7TestMonitor {
  constructor() {
    this.errors = [];
    this.networkCalls = [];
    this.stepProgress = [];
    this.startTime = Date.now();
    this.setupErrorTracking();
    this.setupNetworkMonitoring();
    this.setupStepTracking();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logEntry);
    
    if (type === 'error') {
      this.errors.push({ timestamp, message, step: this.getCurrentStep() });
    }
  }

  setupErrorTracking() {
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.log(`Unhandled Promise Rejection: ${event.reason}`, 'error');
    });

    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.log(`JavaScript Error: ${event.error?.message || event.message}`, 'error');
    });

    // Override console.error to track application errors
    const originalError = console.error;
    console.error = (...args) => {
      this.log(`Console Error: ${args.join(' ')}`, 'error');
      originalError.apply(console, args);
    };
  }

  setupNetworkMonitoring() {
    // Override fetch to monitor API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = args[0];
      const options = args[1] || {};
      
      this.log(`API Call: ${options.method || 'GET'} ${url}`, 'network');
      
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
        
        if (response.ok) {
          this.log(`API Success: ${response.status} ${url} (${duration}ms)`, 'network');
        } else {
          this.log(`API Error: ${response.status} ${url} (${duration}ms)`, 'error');
        }
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.log(`API Failed: ${url} - ${error.message} (${duration}ms)`, 'error');
        throw error;
      }
    };
  }

  setupStepTracking() {
    // Monitor URL changes to track step progression
    let currentPath = window.location.pathname;
    
    const checkStepChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        currentPath = newPath;
        const step = this.getStepFromPath(newPath);
        if (step) {
          this.stepProgress.push({
            step,
            path: newPath,
            timestamp: new Date().toISOString()
          });
          this.log(`Step Change: Moved to ${step} (${newPath})`, 'step');
        }
      }
    };

    // Check for step changes every 500ms
    setInterval(checkStepChange, 500);
  }

  getStepFromPath(path) {
    if (path.includes('step-4')) return 'Step 4';
    if (path.includes('step-5')) return 'Step 5';
    if (path.includes('step-6')) return 'Step 6';
    if (path.includes('step-7')) return 'Step 7';
    return null;
  }

  getCurrentStep() {
    return this.getStepFromPath(window.location.pathname) || 'Unknown';
  }

  // Test specific Step 4 application creation
  async testStep4ApplicationCreation() {
    this.log('Testing Step 4 application creation...', 'test');
    
    try {
      // Check if form data is present
      const formData = localStorage.getItem('financialFormData');
      if (!formData) {
        this.log('No form data found in localStorage', 'error');
        return false;
      }
      
      const parsed = JSON.parse(formData);
      const hasStep1 = parsed.step1 && Object.keys(parsed.step1).length > 0;
      const hasStep3 = parsed.step3 && Object.keys(parsed.step3).length > 0;
      
      this.log(`Form data check: Step1=${hasStep1}, Step3=${hasStep3}`, 'test');
      
      if (!hasStep1 || !hasStep3) {
        this.log('Missing required step data for Step 4 submission', 'error');
        return false;
      }
      
      return true;
    } catch (error) {
      this.log(`Step 4 test failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Test Step 5 document upload endpoints
  async testStep5DocumentUpload() {
    this.log('Testing Step 5 document upload readiness...', 'test');
    
    try {
      const applicationId = localStorage.getItem('applicationId');
      if (!applicationId) {
        this.log('No applicationId found - Step 4 must complete first', 'error');
        return false;
      }
      
      // Check if the upload endpoint format is correct
      const expectedEndpoint = `/api/public/documents/${applicationId}`;
      this.log(`Expected upload endpoint: ${expectedEndpoint}`, 'test');
      
      return true;
    } catch (error) {
      this.log(`Step 5 test failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Test Step 6 SignNow integration
  async testStep6SignNowIntegration() {
    this.log('Testing Step 6 SignNow integration readiness...', 'test');
    
    try {
      const applicationId = localStorage.getItem('applicationId');
      if (!applicationId) {
        this.log('No applicationId found - Step 6 requires valid application', 'error');
        return false;
      }
      
      // Check if SignNow endpoint would be called
      const expectedEndpoint = `/api/public/applications/${applicationId}/signing-status`;
      this.log(`Expected SignNow endpoint: ${expectedEndpoint}`, 'test');
      
      return true;
    } catch (error) {
      this.log(`Step 6 test failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Generate comprehensive test report
  generateTestReport() {
    const duration = Date.now() - this.startTime;
    const durationMins = Math.floor(duration / 60000);
    const durationSecs = Math.floor((duration % 60000) / 1000);
    
    console.log('\n=== STEP 4-7 TEST MONITOR REPORT ===');
    console.log(`Test Duration: ${durationMins}m ${durationSecs}s`);
    console.log(`Current Step: ${this.getCurrentStep()}`);
    console.log(`Total Errors: ${this.errors.length}`);
    console.log(`Network Calls: ${this.networkCalls.length}`);
    console.log(`Step Changes: ${this.stepProgress.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n--- ERRORS DETECTED ---');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.timestamp}] [${error.step}] ${error.message}`);
      });
    }
    
    if (this.networkCalls.length > 0) {
      console.log('\n--- NETWORK ACTIVITY ---');
      this.networkCalls.forEach((call, index) => {
        const status = call.ok ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${call.method} ${call.url} (${call.status}) - ${call.duration}ms`);
      });
    }
    
    if (this.stepProgress.length > 0) {
      console.log('\n--- STEP PROGRESSION ---');
      this.stepProgress.forEach((step, index) => {
        console.log(`${index + 1}. ${step.step} - ${step.timestamp}`);
      });
    }
    
    console.log('\n=== END REPORT ===\n');
    
    return {
      duration,
      errors: this.errors,
      networkCalls: this.networkCalls,
      stepProgress: this.stepProgress,
      summary: {
        totalErrors: this.errors.length,
        totalNetworkCalls: this.networkCalls.length,
        totalStepChanges: this.stepProgress.length,
        currentStep: this.getCurrentStep()
      }
    };
  }
}

// Initialize monitor
console.log('🔍 Step 4-7 Test Monitor initialized');
console.log('📊 Tracking errors, network calls, and step progression...');
console.log('💡 Run monitor.generateTestReport() to see results');

window.monitor = new Step4to7TestMonitor();

// Auto-generate report every 30 seconds
setInterval(() => {
  if (window.monitor.errors.length > 0) {
    console.log(`⚠️  ${window.monitor.errors.length} errors detected so far...`);
  }
}, 30000);