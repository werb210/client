import './serviceWorker';
import { getProducts } from "./api/products";
import './lib/console-guard';
import "./styles/hotfix.css";
import "./styles/step2.css";
// MUST be first so Tailwind base resets apply
import "./index.css";
import "./lib/production-console";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { installAuditHook } from "./auditHook";
import { enableProgressiveEnhancement } from './utils/loadingStates';
import { addSkipLink } from './utils/accessibility';
import { PWAInstallManager } from './utils/pwaTestSuite';

// Bootstrap canonical data store
import { useCanon } from "@/canonical/store";
import { ALIASES } from "@/canonical/aliases";
import { deepGet, present } from "@/canonical/utils";

// IMPORTANT: no top-level await; load guard as a side-effect and ignore failures
import("./lib/fetch-guard").catch(() => {});

// Install audit hook for lender products validation
installAuditHook();

// Bootstrap canonical data store - simplified for debugging
console.log('🔧 [MAIN] Starting canonical store bootstrap...');

try {
  console.log('🔧 [MAIN] Importing canonical store...');
  
  // Test the import first
  console.log('🔧 [MAIN] useCanon imported:', typeof useCanon);
  console.log('🔧 [MAIN] ALIASES imported:', typeof ALIASES);
  
  // Simple test - just try to use the store
  const testStore = useCanon.getState();
  console.log('🔧 [MAIN] Store accessed successfully:', testStore);
  
  // Try a simple set/get
  useCanon.getState().set('country', 'test');
  console.log('🔧 [MAIN] Test set successful');
  
  console.log('📦 Canonical store basic functionality working!');
  
} catch (e) {
  console.error('❌ [MAIN] Canonical store bootstrap failed:', e);
  console.error('❌ [MAIN] Error details:', e instanceof Error ? e.message : String(e));
  console.error('❌ [MAIN] Stack trace:', e instanceof Error ? e.stack : 'No stack trace');
}

// SW disabled automatically via import

// Initialize PWA and accessibility features
document.addEventListener('DOMContentLoaded', () => {
  addSkipLink();
  enableProgressiveEnhancement();
  
  if ('serviceWorker' in navigator) {
    new PWAInstallManager();
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

try {
  if (localStorage.getItem("CATALOG_DIAG") === "1") {
    // Products diagnostic removed
  }
} catch {}

// Expose minimal form state if available (dev-safe)
try{ (window as any).__APP_STATE__ = (window as any).__APP_STATE__ || (window as any).__FORM_STATE__ || (window as any).__store || {}; }catch{ }