import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { scheduledSyncService } from "./lib/scheduledSync";
import { clearLegacyCache, shouldClearCache } from "./startup/clearLegacyCache";
import { runStartupVerification } from "./test/staffDatabaseVerification";
// Initialize finalized production sync system
import { syncLenderProducts } from "./lib/finalizedLenderSync";

// Defer sync and verification to avoid blocking app startup with CORS issues
setTimeout(() => {
  // Trigger initial sync after app loads
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
}, 2000); // Wait 2 seconds for app to fully load

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}
