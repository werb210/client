import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://clientportal.boreal.financial",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    video: false,
    screenshotOnRunFailure: true,
  },
  env: {
    VITE_CLIENT_APP_SHARED_TOKEN: "83f8f007b62dfe94e4e4def10b2f8958c028de8abaa047e1376d3b9c1f3c6256"
  }
});