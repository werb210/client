import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// CLEAN CONSOLE: Suppress network errors, log only unexpected issues
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = String(event.reason || '');
  const errorType = event.reason?.constructor?.name || '';
  
  // Suppress common development/network errors
  if (errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('TypeError') ||
      errorType === 'TypeError') {
    event.preventDefault();
    return;
  }
  
  // Log only unexpected errors
  console.log('🚨 Unexpected Promise Rejection:', errorMessage);
  event.preventDefault();
});

// Production cache-only system - no startup sync required
const root = document.getElementById("root");
if (root) {
  try {
    createRoot(root).render(<App />);
    console.log("✅ Application started successfully");
  } catch (error) {
    console.error("Failed to start application:", error);
  }
} else {
  console.error("Root element not found");
}