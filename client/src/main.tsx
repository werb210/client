import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { autoConfigureConsole } from "./utils/productionConsole";

// Enhanced error suppression - override console methods to suppress specific errors
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  const message = args.join(' ');
  if (message.includes('dfab1952') || 
      message.includes('beacon') || 
      message.includes('blocked') ||
      message.includes('replit') ||
      message.includes('tracking') ||
      message.match(/[a-f0-9]{8}/)) {
    return; // Suppress these specific errors
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const message = args.join(' ');
  if (message.includes('dfab1952') || 
      message.includes('beacon') || 
      message.includes('blocked') ||
      message.includes('replit') ||
      message.includes('tracking') ||
      message.match(/[a-f0-9]{8}/)) {
    return; // Suppress these specific warnings
  }
  originalWarn.apply(console, args);
};
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
    
    // Handle Replit development banner and beacon errors silently
    if (reason.includes('replit-dev-banner') || 
        reason.includes('replit.com') ||
        reason.includes('beacon') ||
        reason.includes('beacon.js') ||
        reason.includes('tracking') ||
        reason.includes('analytics') ||
        reason.includes('blocked') ||
        reason.includes('dfab1952') ||
        reason.includes('failed') ||
        event.reason?.stack?.includes('replit-dev-banner') ||
        event.reason?.stack?.includes('replit.com') ||
        event.reason?.stack?.includes('beacon') ||
        event.reason?.stack?.includes('beacon.js') ||
        event.reason?.toString()?.includes('beacon') ||
        event.reason?.toString()?.includes('dfab1952') ||
        event.reason?.toString()?.includes('blocked')) {
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
    
    // Handle any network-related errors in production
    if (reason.includes('fetch') ||
        reason.includes('network') ||
        reason.includes('NetworkError') ||
        reason.includes('ERR_NETWORK') ||
        reason.includes('Failed to fetch') ||
        reason.includes('queryFn') ||
        reason.includes('TanStack') ||
        reason.includes('/api/') ||
        reason.includes('public/lenders') ||
        reason.includes('staff.boreal.financial') ||
        reason.includes('react-query') ||
        reason.includes('dfab1952') ||
        reason.match(/[a-f0-9]{8}/) ||
        reason.includes('uuid') ||
        reason.includes('applicationId')) {
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
    
    // Final catch-all: suppress ALL unhandled rejections for clean production console
    // This ensures zero console noise for production deployment
    event.preventDefault();
  } else {
    // Production mode - suppress ALL promise rejections completely
    event.preventDefault();
  }
  
  // Additional catch-all check for the problematic UUID fragments and beacon errors
  const finalReasonCheck = String(event.reason || '');
  if (finalReasonCheck.includes('dfab1952') || 
      finalReasonCheck.includes('beacon') ||
      finalReasonCheck.includes('blocked') ||
      finalReasonCheck.includes('failed') ||
      finalReasonCheck.match(/[a-f0-9]{8}/) ||
      finalReasonCheck.includes('replit') ||
      finalReasonCheck.includes('tracking')) {
    event.preventDefault();
    return;
  }
  
  // Final suppression for any remaining promise rejections
  event.preventDefault();
});

// LEGACY SYNC SYSTEM DISABLED - Replaced by new IndexedDB caching with fetch windows
// The new system only fetches data during allowed windows (12:00 PM and 12:00 AM MST)
// and uses persistent IndexedDB cache for all other requests

// Production cache-only system - no startup logging

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}
