import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializePWA } from "./lib/pwa";

/** PROD log gate: silence console.log/debug in production */
if (import.meta?.env?.PROD) {
  console.log   = () => {};
  console.debug = () => {};
}

// Block external fetch calls in dev only - moved to avoid top-level await
if (import.meta.env.DEV) {
  import("./lib/fetch-guard").catch(console.warn);
}
import "./lib/quiet-console";

// Remove duplicate unhandled rejection handler - handled in App.tsx

// Initialize PWA features
initializePWA();

// Production cache-only system - no startup sync required
const root = document.getElementById("root");
if (root) {
  try {
    createRoot(root).render(<App />);
    if (import.meta.env.DEV) {
      // console.log("✅ Application started successfully");
    }
  } catch (error) {
    console.error("Failed to start application:", error);
  }
} else {
  console.error("Root element not found");
}