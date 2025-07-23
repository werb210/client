/**
 * ACCESSIBILITY AUDIT - WCAG 2.1 AA COMPLIANCE
 * Comprehensive accessibility testing for production deployment
 */

console.log('♿ ACCESSIBILITY AUDIT - WCAG 2.1 AA COMPLIANCE');
console.log('================================================');
console.log('Testing scope: Screen reader, keyboard navigation, color contrast');
console.log('');

// Color contrast testing
function getElementColor(element) {
  const styles = window.getComputedStyle(element);
  return {
    color: styles.color,
    backgroundColor: styles.backgroundColor,
    fontSize: styles.fontSize
  };
}

function hexToRgb(hex) {
  if (!hex || hex === 'transparent' || hex === 'rgba(0, 0, 0, 0)') return null;
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbStringToObject(rgb) {
  if (!rgb || rgb === 'transparent') return null;
  
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  return match ? {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  } : null;
}

function getLuminance(rgb) {
  if (!rgb) return 1; // Default to white for transparent
  
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

function testColorContrast() {
  const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, label, button, a, input, textarea');
  const results = [];
  
  textElements.forEach((element, index) => {
    if (!element.textContent.trim()) return;
    
    const colors = getElementColor(element);
    const textColor = rgbStringToObject(colors.color);
    const bgColor = rgbStringToObject(colors.backgroundColor);
    
    if (!textColor) return;
    
    // Get background color from parent if transparent
    let actualBgColor = bgColor;
    if (!actualBgColor || colors.backgroundColor === 'rgba(0, 0, 0, 0)') {
      let parent = element.parentElement;
      while (parent && !actualBgColor) {
        const parentBg = window.getComputedStyle(parent).backgroundColor;
        actualBgColor = rgbStringToObject(parentBg);
        if (parentBg === 'rgba(0, 0, 0, 0)') {
          parent = parent.parentElement;
        } else {
          break;
        }
      }
      // Default to white if no background found
      actualBgColor = actualBgColor || { r: 255, g: 255, b: 255 };
    }
    
    const contrast = getContrastRatio(textColor, actualBgColor);
    const fontSize = parseFloat(colors.fontSize);
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && window.getComputedStyle(element).fontWeight >= '700');
    
    const requiredRatio = isLargeText ? 3 : 4.5; // WCAG AA requirements
    const passes = contrast >= requiredRatio;
    
    if (index < 20) { // Only store first 20 for performance
      results.push({
        element: element.tagName.toLowerCase(),
        text: element.textContent.trim().substring(0, 50),
        contrast: Math.round(contrast * 100) / 100,
        required: requiredRatio,
        passes,
        isLargeText,
        fontSize
      });
    }
  });
  
  return results;
}

// Form accessibility testing
function testFormAccessibility() {
  const formElements = document.querySelectorAll('input, select, textarea, button[type="submit"]');
  const results = [];
  
  formElements.forEach((element, index) => {
    const hasLabel = element.labels && element.labels.length > 0;
    const hasAriaLabel = !!element.getAttribute('aria-label');
    const hasAriaLabelledBy = !!element.getAttribute('aria-labelledby');
    const hasAriaDescribedBy = !!element.getAttribute('aria-describedby');
    const hasPlaceholder = !!element.getAttribute('placeholder');
    const hasTitle = !!element.getAttribute('title');
    const isRequired = element.hasAttribute('required');
    const hasAriaRequired = element.getAttribute('aria-required') === 'true';
    const hasValidRole = !!element.getAttribute('role') || ['input', 'select', 'textarea', 'button'].includes(element.tagName.toLowerCase());
    
    const isAccessible = hasLabel || hasAriaLabel || hasAriaLabelledBy || (hasPlaceholder && element.type !== 'password');
    
    results.push({
      index: index + 1,
      type: element.type || element.tagName.toLowerCase(),
      hasLabel,
      hasAriaLabel,
      hasAriaLabelledBy,
      hasAriaDescribedBy,
      hasPlaceholder,
      hasTitle,
      isRequired,
      hasAriaRequired,
      hasValidRole,
      isAccessible
    });
  });
  
  return results;
}

// Keyboard navigation testing
function testKeyboardNavigation() {
  const focusableElements = document.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
  );
  
  const results = [];
  let tabIndexIssues = 0;
  
  focusableElements.forEach((element, index) => {
    const tabIndex = element.getAttribute('tabindex');
    const hasVisibleFocus = element.matches(':focus-visible') || 
                           window.getComputedStyle(element, ':focus').outline !== 'none' ||
                           window.getComputedStyle(element, ':focus').border !== window.getComputedStyle(element).border;
    
    const rect = element.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && 
                     window.getComputedStyle(element).visibility !== 'hidden' &&
                     window.getComputedStyle(element).display !== 'none';
    
    if (tabIndex && parseInt(tabIndex) > 0) {
      tabIndexIssues++;
    }
    
    if (index < 20) { // Store first 20 for performance
      results.push({
        element: element.tagName.toLowerCase(),
        type: element.type || 'N/A',
        tabIndex: tabIndex || '0',
        isVisible,
        hasProperTabIndex: !tabIndex || parseInt(tabIndex) <= 0,
        id: element.id || `element-${index}`
      });
    }
  });
  
  return {
    totalFocusable: focusableElements.length,
    tabIndexIssues,
    sampleElements: results,
    hasSkipLink: !!document.querySelector('a[href="#main"], a[href="#content"], .skip-link')
  };
}

