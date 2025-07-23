/**
 * LIVE APPLICATION TESTING - MOBILE UI & ACCESSIBILITY
 * Direct testing on the running client application
 */

import puppeteer from 'puppeteer';

async function runLiveTests() {
  console.log('🔴 LIVE APPLICATION TESTING - CLIENT AT http://localhost:5000');
  console.log('==============================================================');
  
  let browser;
  try {
    // Launch browser in mobile mode
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 375,
        height: 812,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
      }
    });
    
    const page = await browser.newPage();
    
    // Set mobile user agent
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
    
    // Navigate to application
    console.log('📱 Loading client application...');
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Test 1: Check if app loads
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Test 2: Form elements
    const formElements = await page.$$eval('input, select, textarea', elements => 
      elements.map(el => ({
        type: el.type || el.tagName.toLowerCase(),
        hasLabel: !!el.labels?.length || !!el.getAttribute('aria-label'),
        placeholder: el.placeholder || '',
        required: el.required
      }))
    );
    
    console.log(`📝 Form elements found: ${formElements.length}`);
    const labeledElements = formElements.filter(el => el.hasLabel).length;
    console.log(`📝 Properly labeled: ${labeledElements}/${formElements.length}`);
    
    // Test 3: Navigation buttons
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(btn => ({
        text: btn.textContent.trim(),
        visible: btn.offsetWidth > 0 && btn.offsetHeight > 0,
        enabled: !btn.disabled
      }))
    );
    
    console.log(`🔘 Buttons found: ${buttons.length}`);
    const visibleButtons = buttons.filter(btn => btn.visible).length;
    console.log(`🔘 Visible buttons: ${visibleButtons}/${buttons.length}`);
    
    // Test 4: Check for specific application steps
    const stepElements = await page.$$eval('[class*="step"], [data-step]', elements => elements.length);
    console.log(`📊 Step indicators found: ${stepElements}`);
    
    // Test 5: Upload components
    const uploadElements = await page.$$eval('input[type="file"], [class*="upload"], [class*="dropzone"]', elements => elements.length);
    console.log(`📤 Upload components found: ${uploadElements}`);
    
    // Test 6: Check mobile viewport
    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    }));
    console.log(`📱 Viewport: ${viewport.width}x${viewport.height} (${viewport.devicePixelRatio}x DPR)`);
    
    // Test 7: Check accessibility features
    const a11yFeatures = await page.evaluate(() => {
      const hasSkipLink = !!document.querySelector('a[href*="#main"], a[href*="#content"], .skip-link');
      const hasAriaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]').length;
      const hasProperHeadings = document.querySelectorAll('h1').length > 0;
      const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').length;
      
      return {
        hasSkipLink,
        ariaLabels: hasAriaLabels,
        hasProperHeadings,
        focusableElements
      };
    });
    
    console.log(`♿ Skip link: ${a11yFeatures.hasSkipLink ? 'YES' : 'NO'}`);
    console.log(`♿ ARIA labels: ${a11yFeatures.ariaLabels}`);
    console.log(`♿ H1 headings: ${a11yFeatures.hasProperHeadings ? 'YES' : 'NO'}`);
    console.log(`♿ Focusable elements: ${a11yFeatures.focusableElements}`);
    
    // Test 8: Performance metrics
    const metrics = await page.metrics();
    console.log(`⚡ DOM nodes: ${metrics.Nodes}`);
    console.log(`⚡ JS heap used: ${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`);
    
    // Test 9: Error checking
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit for any errors to surface
    await page.waitForTimeout(2000);
    
    console.log(`🐛 Console errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('First 3 errors:');
      errors.slice(0, 3).forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    // Test 10: Take a screenshot for visual verification
    await page.screenshot({ path: 'mobile-test-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved: mobile-test-screenshot.png');
    
    // Calculate overall score
    const tests = [
      { name: 'App loads', pass: title.length > 0 },
      { name: 'Form accessibility', pass: labeledElements / Math.max(formElements.length, 1) >= 0.8 },
      { name: 'Button visibility', pass: visibleButtons / Math.max(buttons.length, 1) >= 0.8 },
      { name: 'Upload components', pass: uploadElements > 0 },
      { name: 'Mobile viewport', pass: viewport.width <= 500 },
      { name: 'ARIA support', pass: a11yFeatures.ariaLabels > 5 },
      { name: 'Keyboard navigation', pass: a11yFeatures.focusableElements > 10 },
      { name: 'No critical errors', pass: errors.length === 0 }
    ];
    
    const passedTests = tests.filter(t => t.pass).length;
    const totalTests = tests.length;
    
    console.log('');
    console.log('🎯 LIVE APPLICATION TEST RESULTS:');
    console.log(`Tests passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    console.log('');
    
    tests.forEach(test => {
      console.log(`${test.pass ? '✅' : '❌'} ${test.name}`);
    });
    
    console.log('');
    console.log(`🏁 LIVE TESTING RESULT: ${passedTests >= 6 ? 'PASS' : 'NEEDS ATTENTION'}`);
    
    return {
      score: `${passedTests}/${totalTests}`,
      percentage: Math.round(passedTests/totalTests*100),
      passed: passedTests >= 6
    };
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    return { error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if called directly
const isMainModule = process.argv[1] && process.argv[1].endsWith('run-live-tests.js');
if (isMainModule) {
  runLiveTests().then(result => {
    console.log('Test completed:', result);
    process.exit(result.passed ? 0 : 1);
  });
}

export { runLiveTests };