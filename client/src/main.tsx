import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { scheduledSyncService } from "./lib/scheduledSync";
import { clearLegacyCache, shouldClearCache } from "./startup/clearLegacyCache";
import { runStartupVerification } from "./test/staffDatabaseVerification";
// Initialize finalized production sync system
import { syncLenderProducts } from "./lib/finalizedLenderSync";

// Add global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[GLOBAL] Unhandled promise rejection:', event.reason?.message || event.reason);
  event.preventDefault(); // Prevent default behavior
});

// Trigger initial sync on application startup with comprehensive error handling
(async () => {
  try {
    const result = await syncLenderProducts();
    if (result.success) {
      console.log(`[STARTUP] ✅ Synced ${result.productCount} products from ${result.source}`);
    } else {
      console.warn(`[STARTUP] ⚠️ Sync failed:`, result.errors);
    }
  } catch (error) {
    console.warn('[STARTUP] Sync failed:', error?.message || error);
  }
})();

// Verify staff database integration with comprehensive error handling
(async () => {
  try {
    await runStartupVerification();
    console.log('[STARTUP] ✅ Staff database verification completed');
  } catch (error) {
    console.warn('[STARTUP] ❌ Staff database unreachable:', error?.message || error);
  }
})();

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}
