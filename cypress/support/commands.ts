/// <reference types="cypress" />

// Custom command implementations
Cypress.Commands.add('clearIndexedDB', () => {
  cy.window().then(async (win) => {
    // Clear all IndexedDB databases
    const databases = await win.indexedDB.databases();
    await Promise.all(
      databases.map(db => {
        return new Promise<void>((resolve, reject) => {
          const deleteReq = win.indexedDB.deleteDatabase(db.name!);
          deleteReq.onerror = () => reject(deleteReq.error);
          deleteReq.onsuccess = () => resolve();
        });
      })
    );
  });
});

Cypress.Commands.add('syncNow', () => {
  cy.window().then((win) => {
    // Trigger manual sync if sync function is available
    if ((win as any).triggerManualSync) {
      (win as any).triggerManualSync();
    }
  });
});

// Type declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Clears all IndexedDB databases
       */
      clearIndexedDB(): Chainable<void>;
      
      /**
       * Triggers manual synchronization
       */
      syncNow(): Chainable<void>;
    }
  }
}

export {};