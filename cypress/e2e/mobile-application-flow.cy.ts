/// <reference types="cypress" />

describe('Mobile Application Flow - iOS & Android Viewports', () => {
  const devices = [
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone 14 Pro', width: 393, height: 852 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    { name: 'Google Pixel 5', width: 393, height: 851 },
  ];

  const testData = {
    fundingAmount: '75000',
    applicantEmail: 'qa+mobile@boreal.test',
    businessName: 'Mobile QA Widgets LLC',
    operatingName: 'Mobile Test Business',
    legalName: 'Mobile Test Business Corporation',
    streetAddress: '123 Mobile Test Street',
    city: 'Toronto',
    postalCode: 'M5V 3A8',
    businessPhone: '(416) 555-0123',
    firstName: 'John',
    lastName: 'Doe',
    homeAddress: '456 Mobile Home Street',
    homeCity: 'Toronto',
    homePostalCode: 'M5V 3B9',
    ownershipPercentage: '100'
  };

  // Intercept API calls before each test
  beforeEach(() => {
    cy.intercept('POST', '**/api/public/applications').as('createApp')
    cy.intercept('POST', '**/api/public/upload/*').as('uploadDocs')
    cy.intercept('GET', '**/api/public/lenders').as('getLenders')
  });

  devices.forEach((device) => {
    context(`Testing on ${device.name} (${device.width}x${device.height})`, () => {
      
      beforeEach(() => {
        cy.viewport(device.width, device.height);
      });

      it('Loads landing page and navigates to Step 1', () => {
        cy.visit('/');
        cy.get('body').should('be.visible');
        
        // Find and click Apply button (mobile-responsive)
        cy.get('[data-testid="apply-button"]').first().should('be.visible').click();
        
        cy.url().should('include', '/apply/step-1');
        cy.contains('What are you looking for?').should('be.visible');
      });

      it('Completes Step 1 funding details on mobile', () => {
        cy.visit('/apply/step-1');
        
        // Mobile-optimized form filling
        cy.get('select[name="lookingFor"]').select('Capital for business growth');
        cy.get('input[name="fundingAmount"]').clear().type(testData.fundingAmount);
        cy.get('select[name="businessLocation"]').select('Canada');
        cy.get('select[name="salesHistory"]').select('2 to 5 years');
        cy.get('select[name="lastYearRevenue"]').select('$250K - $500K');
        cy.get('select[name="averageMonthlyRevenue"]').select('$25K - $50K');
        
        // Scroll to continue button on mobile
        cy.get('button').contains('Continue').scrollIntoView().click();
        
        cy.url().should('include', '/apply/step-2');
      });

      it('Selects lender products on Step 2 mobile view', () => {
        cy.visit('/apply/step-2');
        
        // Wait for lender products to load
        cy.wait('@getLenders', { timeout: 10000 });
        
        // Mobile product card selection
        cy.get('[data-testid="product-category-card"]')
          .first()
          .should('be.visible')
          .scrollIntoView()
          .click();
        
        cy.get('button').contains('Continue').scrollIntoView().click();
        cy.url().should('include', '/apply/step-3');
      });

      it('Fills Step 3 business details on mobile', () => {
        cy.visit('/apply/step-3');
        
        // Mobile form field completion
        cy.get('input[name="operatingName"]').type(testData.operatingName);
        cy.get('input[name="legalName"]').type(testData.legalName);
        cy.get('input[name="streetAddress"]').type(testData.streetAddress);
        cy.get('input[name="city"]').type(testData.city);
        cy.get('select[name="province"]').select('ON');
        cy.get('input[name="postalCode"]').type(testData.postalCode);
        cy.get('input[name="businessPhone"]').type(testData.businessPhone);
        cy.get('select[name="businessStructure"]').select('Corporation');
        cy.get('input[name="numberOfEmployees"]').type('5');
        
        cy.get('button').contains('Continue').scrollIntoView().click();
        cy.url().should('include', '/apply/step-4');
      });

      it('Completes Step 4 applicant info on mobile', () => {
        cy.visit('/apply/step-4');
        
        // Mobile personal information form
        cy.get('input[name="firstName"]').type(testData.firstName);
        cy.get('input[name="lastName"]').type(testData.lastName);
        cy.get('input[name="email"]').clear().type(testData.applicantEmail);
        cy.get('input[name="phone"]').type('(416) 555-0124');
        cy.get('input[name="homeAddress"]').type(testData.homeAddress);
        cy.get('input[name="homeCity"]').type(testData.homeCity);
        cy.get('select[name="homeProvince"]').select('ON');
        cy.get('input[name="homePostalCode"]').type(testData.homePostalCode);
        cy.get('input[name="ownershipPercentage"]').clear().type(testData.ownershipPercentage);
        
        cy.get('button').contains('Continue').scrollIntoView().click();
        cy.url().should('include', '/apply/step-5');
      });

      it('Handles document upload on mobile Step 5', () => {
        cy.visit('/apply/step-5');
        
        // Mobile document upload simulation
        // Create a test file for mobile upload
        const fileName = 'mobile_bank_statement.txt';
        const fileContent = 'BMO Business Banking Statement - Mobile Test\nAccount: 5729841 MANITOBA LTD\nBalance: $861,981.04';
        
        cy.get('input[type="file"]').first().then(input => {
          const file = new File([fileContent], fileName, { type: 'text/plain' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          input[0].files = dataTransfer.files;
          input[0].dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        // Wait for upload processing
        cy.wait(1000);
        
        cy.get('button').contains('Continue').scrollIntoView().click();
        cy.url().should('include', '/apply/step-6');
      });

      it('Handles SignNow signing on mobile Step 6', () => {
        cy.visit('/apply/step-6');
        
        // Mobile SignNow simulation
        cy.get('button').contains('Complete Signing').scrollIntoView().click();
        
        // Simulate mobile signing completion
        cy.wait(1000);
        
        cy.url().should('include', '/apply/step-7');
      });

      it('Completes final submission on mobile Step 7', () => {
        cy.visit('/apply/step-7');
        
        // Mobile terms acceptance
        cy.get('input[type="checkbox"]').each($checkbox => {
          cy.wrap($checkbox).scrollIntoView().check({ force: true });
        });
        
        cy.get('button').contains('Submit Application').scrollIntoView().click();
        
        // Verify mobile success flow
        cy.url().should('include', 'application-success');
        cy.contains('Application Submitted Successfully').should('be.visible');
      });

      it('Tests complete mobile workflow end-to-end', () => {
        // Complete mobile workflow test
        cy.visit('/');
        
        // Landing → Step 1
        cy.get('[data-testid="apply-button"]').first().click();
        
        // Step 1: Quick form completion
        cy.get('select[name="lookingFor"]').select('Capital for business growth');
        cy.get('input[name="fundingAmount"]').clear().type('50000');
        cy.get('select[name="businessLocation"]').select('Canada');
        cy.get('button').contains('Continue').click();
        
        // Step 2: Product selection
        cy.wait('@getLenders', { timeout: 10000 });
        cy.get('[data-testid="product-category-card"]').first().click();
        cy.get('button').contains('Continue').click();
        
        // Step 3: Minimal business info
        cy.get('input[name="operatingName"]').type('Mobile E2E Test');
        cy.get('input[name="legalName"]').type('Mobile E2E Test Corp');
        cy.get('button').contains('Continue').click();
        
        // Step 4: Minimal applicant info
        cy.get('input[name="firstName"]').type('Mobile');
        cy.get('input[name="lastName"]').type('Tester');
        cy.get('input[name="email"]').clear().type('mobile@test.com');
        cy.get('button').contains('Continue').click();
        
        // Step 5: Skip document upload in mobile e2e
        cy.get('button').contains('Continue').click();
        
        // Step 6: Mock signing
        cy.get('button').contains('Complete Signing').click();
        
        // Step 7: Final submission
        cy.get('input[type="checkbox"]').check({ multiple: true, force: true });
        cy.get('button').contains('Submit Application').click();
        
        // Verify success
        cy.url().should('include', 'application-success');
      });

      it('Tests mobile responsive elements and navigation', () => {
        cy.visit('/');
        
        // Test mobile navigation responsiveness
        cy.get('header').should('be.visible');
        cy.get('nav').should('be.visible');
        
        // Test mobile landing page elements
        cy.get('h1').should('be.visible');
        cy.contains('Get Started').should('be.visible');
        
        // Test mobile card layouts
        cy.get('[data-testid="apply-button"]').should('be.visible');
        
        // Navigate to application and test mobile form layouts
        cy.get('[data-testid="apply-button"]').first().click();
        
        // Test mobile form responsiveness
        cy.get('form').should('be.visible');
        cy.get('input, select').each($input => {
          cy.wrap($input).should('be.visible');
        });
        
        // Test mobile button accessibility
        cy.get('button').contains('Continue').should('be.visible');
      });
    });
  });

  // Cross-device compatibility test
  it('Tests orientation changes and device rotation', () => {
    devices.forEach(device => {
      // Portrait mode
      cy.viewport(device.width, device.height);
      cy.visit('/apply/step-1');
      cy.get('form').should('be.visible');
      
      // Landscape mode (swap width/height)
      cy.viewport(device.height, device.width);
      cy.get('form').should('be.visible');
      cy.get('button').contains('Continue').should('be.visible');
    });
  });
});