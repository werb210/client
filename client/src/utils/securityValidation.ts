/**
 * Security validation utilities for financial applications
 */

export interface SecurityAuditResult {
  score: number;
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  compliance: ComplianceCheck[];
}

export interface SecurityVulnerability {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  location?: string;
  recommendation: string;
}

export interface ComplianceCheck {
  standard: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

/**
 * Run comprehensive security audit
 */
export async function runSecurityAudit(): Promise<SecurityAuditResult> {
  const vulnerabilities: SecurityVulnerability[] = [];
  const compliance: ComplianceCheck[] = [];
  let score = 100;

  // Check HTTPS enforcement
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    vulnerabilities.push({
      severity: 'critical',
      category: 'Transport Security',
      description: 'Application not served over HTTPS',
      recommendation: 'Enforce HTTPS in production'
    });
    score -= 20;
  }

  // Check Content Security Policy
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!cspMeta) {
    vulnerabilities.push({
      severity: 'high',
      category: 'Content Security',
      description: 'No Content Security Policy detected',
      recommendation: 'Implement CSP headers to prevent XSS attacks'
    });
    score -= 15;
  }

  // Check for sensitive data in localStorage/sessionStorage
  const sensitivePatterns = ['password', 'token', 'secret', 'key', 'ssn', 'sin'];
  const storageKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
  
  sensitivePatterns.forEach(pattern => {
    const foundKeys = storageKeys.filter(key => 
      key.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (foundKeys.length > 0) {
      vulnerabilities.push({
        severity: 'medium',
        category: 'Data Storage',
        description: `Potentially sensitive data in browser storage: ${foundKeys.join(', ')}`,
        recommendation: 'Avoid storing sensitive data in browser storage'
      });
      score -= 10;
    }
  });

  // Check for inline scripts (XSS risk)
  const inlineScripts = document.querySelectorAll('script:not([src])');
  if (inlineScripts.length > 0) {
    vulnerabilities.push({
      severity: 'medium',
      category: 'Script Security',
      description: `${inlineScripts.length} inline scripts detected`,
      recommendation: 'Move JavaScript to external files with CSP nonce'
    });
    score -= 5;
  }

  // Financial industry compliance checks
  compliance.push({
    standard: 'PCI DSS',
    requirement: 'Secure transmission of payment data',
    status: location.protocol === 'https:' ? 'pass' : 'fail',
    details: 'HTTPS enforcement for secure data transmission'
  });

  compliance.push({
    standard: 'PIPEDA (Canada)',
    requirement: 'Privacy policy and consent',
    status: document.querySelector('[data-privacy-policy]') ? 'pass' : 'warning',
    details: 'Privacy policy link and consent mechanisms'
  });

  compliance.push({
    standard: 'GDPR',
    requirement: 'Cookie consent',
    status: document.querySelector('[data-cookie-consent]') ? 'pass' : 'warning',
    details: 'Cookie consent banner implementation'
  });

  // Check form security
  const forms = document.querySelectorAll('form');
  forms.forEach((form, index) => {
    // Check for CSRF protection
    const csrfToken = form.querySelector('input[name="_token"], input[name="csrf_token"]');
    if (!csrfToken) {
      vulnerabilities.push({
        severity: 'high',
        category: 'Form Security',
        description: `Form ${index + 1} missing CSRF protection`,
        location: `form[${index}]`,
        recommendation: 'Add CSRF tokens to all forms'
      });
      score -= 10;
    }

    // Check for autocomplete attributes
    const sensitiveInputs = form.querySelectorAll('input[type="password"], input[name*="ssn"], input[name*="sin"]');
    sensitiveInputs.forEach((input, inputIndex) => {
      if (!input.getAttribute('autocomplete')) {
        vulnerabilities.push({
          severity: 'low',
          category: 'Form Security',
          description: `Sensitive input missing autocomplete attribute`,
          location: `form[${index}] input[${inputIndex}]`,
          recommendation: 'Add appropriate autocomplete attributes'
        });
        score -= 2;
      }
    });
  });

  const recommendations = generateSecurityRecommendations(vulnerabilities);

  return {
    score: Math.max(0, score),
    vulnerabilities,
    recommendations,
    compliance
  };
}

function generateSecurityRecommendations(vulnerabilities: SecurityVulnerability[]): string[] {
  const recommendations: string[] = [];
  
  if (vulnerabilities.some(v => v.category === 'Transport Security')) {
    recommendations.push('Implement HTTPS enforcement and HSTS headers');
  }
  
  if (vulnerabilities.some(v => v.category === 'Content Security')) {
    recommendations.push('Add Content Security Policy headers');
  }
  
  if (vulnerabilities.some(v => v.category === 'Form Security')) {
    recommendations.push('Implement CSRF protection and secure form handling');
  }
  
  if (vulnerabilities.some(v => v.category === 'Data Storage')) {
    recommendations.push('Review and secure client-side data storage');
  }
  
  return recommendations;
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  // Basic token validation - in production, verify against server
  return token && token.length >= 32 && /^[a-zA-Z0-9+/=]+$/.test(token);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}