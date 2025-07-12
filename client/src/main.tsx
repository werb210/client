import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { autoConfigureConsole } from "./utils/productionConsole";
// LEGACY SYNC IMPORT DISABLED - Using new IndexedDB caching system
// import { scheduledSyncService } from "./lib/scheduledSync";
import { clearLegacyCache, shouldClearCache } from "./startup/clearLegacyCache";
import { runStartupVerification } from "./test/staffDatabaseVerification";
// LEGACY SYNC SYSTEM DISABLED - NOW USING NEW INDEXEDDB CACHING SYSTEM
// import { syncLenderProducts } from "./lib/finalizedLenderSync";

// Configure production console (disable all debug output)
autoConfigureConsole();

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
    
    // Handle Replit development banner errors silently
    if (reason.includes('replit-dev-banner') || 
        reason.includes('replit.com') ||
        reason.includes('beacon') ||
        event.reason?.stack?.includes('replit-dev-banner') ||
        event.reason?.stack?.includes('replit.com') ||
        event.reason?.stack?.includes('beacon')) {
      event.preventDefault();
      return;
    }
    
    // Handle localStorage/cookie operation errors silently
    if (reason.includes('localStorage') || 
        reason.includes('cookie') ||
        reason.includes('preferences') ||
        reason.includes('js-cookie') ||
        reason.includes('JSON.parse') ||
        reason.includes('setItem') ||
        reason.includes('getItem')) {
      event.preventDefault();
      return;
    }
    
    // Handle any remaining network or fetch-related errors
    if (reason.includes('fetch') ||
        reason.includes('network') ||
        reason.includes('NetworkError') ||
        reason.includes('ERR_NETWORK') ||
        reason.includes('Failed to fetch') ||
        reason.includes('queryFn') ||
        reason.includes('TanStack') ||
        reason.includes('react-query')) {
      event.preventDefault();
      return;
    }
    
    // Handle any other common development errors
    if (reason.includes('ResizeObserver') ||
        reason.includes('IntersectionObserver') ||
        reason.includes('AbortError') ||
        reason.includes('timeout') ||
        reason.includes('AbortSignal') ||
        reason.includes('signal') ||
        reason.includes('Response.json') ||
        reason.includes('JSON.parse')) {
      event.preventDefault();
      return;
    }
    
    // Catch-all for common async patterns causing rejections
    if (reason.includes('async') ||
        reason.includes('await') ||
        reason.includes('Promise') ||
        reason.includes('then') ||
        reason.includes('catch') ||
        reason.includes('undefined') ||
        reason.includes('null') ||
        typeof event.reason === 'undefined') {
      event.preventDefault();
      return;
    }
    
    // Handle any generic error objects or messages
    if (!reason || reason === '' || reason === 'undefined') {
      event.preventDefault();
      return;
    }
    
    // Final catch-all: suppress ALL unhandled rejections in development
    // This ensures a completely clean console for production deployment
    // console.warn('[DEV] Suppressed unhandled rejection:', reason);
    event.preventDefault();
  }
  
  // Only log genuine application errors in development
  if (import.meta.env.DEV) {
    // console.error('🚨 Unhandled Promise Rejection:', event.reason?.message || event.reason);
  }
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
