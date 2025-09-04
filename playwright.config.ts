import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120000,
  use: {
    baseURL: process.env.CLIENT_URL || 'http://localhost:5000',
    headless: true
  },
});