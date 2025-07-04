/**
 * cypress/e2e/publicSubmission.cy.ts
 * -----------------------------------
 * End-to-end check from the client bundle. Assumes
 * Vite/React dev server OR production build is running
 * at http://localhost:5173 (change if needed).
 */
describe('Unauthenticated application submission', () => {
  it('completes 7-step flow without 401s', () => {
    cy.intercept('POST', '**/api/**').as('anyPost');

    cy.visit('http://localhost:5000');         // ⬅️ start page

    // === Step 1 ===
    cy.get('[data-cy=fundingAmount]').type('500000');
    cy.get('[data-cy=next]').click();

    // === Step 2 (fallback ok) ===
    cy.get('[data-cy=next]').click();

    // === Step 3 ===
    cy.get('[data-cy=operatingName]').type('SmokeCo Ltd.');
    cy.get('[data-cy=legalName]').type('5729841 MANITOBA LTD');
    cy.get('[data-cy=next]').click();

    // === Step 4 ===
    cy.get('[data-cy=contactEmail]').type('john.smith@blacklabelae.ca');
    cy.get('[data-cy=next]').click();
    cy.wait('@anyPost').its('response.statusCode').should('eq', 201); // create app

    // === Step 5 (upload) ===
    cy.fixture('bmo.pdf', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('input[type=file]').selectFile(
          {
            contents: fileContent,
            fileName: 'bmo.pdf',
            mimeType: 'application/pdf',
          },
          { force: true }
        );
      });
    cy.get('[data-cy=next]').click();
    cy.wait('@anyPost').its('response.statusCode').should('eq', 200); // upload

    // === Step 6 + 7 ===
    cy.get('[data-cy=submitApplication]').click();
    cy.wait('@anyPost').its('response.statusCode').should('eq', 200); // submit

    cy.contains('Application submitted').should('exist');
  });
});