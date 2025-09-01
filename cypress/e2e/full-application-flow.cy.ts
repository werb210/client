/**
 * End-to-end test for complete application flow
 * Tests the entire user journey from landing to submission
 */

describe('Complete Application Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1280, 720);
  });

  it('should complete full application flow successfully', () => {
    // Step 1: Financial Profile
    cy.contains('Start Application').click();
    
    // Fill financial profile
    cy.get('[data-testid="business-name"]').type('Test Business Inc');
    cy.get('[data-testid="annual-revenue"]').type('500000');
    cy.get('[data-testid="years-in-business"]').type('3');
    cy.get('[data-testid="credit-score"]').select('700-749');
    cy.get('[data-testid="funding-amount"]').type('50000');
    cy.get('[data-testid="funding-purpose"]').select('equipment');
    
    cy.contains('Continue to Products').click();
    
    // Step 2: Product Selection
    cy.get('[data-testid="product-card"]').first().click();
    cy.contains('Continue to Business Details').click();
    
    // Step 3: Business Details  
    cy.get('[data-testid="legal-business-name"]').type('Test Business Inc');
    cy.get('[data-testid="business-address"]').type('123 Main St');
    cy.get('[data-testid="business-city"]').type('Toronto');
    cy.get('[data-testid="business-province"]').select('ON');
    cy.get('[data-testid="business-postal-code"]').type('M5V 3A8');
    cy.get('[data-testid="business-phone"]').type('(416) 555-0123');
    cy.get('[data-testid="business-email"]').type('test@testbusiness.ca');
    cy.get('[data-testid="business-industry"]').select('Manufacturing');
    cy.get('[data-testid="business-structure"]').select('Corporation');
    
    cy.contains('Continue to Applicant Info').click();
    
    // Step 4: Applicant Information
    cy.get('[data-testid="first-name"]').type('John');
    cy.get('[data-testid="last-name"]').type('Doe');
    cy.get('[data-testid="title"]').type('CEO');
    cy.get('[data-testid="ownership-percentage"]').type('100');
    cy.get('[data-testid="applicant-phone"]').type('(416) 555-0124');
    cy.get('[data-testid="applicant-email"]').type('john@testbusiness.ca');
    cy.get('[data-testid="date-of-birth"]').type('1980-01-01');
    cy.get('[data-testid="social-insurance-number"]').type('123-456-789');
    
    cy.contains('Continue to Documents').click();
    
    // Step 5: Document Upload
    cy.get('[data-testid="document-upload-zone"]').should('be.visible');
    
    // Mock file upload
    const fileName = 'bank-statement.pdf';
    cy.get('[data-testid="file-input"]').then(input => {
      const file = new File(['mock pdf content'], fileName, { type: 'application/pdf' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      (input[0] as HTMLInputElement).files = dataTransfer.files;
      input.trigger('change');
    });
    
    cy.get('[data-testid="upload-progress"]').should('be.visible');
    cy.contains('Continue to Signature').click();
    
    // Step 6: E-Signature
    cy.get('[data-testid="signature-canvas"]').should('be.visible');
    cy.get('[data-testid="typed-signature"]').type('John Doe');
    cy.contains('Accept and Sign').click();
    
    // Step 7: Review and Submit
    cy.contains('Submit Application').click();
    
    // Verify submission success
    cy.contains('Application Submitted Successfully').should('be.visible');
    cy.get('[data-testid="application-id"]').should('be.visible');
  });

  it('should handle mobile responsiveness', () => {
    // Test mobile viewport
    cy.viewport(375, 667); // iPhone SE
    cy.visit('/');
    
    // Check mobile navigation
    cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
    cy.get('[data-testid="mobile-menu-toggle"]').click();
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
    
    // Test form responsiveness
    cy.contains('Start Application').click();
    cy.get('[data-testid="business-name"]').should('be.visible');
    cy.get('form').should('have.css', 'width').and('match', /3[0-9][0-9]px/);
  });

  it('should work offline', () => {
    cy.visit('/');
    
    // Go offline
    cy.window().then((win) => {
      Object.defineProperty(win.navigator, 'onLine', { 
        writable: true, 
        value: false 
      });
      win.dispatchEvent(new Event('offline'));
    });
    
    // Check offline functionality
    cy.contains('You are currently offline').should('be.visible');
    cy.get('[data-testid="offline-form"]').should('be.visible');
    
    // Test offline form submission
    cy.get('[data-testid="business-name"]').type('Offline Test');
    cy.contains('Save for Later').click();
    cy.contains('Data saved locally').should('be.visible');
  });

  it('should validate form fields properly', () => {
    cy.visit('/');
    cy.contains('Start Application').click();
    
    // Test required field validation
    cy.contains('Continue to Products').click();
    cy.contains('Business name is required').should('be.visible');
    
    // Test email validation
    cy.get('[data-testid="business-email"]').type('invalid-email');
    cy.get('[data-testid="business-email"]').blur();
    cy.contains('Please enter a valid email address').should('be.visible');
    
    // Test phone validation
    cy.get('[data-testid="business-phone"]').type('123');
    cy.get('[data-testid="business-phone"]').blur();
    cy.contains('Please enter a valid phone number').should('be.visible');
  });

  it('should handle API errors gracefully', () => {
    cy.visit('/');
    cy.contains('Start Application').click();
    cy.contains('Continue to Products').click();
    
    // Check for error handling in the UI
    cy.get('[data-testid="error-message"]', { timeout: 10000 }).should('exist');
  });
});