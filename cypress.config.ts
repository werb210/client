import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',           // Production server
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    video: false,
    screenshotOnRunFailure: true,
    env: {
      STAFF_API: 'https://staffportal.replit.app/api',
      VITE_CLIENT_APP_SHARED_TOKEN: process.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token-for-cypress'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      
      // Ensure authentication token is available for tests
      config.env.VITE_CLIENT_APP_SHARED_TOKEN = 
        process.env.VITE_CLIENT_APP_SHARED_TOKEN || 
        config.env.VITE_CLIENT_APP_SHARED_TOKEN ||
        'test-token-for-cypress';
      
      return config;
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});