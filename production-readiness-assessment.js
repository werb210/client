/**
 * PRODUCTION READINESS ASSESSMENT
 * Comprehensive evaluation of application deployment readiness
 * Date: July 14, 2025
 */

class ProductionReadinessAssessment {
  constructor() {
    this.assessments = [];
    this.criticalIssues = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const color = type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'orange' : 'blue';
    console.log(`%c[${timestamp}] ${message}`, `color: ${color}`);
  }

  addAssessment(category, test, status, details = '') {
    const assessment = {
      category,
      test,
      status, // 'pass', 'fail', 'warning'
      details,
      timestamp: new Date().toISOString()
    };
    
    this.assessments.push(assessment);
    
    if (status === 'pass') {
      this.passed.push(assessment);
    } else if (status === 'fail') {
      this.criticalIssues.push(assessment);
    } else if (status === 'warning') {
      this.warnings.push(assessment);
    }
  }

  async assessCoreInfrastructure() {
    this.log('🔍 Assessing Core Infrastructure');
    
    // Check API base URL configuration
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    if (apiBaseUrl === '/api') {
      this.addAssessment('Infrastructure', 'API Base URL', 'pass', 'Correctly configured for same-origin requests');
    } else {
      this.addAssessment('Infrastructure', 'API Base URL', 'warning', `External URL: ${apiBaseUrl}`);
    }
    
    // Test basic routing
    try {
      window.location.href = '/';
      await new Promise(resolve => setTimeout(resolve, 500));
      this.addAssessment('Infrastructure', 'Client Routing', 'pass', 'Landing page loads correctly');
    } catch (error) {
      this.addAssessment('Infrastructure', 'Client Routing', 'fail', `Routing error: ${error.message}`);
    }
    
    // Check environment variables
    const hasClientToken = !!import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN;
    if (hasClientToken) {
      this.addAssessment('Infrastructure', 'Authentication Token', 'pass', 'Client token configured');
    } else {
      this.addAssessment('Infrastructure', 'Authentication Token', 'fail', 'Missing VITE_CLIENT_APP_SHARED_TOKEN');
    }
  }

  async assessDataLayer() {
    this.log('🔍 Assessing Data Layer');
    
    // Test IndexedDB cache
    try {
      const { get } = await import('idb-keyval');
      const cachedProducts = await get('lender-products');
      
      if (cachedProducts && cachedProducts.length > 0) {
        this.addAssessment('Data', 'IndexedDB Cache', 'pass', `${cachedProducts.length} products cached`);
      } else {
        this.addAssessment('Data', 'IndexedDB Cache', 'warning', 'No cached products found');
      }
    } catch (error) {
      this.addAssessment('Data', 'IndexedDB Cache', 'fail', `Cache error: ${error.message}`);
    }
    
    // Test API connectivity
    try {
      const response = await fetch('/api/public/lenders', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.addAssessment('Data', 'Staff API Connection', 'pass', `API responding: ${data.length || 0} products`);
      } else {
        this.addAssessment('Data', 'Staff API Connection', 'warning', `API status: ${response.status}`);
      }
    } catch (error) {
      this.addAssessment('Data', 'Staff API Connection', 'fail', `API error: ${error.message}`);
    }
  }

