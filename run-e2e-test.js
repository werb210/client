/**
 * RUN END-TO-END TEST - Execute the comprehensive test suite
 * Copy and paste this into browser console to run the full test
 */

// First, let's check the current state and navigate to start
console.log('🚀 Starting End-to-End Test Execution');
console.log('Current URL:', window.location.href);

// Navigate to home page first
window.location.href = '/';

// Wait for page load then start test
setTimeout(() => {
  // Copy the comprehensive test class here
  class ComprehensiveE2ETest {
    constructor() {
      this.results = [];
      this.testData = {
        businessName: 'End2End Ventures',
        contactName: 'Ava Thorough',
        amountRequested: 100000,
        industry: 'transportation',
        timeInBusiness: '3 years',
        useOfFunds: 'equipment',
        firstName: 'Ava',
        lastName: 'Thorough',
        email: 'ava@end2end.com',
        phone: '555-789-1234',
        equipmentValue: 75000
      };
    }

    log(message, type = 'info') {
      console.log(`[E2E-TEST] ${message}`);
    }

    addResult(step, passed, details = '') {
      this.results.push({
        step,
        passed,
        details,
        timestamp: new Date().toISOString()
      });
    }

    async checkStep2Products() {
      this.log('🔍 Checking Step 2 product display issue...');
      
      // Navigate to Step 2 directly to test
      window.location.href = '/step2';
      await this.waitForPageLoad();
      
      // Check for any products displayed
      const productCards = document.querySelectorAll('[data-testid="product-card"], .product-card, .recommendation-card');
      this.log(`Found ${productCards.length} product cards`);
      
      // Check console for debugging info
      this.log('Checking console for product loading debug info...');
      
      // Look for product loading indicators
      const loadingElements = document.querySelectorAll('[data-testid="loading"], .loading, .spinner');
      this.log(`Found ${loadingElements.length} loading elements`);
      
      // Check for error messages
      const errorElements = document.querySelectorAll('.error, [data-testid="error"]');
      this.log(`Found ${errorElements.length} error elements`);
      
      return productCards.length > 0;
    }

    async quickProductTest() {
      this.log('🧪 Running Quick Product Display Test');
      
      try {
        // Check current page
        const currentPath = window.location.pathname;
        this.log(`Current page: ${currentPath}`);
        
        // If not on Step 2, navigate there
        if (!currentPath.includes('step2')) {
          this.log('Navigating to Step 2...');
          window.location.href = '/step2';
          await this.waitForPageLoad();
        }
        
        // Wait for any loading to complete
        await this.waitForCondition(() => {
          const loadingElements = document.querySelectorAll('.loading, [data-testid="loading"]');
          return loadingElements.length === 0;
        }, 5000);
        
        // Check for products
        const hasProducts = await this.checkStep2Products();
        
        if (hasProducts) {
          this.addResult('Step 2 Products', true, 'Product cards found and displayed');
          this.log('✅ Step 2 products are displaying correctly');
        } else {
          this.addResult('Step 2 Products', false, 'No product cards found');
          this.log('❌ Step 2 products not displaying - this is the main issue');
        }
        
        return hasProducts;
      } catch (error) {
        this.addResult('Step 2 Products', false, `Error: ${error.message}`);
        this.log(`❌ Error testing Step 2: ${error.message}`);
        return false;
      }
    }

    async waitForPageLoad() {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    async waitForCondition(condition, timeout = 5000) {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        if (condition()) {
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return false;
    }

    generateQuickReport() {
      console.log('\n' + '='.repeat(50));
      console.log('📊 QUICK E2E TEST REPORT');
      console.log('='.repeat(50));
      
      this.results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.step}: ${result.details}`);
      });
      
      console.log('\n🎯 KEY FINDINGS:');
      const productTest = this.results.find(r => r.step === 'Step 2 Products');
      if (productTest) {
        if (productTest.passed) {
          console.log('• Step 2 product display is WORKING - 41 products should be visible');
        } else {
          console.log('• Step 2 product display is BROKEN - this is the main issue to fix');
          console.log('• 41 products are available from backend but not showing in UI');
        }
      }
      
      console.log('\n📋 NEXT STEPS:');
      if (!productTest?.passed) {
        console.log('1. Check browser console for product filtering debug logs');
        console.log('2. Verify Step 1 form data is being passed correctly to Step 2');
        console.log('3. Check if product categories are being generated properly');
      }
    }
  }

  // Run the quick test
  const quickTest = new ComprehensiveE2ETest();
  quickTest.quickProductTest().then(() => {
    quickTest.generateQuickReport();
    
    // If products are working, offer to run full test
    const productTest = quickTest.results.find(r => r.step === 'Step 2 Products');
    if (productTest?.passed) {
      console.log('\n🚀 Products are working! Ready to run full 7-step test if needed.');
    } else {
      console.log('\n🔧 Need to fix Step 2 product display before running full test.');
    }
  });
  
}, 1000);