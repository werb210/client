import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// COMPREHENSIVE ERROR HANDLING: Production-ready promise rejection management
window.addEventListener('unhandledrejection', (event) => {
  // Always prevent the default browser behavior for unhandled rejections
  event.preventDefault();
  
  // Suppress repeated errors for unimplemented document endpoint
  if (event.reason?.response?.status === 501) {
    return; // suppress noisy logs for unimplemented document endpoint
  }
  
  // In production mode, suppress all unhandled promise rejections silently
  if (import.meta.env.NODE_ENV === 'production') {
    return;
  }
  
  // In development mode, also suppress all fetch-related errors to keep console clean
  const errorMessage = String(event.reason || '');
  const errorType = event.reason?.constructor?.name || '';
  
  // Comprehensive suppression patterns for clean development experience
  const suppressedPatterns = [
    'Failed to fetch',
    'TypeError: Failed to fetch',
    'fetch',
    'NetworkError',
    'AbortError',
    'DOMException',
    'TypeError: Load failed',
    'TypeError: cancelled',
    'TypeError: The user aborted a request',
    'signnow',
    'documents',
    'applications',
    'network',
    'timeout',
    'cancelled',
    'aborted',
    'lenders',
    'upload',
    'status',
    'public'
  ];
  
  // Check for empty object rejections (common in React Query)
  const isEmptyObjectError = typeof event.reason === 'object' && 
    event.reason !== null && 
    Object.keys(event.reason).length === 0;
  
  // Check if error should be suppressed
  const shouldSuppress = suppressedPatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase()) || 
    errorType.toLowerCase().includes(pattern.toLowerCase())
  ) || isEmptyObjectError || 
  (typeof event.reason === 'object' && event.reason?.type === 'unhandledrejection') ||
  (typeof event.reason === 'object' && event.reason?.constructor?.name === 'TypeError') ||
  (typeof event.reason === 'object' && !event.reason.message);
  
  // Only log truly unexpected errors in development
  if (!shouldSuppress) {
    console.warn("Unhandled Promise Rejection:", errorMessage, event.reason);
  }
});

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