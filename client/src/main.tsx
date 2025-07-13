import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// SIMPLE & FOCUSED: Only suppress the specific Replit dev environment errors
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = String(event.reason || '');
  console.log('🚨 Unhandled Promise Rejection:', errorMessage);
  
  // Suppress "Failed to fetch" errors for automatic retries
  if (errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('janeway.replit.dev') || 
      errorMessage.includes('ERR_CONNECTION_TIMED_OUT') ||
      errorMessage.includes('dfab1952-ea3f-4ab8-a1f0-afc6b34a3c32')) {
    // Only suppress specific Replit dev environment errors and network failures
    event.preventDefault();
    return;
  }
  // Allow all other promise rejections to be reported normally
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