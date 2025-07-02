import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeScheduler } from "./jobs/scheduler";
import { clearLegacyCache, shouldClearCache } from "./startup/clearLegacyCache";
import { runStartupVerification } from "./test/staffDatabaseVerification";

// Clear legacy cache to force use of staff database (43+ products)
if (shouldClearCache()) {
  clearLegacyCache();
}

// Initialize the lender product sync scheduler
initializeScheduler();

// Verify staff database integration
runStartupVerification().catch(error => {
  console.error('[STARTUP] Verification failed:', error);
});

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}
