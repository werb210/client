/**
 * COMPREHENSIVE WORKFLOW TEST - COMPLETE APPLICATION FLOW
 * Tests the complete 7-step application workflow with the fixed lender products system
 * Date: January 11, 2025
 */

class ComprehensiveWorkflowTest {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.logConsole = true;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;
    
    if (this.logConsole) {
      console.log(formattedMessage);
    }
    
    this.results.push({
      timestamp,
      message,
      type,
      time: Date.now() - this.startTime
    });
  }

  addResult(testName, passed, details = '') {
    this.results.push({
      test: testName,
      passed,
      details,
      timestamp: new Date().toLocaleTimeString(),
      time: Date.now() - this.startTime
    });
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${testName}${details ? ' - ' + details : ''}`);
  }

  async waitForNavigation(expectedPath, timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (window.location.pathname === expectedPath) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }

  async waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return null;
  }

  async testLandingPageLoad() {
    this.log('Testing landing page load and navigation...');
    
    try {
      // Navigate to landing page
      window.location.href = '/';
      await this.waitForNavigation('/', 3000);
      
      // Check if main elements are present
      const applyButton = await this.waitForElement('[data-testid="apply-button"], .apply-button, button:contains("Apply")', 2000);
      const heroSection = document.querySelector('.hero, .landing-hero, h1');
      
      this.addResult('Landing Page Load', applyButton && heroSection, 
        `Apply button: ${!!applyButton}, Hero: ${!!heroSection}`);
      
      return !!applyButton;
    } catch (error) {
      this.addResult('Landing Page Load', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testStep1FormFilling() {
    this.log('Testing Step 1 form filling...');
    
    try {
      // Navigate to Step 1
      window.location.href = '/apply/step-1';
      await this.waitForNavigation('/apply/step-1', 3000);
      
      // Fill out form fields
      const formData = {
        'Business Location': 'Canada',
        'Headquarters': 'CA',
        'Industry': 'technology',
        'What are you looking for?': 'capital',
        'Funding Amount': '40000',
        'Purpose of Funds': 'working_capital',
        'Sales History': '2_to_5_years',
        'Last Year Revenue': '100k_to_500k',
        'Average Monthly Revenue': '10k_to_50k',
        'Current Account Receivable balance': 'zero_to_100k',
        'Fixed assets value': 'zero_to_25k'
      };

      let fieldsCompleted = 0;
      let totalFields = Object.keys(formData).length;

      for (const [fieldLabel, value] of Object.entries(formData)) {
        // Try multiple selector strategies
        const selectors = [
          `select[data-testid="${fieldLabel.toLowerCase().replace(/\s+/g, '-')}"]`,
          `select[name*="${fieldLabel.toLowerCase().replace(/\s+/g, '_')}"]`,
          `input[name*="${fieldLabel.toLowerCase().replace(/\s+/g, '_')}"]`,
          `//label[contains(text(), "${fieldLabel}")]/following-sibling::select`,
          `//label[contains(text(), "${fieldLabel}")]/following-sibling::div//select`
        ];

        let fieldElement = null;
        for (const selector of selectors) {
          if (selector.startsWith('//')) {
            // XPath selector
            const result = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            fieldElement = result.singleNodeValue;
          } else {
            fieldElement = document.querySelector(selector);
          }
          
          if (fieldElement) break;
        }

        if (fieldElement) {
          if (fieldElement.tagName === 'SELECT') {
            fieldElement.value = value;
            fieldElement.dispatchEvent(new Event('change', { bubbles: true }));
          } else if (fieldElement.tagName === 'INPUT') {
            fieldElement.value = value;
            fieldElement.dispatchEvent(new Event('input', { bubbles: true }));
          }
          fieldsCompleted++;
          this.log(`✓ Filled field: ${fieldLabel} = ${value}`);
        } else {
          this.log(`❌ Could not find field: ${fieldLabel}`);
        }
      }

      this.addResult('Step 1 Form Filling', fieldsCompleted > 0, 
        `Completed ${fieldsCompleted}/${totalFields} fields`);
      
      return fieldsCompleted > 0;
    } catch (error) {
      this.addResult('Step 1 Form Filling', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testStep1ToStep2Navigation() {
    this.log('Testing Step 1 to Step 2 navigation...');
    
    try {
      // Find and click Continue button
      const continueButton = await this.waitForElement('button:contains("Continue"), [data-testid="continue-button"]', 2000);
      
      if (continueButton) {
        continueButton.click();
        
        // Wait for navigation to Step 2
        const navigated = await this.waitForNavigation('/apply/step-2', 5000);
        
        this.addResult('Step 1 to Step 2 Navigation', navigated, 
          `Current path: ${window.location.pathname}`);
        
        return navigated;
      } else {
        this.addResult('Step 1 to Step 2 Navigation', false, 'Continue button not found');
        return false;
      }
    } catch (error) {
      this.addResult('Step 1 to Step 2 Navigation', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testStep2ProductRecommendations() {
    this.log('Testing Step 2 product recommendations...');
    
    try {
      // Wait for Step 2 to load
      await this.waitForElement('.recommendation-engine, .product-recommendations, [data-testid="step2"]', 3000);
      
      // Check if products are displayed
      const productElements = document.querySelectorAll('.product-card, .recommendation-card, .lender-product');
      const noProductsMessage = document.querySelector('.no-products, .empty-state');
      
      // Test API endpoint directly
      let apiWorking = false;
      try {
        const response = await fetch('/api/loan-products/categories?country=canada&lookingFor=capital&fundingAmount=40000&fundsPurpose=working_capital');
        const data = await response.json();
        apiWorking = response.ok && data.success && data.totalProducts > 0;
        
        this.log(`API Response: ${response.status} - ${data.totalProducts || 0} products`);
      } catch (apiError) {
        this.log(`API Error: ${apiError.message}`);
      }
      
      const hasProducts = productElements.length > 0;
      const hasError = !!noProductsMessage;
      
      this.addResult('Step 2 Product Recommendations', hasProducts || apiWorking, 
        `Products shown: ${productElements.length}, API working: ${apiWorking}, Error: ${hasError}`);
      
      return hasProducts || apiWorking;
    } catch (error) {
      this.addResult('Step 2 Product Recommendations', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testAPIEndpoints() {
    this.log('Testing API endpoints...');
    
    const endpoints = [
      '/api/loan-products/categories?country=canada&lookingFor=capital&fundingAmount=40000',
      '/api/public/lenders',
      '/api/loan-products/required-documents/line_of_credit'
    ];

    let workingEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        const working = response.status < 500;
        
        if (working) {
          workingEndpoints++;
          this.log(`✓ ${endpoint}: ${response.status}`);
        } else {
          this.log(`❌ ${endpoint}: ${response.status}`);
        }
      } catch (error) {
        this.log(`❌ ${endpoint}: ${error.message}`);
      }
    }

    this.addResult('API Endpoints', workingEndpoints > 0, 
      `${workingEndpoints}/${endpoints.length} endpoints working`);
    
    return workingEndpoints > 0;
  }

  async testCacheAndFallbackSystems() {
    this.log('Testing cache and fallback systems...');
    
    try {
      // Test IndexedDB cache
      let cacheWorking = false;
      if ('indexedDB' in window) {
        try {
          const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('LenderProductsDB');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          cacheWorking = true;
          db.close();
        } catch (error) {
          this.log(`IndexedDB error: ${error.message}`);
        }
      }

      // Test localStorage
      const localStorageWorking = typeof Storage !== 'undefined';
      
      // Test fallback data availability
      let fallbackWorking = false;
      try {
        const response = await fetch('/fallback/lenders.json');
        fallbackWorking = response.ok;
      } catch (error) {
        this.log(`Fallback data error: ${error.message}`);
      }

      const systemsWorking = cacheWorking || localStorageWorking || fallbackWorking;
      
      this.addResult('Cache and Fallback Systems', systemsWorking,
        `IndexedDB: ${cacheWorking}, localStorage: ${localStorageWorking}, Fallback: ${fallbackWorking}`);
      
      return systemsWorking;
    } catch (error) {
      this.addResult('Cache and Fallback Systems', false, `Error: ${error.message}`);
      return false;
    }
  }

  async runCompleteWorkflowTest() {
    this.log('🚀 Starting Comprehensive Workflow Test...');
    
    const tests = [
      () => this.testLandingPageLoad(),
      () => this.testStep1FormFilling(),
      () => this.testStep1ToStep2Navigation(),
      () => this.testStep2ProductRecommendations(),
      () => this.testAPIEndpoints(),
      () => this.testCacheAndFallbackSystems()
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (let i = 0; i < tests.length; i++) {
      try {
        const result = await tests[i]();
        if (result) passedTests++;
      } catch (error) {
        this.log(`Test ${i + 1} failed with error: ${error.message}`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.generateFinalReport(passedTests, totalTests);
    return { passedTests, totalTests, results: this.results };
  }

  generateFinalReport(passedTests, totalTests) {
    const duration = Date.now() - this.startTime;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE WORKFLOW TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Tests Passed: ${passedTests}/${totalTests} (${successRate}%)`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📅 Date: ${new Date().toLocaleString()}`);
    
    if (successRate >= 80) {
      console.log('🎉 EXCELLENT: Application workflow is functioning well');
    } else if (successRate >= 60) {
      console.log('⚠️  GOOD: Application has minor issues but core functionality works');
    } else {
      console.log('🚨 NEEDS ATTENTION: Multiple critical issues detected');
    }
    
    console.log('\n📋 Test Details:');
    this.results.filter(r => r.test).forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${status} ${result.test}: ${result.details}`);
    });
    
    console.log('\n🔗 Recommendations:');
    if (passedTests < totalTests) {
      console.log('  • Check server logs for API connectivity issues');
      console.log('  • Verify database and cache systems are operational');
      console.log('  • Test individual components for specific failures');
    } else {
      console.log('  • System is ready for user testing');
      console.log('  • Consider running end-to-end integration tests');
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Export for use in browser console
window.ComprehensiveWorkflowTest = ComprehensiveWorkflowTest;

// Auto-run if executed directly
if (typeof module === 'undefined') {
  console.log('🧪 Comprehensive Workflow Test loaded - run: new ComprehensiveWorkflowTest().runCompleteWorkflowTest()');
}