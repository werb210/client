#!/usr/bin/env node

/**
 * Test Step 1 → Step 2 Data Flow
 * Verifies that form data flows properly from Step 1 to Step 2 without console errors
 */

const puppeteer = require('puppeteer');

async function testStep1ToStep2Flow() {
  console.log('🚀 Testing Step 1 → Step 2 data flow...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    // Navigate to Step 1
    await page.goto('http://localhost:5000/apply/step-1');
    console.log('✅ Step 1 loaded');
    
    // Wait a moment for any initialization
    await page.waitForTimeout(2000);
    
    // Fill out Step 1 form with test data
    console.log('📝 Filling Step 1 form...');
    
    // Select industry (Professional Services should be default)
    await page.selectOption('select[name="industry"]', 'professional_services');
    
    // Select looking for (Capital should be default)
    await page.selectOption('select[name="lookingFor"]', 'capital');
    
    // Enter funding amount (should have default)
    const fundingAmountField = await page.$('input[name="fundingAmount"]');
    if (fundingAmountField) {
      await fundingAmountField.fill('75000');
    }
    
    // Select other defaults
    await page.selectOption('select[name="fundsPurpose"]', 'working_capital');
    await page.selectOption('select[name="salesHistory"]', '1-3yr');
    await page.selectOption('select[name="revenueLastYear"]', '100000');
    await page.selectOption('select[name="averageMonthlyRevenue"]', '10000');
    
    console.log('✅ Step 1 form filled');
    
    // Submit form (navigate to Step 2)
    console.log('🔄 Submitting to Step 2...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to Step 2
    await page.waitForTimeout(3000);
    
    // Check if we're on Step 2
    const currentUrl = page.url();
    const isOnStep2 = currentUrl.includes('/apply/step-2');
    
    if (isOnStep2) {
      console.log('✅ Successfully navigated to Step 2');
      
      // Check for specific console errors related to our fixes
      const amountErrors = consoleErrors.filter(error => 
        error.includes('Cannot read properties of undefined') && 
        (error.includes('amount') || error.includes('industry'))
      );
      
      if (amountErrors.length === 0) {
        console.log('✅ No console errors about undefined property access!');
      } else {
        console.log('❌ Found console errors:', amountErrors);
      }
      
      // Check if Step 2 component rendered properly
      const step2Content = await page.$('.recommendation, .product-matching, [class*="Step2"]');
      if (step2Content) {
        console.log('✅ Step 2 component rendered successfully');
      }
      
    } else {
      console.log('❌ Failed to navigate to Step 2. Current URL:', currentUrl);
    }
    
    console.log('\n📊 CONSOLE ERROR SUMMARY:');
    console.log(`Total console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors found:');
      consoleErrors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    } else {
      console.log('🎉 No console errors detected!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testStep1ToStep2Flow()
    .then(() => console.log('✅ Test completed'))
    .catch(err => console.error('❌ Test error:', err));
}

module.exports = { testStep1ToStep2Flow };