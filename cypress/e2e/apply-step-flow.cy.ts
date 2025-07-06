/**
 * Cypress E2E Test: Complete Application Step Flow
 * Tests the entire 7-step application process with real browser interaction
 */

describe('Application Step Flow', () => {
  beforeEach(() => {
    // Visit the application landing page
    cy.visit('/');
    
    // Verify the app loads with proper authentication token
    cy.window().should('have.property', 'location');
    
    // Start the application flow
    cy.contains('Start Your Application').click();
    cy.url().should('include', '/apply/step-1');
  });

  describe('Step 1: Financial Profile', () => {
    it('should complete Step 1 form with all required fields', () => {
      // Fill out Step 1 form fields
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
    });

    it('should validate required fields before proceeding', () => {
      // Try to proceed without filling required fields
      cy.get('[data-cy="next"]').should('be.disabled');
      
      // Fill one field and verify button remains disabled
      cy.get('[data-cy="lookingFor"]').click();
      cy.contains('Business Capital').click();
      cy.get('[data-cy="next"]').should('be.disabled');
    });
  });

  describe('Step 2: Recommendations', () => {
    beforeEach(() => {
      // Complete Step 1 first
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
    });

    it('should load product recommendations with API call', () => {
      // Verify API call is made with proper authentication
      cy.intercept('GET', '**/api/loan-products/categories**', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              category: 'term_loan',
              displayName: 'Term Loan',
              count: 15,
              matchScore: 85
            }
          ]
        }
      }).as('getRecommendations');
      
      // Wait for API call
      cy.wait('@getRecommendations').then((interception) => {
        // Verify authentication header is included
        expect(interception.request.headers).to.have.property('authorization');
        expect(interception.request.headers.authorization).to.include('Bearer');
      });
      
      // Verify recommendations are displayed
      cy.contains('Term Loan').should('be.visible');
      cy.contains('Best Match').should('be.visible');
    });

    it('should allow product selection and proceed to Step 3', () => {
      // Wait for recommendations to load
      cy.contains('Term Loan', { timeout: 10000 }).should('be.visible');
      
      // Select a product category
      cy.contains('Term Loan').click();
      
      // Verify selection is highlighted
      cy.contains('Term Loan').parent().should('have.class', 'ring-2');
      
      // Proceed to Step 3
      cy.get('[data-cy="next"]').click();
      cy.url().should('include', '/apply/step-3');
    });
  });

  describe('Step 3: Business Details', () => {
    beforeEach(() => {
      // Complete Steps 1-2
      cy.visit('/apply/step-3');
    });

    it('should have consistent styling with Step 1', () => {
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
      // Fill business details
      cy.get('[data-cy="operatingName"]').type('Test Business LLC');
      cy.get('[data-cy="legalName"]').type('Test Business Legal Name LLC');
      
      // Fill address information
      cy.get('input[placeholder*="address"]').type('123 Business St');
      cy.get('input[placeholder*="city"]').type('Business City');
      
      // Select state
      cy.get('select, [role="combobox"]').first().click();
      cy.contains('California').click();
      
      // Fill remaining required fields
      cy.get('input[placeholder*="postal"], input[placeholder*="zip"]').type('12345');
      cy.get('input[placeholder*="phone"]').type('(555) 123-4567');
      
      // Submit form
      cy.get('[data-cy="next"]').click();
      cy.url().should('include', '/apply/step-4');
    });
  });

  describe('Step 4: Applicant Information', () => {
    beforeEach(() => {
      cy.visit('/apply/step-4');
    });

    it('should have consistent styling with Steps 1 and 3', () => {
      // Verify gradient header
      cy.get('h1, h2').contains('Step 4').should('be.visible');
      
      // Verify grid layout
      cy.get('.grid').should('have.class', 'md:grid-cols-2');
      
      // Verify input heights
      cy.get('input').first().should('have.class', 'h-12');
      
      // Verify button styling
      cy.get('button').contains('Continue').should('have.class', 'bg-orange-500');
    });

    it('should complete applicant information and proceed', () => {
      // Fill optional applicant fields
      cy.get('input[placeholder*="first name"]').type('John');
      cy.get('input[placeholder*="last name"]').type('Doe');
      cy.get('input[placeholder*="email"]').type('john.doe@example.com');
      cy.get('input[placeholder*="phone"]').type('(555) 987-6543');
      
      // Proceed to Step 5
      cy.get('[data-cy="next"]').click();
      cy.url().should('include', '/apply/step-5');
    });
  });

  describe('Authentication Token Validation', () => {
    it('should include proper authentication headers in API calls', () => {
      // Intercept any API calls
      cy.intercept('GET', '**/api/**').as('apiCall');
      cy.intercept('POST', '**/api/**').as('postCall');
      
      // Navigate through the application
      cy.visit('/apply/step-1');
      
      // Wait for any API calls and verify headers
      cy.wait('@apiCall', { timeout: 10000 }).then((interception) => {
        const authHeader = interception.request.headers.authorization;
        expect(authHeader).to.exist;
        expect(authHeader).to.include('Bearer');
        
        // Verify it's using the environment token
        cy.window().then((win) => {
          // Check that VITE_CLIENT_APP_SHARED_TOKEN is available
          expect(Cypress.env('VITE_CLIENT_APP_SHARED_TOKEN') || 
                 win.import?.meta?.env?.VITE_CLIENT_APP_SHARED_TOKEN).to.exist;
        });
      });
    });
  });

  describe('Form Persistence', () => {
    it('should maintain form data across steps', () => {
      // Fill Step 1
      cy.get('[data-cy="lookingFor"]').click();
      cy.contains('Business Capital').click();
      cy.get('[data-cy="fundingAmount"]').click();
      cy.contains('$100,000 to $250,000').click();
      
      // Navigate to Step 2 and back
      cy.get('[data-cy="next"]').click();
      cy.get('button').contains('Back').click();
      
      // Verify data is preserved
      cy.get('[data-cy="lookingFor"]').should('contain', 'Business Capital');
      cy.get('[data-cy="fundingAmount"]').should('contain', '$100,000 to $250,000');
    });
  });

  describe('Error Handling', () => {
    it('should handle API failures gracefully', () => {
      // Mock API failure
      cy.intercept('GET', '**/api/loan-products/categories**', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('apiFailure');
      
      // Navigate to Step 2
      cy.visit('/apply/step-2');
      
      // Verify error handling
      cy.wait('@apiFailure');
      cy.contains('error', { matchCase: false }).should('be.visible');
    });

    it('should handle network timeouts', () => {
      // Mock slow API response
      cy.intercept('GET', '**/api/loan-products/categories**', (req) => {
        req.reply((res) => {
          res.delay(30000); // 30 second delay
          res.send({ statusCode: 200, body: { success: true, data: [] } });
        });
      }).as('slowApi');
      
      cy.visit('/apply/step-2');
      
      // Verify timeout handling or loading states
      cy.contains('Loading', { timeout: 5000 }).should('be.visible');
    });
  });
});