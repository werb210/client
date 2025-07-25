// e2e_live_test.js - Live Application Testing

const puppeteer = require('puppeteer');

async function runLiveE2ETest() {
  console.log('🚀 LIVE END-TO-END TEST EXECUTION');
  console.log('=' .repeat(80));
  
  let browser;
  let page;
  
  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to application
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
    
    // Test 1: Homepage Load
    console.log('\n📋 TEST 1: Homepage Load');
    const title = await page.title();
    console.log('✅ Page title:', title);
    
    // Test 2: Navigate to Apply
    console.log('\n📋 TEST 2: Navigate to Application Flow');
    
    // Look for apply button or link
    const applySelector = 'a[href*="apply"], button[data-testid*="apply"], .apply-button, [href="/apply/step-1"]';
    
    try {
      await page.waitForSelector(applySelector, { timeout: 5000 });
      await page.click(applySelector);
      console.log('✅ Successfully clicked apply button');
    } catch (error) {
      // Try direct navigation if button not found
      console.log('⚠️ Apply button not found, navigating directly...');
      await page.goto('http://localhost:5000/apply/step-1', { waitUntil: 'networkidle2' });
    }
    
    // Test 3: Step 1 - Business Basics
    console.log('\n📋 TEST 3: Step 1 - Business Basics');
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('step-1') || currentUrl.includes('apply')) {
      console.log('✅ Successfully reached Step 1');
      
      // Check for funding amount input
      const fundingInputs = await page.$$('input[type="number"], input[name*="amount"], input[id*="amount"]');
      
      if (fundingInputs.length > 0) {
        console.log('✅ Found funding amount input fields');
        
        // Fill funding amount
        await fundingInputs[0].type('75000');
        console.log('✅ Entered funding amount: $75,000');
      } else {
        console.log('⚠️ No funding amount inputs found');
      }
      
      // Check for next button
      const nextButtons = await page.$$('button:contains("Next"), button[data-testid*="next"], .next-button');
      
      if (nextButtons.length > 0) {
        console.log('✅ Found next button');
      } else {
        console.log('⚠️ No next button found');
      }
      
    } else {
      console.log('❌ Could not reach Step 1');
    }
    
    // Test 4: Form Elements Check
    console.log('\n📋 TEST 4: Form Elements Validation');
    
    const inputs = await page.$$('input');
    const buttons = await page.$$('button');
    const selects = await page.$$('select');
    
    console.log(`✅ Found ${inputs.length} input fields`);
    console.log(`✅ Found ${buttons.length} buttons`);
    console.log(`✅ Found ${selects.length} select elements`);
    
    // Test 5: Console Error Check
    console.log('\n📋 TEST 5: Console Error Check');
    
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });
    
    // Wait a moment to capture any errors
    await page.waitForTimeout(2000);
    
    if (consoleLogs.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log(`⚠️ Found ${consoleLogs.length} console errors:`);
      consoleLogs.forEach(log => console.log('  -', log));
    }
    
    // Test 6: Network Requests
    console.log('\n📋 TEST 6: Network Requests');
    
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
      }
    });
    
    // Trigger some interactions to generate API calls
    try {
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('⚠️ Page reload error:', error.message);
    }
    
    console.log(`✅ Captured ${responses.length} API requests`);
    responses.forEach(res => {
      console.log(`  - ${res.method} ${res.url} → ${res.status}`);
    });
    
    // Test 7: LocalStorage Check
    console.log('\n📋 TEST 7: LocalStorage Functionality');
    
    const localStorage = await page.evaluate(() => {
      return {
        length: window.localStorage.length,
        keys: Object.keys(window.localStorage),
        applicationId: window.localStorage.getItem('applicationId')
      };
    });
    
    console.log(`✅ LocalStorage contains ${localStorage.length} items`);
    console.log('✅ LocalStorage keys:', localStorage.keys);
    
    if (localStorage.applicationId) {
      console.log('✅ Application ID found:', localStorage.applicationId);
    } else {
      console.log('⚠️ No application ID in localStorage');
    }
    
  } catch (error) {
    console.log('❌ Test execution error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 LIVE E2E TEST COMPLETE');
  console.log('='.repeat(80));
}

// Check if running in Node.js environment
if (typeof require !== 'undefined' && require.main === module) {
  runLiveE2ETest().catch(console.error);
}

module.exports = { runLiveE2ETest };