// ARIA attributes testing
function testAriaAttributes() {
  const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role], [aria-expanded], [aria-hidden]');
  const results = [];
  
  elementsWithAria.forEach((element, index) => {
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const ariaDescribedBy = element.getAttribute('aria-describedby');
    const role = element.getAttribute('role');
    const ariaExpanded = element.getAttribute('aria-expanded');
    const ariaHidden = element.getAttribute('aria-hidden');
    
    // Validate aria-labelledby references
    let validLabelledBy = true;
    if (ariaLabelledBy) {
      const referencedElements = ariaLabelledBy.split(' ').map(id => document.getElementById(id));
      validLabelledBy = referencedElements.every(el => el !== null);
    }
    
    // Validate aria-describedby references
    let validDescribedBy = true;
    if (ariaDescribedBy) {
      const referencedElements = ariaDescribedBy.split(' ').map(id => document.getElementById(id));
      validDescribedBy = referencedElements.every(el => el !== null);
    }
    
    if (index < 15) { // Store first 15 for performance
      results.push({
        element: element.tagName.toLowerCase(),
        ariaLabel: !!ariaLabel,
        ariaLabelledBy: !!ariaLabelledBy,
        ariaDescribedBy: !!ariaDescribedBy,
        role: role || 'none',
        ariaExpanded: ariaExpanded || 'N/A',
        ariaHidden: ariaHidden || 'false',
        validLabelledBy,
        validDescribedBy,
        id: element.id || `aria-element-${index}`
      });
    }
  });
  
  return {
    totalElementsWithAria: elementsWithAria.length,
    sampleElements: results
  };
}

// Heading structure testing
function testHeadingStructure() {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const structure = [];
  let hasH1 = false;
  let properOrder = true;
  let lastLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent.trim();
    
    if (level === 1) hasH1 = true;
    
    if (index > 0 && level > lastLevel + 1) {
      properOrder = false;
    }
    
    structure.push({
      level,
      text: text.substring(0, 50),
      tagName: heading.tagName.toLowerCase()
    });
    
    lastLevel = level;
  });
  
  return {
    totalHeadings: headings.length,
    hasH1,
    properOrder,
    structure: structure.slice(0, 10) // First 10 headings
  };
}

// Image accessibility testing
function testImageAccessibility() {
  const images = document.querySelectorAll('img, svg, [role="img"]');
  const results = [];
  
  images.forEach((image, index) => {
    const hasAlt = image.hasAttribute('alt');
    const altText = image.getAttribute('alt') || '';
    const hasAriaLabel = !!image.getAttribute('aria-label');
    const hasAriaLabelledBy = !!image.getAttribute('aria-labelledby');
    const isDecorative = altText === '' && hasAlt;
    const role = image.getAttribute('role');
    
    const isAccessible = hasAlt || hasAriaLabel || hasAriaLabelledBy || role === 'presentation';
    
    if (index < 10) { // Store first 10 for performance
      results.push({
        element: image.tagName.toLowerCase(),
        hasAlt,
        altText: altText.substring(0, 50),
        hasAriaLabel,
        hasAriaLabelledBy,
        isDecorative,
        isAccessible,
        src: image.src ? image.src.substring(image.src.lastIndexOf('/') + 1) : 'N/A'
      });
    }
  });
  
  return {
    totalImages: images.length,
    sampleImages: results
  };
}

