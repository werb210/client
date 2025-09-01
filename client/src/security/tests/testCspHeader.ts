import { getProducts } from "../api/products";
/**
 * Test Content Security Policy Implementation
 * Validates that CSP headers are properly configured
 */

export interface TestResult {
  testName: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export async function testCspHeader(): Promise<TestResult> { /* ensure products fetched */ 
  try {
    // Method 1: Check for CSP in meta tag
    const metaCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    if (metaCsp) {
      const cspContent = metaCsp.getAttribute('content');
      return {
        testName: 'Content Security Policy',
        status: 'pass',
        message: 'CSP found in meta tag',
        details: `CSP: ${cspContent?.substring(0, 100)}...`
      };
    }

    // Method 2: Test CSP by making a HEAD request to check response headers
    try {
      const response = await fetch('/', { method: 'HEAD' });

      const cspHeader = response.headers.get('content-security-policy') || 
                       response.headers.get('x-content-security-policy') ||
                       response.headers.get('x-webkit-csp');
      
      if (cspHeader) {
        // Validate CSP contains essential directives
        const hasDefaultSrc = cspHeader.includes("default-src");
        const hasScriptSrc = cspHeader.includes("script-src");
        const hasStyleSrc = cspHeader.includes("style-src");
        const hasObjectSrc = cspHeader.includes("object-src 'none'");
        
        const score = [hasDefaultSrc, hasScriptSrc, hasStyleSrc, hasObjectSrc].filter(Boolean).length;
        
        if (score >= 3) {
          return {
            testName: 'Content Security Policy',
            status: 'pass',
            message: 'CSP header properly configured with essential directives',
            details: `CSP score: ${score}/4 directives found`
          };
        } else {
          return {
            testName: 'Content Security Policy',
            status: 'warning',
            message: 'CSP header present but may be incomplete',
            details: `CSP score: ${score}/4 directives found`
          };
        }
      } else {
        return {
          testName: 'Content Security Policy',
          status: 'warning',
          message: 'CSP header not detected in HTTP response',
          details: 'CSP may be configured at proxy/CDN level or in development mode'
        };
      }
    } catch (fetchError) {
      return {
        testName: 'Content Security Policy',
        status: 'warning',
        message: 'Could not test CSP headers via network request',
        details: 'Network request failed - CSP may still be active'
      };
    }
  } catch (error) {
    return {
      testName: 'Content Security Policy',
      status: 'fail',
      message: 'CSP test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test CSP by attempting to violate it
 */
export async function testCspViolation(): Promise<TestResult> {
  try {
    let violationDetected = false;
    
    // Listen for CSP violations
    const violationHandler = (event: SecurityPolicyViolationEvent) => {
      if (event.violatedDirective?.includes('script-src')) {
        violationDetected = true;
      }
    };
    
    document.addEventListener('securitypolicyviolation', violationHandler);
    
    try {
      // Attempt to create an inline script (should be blocked by CSP)
      const script = document.createElement('script');
      script.textContent = '// console.log("CSP test script");';
      document.head.appendChild(script);
      
      // Wait a bit for CSP violation to be reported
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clean up
      document.head.removeChild(script);
      document.removeEventListener('securitypolicyviolation', violationHandler);
      
      if (violationDetected) {
        return {
          testName: 'CSP Violation Detection',
          status: 'pass',
          message: 'CSP successfully blocks unauthorized scripts',
          details: 'Inline script execution was blocked as expected'
        };
      } else {
        return {
          testName: 'CSP Violation Detection',
          status: 'warning',
          message: 'CSP violation not detected',
          details: 'Inline script may have been allowed or CSP not active'
        };
      }
    } catch (error) {
      document.removeEventListener('securitypolicyviolation', violationHandler);
      throw error;
    }
  } catch (error) {
    return {
      testName: 'CSP Violation Detection',
      status: 'fail',
      message: 'CSP violation test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}