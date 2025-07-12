import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { scheduledSyncService } from "./lib/scheduledSync";
import { clearLegacyCache, shouldClearCache } from "./startup/clearLegacyCache";
import { runStartupVerification } from "./test/staffDatabaseVerification";
// LEGACY SYNC SYSTEM DISABLED - NOW USING NEW INDEXEDDB CACHING SYSTEM
// import { syncLenderProducts } from "./lib/finalizedLenderSync";

// Enhanced global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Only log Vite-related WebSocket errors in development without cluttering console
  if (import.meta.env.DEV && event.reason?.stack?.includes('@vite/client')) {
    // Silently handle Vite WebSocket reconnection errors - these are normal in development
    event.preventDefault();
    return;
  }
  
  console.error('🚨 Unhandled Promise Rejection:', event.reason?.message || event.reason);
  
  // In development, provide detailed debugging information for non-Vite errors
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
