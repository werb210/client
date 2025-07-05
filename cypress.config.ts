import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',           // Production server
    supportFile: 'cypress/support/e2e.ts',
    env: {
      STAFF_API: 'https://staffportal.replit.app/api'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});