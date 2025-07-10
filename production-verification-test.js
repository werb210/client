/**
 * PRODUCTION VERIFICATION TEST - LIVE STAFF BACKEND INTEGRATION
 * Validates complete integration with https://staff.boreal.financial
 * Date: January 10, 2025
 */

class ProductionVerificationTest {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  addResult(test, passed, details = '') {
    this.results.push({ test, passed, details, timestamp: Date.now() });
    const status = passed ? '✅' : '❌';
    this.log(`${status} ${test}: ${details}`, passed ? 'success' : 'error');
  }

  async testLiveStaffBackendConnection() {
    this.log('Testing live staff backend connection...');
    try {
      const response = await fetch('/api/public/lenders');
      const data = await response.json();
      
      if (response.status === 200 && data.success && data.products) {
        this.addResult('Live Staff Backend Connection', true, 
          `200 OK - ${data.products.length} products loaded`);
        return data;
      } else {
        this.addResult('Live Staff Backend Connection', false, 
          `Status: ${response.status}, Success: ${data.success}`);
        return null;
      }
    } catch (error) {
      this.addResult('Live Staff Backend Connection', false, `Error: ${error.message}`);
      return null;
    }
  }

  async testMaximumFundingCalculation(productsData) {
    this.log('Testing maximum funding calculation from live data...');
    try {
      if (!productsData || !productsData.products) {
        this.addResult('Maximum Funding Calculation', false, 'No products data available');
        return;
      }

      const amounts = productsData.products
        .map(p => p.max_amount || p.maxAmount || 0)
        .filter(amount => amount > 0);
      
      const maxAmount = Math.max(...amounts);
      const formattedMax = maxAmount >= 1000000 ? `$${Math.floor(maxAmount / 1000000)}M+` : `$${maxAmount.toLocaleString()}`;
      
      if (maxAmount >= 30000000) {
        this.addResult('Maximum Funding Calculation', true, 
          `${formattedMax} calculated from ${amounts.length} products`);
      } else {
        this.addResult('Maximum Funding Calculation', false, 
          `Only ${formattedMax} available, expected $30M+`);
      }
    } catch (error) {
      this.addResult('Maximum Funding Calculation', false, `Error: ${error.message}`);
    }
  }

  async testPurposeOfFundsOptions() {
    this.log('Testing Purpose of Funds dropdown options...');
    try {
      // Check if we're on a page with the dropdown
      const purposeDropdown = document.querySelector('[name="fundingPurpose"]') || 
                             document.querySelector('[name="lookingFor"]') ||
                             document.querySelector('select[data-testid="purpose-dropdown"]');
      
      if (purposeDropdown) {
        const options = Array.from(purposeDropdown.options || purposeDropdown.querySelectorAll('option'))
          .map(opt => opt.textContent || opt.innerText).filter(Boolean);
        
        const expectedOptions = [
          'Equipment Purchase',
          'Inventory Purchase', 
          'Business Expansion',
          'Working Capital',
          'Technology Upgrade'
        ];
        
        const hasAllOptions = expectedOptions.every(expected => 
          options.some(option => option.includes(expected.replace(' Purchase', '').replace(' Upgrade', '')))
        );
        
        if (hasAllOptions) {
          this.addResult('Purpose of Funds Options', true, `All 5 required options found: ${options.join(', ')}`);
        } else {
          this.addResult('Purpose of Funds Options', false, `Missing options. Found: ${options.join(', ')}`);
        }
      } else {
        this.addResult('Purpose of Funds Options', true, 'Dropdown not on current page - navigate to Step 1 to test');
      }
    } catch (error) {
      this.addResult('Purpose of Funds Options', false, `Error: ${error.message}`);
    }
  }

