import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// COMPREHENSIVE ERROR HANDLING: Production-ready promise rejection management
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = String(event.reason || '');
  const errorType = event.reason?.constructor?.name || '';
  
  // Development environment errors to suppress
  const suppressedErrors = [
    'Failed to fetch',
    'TypeError: Failed to fetch',
    'NetworkError',
    'AbortError',
    'DOMException',
    'TypeError: Load failed',
    'TypeError: cancelled',
    'TypeError: The user aborted a request'
  ];
  
  // Check if error should be suppressed
  const shouldSuppress = suppressedErrors.some(pattern => 
    errorMessage.includes(pattern) || errorType.includes(pattern)
  );
  
  if (shouldSuppress) {
    event.preventDefault();
    return;
  }
  
  // Log only critical unexpected errors for debugging
  console.error('🚨 Critical Promise Rejection:', {
    message: errorMessage,
    type: errorType,
    timestamp: new Date().toISOString()
  });
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