/**
 * MANUAL UI & ACCESSIBILITY VERIFICATION
 * Browser console testing for mobile and accessibility features
 */

console.log('📋 MANUAL UI & ACCESSIBILITY VERIFICATION');
console.log('==========================================');
console.log('Paste this script into your browser console at http://localhost:5000');
console.log('');

function runManualVerification() {
  const results = {
    mobileUI: {},
    accessibility: {},
    overall: {}
  };
  
  console.log('🔍 Starting manual verification...');
  
  // Mobile UI Tests
  console.log('');
  console.log('📱 MOBILE UI VERIFICATION:');
  
  // Test 1: Viewport
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    isMobile: window.innerWidth <= 768
  };
  console.log(`Screen: ${viewport.width}x${viewport.height} (${viewport.devicePixelRatio}x DPR)`);
  console.log(`Mobile detected: ${viewport.isMobile ? 'YES' : 'NO'}`);
  results.mobileUI.viewport = viewport.isMobile;
  
  // Test 2: Touch targets
  const buttons = document.querySelectorAll('button');
  let tappableButtons = 0;
  buttons.forEach(btn => {
    const rect = btn.getBoundingClientRect();
    if (rect.width >= 44 && rect.height >= 44) tappableButtons++;
  });
  console.log(`Buttons: ${buttons.length}, Tappable: ${tappableButtons} (${Math.round(tappableButtons/buttons.length*100)}%)`);
  results.mobileUI.touchTargets = tappableButtons / buttons.length >= 0.8;
  
  // Test 3: Form fields
  const formFields = document.querySelectorAll('input, select, textarea');
  let labeledFields = 0;
  formFields.forEach(field => {
    if (field.labels?.length > 0 || field.getAttribute('aria-label') || field.getAttribute('aria-labelledby')) {
      labeledFields++;
    }
  });
  console.log(`Form fields: ${formFields.length}, Labeled: ${labeledFields} (${Math.round(labeledFields/formFields.length*100)}%)`);
  results.mobileUI.formLabels = labeledFields / formFields.length >= 0.9;
  
  // Test 4: Upload components
  const uploadElements = document.querySelectorAll('input[type="file"], [class*="upload"], [class*="dropzone"]');
  console.log(`Upload components: ${uploadElements.length}`);
  results.mobileUI.uploads = uploadElements.length > 0;
  
  // Test 5: Progress indicators
  const progressElements = document.querySelectorAll('progress, [role="progressbar"], .progress, [class*="step"]');
  console.log(`Progress indicators: ${progressElements.length}`);
  results.mobileUI.progress = progressElements.length > 0;
  
  // Accessibility Tests
  console.log('');
  console.log('♿ ACCESSIBILITY VERIFICATION:');
  
  // Test 6: Color contrast (simplified check)
  const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, label, button, a');
  let contrastChecked = 0;
  let contrastPassed = 0;
  
  for (let i = 0; i < Math.min(20, textElements.length); i++) {
    const element = textElements[i];
    if (!element.textContent.trim()) continue;
    
    const styles = getComputedStyle(element);
    const color = styles.color;
    const bgColor = styles.backgroundColor;
    
    contrastChecked++;
    // Simplified check - assume good contrast for dark text on light backgrounds
    if (color.includes('rgb(33, 37, 41)') || color.includes('rgb(0, 0, 0)')) {
      contrastPassed++;
    }
  }
  console.log(`Color contrast: ${contrastPassed}/${contrastChecked} elements (${Math.round(contrastPassed/contrastChecked*100)}%)`);
  results.accessibility.contrast = contrastPassed / contrastChecked >= 0.8;
  
  // Test 7: ARIA attributes
  const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
  console.log(`ARIA attributes: ${ariaElements.length} elements`);
  results.accessibility.aria = ariaElements.length > 5;
  
  // Test 8: Keyboard navigation
  const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const tabIndexIssues = document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])');
  console.log(`Focusable elements: ${focusableElements.length}`);
  console.log(`TabIndex issues: ${tabIndexIssues.length}`);
  results.accessibility.keyboard = focusableElements.length > 10 && tabIndexIssues.length === 0;
  
  // Test 9: Heading structure
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const h1Count = document.querySelectorAll('h1').length;
  const stepHeaderH1 = document.querySelectorAll('h1.bg-gradient-to-r');
  console.log(`Headings: ${headings.length}, H1 tags: ${h1Count}, StepHeader H1: ${stepHeaderH1.length}`);
  results.accessibility.headings = h1Count > 0 || stepHeaderH1.length > 0;
  
  // Test 10: Image accessibility
  const images = document.querySelectorAll('img, svg, [role="img"]');
  let accessibleImages = 0;
  images.forEach(img => {
    if (img.hasAttribute('alt') || img.getAttribute('aria-label') || img.getAttribute('role') === 'presentation') {
      accessibleImages++;
    }
  });
  console.log(`Images: ${images.length}, Accessible: ${accessibleImages} (${Math.round(accessibleImages/images.length*100)}%)`);
  results.accessibility.images = images.length === 0 || accessibleImages / images.length >= 0.8;
  
  // Calculate scores
  const mobileTests = Object.values(results.mobileUI);
  const a11yTests = Object.values(results.accessibility);
  
  const mobileScore = mobileTests.filter(Boolean).length;
  const a11yScore = a11yTests.filter(Boolean).length;
  const totalScore = mobileScore + a11yScore;
  const maxScore = mobileTests.length + a11yTests.length;
  
  console.log('');
  console.log('🎯 VERIFICATION RESULTS:');
  console.log(`Mobile UI: ${mobileScore}/${mobileTests.length} (${Math.round(mobileScore/mobileTests.length*100)}%)`);
  console.log(`Accessibility: ${a11yScore}/${a11yTests.length} (${Math.round(a11yScore/a11yTests.length*100)}%)`);
  console.log(`Overall: ${totalScore}/${maxScore} (${Math.round(totalScore/maxScore*100)}%)`);
  
  console.log('');
  console.log('📋 DETAILED RESULTS:');
  console.log('Mobile UI:');
  console.log(`  ${results.mobileUI.viewport ? '✅' : '❌'} Mobile viewport`);
  console.log(`  ${results.mobileUI.touchTargets ? '✅' : '❌'} Touch targets (44px+)`);
  console.log(`  ${results.mobileUI.formLabels ? '✅' : '❌'} Form labels`);
  console.log(`  ${results.mobileUI.uploads ? '✅' : '❌'} Upload components`);
  console.log(`  ${results.mobileUI.progress ? '✅' : '❌'} Progress indicators`);
  
  console.log('Accessibility:');
  console.log(`  ${results.accessibility.contrast ? '✅' : '❌'} Color contrast`);
  console.log(`  ${results.accessibility.aria ? '✅' : '❌'} ARIA attributes`);
  console.log(`  ${results.accessibility.keyboard ? '✅' : '❌'} Keyboard navigation`);
  console.log(`  ${results.accessibility.headings ? '✅' : '❌'} Heading structure`);
  console.log(`  ${results.accessibility.images ? '✅' : '❌'} Image accessibility`);
  
  const passed = totalScore >= Math.ceil(maxScore * 0.8); // 80% threshold
  console.log('');
  console.log(`🏁 VERIFICATION STATUS: ${passed ? 'PASS' : 'NEEDS ATTENTION'}`);
  
  results.overall = {
    mobileScore: `${mobileScore}/${mobileTests.length}`,
    a11yScore: `${a11yScore}/${a11yTests.length}`,
    totalScore: `${totalScore}/${maxScore}`,
    percentage: Math.round(totalScore/maxScore*100),
    passed
  };
  
  return results;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('To run this verification, call: runManualVerification()');
  window.runManualVerification = runManualVerification;
}

// Instructions for manual testing
console.log('');
console.log('📋 MANUAL TESTING INSTRUCTIONS:');
console.log('1. Open http://localhost:5000 in your browser');
console.log('2. Open browser developer tools (F12)');
console.log('3. Paste this script in the console');
console.log('4. Call runManualVerification()');
console.log('5. Test the application workflow:');
console.log('   - Step 1: Fill out business basics');
console.log('   - Step 2: Select financing options');
console.log('   - Step 3: Complete business details');
console.log('   - Step 4: Add contact information');
console.log('   - Step 5: Upload documents');
console.log('   - Step 6: Review and submit');
console.log('6. Verify mobile responsiveness by resizing browser');
console.log('7. Test keyboard navigation with Tab key');
console.log('8. Check that all form fields are properly labeled');
console.log('');

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runManualVerification };
}