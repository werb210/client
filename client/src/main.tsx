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
import { installSubmitInterceptor } from "./dev/submitInterceptor";
import { enableProgressiveEnhancement } from './utils/loadingStates';
import { addSkipLink } from './utils/accessibility';
import { PWAInstallManager } from './utils/pwaTestSuite';

// Test canonical imports separately to avoid breaking main.tsx

// IMPORTANT: no top-level await; load guard as a side-effect and ignore failures
import("./lib/fetch-guard").catch(() => {});

// Install audit hook for lender products validation
installAuditHook();

// Install submit interceptor for development debugging
if (import.meta.env.DEV) {
  installSubmitInterceptor();
}

// Application loaded successfully
(window as any).BOREAL_DEBUG = { mainExecuted: true, timestamp: Date.now() };

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