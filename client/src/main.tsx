import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializePWA } from "./lib/pwa";

// Enhanced error handling to prevent app crashes and identify sources
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  
  // In development, log the actual error for debugging
  if (import.meta.env.DEV) {
    console.warn('[App] Unhandled promise rejection prevented:', event.reason || {});
    
    // Additional debugging for promise rejection sources
    if (event.reason && event.reason.stack) {
      console.warn('[App] Rejection stack:', event.reason.stack);
    }
  }
  
  // Suppress all unhandled rejections for clean production console
});

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