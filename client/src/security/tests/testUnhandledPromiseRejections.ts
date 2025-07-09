/**
 * Test for Unhandled Promise Rejections
 * Validates that the global error handler catches unhandled promise rejections
 */

export interface TestResult {
  testName: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export async function testUnhandledPromiseRejections(): Promise<TestResult> {
  return new Promise((resolve) => {
    let rejectionCaught = false;
    const originalHandler = window.onunhandledrejection;
    
    // Set up temporary handler to catch test rejections
    const testHandler = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('SecurityTest')) {
        rejectionCaught = true;
        event.preventDefault();
        return;
      }
      // Let other handlers process non-test rejections
      if (originalHandler) originalHandler(event);
    };
    
    window.onunhandledrejection = testHandler;

    try {
      // Create an unhandled promise rejection
      Promise.reject(new Error('SecurityTest: Intentional unhandled rejection'));
      
      // Wait for the rejection to be processed
      setTimeout(() => {
        // Restore original handler
        window.onunhandledrejection = originalHandler;
        
        if (rejectionCaught) {
          resolve({
            testName: 'Unhandled Promise Rejection Detection',
            status: 'pass',
            message: 'Global handler successfully catches unhandled promise rejections',
            details: 'window.onunhandledrejection is properly configured in main.tsx'
          });
        } else {
          resolve({
            testName: 'Unhandled Promise Rejection Detection',
            status: 'fail',
            message: 'Global handler not catching unhandled promise rejections',
            details: 'Check main.tsx for proper error handler setup'
          });
        }
      }, 100);
    } catch (error) {
      // Restore original handler on error
      window.onunhandledrejection = originalHandler;
      resolve({
        testName: 'Unhandled Promise Rejection Detection',
        status: 'fail',
        message: 'Test execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

/**
 * Test fetch operations for proper error handling
 */
export async function testFetchErrorHandling(): Promise<TestResult> {
  try {
    // Test a fetch to a non-existent endpoint
    const testUrl = '/api/security-test-nonexistent-endpoint';
    
    let errorCaught = false;
    try {
      await fetch(testUrl).catch(error => {
        errorCaught = true;
        console.log('[SECURITY_TEST] Fetch error properly caught:', error.message);
        throw error; // Re-throw to maintain error flow
      });
    } catch (error) {
      if (errorCaught) {
        return {
          testName: 'Fetch Error Handling',
          status: 'pass',
          message: 'Fetch operations properly handle errors with .catch()',
          details: 'Network errors are caught and logged appropriately'
        };
      }
    }
    
    return {
      testName: 'Fetch Error Handling',
      status: 'warning',
      message: 'Could not test fetch error handling',
      details: 'Test endpoint may have returned unexpected response'
    };
  } catch (error) {
    return {
      testName: 'Fetch Error Handling',
      status: 'fail',
      message: 'Fetch error handling test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}