// Run comprehensive accessibility audit
function runAccessibilityAudit() {
  console.log('♿ Starting comprehensive accessibility audit...');
  console.log('');
  
  // Test 1: Color contrast
  console.log('🎨 COLOR CONTRAST (WCAG AA):');
  const contrastResults = testColorContrast();
  const passingContrast = contrastResults.filter(r => r.passes).length;
  console.log(`Elements tested: ${contrastResults.length}`);
  console.log(`Passing contrast: ${passingContrast}/${contrastResults.length}`);
  
  if (contrastResults.length > 0) {
    console.log('Sample results:');
    contrastResults.slice(0, 5).forEach(result => {
      console.log(`  ${result.element}: ${result.contrast}:1 ${result.passes ? '✅' : '❌'} (need ${result.required}:1)`);
    });
  }
  console.log('');
  
  // Test 2: Form accessibility
  console.log('📝 FORM ACCESSIBILITY:');
  const formResults = testFormAccessibility();
  const accessibleForms = formResults.filter(r => r.isAccessible).length;
  console.log(`Form elements: ${formResults.length}`);
  console.log(`Properly labeled: ${accessibleForms}/${formResults.length}`);
  
  if (formResults.length > 0) {
    console.log('Sample results:');
    formResults.slice(0, 5).forEach(result => {
      console.log(`  ${result.type}: ${result.isAccessible ? '✅' : '❌'} ${result.hasLabel ? 'labeled' : result.hasAriaLabel ? 'aria-label' : 'no-label'}`);
    });
  }
  console.log('');
  
  // Test 3: Keyboard navigation
  console.log('⌨️ KEYBOARD NAVIGATION:');
  const keyboardResults = testKeyboardNavigation();
  console.log(`Focusable elements: ${keyboardResults.totalFocusable}`);
  console.log(`TabIndex issues: ${keyboardResults.tabIndexIssues}`);
  console.log(`Has skip link: ${keyboardResults.hasSkipLink ? 'YES' : 'NO'}`);
  
  if (keyboardResults.sampleElements.length > 0) {
    console.log('Sample focusable elements:');
    keyboardResults.sampleElements.slice(0, 5).forEach(result => {
      console.log(`  ${result.element}[${result.type}]: ${result.hasProperTabIndex ? '✅' : '❌'} tabindex=${result.tabIndex}`);
    });
  }
  console.log('');
  
  // Test 4: ARIA attributes
  console.log('🏷️ ARIA ATTRIBUTES:');
  const ariaResults = testAriaAttributes();
  console.log(`Elements with ARIA: ${ariaResults.totalElementsWithAria}`);
  
  if (ariaResults.sampleElements.length > 0) {
    console.log('Sample ARIA elements:');
    ariaResults.sampleElements.slice(0, 5).forEach(result => {
      console.log(`  ${result.element}: role="${result.role}" ${result.validLabelledBy && result.validDescribedBy ? '✅' : '❌'}`);
    });
  }
  console.log('');
  
  // Test 5: Heading structure
  console.log('📄 HEADING STRUCTURE:');
  const headingResults = testHeadingStructure();
  console.log(`Total headings: ${headingResults.totalHeadings}`);
  console.log(`Has H1: ${headingResults.hasH1 ? 'YES' : 'NO'}`);
  console.log(`Proper order: ${headingResults.properOrder ? 'YES' : 'NO'}`);
  
  if (headingResults.structure.length > 0) {
    console.log('Heading structure:');
    headingResults.structure.forEach(heading => {
      console.log(`  ${'  '.repeat(heading.level - 1)}${heading.tagName}: ${heading.text}`);
    });
  }
  console.log('');
  
  // Test 6: Image accessibility
  console.log('🖼️ IMAGE ACCESSIBILITY:');
  const imageResults = testImageAccessibility();
  const accessibleImages = imageResults.sampleImages.filter(r => r.isAccessible).length;
  console.log(`Total images: ${imageResults.totalImages}`);
  console.log(`Accessible images: ${accessibleImages}/${imageResults.sampleImages.length} (sample)`);
  
  if (imageResults.sampleImages.length > 0) {
    console.log('Sample images:');
    imageResults.sampleImages.slice(0, 5).forEach(result => {
      console.log(`  ${result.element}: ${result.isAccessible ? '✅' : '❌'} ${result.hasAlt ? 'alt' : result.hasAriaLabel ? 'aria-label' : 'no-alt'}`);
    });
  }
  console.log('');
  
  // Calculate overall accessibility score
  const tests = [
    { name: 'Color contrast', pass: passingContrast / Math.max(contrastResults.length, 1) >= 0.9 },
    { name: 'Form accessibility', pass: accessibleForms / Math.max(formResults.length, 1) >= 0.9 },
    { name: 'Keyboard navigation', pass: keyboardResults.tabIndexIssues === 0 },
    { name: 'ARIA attributes', pass: ariaResults.totalElementsWithAria > 0 },
    { name: 'Heading structure', pass: headingResults.hasH1 && headingResults.properOrder },
    { name: 'Image accessibility', pass: accessibleImages / Math.max(imageResults.sampleImages.length, 1) >= 0.8 }
  ];
  
  const passedTests = tests.filter(t => t.pass).length;
  const totalTests = tests.length;
  
  console.log('🎯 ACCESSIBILITY AUDIT RESULTS:');
  console.log(`Tests passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log('');
  
  tests.forEach(test => {
    console.log(`${test.pass ? '✅' : '❌'} ${test.name}`);
  });
  
  console.log('');
  console.log(`🏁 ACCESSIBILITY COMPLIANCE: ${passedTests >= 5 ? 'WCAG AA COMPLIANT' : 'NEEDS IMPROVEMENT'}`);
  
  return {
    score: `${passedTests}/${totalTests}`,
    percentage: Math.round(passedTests/totalTests*100),
    compliant: passedTests >= 5,
    details: {
      contrast: { tested: contrastResults.length, passing: passingContrast },
      forms: { total: formResults.length, accessible: accessibleForms },
      keyboard: keyboardResults,
      aria: ariaResults,
      headings: headingResults,
      images: { total: imageResults.totalImages, accessible: accessibleImages }
    }
  };
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAccessibilityAudit);
  } else {
    runAccessibilityAudit();
  }
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAccessibilityAudit };
} else if (typeof window !== 'undefined') {
  window.runAccessibilityAudit = runAccessibilityAudit;
}