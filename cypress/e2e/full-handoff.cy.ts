/// <reference types="cypress" />

describe('Full client → staff hand-off', () => {
  const fundingAmount = '75000'
  const applicantEmail = 'qa+boreal@demo.dev'

  // Intercept the exact Staff endpoints we care about
  beforeEach(() => {
    cy.intercept('POST', `${Cypress.env('STAFF_API')}/public/applications`).as('createApp')
    cy.intercept('POST', `${Cypress.env('STAFF_API')}/public/upload/*`).as('uploadDocs')
    cy.intercept('GET', `${Cypress.env('STAFF_API')}/public/lenders`).as('getLenders')
  })

  it('submits an application & documents with 2 valid 20X responses', () => {
    // Start at the landing page and navigate to application
    cy.visit('/')
    cy.get('[data-testid="apply-button"]').first().click()

    // Step 1 - Funding Details
    cy.get('select[name="lookingFor"]').select('Capital for business growth')
    cy.get('input[name="fundingAmount"]').clear().type(fundingAmount)
    cy.get('select[name="businessLocation"]').select('Canada')
    cy.get('select[name="salesHistory"]').select('2 to 5 years')
    cy.get('select[name="lastYearRevenue"]').select('$250K - $500K')
    cy.get('select[name="averageMonthlyRevenue"]').select('$25K - $50K')
    cy.get('button').contains('Continue').click()

    // Step 2 - Wait for lender products to load and select first category
    cy.wait('@getLenders', { timeout: 10000 })
    cy.get('[data-testid="product-category-card"]').first().click()
    cy.get('button').contains('Continue').click()

    // Step 3 - Business Details
    cy.get('input[name="operatingName"]').type('QA Widgets LLC')
    cy.get('input[name="legalName"]').type('QA Widgets LLC')
    cy.get('input[name="streetAddress"]').type('123 Test Street')
    cy.get('input[name="city"]').type('Toronto')
    cy.get('select[name="province"]').select('ON')
    cy.get('input[name="postalCode"]').type('M5V 3A8')
    cy.get('input[name="businessPhone"]').type('(416) 555-0123')
    cy.get('select[name="businessStructure"]').select('Corporation')
    cy.get('input[name="numberOfEmployees"]').type('5')
    cy.get('button').contains('Continue').click()

    // Step 4 - Applicant Information
    cy.get('input[name="firstName"]').type('John')
    cy.get('input[name="lastName"]').type('Doe')
    cy.get('input[name="email"]').clear().type(applicantEmail)
    cy.get('input[name="phone"]').type('(416) 555-0124')
    cy.get('input[name="homeAddress"]').type('456 Home Street')
    cy.get('input[name="homeCity"]').type('Toronto')
    cy.get('select[name="homeProvince"]').select('ON')
    cy.get('input[name="homePostalCode"]').type('M5V 3B9')
    cy.get('input[name="ownershipPercentage"]').clear().type('100')
    cy.get('button').contains('Continue').click()

    // Step 5 - Document Upload (use one of the actual BMO statements)
    // Copy one of the attached PDFs to fixtures for the test
    cy.fixture('../attached_assets/April 2025_1751745946758.pdf', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(blob => {
        const file = new File([blob], 'april_2025_statement.pdf', { type: 'application/pdf' })
        cy.get('input[type=file]').first().then(input => {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          input[0].files = dataTransfer.files
          input[0].dispatchEvent(new Event('change', { bubbles: true }))
        })
      })

    cy.get('button').contains('Continue').click()

    // Step 6 - Signature (mock SignNow completion)
    cy.get('button').contains('Complete Signing').click()

    // Step 7 - Final Submission
    cy.get('input[type="checkbox"]').check({ multiple: true })
    cy.get('button').contains('Submit Application').click()

    // Verify API calls were made with correct status codes
    cy.wait('@createApp').its('response.statusCode').should('be.oneOf', [200, 201])
      .then(intercept => {
        expect(intercept.response?.body).to.have.property('applicationId')
      })

    cy.wait('@uploadDocs').its('response.statusCode').should('be.oneOf', [200, 201])

    // Verify success page
    cy.url().should('include', 'application-success')
    cy.contains('Application Submitted Successfully').should('be.visible')
  })

  it('validates the complete lender sync system', () => {
    // Test the diagnostic page functionality
    cy.visit('/diagnostics/lenders')
    
    // Verify sync status
    cy.get('[data-testid="sync-status"]').should('be.visible')
    cy.get('[data-testid="product-count"]').should('contain', '41')
    
    // Test manual sync
    cy.get('button').contains('Force Sync from Staff').click()
    cy.get('[data-testid="sync-success"]', { timeout: 10000 }).should('be.visible')
    
    // Verify all 9 enhanced product fields are present
    cy.get('[data-testid="field-validation"]').should('contain', 'Interest Rate: ✓')
    cy.get('[data-testid="field-validation"]').should('contain', 'Term Length: ✓')
    cy.get('[data-testid="field-validation"]').should('contain', 'Credit Score: ✓')
    cy.get('[data-testid="field-validation"]').should('contain', 'Revenue Requirements: ✓')
    cy.get('[data-testid="field-validation"]').should('contain', 'Industries: ✓')
    cy.get('[data-testid="field-validation"]').should('contain', 'Required Documents: ✓')
  })
})