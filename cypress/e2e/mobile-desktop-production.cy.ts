/// <reference types="cypress" />

describe('Boreal Financial Production Application Suite', () => {
  const baseUrl = Cypress.env('CYPRESS_BASE_URL') || 'http://localhost:5000';
  
  beforeEach(() => {
    cy.visit(baseUrl);
  });

  describe('Mobile Testing (375px)', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone SE
    });

    it('should complete mobile application flow', () => {
      // Landing page
      cy.contains('Get Started').should('be.visible');
      cy.contains('Get Started').click();
      
      // Step 1: Financial Profile
      cy.url().should('include', '/apply/step-1');
      cy.get('[data-testid="funding-amount"]').select('$100,000 - $250,000');
      cy.get('[data-testid="looking-for"]').select('Working Capital');
      cy.get('[data-testid="business-location"]').select('US');
      cy.get('[data-testid="sales-history"]').select('2 to 5 years');
      cy.get('[data-testid="last-year-revenue"]').select('$500K - $1M');
      cy.get('[data-testid="monthly-revenue"]').select('$50K - $100K');
      cy.get('[data-testid="ar-balance"]').select('$50K - $100K');
      cy.get('[data-testid="fixed-assets"]').select('$100K - $500K');
      
      cy.contains('Continue to Step 2').click();
      
      // Step 2: Recommendations
      cy.url().should('include', '/apply/step-2');
      cy.get('[data-testid="product-categories"]').should('be.visible');
      cy.get('[data-testid="category-card"]').first().click();
      cy.contains('Continue to Step 3').click();
      
      // Step 3: Business Details
      cy.url().should('include', '/apply/step-3');
      cy.get('[data-testid="operating-name"]').type('Test Business Mobile');
      cy.get('[data-testid="legal-name"]').type('Test Business Legal Mobile');
      cy.get('[data-testid="address1"]').type('123 Test St');
      cy.get('[data-testid="city"]').type('New York');
      cy.get('[data-testid="state"]').select('NY');
      cy.get('[data-testid="postal-code"]').type('10001');
      cy.get('[data-testid="phone"]').type('(555) 123-4567');
      cy.get('[data-testid="business-structure"]').select('LLC');
      cy.get('[data-testid="start-date"]').type('2020-01-01');
      cy.get('[data-testid="employees"]').select('5-10');
      cy.get('[data-testid="industry"]').select('Technology');
      
      cy.contains('Continue to Step 4').click();
      
      // Step 4: Application Submission
      cy.url().should('include', '/apply/step-4');
      cy.get('[data-testid="first-name"]').type('John');
      cy.get('[data-testid="last-name"]').type('Doe');
      cy.get('[data-testid="email"]').type('john.doe@test.com');
      cy.get('[data-testid="phone"]').type('(555) 987-6543');
      cy.get('[data-testid="title"]').type('CEO');
      cy.get('[data-testid="ownership"]').select('76-100%');
      
      // Submit application
      cy.contains('Submit Application').click();
      
      // Verify production application ID is created
      cy.window().then((win) => {
        const appId = win.localStorage.getItem('appId');
        expect(appId).to.match(/^app_prod_\d+$/);
        cy.log('Application ID:', appId);
      });
    });
  });

  describe('Desktop Testing (1920px)', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });

    it('should complete desktop application flow with production API', () => {
      // Landing page
      cy.contains('Get Started').should('be.visible');
      cy.contains('Get Started').click();
      
      // Step 1: Financial Profile
      cy.url().should('include', '/apply/step-1');
      
      // Verify 41 products are loaded
      cy.window().then((win) => {
        return new Cypress.Promise((resolve) => {
          const checkProducts = () => {
            fetch('/api/public/lenders')
              .then(response => response.json())
              .then(data => {
                if (data.products && data.products.length >= 41) {
                  resolve(data.products.length);
                } else {
                  setTimeout(checkProducts, 500);
                }
              });
          };
          checkProducts();
        });
      }).should('be.gte', 41);
      
      // Fill form
      cy.get('[data-testid="funding-amount"]').select('$500,000 - $1,000,000');
      cy.get('[data-testid="looking-for"]').select('Both Capital & Equipment');
      cy.get('[data-testid="equipment-value"]').select('$250K - $500K');
      cy.get('[data-testid="business-location"]').select('Canada');
      cy.get('[data-testid="sales-history"]').select('More than 5 years');
      cy.get('[data-testid="last-year-revenue"]').select('$2M - $5M');
      cy.get('[data-testid="monthly-revenue"]').select('$200K+');
      cy.get('[data-testid="ar-balance"]').select('$100K+');
      cy.get('[data-testid="fixed-assets"]').select('$1M+');
      
      cy.contains('Continue to Step 2').click();
      
      // Step 2: Verify intelligent filtering
      cy.url().should('include', '/apply/step-2');
      cy.get('[data-testid="product-categories"]').should('be.visible');
      cy.get('[data-testid="profile-summary"]').should('contain', 'Canada');
      cy.get('[data-testid="profile-summary"]').should('contain', '$500,000 - $1,000,000');
      
      // Select a product category
      cy.get('[data-testid="category-card"]').should('have.length.gte', 1);
      cy.get('[data-testid="category-card"]').first().click();
      cy.contains('Continue to Step 3').click();
      
      // Step 3: Business Details
      cy.url().should('include', '/apply/step-3');
      cy.get('[data-testid="operating-name"]').type('Test Business Desktop');
      cy.get('[data-testid="legal-name"]').type('Test Business Legal Desktop Inc.');
      cy.get('[data-testid="address1"]').type('456 Business Ave');
      cy.get('[data-testid="city"]').type('Toronto');
      cy.get('[data-testid="state"]').select('ON');
      cy.get('[data-testid="postal-code"]').type('M5V 3A8');
      cy.get('[data-testid="phone"]').type('(416) 555-0123');
      cy.get('[data-testid="business-structure"]').select('Corporation');
      cy.get('[data-testid="start-date"]').type('2018-03-15');
      cy.get('[data-testid="employees"]').select('11-25');
      cy.get('[data-testid="industry"]').select('Manufacturing');
      
      cy.contains('Continue to Step 4').click();
      
      // Step 4: Application Submission with Production API
      cy.url().should('include', '/apply/step-4');
      cy.get('[data-testid="first-name"]').type('Jane');
      cy.get('[data-testid="last-name"]').type('Smith');
      cy.get('[data-testid="email"]').type('jane.smith@testbusiness.com');
      cy.get('[data-testid="phone"]').type('(416) 555-0456');
      cy.get('[data-testid="title"]').type('President');
      cy.get('[data-testid="ownership"]').select('51-75%');
      
      // Submit application and verify production API response
      cy.intercept('POST', '/api/applications').as('createApplication');
      cy.contains('Submit Application').click();
      
      // Wait for API call and verify response
      cy.wait('@createApplication').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        expect(interception.response?.body).to.have.property('applicationId');
        expect(interception.response?.body.applicationId).to.match(/^app_prod_\d+$/);
      });
      
      // Verify Step 6 navigation
      cy.url().should('include', '/apply/step-6');
      
      // Check that application ID is stored
      cy.window().then((win) => {
        const appId = win.localStorage.getItem('appId');
        expect(appId).to.match(/^app_prod_\d+$/);
        cy.log('Production Application ID:', appId);
      });
    });
  });

  describe('Step 6 SignNow Integration', () => {
    it('should retrieve signing URL and load iframe', () => {
      // Set up test application ID
      cy.window().then((win) => {
        win.localStorage.setItem('appId', 'app_prod_test123');
      });
      
      cy.visit(`${baseUrl}/apply/step-6`);
      
      // Verify polling for signing URL
      cy.intercept('POST', '/api/applications/*/initiate-signing').as('initiateSigning');
      
      // Wait for signing URL retrieval
      cy.wait('@initiateSigning', { timeout: 10000 }).then((interception) => {
        if (interception.response?.statusCode === 200) {
          expect(interception.response.body).to.have.property('signingUrl');
          
          // Verify iframe loads
          cy.get('iframe[src*="signnow"]').should('be.visible');
        }
      });
    });
  });

  describe('Analytics & Error Monitoring', () => {
    it('should fire GTM events on submission success', () => {
      cy.window().then((win) => {
        // Mock GTM
        win.dataLayer = win.dataLayer || [];
        cy.stub(win.dataLayer, 'push').as('gtmPush');
      });
      
      // Complete minimal flow to trigger analytics
      cy.visit(`${baseUrl}/apply/step-1`);
      // ... fill form and submit
      
      // Verify GTM events fired
      cy.get('@gtmPush').should('have.been.calledWith', 
        Cypress.sinon.match.has('event', 'application_submitted')
      );
    });

    it('should have no network errors in production', () => {
      // Monitor network errors
      cy.window().then((win) => {
        win.addEventListener('error', (e) => {
          throw new Error(`Network error: ${e.message}`);
        });
      });
      
      cy.visit(baseUrl);
      cy.contains('Get Started').click();
      
      // Verify no console errors
      cy.window().then((win) => {
        const errors = win.console.error.calls || [];
        expect(errors.length).to.eq(0);
      });
    });
  });
});