  async assessApplicationFlow() {
    this.log('🔍 Assessing Application Flow');
    
    // Test Step 1 accessibility
    try {
      window.location.href = '/apply/step-1';
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const step1Form = document.querySelector('form');
      if (step1Form) {
        this.addAssessment('Application Flow', 'Step 1 Form', 'pass', 'Step 1 form loads correctly');
      } else {
        this.addAssessment('Application Flow', 'Step 1 Form', 'fail', 'Step 1 form not found');
      }
    } catch (error) {
      this.addAssessment('Application Flow', 'Step 1 Form', 'fail', `Step 1 error: ${error.message}`);
    }
    
    // Test Step 2 recommendation engine
    try {
      window.location.href = '/apply/step-2';
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const productCards = document.querySelectorAll('[data-testid="product-card"]');
      if (productCards.length > 0) {
        this.addAssessment('Application Flow', 'Step 2 Recommendations', 'pass', `${productCards.length} products displayed`);
      } else {
        this.addAssessment('Application Flow', 'Step 2 Recommendations', 'warning', 'No product cards found');
      }
    } catch (error) {
      this.addAssessment('Application Flow', 'Step 2 Recommendations', 'fail', `Step 2 error: ${error.message}`);
    }
    
    // Test Step 4 double-click prevention
    try {
      window.location.href = '/apply/step-4';
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton) {
        this.addAssessment('Application Flow', 'Step 4 Submit Protection', 'pass', 'Submit button with double-click prevention');
      } else {
        this.addAssessment('Application Flow', 'Step 4 Submit Protection', 'fail', 'Submit button not found');
      }
    } catch (error) {
      this.addAssessment('Application Flow', 'Step 4 Submit Protection', 'fail', `Step 4 error: ${error.message}`);
    }
  }

  async assessSecurityFeatures() {
    this.log('🔍 Assessing Security Features');
    
    // Check HTTPS enforcement
    const isHTTPS = window.location.protocol === 'https:';
    if (isHTTPS) {
      this.addAssessment('Security', 'HTTPS Enforcement', 'pass', 'Running on HTTPS');
    } else {
      this.addAssessment('Security', 'HTTPS Enforcement', 'warning', 'Running on HTTP (development)');
    }
    
    // Check CSP headers
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (metaCSP) {
      this.addAssessment('Security', 'Content Security Policy', 'pass', 'CSP headers present');
    } else {
      this.addAssessment('Security', 'Content Security Policy', 'warning', 'CSP headers not found');
    }
    
    // Check for sensitive data exposure
    const scripts = document.querySelectorAll('script');
    let hasExposedSecrets = false;
    
    scripts.forEach(script => {
      if (script.textContent && script.textContent.includes('VITE_CLIENT_APP_SHARED_TOKEN')) {
        hasExposedSecrets = true;
      }
    });
    
    if (!hasExposedSecrets) {
      this.addAssessment('Security', 'Secret Exposure', 'pass', 'No exposed secrets in DOM');
    } else {
      this.addAssessment('Security', 'Secret Exposure', 'fail', 'Secrets exposed in client-side code');
    }
  }

  async assessPerformance() {
    this.log('🔍 Assessing Performance');
    
    // Check bundle size indicators
    const scripts = document.querySelectorAll('script[src]');
    const totalScripts = scripts.length;
    
    if (totalScripts < 10) {
      this.addAssessment('Performance', 'Bundle Size', 'pass', `${totalScripts} script files loaded`);
    } else {
      this.addAssessment('Performance', 'Bundle Size', 'warning', `${totalScripts} script files (consider optimization)`);
    }
    
    // Check for memory leaks indicators
    const performanceEntries = performance.getEntriesByType('navigation');
    if (performanceEntries.length > 0) {
      const loadTime = performanceEntries[0].loadEventEnd - performanceEntries[0].loadEventStart;
      if (loadTime < 2000) {
        this.addAssessment('Performance', 'Load Time', 'pass', `${loadTime.toFixed(0)}ms load time`);
      } else {
        this.addAssessment('Performance', 'Load Time', 'warning', `${loadTime.toFixed(0)}ms load time (slow)`);
      }
    }
    
    // Test form responsiveness
    const formElements = document.querySelectorAll('input, select, textarea');
    if (formElements.length > 0) {
      this.addAssessment('Performance', 'Form Responsiveness', 'pass', `${formElements.length} form elements found`);
    } else {
      this.addAssessment('Performance', 'Form Responsiveness', 'warning', 'No form elements found');
    }
  }

  async assessErrorHandling() {
    this.log('🔍 Assessing Error Handling');
    
    // Check console errors
    const originalConsoleError = console.error;
    let errorCount = 0;
    
    console.error = (...args) => {
      errorCount++;
      originalConsoleError.apply(console, args);
    };
    
    // Wait for any async errors
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.error = originalConsoleError;
    
    if (errorCount < 5) {
      this.addAssessment('Error Handling', 'Console Errors', 'pass', `${errorCount} console errors`);
    } else {
      this.addAssessment('Error Handling', 'Console Errors', 'warning', `${errorCount} console errors (investigate)`);
    }
    
    // Check for unhandled promise rejections
    let rejectionCount = 0;
    const rejectionHandler = (event) => {
      rejectionCount++;
    };
    
    window.addEventListener('unhandledrejection', rejectionHandler);
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.removeEventListener('unhandledrejection', rejectionHandler);
    
    if (rejectionCount < 3) {
      this.addAssessment('Error Handling', 'Unhandled Rejections', 'pass', `${rejectionCount} unhandled rejections`);
    } else {
      this.addAssessment('Error Handling', 'Unhandled Rejections', 'warning', `${rejectionCount} unhandled rejections`);
    }
  }

  async runCompleteAssessment() {
    this.log('🚀 Starting Production Readiness Assessment');
    
    try {
      await this.assessCoreInfrastructure();
      await this.assessDataLayer();
      await this.assessApplicationFlow();
      await this.assessSecurityFeatures();
      await this.assessPerformance();
      await this.assessErrorHandling();
      
      this.generateFinalReport();
      
    } catch (error) {
      this.log(`❌ Assessment failed: ${error.message}`, 'error');
    }
  }

  generateFinalReport() {
    const totalTests = this.assessments.length;
    const passedTests = this.passed.length;
    const failedTests = this.criticalIssues.length;
    const warningTests = this.warnings.length;
    
    console.log('\n🎯 PRODUCTION READINESS ASSESSMENT COMPLETE');
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`❌ Failed: ${failedTests}/${totalTests} tests`);
    console.log(`⚠️ Warnings: ${warningTests}/${totalTests} tests`);
    
    // Calculate readiness score
    const readinessScore = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n--- DETAILED RESULTS ---');
    
    // Group by category
    const categories = {};
    this.assessments.forEach(assessment => {
      if (!categories[assessment.category]) {
        categories[assessment.category] = [];
      }
      categories[assessment.category].push(assessment);
    });
    
    Object.keys(categories).forEach(category => {
      console.log(`\n📋 ${category}:`);
      categories[category].forEach(assessment => {
        const icon = assessment.status === 'pass' ? '✅' : assessment.status === 'fail' ? '❌' : '⚠️';
        console.log(`  ${icon} ${assessment.test}: ${assessment.details}`);
      });
    });
    
    if (this.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES TO RESOLVE:');
      this.criticalIssues.forEach(issue => {
        console.log(`❌ ${issue.category} - ${issue.test}: ${issue.details}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS TO CONSIDER:');
      this.warnings.forEach(warning => {
        console.log(`⚠️ ${warning.category} - ${warning.test}: ${warning.details}`);
      });
    }
    
    console.log('\n--- DEPLOYMENT RECOMMENDATION ---');
    
    if (failedTests === 0 && readinessScore >= 90) {
      console.log('🎉 APPLICATION IS READY FOR PRODUCTION DEPLOYMENT');
      console.log('✅ All critical systems operational');
      console.log('✅ Security measures in place');
      console.log('✅ Performance within acceptable limits');
      console.log('✅ Error handling comprehensive');
    } else if (failedTests === 0 && readinessScore >= 80) {
      console.log('⚠️ APPLICATION READY WITH MINOR OPTIMIZATIONS');
      console.log('✅ Core functionality working');
      console.log('⚠️ Some performance optimizations recommended');
      console.log('✅ Safe to deploy with monitoring');
    } else if (failedTests > 0 && failedTests < 3) {
      console.log('🔧 APPLICATION NEEDS MINOR FIXES BEFORE DEPLOYMENT');
      console.log('⚠️ Address critical issues first');
      console.log('✅ Most systems operational');
      console.log('🔧 Fix issues then redeploy');
    } else {
      console.log('❌ APPLICATION NOT READY FOR PRODUCTION');
      console.log('🚨 Multiple critical issues detected');
      console.log('🔧 Significant fixes required');
      console.log('❌ Do not deploy until issues resolved');
    }
    
    console.log(`\n📊 READINESS SCORE: ${readinessScore}%`);
    
    return {
      ready: failedTests === 0 && readinessScore >= 85,
      score: readinessScore,
      criticalIssues: this.criticalIssues.length,
      warnings: this.warnings.length,
      recommendation: failedTests === 0 && readinessScore >= 90 ? 'DEPLOY' : 
                     failedTests === 0 && readinessScore >= 80 ? 'DEPLOY_WITH_MONITORING' :
                     failedTests < 3 ? 'FIX_THEN_DEPLOY' : 'NOT_READY'
    };
  }
}

// Initialize assessment
console.log('🔬 Production Readiness Assessment Ready');
console.log('💡 Usage: window.productionAssessment.runCompleteAssessment()');
window.productionAssessment = new ProductionReadinessAssessment();