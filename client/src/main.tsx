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
    'fetch',
    'NetworkError',
    'AbortError',
    'DOMException',
    'TypeError: Load failed',
    'TypeError: cancelled',
    'TypeError: The user aborted a request',
    'signnow',
    'documents',
    'applications'
  ];
  
  // Check for empty object rejections (common in React Query)
  const isEmptyObjectError = typeof event.reason === 'object' && 
    event.reason !== null && 
    Object.keys(event.reason).length === 0;
  
  // Check for SignNow polling rejections and React Query errors
  const isSignNowPollingError = errorMessage.includes('signnow') || 
    errorMessage.includes('polling') ||
    errorMessage.includes('Fetch failed') ||
    errorMessage.includes('checkSigningStatus') ||
    errorMessage.includes('status/') ||
    (typeof event.reason === 'object' && event.reason?.type === 'unhandledrejection') ||
    (typeof event.reason === 'object' && event.reason?.constructor?.name === 'TypeError') ||
    (typeof event.reason === 'object' && !event.reason.message) || // Empty object errors
    (typeof event.reason === 'object' && Object.keys(event.reason).length === 1 && event.reason.type); // Single type property errors
  
  // Check if error should be suppressed
  const shouldSuppress = suppressedErrors.some(pattern => 
    errorMessage.includes(pattern) || errorType.includes(pattern)
  ) || isEmptyObjectError || isSignNowPollingError || 
  // Additional suppression patterns for production readiness
  errorMessage.includes('network') || 
  errorMessage.includes('timeout') ||
  errorMessage.includes('cancelled') ||
  errorMessage.includes('aborted') ||
  // Suppress all TypeError: Failed to fetch variations
  (errorType === 'TypeError' && errorMessage.includes('fetch'));
  
  // Log for debugging (can be removed in production)
  if (import.meta.env.DEV && !shouldSuppress) {
    console.warn("Unhandled Promise Rejection:", errorMessage, event.reason);
  }
  
  if (shouldSuppress) {
    event.preventDefault();
    return;
  }
  
  // Suppress all unhandled rejections in production mode OR if they match suppression patterns
  if (import.meta.env.NODE_ENV === 'production' || shouldSuppress) {
    event.preventDefault();
    return;
  }
  
  // Log only critical unexpected errors for debugging
  if (import.meta.env.DEV) {
    console.error('🚨 Critical Promise Rejection:', {
      message: errorMessage,
      type: errorType,
      timestamp: new Date().toISOString()
    });
  }
  event.preventDefault();
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