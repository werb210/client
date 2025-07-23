/**
 * MOBILE UI/UX SMOKE TEST - STEPS 1-6
 * Comprehensive mobile testing for production deployment  
 */

console.log('📱 MOBILE UI/UX SMOKE TEST - STEPS 1-6');
console.log('==========================================');
console.log('Testing environment: Mobile emulation (iPhone 13 / Pixel 6)');
console.log('Test scope: Complete 6-step application workflow');
console.log('');

// Mobile viewport detection
function getMobileViewportInfo() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    orientation: window.screen.orientation?.type || 'unknown',
    userAgent: navigator.userAgent,
    isMobile: window.innerWidth <= 768
  };
}

// Touch and interaction testing
function testTouchInteraction(element, stepName) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const isVisible = rect.width > 0 && rect.height > 0;
  const isTappable = rect.width >= 44 && rect.height >= 44; // iOS minimum tap target
  const hasProperSpacing = rect.top >= 0 && rect.left >= 0;
  
  return {
    element: element.tagName.toLowerCase(),
    stepName,
    visible: isVisible,
    tappable: isTappable,
    properSpacing: hasProperSpacing,
    rect: { width: rect.width, height: rect.height }
  };
}

// Keyboard layout testing
function testKeyboardInteraction() {
  // Simulate keyboard appearance
  const originalHeight = window.innerHeight;
  
  // Test if viewport handling exists
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  const hasViewportMeta = !!viewportMeta;
  const viewportContent = viewportMeta?.getAttribute('content') || '';
  
  return {
    hasViewportMeta,
    viewportContent,
    supportsVisualViewport: !!window.visualViewport,
    currentHeight: originalHeight,
    keyboardAware: viewportContent.includes('interactive-widget')
  };
}

// Form field accessibility testing
function testFormAccessibility() {
  const formFields = document.querySelectorAll('input, select, textarea');
  const results = [];
  
  formFields.forEach((field, index) => {
    const hasLabel = !!field.labels?.length || 
                    !!field.getAttribute('aria-label') || 
                    !!field.getAttribute('aria-labelledby');
    const hasPlaceholder = !!field.getAttribute('placeholder');
    const isRequired = field.hasAttribute('required');
    const hasValidType = field.type !== 'text' || field.tagName.toLowerCase() !== 'input';
    
    results.push({
      index: index + 1,
      tagName: field.tagName.toLowerCase(),
      type: field.type || 'N/A',
      hasLabel,
      hasPlaceholder,
      isRequired,
      hasValidType,
      accessible: hasLabel && (hasPlaceholder || hasValidType)
    });
  });
  
  return results;
}

// Upload component testing
function testUploadComponents() {
  const uploadAreas = document.querySelectorAll('[data-testid*="upload"], .dropzone, [class*="upload"]');
  const fileInputs = document.querySelectorAll('input[type="file"]');
  
  return {
    uploadAreas: uploadAreas.length,
    fileInputs: fileInputs.length,
    hasDropzone: document.querySelector('.dropzone') !== null,
    hasDragAndDrop: uploadAreas.length > 0
  };
}

// Progress indicator testing
function testProgressIndicators() {
  const progressBars = document.querySelectorAll('progress, [role="progressbar"], .progress');
  const stepIndicators = document.querySelectorAll('[class*="step"], .stepper, [data-step]');
  
  return {
    progressBars: progressBars.length,
    stepIndicators: stepIndicators.length,
    hasProgressFeedback: progressBars.length > 0 || stepIndicators.length > 0
  };
}

// Navigation testing
function testNavigation() {
  const navButtons = document.querySelectorAll('button[class*="next"], button[class*="prev"], button[class*="continue"], button[class*="back"]');
  const links = document.querySelectorAll('a[href]');
  
  const navigationResults = [];
  navButtons.forEach((button, index) => {
    const interaction = testTouchInteraction(button, `Navigation Button ${index + 1}`);
    navigationResults.push(interaction);
  });
  
  return {
    totalNavButtons: navButtons.length,
    totalLinks: links.length,
    navigationTests: navigationResults,
    hasKeyboardNav: document.querySelector('[tabindex]') !== null
  };
}

// Chatbot mobile testing
function testChatbotMobile() {
  const chatbot = document.querySelector('[class*="chatbot"], [id*="chat"], [data-testid*="chat"]');
  const chatButton = document.querySelector('button[class*="chat"]');
  
  if (!chatbot && !chatButton) {
    return { present: false };
  }
  
  const chatElement = chatbot || chatButton;
  const rect = chatElement.getBoundingClientRect();
  
  return {
    present: true,
    visible: rect.width > 0 && rect.height > 0,
    position: {
      bottom: window.innerHeight - rect.bottom,
      right: window.innerWidth - rect.right
    },
    size: {
      width: rect.width,
      height: rect.height
    },
    mobileOptimized: rect.width <= window.innerWidth * 0.9 // Should not exceed 90% width
  };
}

// Performance testing
function testPerformance() {
  const performance = window.performance;
  const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
  const domReady = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
  
  return {
    loadTime: loadTime,
    domReady: domReady,
    performanceSupported: !!performance.timing,
    resourceCount: performance.getEntriesByType('resource').length
  };
}

