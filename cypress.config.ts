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
    VITE_CLIENT_APP_SHARED_TOKEN: "ae2dd3089a06aa32157abd1b997a392836059ba3d47dca79cff0660c09f95042"
  }
});