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

// Bootstrap canonical data store from existing localStorage
(() => {
  try {
    const ls = (k: string) => {
      try {
        return JSON.parse(localStorage.getItem(k) || "{}");
      } catch {
        return {};
      }
    };
    const sources = [
      ls("bf:intake"), 
      ls("bf:step1-autosave"),
      ls("bf:step2"), 
      ls("bf:step3"), 
      ls("bf:step4"), 
      ls("bf:docs"), 
      (window as any).__APP_STATE__ || {}
    ];
    const setMany = useCanon.getState().setMany;
    const seed: any = {};
    
    (Object.keys(ALIASES) as (keyof typeof ALIASES)[]).forEach((canon) => {
      for (const p of ALIASES[canon]) {
        const val = sources.map(s => deepGet(s, p)).find(present);
        if (present(val)) { 
          seed[canon] = val; 
          break; 
        }
      }
    });
    
    if (Object.keys(seed).length > 0) {
      setMany(seed);
      console.log('📦 Canonical store bootstrapped with', Object.keys(seed).length, 'fields:', seed);
    }
  } catch (e) {
    console.warn('⚠️ Failed to bootstrap canonical store:', e);
  }
})();

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