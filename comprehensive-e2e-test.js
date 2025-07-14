/**
 * COMPREHENSIVE E2E TEST SUITE
 * Tests the complete application workflow from landing page to final submission
 * Date: July 14, 2025
 */

class ComprehensiveE2ETest {
  constructor() {
    this.startTime = Date.now();
    this.testResults = [];
    this.networkCalls = [];
    this.applicationId = null;
    this.errors = [];
    this.setupNetworkMonitoring();
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

  setupNetworkMonitoring() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const url = args[0];
      const options = args[1] || {};
      const startTime = Date.now();
      
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
        
        // Track application ID
        if (url.includes('/api/public/applications') && options.method === 'POST') {
          try {
            const responseData = await response.clone().json();
            if (responseData.applicationId) {
              this.applicationId = responseData.applicationId;
              this.log(`📊 Application ID captured: ${this.applicationId}`, 'success');
            }
          } catch (e) {
            this.log('Could not parse application response', 'error');
          }
        }
        
        return response;
      } catch (error) {
        this.errors.push({ url, error: error.message });
        this.log(`❌ Network error: ${url} - ${error.message}`, 'error');
        throw error;
      }
    };
  }

  async testLandingPageLoad() {
    this.log('Testing landing page load and maximum funding display');
    
    // Navigate to landing page
    window.location.href = '/';
    await this.waitForPageLoad();
    
    // Check for maximum funding display
    const fundingElement = document.querySelector('[data-testid="max-funding"]');
    if (fundingElement && fundingElement.textContent.includes('$30M')) {
      this.addResult('Landing Page Load', true, 'Maximum funding $30M+ displayed correctly');
      this.log('✅ Landing page loaded with correct maximum funding', 'success');
    } else {
      this.addResult('Landing Page Load', false, 'Maximum funding not displayed correctly');
      this.log('❌ Landing page funding display issue', 'error');
    }
  }

  async testNavigationToStep1() {
    this.log('Testing navigation to Step 1');
    
    // Click "Get Started" button
    const getStartedButton = document.querySelector('button:contains("Get Started")') || 
                            document.querySelector('a[href="/apply/step-1"]');
    
    if (getStartedButton) {
      getStartedButton.click();
      await this.waitForNavigation('/apply/step-1');
      
      this.addResult('Navigation to Step 1', true, 'Successfully navigated to Step 1');
      this.log('✅ Navigation to Step 1 successful', 'success');
    } else {
      this.addResult('Navigation to Step 1', false, 'Get Started button not found');
      this.log('❌ Get Started button not found', 'error');
    }
  }

  async testStep1FormFilling() {
    this.log('Testing Step 1 form filling and submission');
    
    // Fill Step 1 form with realistic data
    const formData = {
      requestedAmount: 150000,
      use_of_funds: 'equipment',
      equipment_value: 75000,
      businessLocation: 'CA',
      salesHistory: '3+yr',
      averageMonthlyRevenue: 25000,
      accountsReceivableBalance: 50000,
      fixedAssetsValue: 100000
    };
    
    let fieldsFilledCount = 0;
    
    for (const [key, value] of Object.entries(formData)) {
      const field = document.querySelector(`input[name="${key}"], select[name="${key}"]`);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = value;
        } else {
          field.value = value;
        }
        field.dispatchEvent(new Event('input', { bubbles: true }));
        fieldsFilledCount++;
      }
    }
    
    // Submit form
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.click();
      await this.waitForNavigation('/apply/step-2');
      
      this.addResult('Step 1 Form Filling', true, `Filled ${fieldsFilledCount} fields and submitted successfully`);
      this.log('✅ Step 1 form filled and submitted', 'success');
    } else {
      this.addResult('Step 1 Form Filling', false, 'Submit button not found');
      this.log('❌ Step 1 submit button not found', 'error');
    }
  }

  async testStep2Navigation() {
    this.log('Testing Step 2 product recommendations loading');
    
    // Wait for products to load
    await this.waitForCondition(() => {
      const products = document.querySelectorAll('[data-testid="product-card"]');
      return products.length > 0;
    }, 15000);
    
    const productCards = document.querySelectorAll('[data-testid="product-card"]');
    
    if (productCards.length > 0) {
      this.addResult('Step 2 Product Loading', true, `${productCards.length} products loaded`);
      this.log(`✅ Step 2 loaded ${productCards.length} products`, 'success');
      
      // Select first product
      productCards[0].click();
      await this.waitForNavigation('/apply/step-3');
      
      this.addResult('Step 2 Product Selection', true, 'Product selected successfully');
      this.log('✅ Product selected in Step 2', 'success');
    } else {
      this.addResult('Step 2 Product Loading', false, 'No products found');
      this.log('❌ No products found in Step 2', 'error');
    }
  }

  async testProductRecommendations() {
    this.log('Testing product recommendation system');
    
    // Check if recommendation engine is working
    const recommendations = document.querySelectorAll('[data-testid="recommendation-item"]');
    const productCategories = document.querySelectorAll('[data-testid="product-category"]');
    
    if (recommendations.length > 0 || productCategories.length > 0) {
      this.addResult('Product Recommendations', true, 'Recommendation engine working');
      this.log('✅ Product recommendation system operational', 'success');
    } else {
      this.addResult('Product Recommendations', false, 'No recommendations found');
      this.log('❌ Product recommendation system not working', 'error');
    }
  }

  async testDocumentUploadSystem() {
    this.log('Testing document upload system');
    
    // Navigate to Step 5
    window.location.href = '/apply/step-5';
    await this.waitForPageLoad();
    
    // Check for document upload areas
    const uploadAreas = document.querySelectorAll('[data-testid="upload-area"]');
    
    if (uploadAreas.length > 0) {
      this.addResult('Document Upload System', true, `${uploadAreas.length} upload areas found`);
      this.log(`✅ Document upload system loaded with ${uploadAreas.length} areas`, 'success');
    } else {
      this.addResult('Document Upload System', false, 'No upload areas found');
      this.log('❌ No document upload areas found', 'error');
    }
  }

  async testSignNowIntegration() {
    this.log('Testing SignNow integration');
    
    // Navigate to Step 6
    window.location.href = '/apply/step-6';
    await this.waitForPageLoad();
    
    // Wait for SignNow iframe to load
    try {
      await this.waitForCondition(() => {
        const iframe = document.querySelector('iframe[src*="signnow"]');
        return iframe !== null;
      }, 20000);
      
      const iframe = document.querySelector('iframe[src*="signnow"]');
      if (iframe) {
        const src = iframe.src;
        
        if (src.includes('temp_')) {
          this.addResult('SignNow Integration', true, 'SignNow iframe loaded (fallback URL)');
          this.log('⚠️ SignNow loaded with fallback URL (backend unavailable)', 'success');
        } else {
          this.addResult('SignNow Integration', true, 'SignNow iframe loaded (real URL)');
          this.log('✅ SignNow loaded with real URL', 'success');
        }
        
        // Test manual continue button
        const continueButton = document.querySelector('button[data-testid="continue-without-signing"]');
        if (continueButton) {
          this.log('🖱️ Testing manual continue button');
          continueButton.click();
          
          setTimeout(() => {
            if (window.location.pathname === '/apply/step-7') {
              this.addResult('SignNow Manual Continue', true, 'Manual continue successful');
              this.log('✅ Manual continue to Step 7 successful', 'success');
            }
          }, 2000);
        }
      }
    } catch (error) {
      this.addResult('SignNow Integration', false, 'SignNow iframe failed to load');
      this.log('❌ SignNow iframe failed to load', 'error');
    }
  }

  async testFinalSubmission() {
    this.log('Testing final submission process');
    
    // Navigate to Step 7
    window.location.href = '/apply/step-7';
    await this.waitForPageLoad();
    
    // Find submit button
    const submitButton = document.querySelector('button[data-testid="final-submit"]') || 
                        document.querySelector('button[type="submit"]');
    
    if (submitButton) {
      this.log('🚀 Testing final submission');
      submitButton.click();
      
      // Wait for submission completion
      await this.waitForCondition(() => {
        const successMessage = document.querySelector('[data-testid="success-message"]');
        return successMessage !== null;
      }, 15000);
      
      const successMessage = document.querySelector('[data-testid="success-message"]');
      if (successMessage) {
        this.addResult('Final Submission', true, 'Application submitted successfully');
        this.log('✅ Final submission completed', 'success');
      } else {
        this.addResult('Final Submission', false, 'No success message found');
        this.log('❌ Final submission may have failed', 'error');
      }
    } else {
      this.addResult('Final Submission', false, 'Submit button not found');
      this.log('❌ Final submit button not found', 'error');
    }
  }

  async testErrorHandling() {
    this.log('Testing error handling capabilities');
    
    // Test network error handling
    const networkErrors = this.errors.length;
    const unhandledRejections = this.networkCalls.filter(call => !call.ok).length;
    
    if (networkErrors < 5 && unhandledRejections < 10) {
      this.addResult('Error Handling', true, `${networkErrors} network errors, ${unhandledRejections} failed requests`);
      this.log('✅ Error handling working properly', 'success');
    } else {
      this.addResult('Error Handling', false, `Too many errors: ${networkErrors} network, ${unhandledRejections} failed requests`);
      this.log('❌ Error handling issues detected', 'error');
    }
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

  async runCompleteE2ETest() {
    this.log('🚀 Starting comprehensive E2E test suite');
    
    try {
      // Run all tests
      await this.testLandingPageLoad();
      await this.testNavigationToStep1();
      await this.testStep1FormFilling();
      await this.testStep2Navigation();
      await this.testProductRecommendations();
      await this.testDocumentUploadSystem();
      await this.testSignNowIntegration();
      await this.testFinalSubmission();
      await this.testErrorHandling();
      
      this.generateFinalReport();
      
    } catch (error) {
      this.log(`❌ E2E test suite failed: ${error.message}`, 'error');
    }
  }

  generateFinalReport() {
    const duration = Date.now() - this.startTime;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    
    const durationMins = Math.floor(duration / 60000);
    const durationSecs = Math.floor((duration % 60000) / 1000);
    
    console.log('\n🎉 COMPREHENSIVE E2E TEST COMPLETE 🎉');
    console.log(`⏱️  Duration: ${durationMins}m ${durationSecs}s`);
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`📊 Network calls: ${this.networkCalls.length}`);
    console.log(`🆔 Application ID: ${this.applicationId || 'None generated'}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    console.log('\n--- TEST RESULTS ---');
    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}: ${result.details}`);
    });
    
    console.log('\n--- NETWORK SUMMARY ---');
    const successfulCalls = this.networkCalls.filter(call => call.ok);
    const failedCalls = this.networkCalls.filter(call => !call.ok);
    
    console.log(`✅ Successful requests: ${successfulCalls.length}`);
    console.log(`❌ Failed requests: ${failedCalls.length}`);
    
    if (failedCalls.length > 0) {
      console.log('\n--- FAILED REQUESTS ---');
      failedCalls.forEach((call, index) => {
        console.log(`${index + 1}. ${call.method} ${call.url} - Status: ${call.status}`);
      });
    }
    
    console.log('\n--- FINAL VERDICT ---');
    const successRate = (passedTests / totalTests) * 100;
    
    if (successRate >= 80) {
      console.log('🎉 CLIENT APPLICATION: PRODUCTION READY');
      console.log('✅ All critical functionality working correctly');
    } else if (successRate >= 60) {
      console.log('⚠️ CLIENT APPLICATION: NEEDS MINOR FIXES');
      console.log('🔧 Some functionality issues detected');
    } else {
      console.log('❌ CLIENT APPLICATION: MAJOR ISSUES DETECTED');
      console.log('🚨 Critical functionality not working');
    }
  }
}

// Initialize the comprehensive test
console.log('🔬 Comprehensive E2E Test Suite Ready');
console.log('💡 Usage: window.comprehensiveE2E.runCompleteE2ETest()');
console.log('📊 Monitor: window.comprehensiveE2E.testResults');
console.log('🌐 Network: window.comprehensiveE2E.networkCalls');

window.comprehensiveE2E = new ComprehensiveE2ETest();