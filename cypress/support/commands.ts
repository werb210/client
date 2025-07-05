/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-testid attribute.
       * @example cy.getByTestId('submit-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      
      /**
       * Custom command to fill out mobile application form
       * @example cy.fillMobileApplication(applicationData)
       */
      fillMobileApplication(data: any): Chainable<void>
      
      /**
       * Custom command to simulate mobile file upload
       * @example cy.uploadMobileDocument('statement.pdf')
       */
      uploadMobileDocument(fileName: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`)
})

Cypress.Commands.add('fillMobileApplication', (data: any) => {
  // Mobile-optimized form filling helper
  cy.get('select[name="lookingFor"]').select(data.lookingFor || 'Capital for business growth')
  cy.get('input[name="fundingAmount"]').clear().type(data.fundingAmount || '75000')
  cy.get('select[name="businessLocation"]').select(data.businessLocation || 'Canada')
  cy.get('button').contains('Continue').scrollIntoView().click()
})

Cypress.Commands.add('uploadMobileDocument', (fileName: string) => {
  // Mobile document upload helper
  const fileContent = 'BMO Business Banking Statement - Mobile Test Data'
  cy.get('input[type="file"]').first().then(input => {
    const file = new File([fileContent], fileName, { type: 'application/pdf' })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    input[0].files = dataTransfer.files
    input[0].dispatchEvent(new Event('change', { bubbles: true }))
  })
})