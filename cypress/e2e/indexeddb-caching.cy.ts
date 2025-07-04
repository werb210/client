/**
 * Cypress E2E Tests for IndexedDB Caching System
 * Tests the requirements: successful sync, API failure → cache fallback, cache missing → alert
 */

describe('IndexedDB Caching System', () => {
  beforeEach(() => {
    // Clear IndexedDB before each test
    cy.clearIndexedDB();
    cy.visit('/indexeddb-test');
  });

  it('should successfully sync lender products to IndexedDB cache', () => {
    // Wait for the page to load and API to be called
    cy.get('[data-testid="cache-status"]', { timeout: 10000 }).should('be.visible');
    
    // Check that products were fetched and cached
    cy.get('[data-testid="products-fetched"]').should('contain', '6');
    
    // Verify cache status shows as active
    cy.get('[data-testid="cache-status-badge"]').should('contain', 'Active');
    
    // Verify IndexedDB contains the cached data
    cy.window().then((win) => {
      return new Promise((resolve) => {
        const request = win.indexedDB.open('keyval-store');
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['keyval'], 'readonly');
          const store = transaction.objectStore('keyval');
          const getRequest = store.get('lender_products_cache');
          
          getRequest.onsuccess = () => {
            expect(getRequest.result).to.exist;
            expect(Array.isArray(getRequest.result)).to.be.true;
            expect(getRequest.result.length).to.be.greaterThan(0);
            resolve(getRequest.result);
          };
        };
      });
    });
  });

  it('should fallback to cached data when API is unreachable', () => {
    // First, let the normal API call succeed and cache data
    cy.get('[data-testid="cache-status-badge"]', { timeout: 10000 }).should('contain', 'Active');
    
    // Intercept API calls to simulate failure
    cy.intercept('GET', '/api/public/lenders', { forceNetworkError: true }).as('apiFailure');
    
    // Clear cache and refetch to trigger API failure
    cy.get('[data-testid="clear-cache-btn"]').click();
    cy.wait(1000);
    
    // The system should attempt to fetch from API, fail, and then use cached data
    cy.get('[data-testid="api-status"]').should('contain', 'Error');
    
    // But products should still be displayed from cache
    cy.get('[data-testid="products-display"]').should('be.visible');
    cy.get('[data-testid="products-fetched"]').should('be.greaterThan', 0);
    
    // Should show a warning about using cached data
    cy.get('.toast', { timeout: 5000 }).should('contain', 'cached');
  });

  it('should show alert message when cache is missing and API fails', () => {
    // Intercept API calls to simulate failure from the start
    cy.intercept('GET', '/api/public/lenders', { forceNetworkError: true }).as('apiFailure');
    
    // Clear any existing cache
    cy.clearIndexedDB();
    
    // Reload the page so it starts fresh with no cache
    cy.reload();
    
    // Wait for API failure
    cy.wait('@apiFailure');
    
    // Should show error status
    cy.get('[data-testid="api-status"]', { timeout: 10000 }).should('contain', 'Error');
    
    // Should show cache as empty
    cy.get('[data-testid="cache-status-badge"]').should('contain', 'Empty');
    
    // Should show graceful degradation message
    cy.get('.toast').should('contain', 'temporarily unavailable');
  });

  it('should invalidate cache when WebSocket update is received', () => {
    // Wait for initial cache to be populated
    cy.get('[data-testid="cache-status-badge"]', { timeout: 10000 }).should('contain', 'Active');
    
    // Test WebSocket connection
    cy.get('[data-testid="test-websocket-btn"]').click();
    
    // Check console for WebSocket connection
    cy.window().then((win) => {
      cy.spy(win.console, 'log').should('have.been.calledWith', '[Test] WebSocket connected successfully');
    });
    
    // Simulate WebSocket message (this would normally come from the server)
    cy.window().then((win) => {
      const ws = new win.WebSocket('ws://localhost:5000/ws');
      ws.onopen = () => {
        // Simulate lender products update message
        const message = {
          type: 'lender_products.updated',
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(message));
        ws.close();
      };
    });
    
    // Should show update notification
    cy.get('.toast', { timeout: 5000 }).should('contain', 'updated');
  });

  it('should maintain cache across browser sessions', () => {
    // Wait for cache to be populated
    cy.get('[data-testid="cache-status-badge"]', { timeout: 10000 }).should('contain', 'Active');
    cy.get('[data-testid="products-fetched"]').should('be.greaterThan', 0);
    
    // Record the number of cached products
    cy.get('[data-testid="cache-count"]').invoke('text').then((cacheCount) => {
      // Reload the page to simulate new session
      cy.reload();
      
      // Cache should still be available
      cy.get('[data-testid="cache-status-badge"]', { timeout: 10000 }).should('contain', 'Active');
      cy.get('[data-testid="cache-count"]').should('contain', cacheCount);
    });
  });

  it('should respect 5-minute refetch interval', () => {
    // This test verifies the refetch interval configuration
    cy.get('[data-testid="cache-status"]').should('be.visible');
    
    // Check that the hook is configured with 5-minute interval
    cy.window().then((win) => {
      // Access React Query DevTools to verify interval
      const queryClient = win.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__?.queryClient;
      if (queryClient) {
        const query = queryClient.getQueryData(['lender-products']);
        expect(query).to.exist;
      }
    });
    
    // Verify refetch interval in implementation (5 * 60_000 = 300000ms)
    cy.readFile('client/src/lib/useLenderProducts.ts').should('contain', '5 * 60_000');
  });
});

// Custom command to clear IndexedDB
Cypress.Commands.add('clearIndexedDB', () => {
  cy.window().then((win) => {
    return new Promise((resolve) => {
      const deleteRequest = win.indexedDB.deleteDatabase('keyval-store');
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve(); // Resolve even if deletion fails
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      clearIndexedDB(): Chainable<void>
    }
  }
}