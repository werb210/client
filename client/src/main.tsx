import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { scheduledSyncService } from "./lib/scheduledSync";
import { clearLegacyCache, shouldClearCache } from "./startup/clearLegacyCache";
import { runStartupVerification } from "./test/staffDatabaseVerification";
// Initialize finalized production sync system
import { syncLenderProducts } from "./lib/finalizedLenderSync";

// Trigger initial sync on application startup
syncLenderProducts().then(result => {
  if (result.success) {
    console.log(`[STARTUP] ✅ Synced ${result.productCount} products from ${result.source}`);
  } else {
    console.warn(`[STARTUP] ⚠️ Sync failed:`, result.errors);
  }
});

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
