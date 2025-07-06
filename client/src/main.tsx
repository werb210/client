import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Temporarily disable all sync imports to resolve startup blocking
// import { scheduledSyncService } from "./lib/scheduledSync";
// import { clearLegacyCache, shouldClearCache } from "./startup/clearLegacyCache";
// import { runStartupVerification } from "./test/staffDatabaseVerification";
// import { syncLenderProducts } from "./lib/finalizedLenderSync";

// Completely disable sync and verification to resolve startup blocking
console.log('[STARTUP] Sync system disabled to prevent HMR connectivity issues');

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}