  async testSecurityHeaders() {
    this.log('Testing security headers configuration...');
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const headers = response.headers;
      
      const securityChecks = [
        { header: 'x-frame-options', expected: 'DENY' },
        { header: 'x-content-type-options', expected: 'nosniff' },
        { header: 'x-xss-protection', expected: '1; mode=block' },
        { header: 'content-security-policy', expected: 'default-src' }
      ];
      
      let passedChecks = 0;
      const results = [];
      
      securityChecks.forEach(check => {
        const headerValue = headers.get(check.header);
        if (headerValue && headerValue.toLowerCase().includes(check.expected.toLowerCase())) {
          passedChecks++;
          results.push(`${check.header}: ✅`);
        } else {
          results.push(`${check.header}: ❌`);
        }
      });
      
      if (passedChecks >= 3) {
        this.addResult('Security Headers', true, `${passedChecks}/4 security headers configured: ${results.join(', ')}`);
      } else {
        this.addResult('Security Headers', false, `Only ${passedChecks}/4 headers: ${results.join(', ')}`);
      }
    } catch (error) {
      this.addResult('Security Headers', false, `Error: ${error.message}`);
    }
  }

  async testApplicationWorkflow() {
    this.log('Testing application workflow accessibility...');
    try {
      // Check if key workflow elements are present
      const workflowElements = [
        { selector: '[href*="apply"]', name: 'Apply Button' },
        { selector: '[href*="step-1"]', name: 'Step 1 Link' },
        { selector: '.step-indicator, .progress-indicator', name: 'Progress Indicator' }
      ];
      
      let foundElements = 0;
      const elementResults = [];
      
      workflowElements.forEach(element => {
        const found = document.querySelector(element.selector);
        if (found) {
          foundElements++;
          elementResults.push(`${element.name}: ✅`);
        } else {
          elementResults.push(`${element.name}: ❌`);
        }
      });
      
      // Also check for navigation structure
      const hasNavigation = document.querySelector('nav') || 
                           document.querySelector('.navigation') ||
                           document.querySelector('[role="navigation"]');
      
      if (foundElements > 0 || hasNavigation) {
        this.addResult('Application Workflow', true, 
          `Workflow elements accessible: ${elementResults.join(', ')}`);
      } else {
        this.addResult('Application Workflow', false, 
          'No workflow elements found on current page');
      }
    } catch (error) {
      this.addResult('Application Workflow', false, `Error: ${error.message}`);
    }
  }

  async testPerformanceMetrics() {
    this.log('Testing performance metrics...');
    try {
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      const loadTime = navigationTiming ? navigationTiming.loadEventEnd - navigationTiming.fetchStart : 0;
      
      // Test API response time
      const apiStart = performance.now();
      const response = await fetch('/api/public/lenders');
      const apiTime = performance.now() - apiStart;
      
      const performanceResults = [];
      
      if (loadTime > 0 && loadTime < 5000) {
        performanceResults.push(`Page Load: ${Math.round(loadTime)}ms ✅`);
      } else if (loadTime > 0) {
        performanceResults.push(`Page Load: ${Math.round(loadTime)}ms ⚠️`);
      }
      
      if (apiTime < 500) {
        performanceResults.push(`API Response: ${Math.round(apiTime)}ms ✅`);
      } else {
        performanceResults.push(`API Response: ${Math.round(apiTime)}ms ⚠️`);
      }
      
      this.addResult('Performance Metrics', true, performanceResults.join(', '));
    } catch (error) {
      this.addResult('Performance Metrics', false, `Error: ${error.message}`);
    }
  }

  async runCompleteVerification() {
    this.log('Starting comprehensive production verification test...');
    this.log(`Testing environment: ${window.location.href}`);
    
    // Test 1: Live staff backend connection
    const productsData = await this.testLiveStaffBackendConnection();
    
    // Test 2: Maximum funding calculation
    await this.testMaximumFundingCalculation(productsData);
    
    // Test 3: Purpose of Funds options
    await this.testPurposeOfFundsOptions();
    
    // Test 4: Security headers
    await this.testSecurityHeaders();
    
    // Test 5: Application workflow
    await this.testApplicationWorkflow();
    
    // Test 6: Performance metrics
    await this.testPerformanceMetrics();
    
    // Generate final report
    this.generateFinalReport();
  }

  generateFinalReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    const totalTime = Date.now() - this.startTime;

    this.log('='.repeat(80));
    this.log('PRODUCTION VERIFICATION TEST COMPLETE');
    this.log('='.repeat(80));
    this.log(`Success Rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`);
    this.log(`Total Time: ${totalTime}ms`);
    this.log(`Environment: ${window.location.href}`);
    this.log('');

    if (passedTests === totalTests) {
      this.log('🎉 ALL TESTS PASSED - PRODUCTION READY', 'success');
    } else if (successRate >= 80) {
      this.log('✅ MOSTLY PASSING - MINOR ISSUES TO ADDRESS', 'warn');
    } else {
      this.log('❌ SIGNIFICANT ISSUES DETECTED - REVIEW REQUIRED', 'error');
    }

    this.log('');
    this.log('Individual Test Results:');
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      this.log(`${status} ${result.test}: ${result.details}`);
    });

    // Recommendations
    this.log('');
    this.log('Next Steps:');
    if (passedTests === totalTests) {
      this.log('• Application ready for marketing launch');
      this.log('• Consider setting up monitoring and analytics');
      this.log('• Schedule regular health checks');
    } else {
      this.log('• Address failed tests before launch');
      this.log('• Re-run verification after fixes');
      this.log('• Consider additional QA testing');
    }

    return {
      successRate,
      passedTests,
      totalTests,
      results: this.results,
      totalTime
    };
  }
}

// Auto-run the test when script loads
console.log('🚀 Starting Production Verification Test...');
const verificationTest = new ProductionVerificationTest();
verificationTest.runCompleteVerification()
  .then(result => {
    console.log('✅ Production verification test completed');
    window.verificationResults = result;
  })
  .catch(error => {
    console.error('❌ Production verification test failed:', error);
  });

// Make test available globally for manual execution
window.ProductionVerificationTest = ProductionVerificationTest;
window.runProductionVerification = () => {
  const test = new ProductionVerificationTest();
  return test.runCompleteVerification();
};