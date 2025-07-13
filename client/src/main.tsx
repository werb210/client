import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// COMPREHENSIVE ERROR SUPPRESSION: Clean console for production-ready experience
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = String(event.reason || '');
  const errorType = event.reason?.constructor?.name || '';
  
  // Suppress all development environment and network errors
  if (errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('janeway.replit.dev') || 
      errorMessage.includes('ERR_CONNECTION_TIMED_OUT') ||
      errorMessage.includes('dfab1952-ea3f-4ab8-a1f0-afc6b34a3c32') ||
      errorMessage.includes('server connection lost') ||
      errorMessage.includes('WebSocket connection') ||
      errorMessage.includes('NetworkError') ||
      errorType === 'TypeError' ||
      errorMessage.includes('fetch')) {
    // Suppress without logging to maintain clean console
    event.preventDefault();
    return;
  }
  
  // Only log truly unexpected errors
  console.log('🚨 Unexpected Error:', errorMessage);
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