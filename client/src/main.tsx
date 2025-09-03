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

// Test canonical imports separately to avoid breaking main.tsx

// IMPORTANT: no top-level await; load guard as a side-effect and ignore failures
import("./lib/fetch-guard").catch(() => {});

// Install audit hook for lender products validation
installAuditHook();

// Test basic main.tsx execution first
console.log('🔧 [MAIN] main.tsx is executing!');

// Test canonical imports dynamically to avoid breaking main.tsx
console.log('🔧 [MAIN] Testing canonical store imports...');

async function testCanonicalImports() {
  try {
    console.log('🔧 [MAIN] Attempting dynamic import of canonical store...');
    const { useCanon } = await import("@/canonical/store");
    console.log('🔧 [MAIN] useCanon imported successfully:', typeof useCanon);
    
    const { ALIASES } = await import("@/canonical/aliases");
    console.log('🔧 [MAIN] ALIASES imported successfully:', typeof ALIASES);
    
    const { deepGet, present } = await import("@/canonical/utils");
    console.log('🔧 [MAIN] Utils imported successfully:', typeof deepGet, typeof present);
    
    // Test store functionality
    const testStore = useCanon.getState();
    console.log('🔧 [MAIN] Store accessed successfully:', testStore);
    
    useCanon.getState().set('country', 'test');
    console.log('🔧 [MAIN] Test set successful');
    
    console.log('📦 Canonical store system is fully working!');
    
    return true;
  } catch (e) {
    console.error('❌ [MAIN] Canonical store import failed:', e);
    console.error('❌ [MAIN] Error details:', e instanceof Error ? e.message : String(e));
    console.error('❌ [MAIN] Stack trace:', e instanceof Error ? e.stack : 'No stack trace');
    return false;
  }
}

// Run the test
testCanonicalImports();

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