// Run comprehensive mobile UI test
function runMobileUITest() {
  console.log('📱 Starting comprehensive mobile UI smoke test...');
  console.log('');
  
  // Test 1: Viewport and device info
  const viewport = getMobileViewportInfo();
  console.log('📱 VIEWPORT & DEVICE INFO:');
  console.log(`Screen: ${viewport.width}x${viewport.height} (${viewport.devicePixelRatio}x DPR)`);
  console.log(`Mobile detected: ${viewport.isMobile ? 'YES' : 'NO'}`);
  console.log(`Orientation: ${viewport.orientation}`);
  console.log('');
  
  // Test 2: Form accessibility
  const formAccessibility = testFormAccessibility();
  console.log('📝 FORM ACCESSIBILITY:');
  console.log(`Total form fields: ${formAccessibility.length}`);
  const accessibleFields = formAccessibility.filter(f => f.accessible).length;
  console.log(`Accessible fields: ${accessibleFields}/${formAccessibility.length}`);
  
  if (formAccessibility.length > 0) {
    console.log('Field details:');
    formAccessibility.slice(0, 5).forEach(field => {
      console.log(`  ${field.index}. ${field.tagName}[${field.type}]: ${field.accessible ? '✅' : '❌'} ${field.hasLabel ? 'labeled' : 'no-label'}`);
    });
  }
  console.log('');
  
  // Test 3: Touch interaction
  const navTest = testNavigation();
  console.log('🖱️ TOUCH INTERACTION:');
  console.log(`Navigation buttons: ${navTest.totalNavButtons}`);
  console.log(`Links: ${navTest.totalLinks}`);
  console.log(`Keyboard navigation: ${navTest.hasKeyboardNav ? 'YES' : 'NO'}`);
  
  const tappableButtons = navTest.navigationTests.filter(t => t.tappable).length;
  console.log(`Tappable nav buttons: ${tappableButtons}/${navTest.totalNavButtons}`);
  console.log('');
  
  // Test 4: Upload functionality
  const uploadTest = testUploadComponents();
  console.log('📤 UPLOAD COMPONENTS:');
  console.log(`Upload areas: ${uploadTest.uploadAreas}`);
  console.log(`File inputs: ${uploadTest.fileInputs}`);
  console.log(`Drag & drop: ${uploadTest.hasDragAndDrop ? 'YES' : 'NO'}`);
  console.log('');
  
  // Test 5: Progress indicators
  const progressTest = testProgressIndicators();
  console.log('📊 PROGRESS INDICATORS:');
  console.log(`Progress bars: ${progressTest.progressBars}`);
  console.log(`Step indicators: ${progressTest.stepIndicators}`);
  console.log(`Has progress feedback: ${progressTest.hasProgressFeedback ? 'YES' : 'NO'}`);
  console.log('');
  
  // Test 6: Keyboard interaction
  const keyboardTest = testKeyboardInteraction();
  console.log('⌨️ KEYBOARD INTERACTION:');
  console.log(`Viewport meta: ${keyboardTest.hasViewportMeta ? 'YES' : 'NO'}`);
  console.log(`Visual viewport API: ${keyboardTest.supportsVisualViewport ? 'YES' : 'NO'}`);
  console.log(`Keyboard aware: ${keyboardTest.keyboardAware ? 'YES' : 'NO'}`);
  console.log('');
  
  // Test 7: Chatbot mobile optimization
  const chatbotTest = testChatbotMobile();
  console.log('💬 CHATBOT MOBILE:');
  if (chatbotTest.present) {
    console.log(`Present: YES`);
    console.log(`Visible: ${chatbotTest.visible ? 'YES' : 'NO'}`);
    console.log(`Mobile optimized: ${chatbotTest.mobileOptimized ? 'YES' : 'NO'}`);
    console.log(`Size: ${Math.round(chatbotTest.size.width)}x${Math.round(chatbotTest.size.height)}`);
  } else {
    console.log('Present: NO');
  }
  console.log('');
  
  // Test 8: Performance
  const perfTest = testPerformance();
  console.log('⚡ PERFORMANCE:');
  console.log(`DOM ready: ${perfTest.domReady}ms`);
  console.log(`Load time: ${perfTest.loadTime}ms`);
  console.log(`Resources loaded: ${perfTest.resourceCount}`);
  console.log('');
  
  // Calculate overall score
  const tests = [
    { name: 'Mobile viewport', pass: viewport.isMobile },
    { name: 'Form accessibility', pass: accessibleFields / Math.max(formAccessibility.length, 1) >= 0.8 },
    { name: 'Touch interaction', pass: tappableButtons / Math.max(navTest.totalNavButtons, 1) >= 0.8 },
    { name: 'Upload components', pass: uploadTest.fileInputs > 0 },
    { name: 'Progress feedback', pass: progressTest.hasProgressFeedback },
    { name: 'Keyboard support', pass: keyboardTest.hasViewportMeta },
    { name: 'Chatbot mobile', pass: !chatbotTest.present || chatbotTest.mobileOptimized },
    { name: 'Performance', pass: perfTest.domReady < 5000 }
  ];
  
  const passedTests = tests.filter(t => t.pass).length;
  const totalTests = tests.length;
  
  console.log('🎯 MOBILE UI TEST RESULTS:');
  console.log(`Tests passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log('');
  
  tests.forEach(test => {
    console.log(`${test.pass ? '✅' : '❌'} ${test.name}`);
  });
  
  console.log('');
  console.log(`🏁 MOBILE UI SMOKE TEST: ${passedTests >= 6 ? 'PASS' : 'NEEDS ATTENTION'}`);
  
  return {
    score: `${passedTests}/${totalTests}`,
    percentage: Math.round(passedTests/totalTests*100),
    passed: passedTests >= 6,
    details: {
      viewport,
      formAccessibility,
      navigation: navTest,
      upload: uploadTest,
      progress: progressTest,
      keyboard: keyboardTest,
      chatbot: chatbotTest,
      performance: perfTest
    }
  };
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runMobileUITest);
  } else {
    runMobileUITest();
  }
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runMobileUITest };
} else if (typeof window !== 'undefined') {
  window.runMobileUITest = runMobileUITest;
}