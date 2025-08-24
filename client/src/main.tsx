import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializePWA } from "./lib/pwa";

// Enhanced error handling to prevent app crashes and identify sources
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  
  // In development, log the actual error for debugging (but less verbose)
  if (import.meta.env.DEV) {
    // Only log significant errors, filter out common safe rejections
    const reason = event.reason;
    if (reason && !isKnownSafeRejection(reason)) {
      console.warn('[App] Unhandled promise rejection:', reason.message || reason);
    }
  }
});

// Helper to identify safe rejections that can be ignored
function isKnownSafeRejection(reason: any): boolean {
  const message = reason?.message || String(reason);
  const safeMessages = [
    'AbortError',
    'Load was cancelled',
    'Navigation cancelled',
    'The user aborted a request',
    'signal is aborted without reason'
  ];
  
  return safeMessages.some(safe => message.includes(safe));
}

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