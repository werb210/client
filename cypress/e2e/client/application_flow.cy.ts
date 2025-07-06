/**
 * Cypress E2E Test: Complete Application Flow for Production
 * Tests Step 1, Step 3, Step 4, Step 5 (file upload) and SignNow embed
 * Base URL: https://clientportal.boreal.financial
 */

describe('Client Application Flow - Production', () => {
  beforeEach(() => {
    // Visit the production client portal
    cy.visit('/');
    
    // Verify the app loads properly
    cy.contains('Boreal Financial').should('be.visible');
    cy.contains('Start Your Application').should('be.visible');
  });

  describe('Step 1: Financial Profile', () => {
    it('should complete Step 1 form and navigate to recommendations', () => {
      // Start the application
      cy.contains('Start Your Application').click();
      cy.url().should('include', '/apply/step-1');
      
      // Verify Step 1 loads with proper styling
      cy.contains('Step 1').should('be.visible');
      cy.get('.grid').should('have.class', 'md:grid-cols-2');
      
      // Fill out all required fields
      cy.get('[data-cy="lookingFor"]').click();
      cy.contains('Business Capital').click();
      
      cy.get('[data-cy="fundingAmount"]').click();
      cy.contains('$100,000 to $250,000').click();
      
      cy.get('[data-cy="businessLocation"]').click();
      cy.contains('United States').click();
      
      cy.get('[data-cy="salesHistory"]').click();
      cy.contains('1 to 2 years').click();
      
      cy.get('[data-cy="lastYearRevenue"]').click();
      cy.contains('$250,000 to $500,000').click();
      
      cy.get('[data-cy="averageMonthlyRevenue"]').click();
      cy.contains('$20,000 to $50,000').click();
      
      cy.get('[data-cy="accountsReceivable"]').click();
      cy.contains('$10,000 to $50,000').click();
      
      cy.get('[data-cy="fixedAssets"]').click();
      cy.contains('$50,000 to $100,000').click();
      
      cy.get('[data-cy="fundsPurpose"]').click();
      cy.contains('Working Capital').click();
      
      // Submit Step 1
      cy.get('[data-cy="next"]').click();
      
      // Verify navigation to Step 2
      cy.url().should('include', '/apply/step-2');
      cy.contains('Step 2').should('be.visible');
    });

    it('should validate production API integration with authentication', () => {
      // Intercept API calls to verify authentication headers
      cy.intercept('GET', '**/api/**').as('apiCall');
      
      cy.contains('Start Your Application').click();
      
      // Wait for any API calls and verify authentication
      cy.wait('@apiCall', { timeout: 15000 }).then((interception) => {
        if (interception.request.headers.authorization) {
          expect(interception.request.headers.authorization).to.include('Bearer');
          expect(interception.request.headers.authorization).to.include(Cypress.env('VITE_CLIENT_APP_SHARED_TOKEN'));
        }
      });
    });
  });

  describe('Step 3: Business Details', () => {
    beforeEach(() => {
      // Navigate directly to Step 3 for focused testing
      cy.visit('/apply/step-3');
    });

    it('should display consistent styling with gradient headers', () => {
      // Verify gradient header is present
      cy.get('h1, h2').contains('Step 3').should('be.visible');
      
      // Verify responsive grid layout
      cy.get('.grid').should('have.class', 'md:grid-cols-2');
      
      // Verify input styling consistency
      cy.get('input').first().should('have.class', 'h-12');
      
      // Verify continue button styling
      cy.get('button').contains('Continue').should('have.class', 'bg-orange-500');
    });

    it('should complete business details form', () => {
      // Fill business operating name
      cy.get('input[placeholder*="operating name"], input[name*="operating"]').first().type('Test Business LLC');
      
      // Fill legal name
      cy.get('input[placeholder*="legal name"], input[name*="legal"]').first().type('Test Business Legal Name LLC');
      
      // Fill address information
      cy.get('input[placeholder*="address"], input[name*="address"]').first().type('123 Business Street');
      cy.get('input[placeholder*="city"], input[name*="city"]').type('Business City');
      
      // Select state/province
      cy.get('select, [role="combobox"]').first().click();
      cy.contains('California').click();
      
      // Fill postal code
      cy.get('input[placeholder*="postal"], input[placeholder*="zip"], input[name*="postal"]').type('12345');
      
      // Fill phone number
      cy.get('input[placeholder*="phone"], input[name*="phone"]').type('(555) 123-4567');
      
      // Submit form
      cy.get('button').contains('Continue').click();
      
      // Verify navigation to Step 4
      cy.url().should('include', '/apply/step-4');
    });
  });

  describe('Step 4: Applicant Information', () => {
    beforeEach(() => {
      cy.visit('/apply/step-4');
    });

    it('should display consistent styling matching Steps 1 and 3', () => {
      // Verify gradient header
      cy.get('h1, h2').contains('Step 4').should('be.visible');
      
      // Verify grid layout consistency
      cy.get('.grid').should('have.class', 'md:grid-cols-2');
      
      // Verify input heights match other steps
      cy.get('input').first().should('have.class', 'h-12');
      
      // Verify button styling consistency
      cy.get('button').contains('Continue').should('have.class', 'bg-orange-500');
    });

    it('should complete applicant information and trigger API calls', () => {
      // Intercept application submission API
      cy.intercept('POST', '**/api/applications').as('submitApplication');
      cy.intercept('POST', '**/api/applications/*/initiate-signing').as('initiateSignNow');
      
      // Fill applicant information (all optional fields)
      cy.get('input[placeholder*="first name"], input[name*="firstName"]').type('John');
      cy.get('input[placeholder*="last name"], input[name*="lastName"]').type('Doe');
      cy.get('input[placeholder*="email"], input[name*="email"]').type('john.doe@example.com');
      cy.get('input[placeholder*="phone"], input[name*="phone"]').type('(555) 987-6543');
      
      // Submit Step 4 which should trigger API calls
      cy.get('button').contains('Continue').click();
      
      // Verify API calls are made with proper authentication
      cy.wait('@submitApplication', { timeout: 30000 }).then((interception) => {
        expect(interception.request.headers).to.have.property('authorization');
        expect(interception.request.headers.authorization).to.include('Bearer');
        expect(interception.request.headers.authorization).to.include(Cypress.env('VITE_CLIENT_APP_SHARED_TOKEN'));
      });
      
      // Verify SignNow initiation API call
      cy.wait('@initiateSignNow', { timeout: 30000 }).then((interception) => {
        expect(interception.request.headers).to.have.property('authorization');
      });
      
      // Should navigate to Step 5 or Step 6 depending on flow
      cy.url().should('match', /\/apply\/step-[56]/);
    });
  });

  describe('Step 2: AI Product Recommendations', () => {
    beforeEach(() => {
      // Complete Step 1 to reach Step 2
      cy.visit('/apply/step-1');
      cy.get('[data-cy="lookingFor"]').click();
      cy.contains('Business Capital').click();
      cy.get('[data-cy="fundingAmount"]').click();
      cy.contains('$100,000 to $250,000').click();
      cy.get('[data-cy="businessLocation"]').click();
      cy.contains('United States').click();
      cy.get('[data-cy="salesHistory"]').click();
      cy.contains('1 to 2 years').click();
      cy.get('[data-cy="lastYearRevenue"]').click();
      cy.contains('$250,000 to $500,000').click();
      cy.get('[data-cy="averageMonthlyRevenue"]').click();
      cy.contains('$20,000 to $50,000').click();
      cy.get('[data-cy="accountsReceivable"]').click();
      cy.contains('$10,000 to $50,000').click();
      cy.get('[data-cy="fixedAssets"]').click();
      cy.contains('$50,000 to $100,000').click();
      cy.get('[data-cy="fundsPurpose"]').click();
      cy.contains('Working Capital').click();
      cy.get('[data-cy="next"]').click();
      cy.url().should('include', '/apply/step-2');
    });

    it('should load AI recommendations with real lender data', () => {
      // Intercept recommendations API
      cy.intercept('GET', '**/api/loan-products/categories**').as('getRecommendations');
      
      // Wait for recommendations to load
      cy.wait('@getRecommendations', { timeout: 15000 }).then((interception) => {
        expect(interception.request.headers).to.have.property('authorization');
        expect(interception.request.headers.authorization).to.include('Bearer');
      });
      
      // Verify recommendation cards appear
      cy.contains('Recommendations for You', { timeout: 15000 }).should('be.visible');
      cy.get('[data-testid="product-category-card"]').should('have.length.greaterThan', 0);
    });

    it('should display lender product cards with match scores', () => {
      // Wait for content to load
      cy.contains('Recommendations', { timeout: 15000 }).should('be.visible');
      
      // Verify product cards have required elements
      cy.get('[data-testid="product-category-card"]').first().within(() => {
        cy.get('[data-testid="category-name"]').should('be.visible');
        cy.get('[data-testid="match-percentage"]').should('be.visible');
        cy.get('[data-testid="lender-count"]').should('be.visible');
        cy.contains(/\d+%/).should('be.visible'); // Match percentage
      });
    });

    it('should allow product selection and navigation to Step 3', () => {
      // Wait for recommendations
      cy.contains('Recommendations', { timeout: 15000 }).should('be.visible');
      
      // Select first available product category
      cy.get('[data-testid="product-category-card"]').first().click();
      
      // Verify selection is highlighted
      cy.get('[data-testid="product-category-card"]').first().should('have.class', 'selected');
      
      // Continue to Step 3
      cy.get('button').contains('Continue').click();
      cy.url().should('include', '/apply/step-3');
    });

    it('should prevent navigation without product selection', () => {
      // Wait for page to load
      cy.contains('Recommendations', { timeout: 15000 }).should('be.visible');
      
      // Try to continue without selection
      cy.get('button').contains('Continue').should('be.disabled');
      
      // Select a product
      cy.get('[data-testid="product-category-card"]').first().click();
      
      // Button should now be enabled
      cy.get('button').contains('Continue').should('not.be.disabled');
    });
  });

  describe('Step 5: File Upload', () => {
    beforeEach(() => {
      cy.visit('/apply/step-5');
    });

    it('should load document requirements from production API', () => {
      // Intercept document requirements API
      cy.intercept('GET', '**/api/loan-products/required-documents/**').as('getRequiredDocs');
      
      // Wait for API call and verify authentication
      cy.wait('@getRequiredDocs', { timeout: 15000 }).then((interception) => {
        expect(interception.request.headers).to.have.property('authorization');
        expect(interception.request.headers.authorization).to.include('Bearer');
      });
      
      // Verify document requirements are displayed
      cy.contains('Bank Statements', { timeout: 10000 }).should('be.visible');
      cy.contains('Required').should('be.visible');
    });

    it('should upload files with proper authentication', () => {
      // Wait for document requirements to load
      cy.contains('Bank Statements', { timeout: 15000 }).should('be.visible');
      
      // Intercept file upload API
      cy.intercept('POST', '**/api/upload/**').as('uploadFile');
      
      // Upload a test file
      cy.fixture('sample-bank-statement.pdf', 'base64').then(fileContent => {
        cy.get('[data-testid="upload-area"]').first().selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'bank_statement.pdf',
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
      });
      
      // Verify upload API call with authentication
      cy.wait('@uploadFile', { timeout: 30000 }).then((interception) => {
        expect(interception.request.headers).to.have.property('authorization');
        expect(interception.request.headers.authorization).to.include('Bearer');
        expect(interception.request.headers.authorization).to.include(Cypress.env('VITE_CLIENT_APP_SHARED_TOKEN'));
      });
      
      // Verify upload success
      cy.contains('Upload successful', { timeout: 10000 }).should('be.visible');
    });

    it('should handle upload progress and completion', () => {
      cy.contains('Bank Statements', { timeout: 15000 }).should('be.visible');
      
      // Mock slow upload to test progress
      cy.intercept('POST', '**/api/upload/**', (req) => {
        req.reply((res) => {
          res.delay(2000);
          res.send({ statusCode: 200, body: { success: true, data: { fileId: 'test_file' } } });
        });
      }).as('slowUpload');
      
      // Upload file
      cy.fixture('sample-bank-statement.pdf', 'base64').then(fileContent => {
        cy.get('[data-testid="upload-area"]').first().selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test_upload.pdf',
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
      });
      
      // Verify progress indicators
      cy.contains('Uploading').should('be.visible');
      
      // Wait for completion
      cy.wait('@slowUpload');
      cy.contains('Upload successful').should('be.visible');
    });
  });

  describe('Step 6: SignNow Integration', () => {
    beforeEach(() => {
      cy.visit('/apply/step-6');
    });

    it('should initialize SignNow embedded interface', () => {
      // Intercept SignNow initialization API
      cy.intercept('POST', '**/api/applications/*/complete').as('initializeSignNow');
      
      // Start SignNow process
      cy.get('[data-cy="finalize-application"]', { timeout: 10000 }).click();
      
      // Verify API call with authentication
      cy.wait('@initializeSignNow', { timeout: 30000 }).then((interception) => {
        expect(interception.request.headers).to.have.property('authorization');
        expect(interception.request.headers.authorization).to.include('Bearer');
        expect(interception.request.headers.authorization).to.include(Cypress.env('VITE_CLIENT_APP_SHARED_TOKEN'));
      });
      
      // Verify SignNow iframe loads
      cy.get('[data-testid="signnow-iframe"]', { timeout: 15000 }).should('be.visible');
      cy.get('iframe[src*="signnow"]').should('be.visible');
    });

    it('should validate iframe URL and role configuration', () => {
      // Start SignNow process
      cy.get('[data-cy="finalize-application"]', { timeout: 10000 }).click();
      
      // Wait for iframe to load and verify URL structure
      cy.get('[data-testid="signnow-iframe"]', { timeout: 15000 }).should('be.visible');
      
      // Check iframe src contains required parameters
      cy.get('iframe[src*="signnow"]').should(($iframe) => {
        const src = $iframe.attr('src');
        expect(src).to.include('role=Borrower');
        expect(src).to.match(/https:\/\/.+\.signnow\./);
      });
    });

    it('should handle SignNow iframe communication', () => {
      // Start SignNow process
      cy.get('[data-cy="finalize-application"]', { timeout: 10000 }).click();
      
      // Wait for iframe to load
      cy.get('[data-testid="signnow-iframe"]', { timeout: 15000 }).should('be.visible');
      
      // Simulate signing completion via postMessage
      cy.window().then((win) => {
        win.postMessage({
          type: 'signnow_complete',
          status: 'signed',
          applicationId: 'test_app_123'
        }, '*');
      });
      
      // Verify completion handling
      cy.contains('Documents signed successfully', { timeout: 10000 }).should('be.visible');
      cy.contains('Continue').should('be.visible');
    });

    it('should handle webhook confirmation and status updates', () => {
      // Mock successful signing with webhook confirmation
      cy.intercept('GET', '**/api/applications/*/signing-status', {
        statusCode: 200,
        body: { status: 'completed', signedAt: new Date().toISOString() }
      }).as('signingStatus');
      
      // Start SignNow process
      cy.get('[data-cy="finalize-application"]', { timeout: 10000 }).click();
      
      // Wait for status polling
      cy.wait('@signingStatus', { timeout: 15000 });
      
      // Verify webhook confirmation handling
      cy.contains('Document signing confirmed', { timeout: 10000 }).should('be.visible');
      cy.get('button').contains('Continue to Step 7').should('be.visible');
    });

    it('should handle SignNow errors and provide fallback options', () => {
      // Mock SignNow initialization failure
      cy.intercept('POST', '**/api/applications/*/complete', {
        statusCode: 500,
        body: { error: 'SignNow service unavailable' }
      }).as('signNowError');
      
      // Attempt to start SignNow
      cy.get('[data-cy="finalize-application"]', { timeout: 10000 }).click();
      
      // Verify error handling
      cy.wait('@signNowError');
      cy.contains('Error preparing documents').should('be.visible');
      cy.contains('Try again').should('be.visible');
      
      // Verify fallback options are available
      cy.contains('Open in new window').should('be.visible');
    });
  });

  describe('Step 7: Final Submission', () => {
    beforeEach(() => {
      cy.visit('/apply/step-7');
    });

    it('should display application summary and terms', () => {
      // Verify step header
      cy.contains('Step 7').should('be.visible');
      cy.contains('Review & Submit').should('be.visible');
      
      // Verify application summary sections
      cy.contains('Application Summary').should('be.visible');
      cy.contains('Business Information').should('be.visible');
      cy.contains('Funding Details').should('be.visible');
      
      // Verify terms and conditions
      cy.contains('Terms & Conditions').should('be.visible');
      cy.contains('Privacy Policy').should('be.visible');
      
      // Verify submit button is initially disabled
      cy.get('button').contains('Submit Application').should('be.disabled');
    });

    it('should require both terms acceptance before submission', () => {
      // Check only Terms & Conditions
      cy.get('input[type="checkbox"]').first().check();
      cy.get('button').contains('Submit Application').should('be.disabled');
      
      // Check Privacy Policy as well
      cy.get('input[type="checkbox"]').last().check();
      cy.get('button').contains('Submit Application').should('not.be.disabled');
      
      // Uncheck one to verify validation
      cy.get('input[type="checkbox"]').first().uncheck();
      cy.get('button').contains('Submit Application').should('be.disabled');
    });

    it('should submit application with proper authentication', () => {
      // Intercept final submission API
      cy.intercept('POST', '**/api/public/applications/*/submit').as('finalSubmission');
      
      // Accept terms
      cy.get('input[type="checkbox"]').check();
      
      // Submit application
      cy.get('button').contains('Submit Application').click();
      
      // Verify API call with authentication
      cy.wait('@finalSubmission', { timeout: 30000 }).then((interception) => {
        expect(interception.request.headers).to.have.property('authorization');
        expect(interception.request.headers.authorization).to.include('Bearer');
        expect(interception.request.headers.authorization).to.include(Cypress.env('VITE_CLIENT_APP_SHARED_TOKEN'));
      });
      
      // Verify navigation to success page
      cy.url().should('include', '/application-success');
    });

    it('should handle submission errors gracefully', () => {
      // Mock submission failure
      cy.intercept('POST', '**/api/public/applications/*/submit', {
        statusCode: 500,
        body: { error: 'Submission failed' }
      }).as('submissionError');
      
      // Accept terms and submit
      cy.get('input[type="checkbox"]').check();
      cy.get('button').contains('Submit Application').click();
      
      // Verify error handling
      cy.wait('@submissionError');
      cy.contains('Submission failed').should('be.visible');
      cy.contains('Try again').should('be.visible');
      
      // Verify form remains editable
      cy.get('button').contains('Submit Application').should('not.be.disabled');
    });
  });

  describe('Application Success Page', () => {
    beforeEach(() => {
      cy.visit('/application-success');
    });

    it('should display success confirmation and timeline', () => {
      // Verify success messaging
      cy.contains('Application Submitted Successfully').should('be.visible');
      cy.contains('Thank you').should('be.visible');
      
      // Verify application reference ID
      cy.contains('Application ID').should('be.visible');
      cy.get('[data-testid="application-id"]').should('be.visible');
      
      // Verify timeline or next steps
      cy.contains('What Happens Next').should('be.visible');
      cy.contains('Review Process').should('be.visible');
    });

    it('should provide contact information and support', () => {
      // Verify contact details
      cy.contains('Contact Information').should('be.visible');
      cy.contains('support@boreal.financial').should('be.visible');
      
      // Verify support options
      cy.contains('Questions?').should('be.visible');
      cy.get('a[href*="mailto"]').should('be.visible');
    });

    it('should offer next actions or dashboard link', () => {
      // Verify action buttons
      cy.contains('Track Application').should('be.visible').or('Return to Dashboard').should('be.visible');
      
      // Verify proper routing
      cy.get('a, button').contains(/Track|Dashboard/).click();
      cy.url().should('not.include', '/application-success');
    });
  });

  describe('Production Environment Validation', () => {
    it('should verify production URL and SSL certificate', () => {
      cy.url().should('include', 'https://clientportal.boreal.financial');
      
      // Verify SSL certificate is valid (Cypress automatically validates this)
      cy.visit('/');
      cy.contains('Boreal Financial').should('be.visible');
    });

    it('should validate authentication token configuration', () => {
      // Verify environment token is configured
      const token = Cypress.env('VITE_CLIENT_APP_SHARED_TOKEN');
      expect(token).to.exist;
      expect(token).to.be.a('string');
      expect(token.length).to.be.greaterThan(20);
    });

    it('should handle production API endpoints correctly', () => {
      // Test all major API endpoints are accessible
      cy.intercept('GET', '**/api/public/lenders').as('getLenders');
      cy.intercept('GET', '**/api/loan-products/categories**').as('getCategories');
      
      cy.visit('/apply/step-1');
      
      // Fill minimal form to trigger API calls
      cy.get('[data-cy="lookingFor"]').click();
      cy.contains('Business Capital').click();
      cy.get('[data-cy="fundingAmount"]').click();
      cy.contains('$100,000 to $250,000').click();
      cy.get('[data-cy="next"]').click();
      
      // Verify API calls succeed
      cy.wait('@getLenders', { timeout: 30000 });
      cy.wait('@getCategories', { timeout: 30000 });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should work correctly on mobile viewport', () => {
      cy.viewport(375, 812); // iPhone X dimensions
      
      cy.visit('/');
      cy.contains('Start Your Application').should('be.visible').click();
      
      // Verify mobile layout for Step 1
      cy.get('.grid').should('have.class', 'grid-cols-1');
      
      // Fill form on mobile
      cy.get('[data-cy="lookingFor"]').click();
      cy.contains('Business Capital').click();
      
      cy.get('[data-cy="fundingAmount"]').click();
      cy.contains('$100,000 to $250,000').click();
      
      // Continue through steps
      cy.get('[data-cy="next"]').should('be.visible');
    });

    it('should maintain visual consistency on tablet', () => {
      cy.viewport(768, 1024); // iPad dimensions
      
      cy.visit('/apply/step-3');
      
      // Verify tablet layout
      cy.get('.grid').should('have.class', 'md:grid-cols-2');
      cy.get('h1, h2').contains('Step 3').should('be.visible');
    });
  });
});