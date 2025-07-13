import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// DIAGNOSTIC MODE: Track all promise rejections during form testing
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = String(event.reason || '');
  const errorType = event.reason?.constructor?.name || '';
  const timestamp = new Date().toISOString();
  
  // Log all errors with timing for debugging
  console.log(`🔍 [${timestamp}] Promise Rejection:`, {
    message: errorMessage,
    type: errorType,
    stack: event.reason?.stack?.split('\n')[0] || 'No stack trace'
  });
  
  // Prevent browser default handling but keep logging for now
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