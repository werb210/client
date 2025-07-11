import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { scheduledSyncService } from "./lib/scheduledSync";
import { clearLegacyCache, shouldClearCache } from "./startup/clearLegacyCache";
import { runStartupVerification } from "./test/staffDatabaseVerification";
// Initialize finalized production sync system
import { syncLenderProducts } from "./lib/finalizedLenderSync";

// Enhanced global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason?.message || event.reason);
  
  // In development, provide detailed debugging information
  if (import.meta.env.DEV) {
    console.error('[DEV] Promise rejection details:', {
      reason: event.reason,
      stack: event.reason?.stack,
      promise: event.promise,
      timestamp: new Date().toISOString()
    });
    
    // Log specific error types for debugging
    if (event.reason?.message?.includes('Failed to fetch')) {
      console.error('[DEV] Network error detected - check API endpoints and connectivity');
      console.error('[DEV] Consider implementing retry logic or fallback mechanisms');
    }
  }
  
  event.preventDefault(); // Prevent default browser behavior
});

// TESTING MODE: Disable startup verification to test SignNow console output
console.log('🧪 TESTING MODE: Startup verification disabled for SignNow console testing');

// Trigger initial sync on application startup with comprehensive error handling
// (async () => {
//   try {
//     const result = await syncLenderProducts();
//     if (result.success) {
//       console.log(`[STARTUP] ✅ Synced ${result.productCount} products from ${result.source}`);
//     } else {
//       console.warn(`[STARTUP] ⚠️ Sync failed:`, result.errors);
//     }
//   } catch (error) {
//     console.warn('[STARTUP] Sync failed:', error?.message || error);
//   }
// })();

// Verify staff database integration with comprehensive error handling
// (async () => {
//   try {
//     await runStartupVerification();
//     console.log('[STARTUP] ✅ Staff database verification completed');
//   } catch (error) {
//     console.warn('[STARTUP] ❌ Staff database unreachable:', error?.message || error);
//   }
// })();

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}
