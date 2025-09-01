/**
 * Accessibility utilities for financial industry compliance
 */

export interface AccessibilityAuditResult {
  score: number;
  issues: AccessibilityIssue[];
  recommendations: string[];
}

export interface AccessibilityIssue {
  severity: 'error' | 'warning' | 'info';
  element: string;
  description: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  rule: string;
}

/**
 * Run comprehensive accessibility audit
 */
export async function runAccessibilityAudit(): Promise<AccessibilityAuditResult> {
  const issues: AccessibilityIssue[] = [];
  let score = 100;

  // Check for missing alt text on images
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt) {
      issues.push({
        severity: 'error',
        element: `img[${index}]`,
        description: 'Image missing alt text',
        wcagLevel: 'A',
        rule: 'WCAG 1.1.1'
      });
      score -= 5;
    }
  });

  // Check for proper heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastHeadingLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (index === 0 && level !== 1) {
      issues.push({
        severity: 'warning',
        element: heading.tagName.toLowerCase(),
        description: 'Page should start with h1',
        wcagLevel: 'AA',
        rule: 'WCAG 1.3.1'
      });
      score -= 2;
    }
    if (level > lastHeadingLevel + 1) {
      issues.push({
        severity: 'warning',
        element: heading.tagName.toLowerCase(),
        description: 'Heading levels should not skip',
        wcagLevel: 'AA',
        rule: 'WCAG 1.3.1'
      });
      score -= 2;
    }
    lastHeadingLevel = level;
  });

  // Check for proper form labels
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const hasLabel = input.getAttribute('aria-label') || 
                    input.getAttribute('aria-labelledby') ||
                    document.querySelector(`label[for="${input.id}"]`);
    
    if (!hasLabel) {
      issues.push({
        severity: 'error',
        element: `${input.tagName.toLowerCase()}[${index}]`,
        description: 'Form control missing accessible label',
        wcagLevel: 'A',
        rule: 'WCAG 1.3.1'
      });
      score -= 3;
    }
  });

  // Check color contrast (simplified)
  const elementsToCheck = document.querySelectorAll('button, a, input, select, textarea');
  elementsToCheck.forEach((element, index) => {
    const styles = window.getComputedStyle(element);
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    
    // Basic contrast check (simplified)
    if (bgColor && textColor && !hasGoodContrast(bgColor, textColor)) {
      issues.push({
        severity: 'warning',
        element: `${element.tagName.toLowerCase()}[${index}]`,
        description: 'Insufficient color contrast',
        wcagLevel: 'AA',
        rule: 'WCAG 1.4.3'
      });
      score -= 1;
    }
  });

  // Check for keyboard navigation
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) {
    issues.push({
      severity: 'error',
      element: 'page',
      description: 'No focusable elements found',
      wcagLevel: 'A',
      rule: 'WCAG 2.1.1'
    });
    score -= 10;
  }

  const recommendations = generateRecommendations(issues);
  
  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

function hasGoodContrast(bgColor: string, textColor: string): boolean {
  // Simplified contrast check - in production, use a proper contrast calculation
  const bg = parseColor(bgColor);
  const text = parseColor(textColor);
  
  if (!bg || !text) return true; // Can't determine, assume good
  
  const bgLuminance = getLuminance(bg);
  const textLuminance = getLuminance(text);
  const contrast = (Math.max(bgLuminance, textLuminance) + 0.05) / 
                  (Math.min(bgLuminance, textLuminance) + 0.05);
  
  return contrast >= 4.5; // WCAG AA standard
}

function parseColor(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3])
    };
  }
  return null;
}

function getLuminance(color: { r: number; g: number; b: number }): number {
  const rs = color.r / 255;
  const gs = color.g / 255;
  const bs = color.b / 255;
  
  const r = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const g = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const b = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function generateRecommendations(issues: AccessibilityIssue[]): string[] {
  const recommendations: string[] = [];
  
  if (issues.some(i => i.rule === 'WCAG 1.1.1')) {
    recommendations.push('Add descriptive alt text to all images');
  }
  
  if (issues.some(i => i.rule === 'WCAG 1.3.1')) {
    recommendations.push('Ensure proper form labels and heading hierarchy');
  }
  
  if (issues.some(i => i.rule === 'WCAG 1.4.3')) {
    recommendations.push('Improve color contrast for better readability');
  }
  
  if (issues.some(i => i.rule === 'WCAG 2.1.1')) {
    recommendations.push('Ensure all interactive elements are keyboard accessible');
  }
  
  return recommendations;
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: Element): boolean {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])', 
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  
  return focusableSelectors.some(selector => element.matches(selector));
}

/**
 * Add skip link for keyboard navigation
 */
export function addSkipLink(): void {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:border-2 focus:border-teal-600';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
}