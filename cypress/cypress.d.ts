/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Clear IndexedDB data for the Boreal Financial application
       * @example cy.clearIndexedDB()
       */
      clearIndexedDB(): Chainable<Subject>

      /**
       * Trigger manual sync of lender products from staff API
       * @example cy.syncNow()
       */
      syncNow(): Chainable<Subject>
    }
  }
}

export {}