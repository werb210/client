import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// LEGACY SYNC IMPORT DISABLED - Using new IndexedDB caching system
// import { scheduledSyncService } from "./lib/scheduledSync";
import { clearLegacyCache, shouldClearCache } from "./startup/clearLegacyCache";
import { runStartupVerification } from "./test/staffDatabaseVerification";
// LEGACY SYNC SYSTEM DISABLED - NOW USING NEW INDEXEDDB CACHING SYSTEM
// import { syncLenderProducts } from "./lib/finalizedLenderSync";

// Enhanced global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Silently handle common development errors
  if (import.meta.env.DEV) {
    const reason = event.reason?.message || event.reason?.toString() || '';
    
    // Handle Vite WebSocket errors silently
    if (event.reason?.stack?.includes('@vite/client') || 
        reason.includes('WebSocket') || 
        reason.includes('hmr') ||
        reason.includes('vite')) {
      event.preventDefault();
      return;
    }
    
    // Handle fetch errors from disabled legacy sync systems
    if (reason.includes('syncManager') || 
        reason.includes('getSyncStatus') || 
        reason.includes('getProducts') ||
        reason.includes('scheduledSyncService')) {
      event.preventDefault();
      return;
    }
  }
  
  // Only log genuine application errors
  console.error('🚨 Unhandled Promise Rejection:', event.reason?.message || event.reason);
  event.preventDefault();
});

// LEGACY SYNC SYSTEM DISABLED - Replaced by new IndexedDB caching with fetch windows
// The new system only fetches data during allowed windows (12:00 PM and 12:00 AM MST)
// and uses persistent IndexedDB cache for all other requests

// NO STARTUP SYNC - New system handles this automatically when needed
console.log('[STARTUP] 🚀 Using new IndexedDB caching system with scheduled fetch windows');

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
