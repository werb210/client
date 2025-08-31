import { getProducts } from "./api/products";
import './lib/console-guard';
import "./styles/hotfix.css";
// MUST be first so Tailwind base resets apply
import "./index.css";
import "./lib/production-console";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { installAuditHook } from "./auditHook";

// IMPORTANT: no top-level await; load guard as a side-effect and ignore failures
import("./lib/fetch-guard").catch(console.warn);

// Install audit hook for lender products validation
installAuditHook();

// Disable service worker in dev to prevent state nuking
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

try {
  if (localStorage.getItem("CATALOG_DIAG") === "1") {
    console.log("Products available via getProducts()");
  }
} catch {}