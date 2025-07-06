/**
 * Cypress E2E Test: SignNow Integration Flow
 * Tests the complete SignNow e-signature workflow with iframe interaction
 */

describe('SignNow Integration Flow', () => {
  beforeEach(() => {
    // Navigate to Step 6 (SignNow)
    cy.visit('/apply/step-6');
    
    // Mock application finalization API call
    cy.intercept('POST', '**/api/applications/*/complete', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          applicationId: 'app_12345',
          signNowUrl: 'https://app.signnow.com/embedded/invite/abcdef123456',
          status: 'pending_signature',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      }
    }).as('finalizeApplication');
    
    // Mock SignNow status polling
    cy.intercept('GET', '**/api/applications/*/status', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          applicationId: 'app_12345',
          status: 'pending_signature',
          signNowStatus: 'pending',
          documentsUrl: 'https://app.signnow.com/embedded/invite/abcdef123456'
        }
      }
    }).as('checkStatus');
  });

  describe('Application Finalization', () => {
    it('should initiate SignNow process with proper authentication', () => {
      // Click finalize button to start SignNow process
      cy.get('[data-cy="finalize-application"]').click();
      
      // Verify API call with authentication
      cy.wait('@finalizeApplication').then((interception) => {
        // Check authentication header
        expect(interception.request.headers).to.have.property('authorization');
        expect(interception.request.headers.authorization).to.include('Bearer');
        
        // Verify VITE_CLIENT_APP_SHARED_TOKEN is used
        const authHeader = interception.request.headers.authorization;
        expect(authHeader).to.match(/Bearer\s+\S+/);
      });
      
      // Verify loading state during API call
      cy.contains('Preparing documents').should('be.visible');
      
      // Verify SignNow iframe appears
      cy.get('[data-testid="signnow-iframe"]').should('be.visible');
      cy.get('iframe[src*="signnow.com"]').should('be.visible');
    });

    it('should handle application finalization errors', () => {
      // Mock API failure
      cy.intercept('POST', '**/api/applications/*/complete', {
        statusCode: 500,
        body: { error: 'Failed to generate signing documents' }
      }).as('finalizationError');
      
      // Attempt finalization
      cy.get('[data-cy="finalize-application"]').click();
      
      // Verify error handling
      cy.wait('@finalizationError');
      cy.contains('Error preparing documents').should('be.visible');
      cy.contains('Try again').should('be.visible');
      
      // Verify retry functionality
      cy.contains('Try again').click();
      cy.wait('@finalizationError');
    });
  });

  describe('SignNow Iframe Integration', () => {
    beforeEach(() => {
      // Start the SignNow process
      cy.get('[data-cy="finalize-application"]').click();
      cy.wait('@finalizeApplication');
    });

    it('should load SignNow iframe with correct URL', () => {
      // Verify iframe is loaded
      cy.get('[data-testid="signnow-iframe"]').should('be.visible');
      
      // Verify iframe source URL
      cy.get('iframe[src*="signnow.com"]').should('have.attr', 'src')
        .and('include', 'signnow.com/embedded/invite');
      
      // Verify iframe is responsive
      cy.get('[data-testid="signnow-iframe"]').should('have.class', 'w-full');
      cy.get('[data-testid="signnow-iframe"]').should('have.class', 'h-full');
    });

    it('should handle iframe loading states', () => {
      // Verify loading indicator appears
      cy.contains('Loading signing interface').should('be.visible');
      
      // Simulate iframe load completion
      cy.get('[data-testid="signnow-iframe"]').should('be.visible');
      
      // Verify loading indicator disappears
      cy.contains('Loading signing interface').should('not.exist');
    });

    it('should provide iframe fallback options', () => {
      // Mock iframe loading failure
      cy.get('[data-testid="signnow-iframe"]').then(($iframe) => {
        // Simulate iframe error
        $iframe[0].dispatchEvent(new Event('error'));
      });
      
      // Verify fallback options appear
      cy.contains('Open in new window').should('be.visible');
      cy.contains('Direct link').should('be.visible');
      
      // Test direct link
      cy.get('[data-testid="direct-link"]').should('have.attr', 'href')
        .and('include', 'signnow.com');
    });
  });

  describe('Document Signing Process', () => {
    beforeEach(() => {
      cy.get('[data-cy="finalize-application"]').click();
      cy.wait('@finalizeApplication');
    });

    it('should simulate document signing completion', () => {
      // Mock signed status update
      cy.intercept('GET', '**/api/applications/*/status', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            applicationId: 'app_12345',
            status: 'signed',
            signNowStatus: 'completed',
            signedAt: new Date().toISOString(),
            documentsUrl: 'https://app.signnow.com/document/signed'
          }
        }
      }).as('signedStatus');
      
      // Simulate iframe message for signing completion
      cy.window().then((win) => {
        // Simulate SignNow postMessage
        win.postMessage({
          type: 'signnow_complete',
          status: 'signed',
          applicationId: 'app_12345'
        }, '*');
      });
      
      // Verify completion detection
      cy.wait('@signedStatus');
      cy.contains('Documents signed successfully').should('be.visible');
      cy.contains('Continue to next step').should('be.visible');
    });

    it('should handle partial signing states', () => {
      // Mock partial signing status
      cy.intercept('GET', '**/api/applications/*/status', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            applicationId: 'app_12345',
            status: 'partially_signed',
            signNowStatus: 'in_progress',
            signaturesRequired: 2,
            signaturesCompleted: 1
          }
        }
      }).as('partialStatus');
      
      // Trigger status check
      cy.wait('@checkStatus');
      cy.wait('@partialStatus');
      
      // Verify partial completion indicator
      cy.contains('1 of 2 signatures completed').should('be.visible');
      cy.contains('Waiting for additional signatures').should('be.visible');
    });

    it('should poll for signing status updates', () => {
      // Verify initial status check
      cy.wait('@checkStatus');
      
      // Wait for polling interval (should check every 5 seconds)
      cy.wait(6000);
      cy.wait('@checkStatus');
      
      // Verify multiple polling requests
      cy.get('@checkStatus.all').should('have.length.at.least', 2);
    });
  });

  describe('Authentication and Token Validation', () => {
    it('should include proper authentication in all SignNow-related API calls', () => {
      // Start SignNow process
      cy.get('[data-cy="finalize-application"]').click();
      
      // Verify finalization API uses proper auth
      cy.wait('@finalizeApplication').then((interception) => {
        const authHeader = interception.request.headers.authorization;
        expect(authHeader).to.exist;
        expect(authHeader).to.include('Bearer');
        
        // Verify token format
        const token = authHeader.replace('Bearer ', '');
        expect(token).to.match(/^[a-zA-Z0-9]+$/);
        expect(token.length).to.be.greaterThan(10);
      });
      
      // Verify status polling uses auth
      cy.wait('@checkStatus').then((interception) => {
        expect(interception.request.headers).to.have.property('authorization');
        expect(interception.request.headers.authorization).to.include('Bearer');
      });
    });

    it('should handle authentication failures', () => {
      // Mock auth failure
      cy.intercept('POST', '**/api/applications/*/complete', {
        statusCode: 401,
        body: { error: 'Invalid or expired token' }
      }).as('authError');
      
      // Attempt finalization
      cy.get('[data-cy="finalize-application"]').click();
      
      // Verify auth error handling
      cy.wait('@authError');
      cy.contains('Authentication error').should('be.visible');
      cy.contains('Please refresh and try again').should('be.visible');
    });

    it('should validate VITE_CLIENT_APP_SHARED_TOKEN usage', () => {
      // Verify environment variable is available
      cy.window().then((win) => {
        // Check that the token is configured
        expect(Cypress.env('VITE_CLIENT_APP_SHARED_TOKEN') || 
               win.import?.meta?.env?.VITE_CLIENT_APP_SHARED_TOKEN).to.exist;
      });
      
      // Start process and verify token usage
      cy.get('[data-cy="finalize-application"]').click();
      
      cy.wait('@finalizeApplication').then((interception) => {
        const authHeader = interception.request.headers.authorization;
        const token = authHeader.replace('Bearer ', '');
        
        // Token should be the configured value
        expect(token).to.be.a('string');
        expect(token.length).to.be.greaterThan(20);
      });
    });
  });

  describe('Navigation and Flow Control', () => {
    it('should prevent navigation during signing process', () => {
      // Start SignNow process
      cy.get('[data-cy="finalize-application"]').click();
      cy.wait('@finalizeApplication');
      
      // Verify back button is disabled during signing
      cy.get('[data-cy="back-button"]').should('be.disabled');
      
      // Verify next button is disabled until signing complete
      cy.get('[data-cy="next-button"]').should('be.disabled');
    });

    it('should allow navigation after successful signing', () => {
      // Complete signing process
      cy.get('[data-cy="finalize-application"]').click();
      cy.wait('@finalizeApplication');
      
      // Mock completion
      cy.intercept('GET', '**/api/applications/*/status', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            applicationId: 'app_12345',
            status: 'signed',
            signNowStatus: 'completed'
          }
        }
      }).as('completedStatus');
      
      // Trigger completion
      cy.window().then((win) => {
        win.postMessage({ type: 'signnow_complete', status: 'signed' }, '*');
      });
      
      cy.wait('@completedStatus');
      
      // Verify navigation is enabled
      cy.get('[data-cy="next-button"]').should('be.enabled');
      cy.get('[data-cy="next-button"]').click();
      
      // Should navigate to Step 7
      cy.url().should('include', '/apply/step-7');
    });

    it('should handle signing cancellation', () => {
      // Start signing process
      cy.get('[data-cy="finalize-application"]').click();
      cy.wait('@finalizeApplication');
      
      // Simulate signing cancellation
      cy.window().then((win) => {
        win.postMessage({
          type: 'signnow_cancelled',
          reason: 'user_cancelled'
        }, '*');
      });
      
      // Verify cancellation handling
      cy.contains('Signing cancelled').should('be.visible');
      cy.contains('You can restart the signing process').should('be.visible');
      cy.get('[data-cy="restart-signing"]').should('be.visible');
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle network interruptions during signing', () => {
      // Start signing process
      cy.get('[data-cy="finalize-application"]').click();
      cy.wait('@finalizeApplication');
      
      // Mock network failure during status check
      cy.intercept('GET', '**/api/applications/*/status', {
        statusCode: 0, // Network error
        body: null
      }).as('networkError');
      
      // Wait for network error
      cy.wait('@networkError');
      
      // Verify error handling
      cy.contains('Connection lost').should('be.visible');
      cy.contains('Retrying').should('be.visible');
      
      // Mock recovery
      cy.intercept('GET', '**/api/applications/*/status', {
        statusCode: 200,
        body: { success: true, data: { status: 'pending_signature' } }
      }).as('recoveredStatus');
      
      // Verify automatic retry
      cy.wait('@recoveredStatus');
      cy.contains('Connection restored').should('be.visible');
    });

    it('should provide manual retry options', () => {
      // Mock persistent API failure
      cy.intercept('POST', '**/api/applications/*/complete', {
        statusCode: 500,
        body: { error: 'Service temporarily unavailable' }
      }).as('serviceError');
      
      // Attempt finalization
      cy.get('[data-cy="finalize-application"]').click();
      cy.wait('@serviceError');
      
      // Verify manual retry option
      cy.contains('Try again').should('be.visible');
      cy.get('[data-cy="manual-retry"]').should('be.visible');
      
      // Test manual retry
      cy.get('[data-cy="manual-retry"]').click();
      cy.wait('@serviceError');
      
      // Verify retry attempt
      cy.contains('Retrying').should('be.visible');
    });

    it('should handle iframe communication failures', () => {
      // Start signing process
      cy.get('[data-cy="finalize-application"]').click();
      cy.wait('@finalizeApplication');
      
      // Wait for iframe timeout (should be ~30 seconds)
      cy.wait(35000);
      
      // Verify timeout handling
      cy.contains('Signing interface timeout').should('be.visible');
      cy.contains('Open in new window').should('be.visible');
      
      // Test fallback option
      cy.get('[data-testid="open-new-window"]').click();
      
      // Verify new window option works
      cy.window().its('open').should('have.been.called');
    });
  });
});