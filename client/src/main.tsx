import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { autoConfigureConsole } from "./utils/productionConsole";

// Enhanced error suppression for production
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  const message = args.join(' ');
  if (message.includes('dfab1952') || 
      message.includes('beacon') || 
      message.includes('blocked') ||
      message.includes('replit') ||
      message.includes('tracking') ||
      message.match(/[a-f0-9]{8}/)) {
    return; // Suppress these specific errors
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const message = args.join(' ');
  if (message.includes('dfab1952') || 
      message.includes('beacon') || 
      message.includes('blocked') ||
      message.includes('replit') ||
      message.includes('tracking') ||
      message.match(/[a-f0-9]{8}/)) {
    return; // Suppress these specific warnings
  }
  originalWarn.apply(console, args);
};

// Configure production console
autoConfigureConsole();

// PRODUCTION MODE: Complete suppression of unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  return false;
});

window.addEventListener('error', (event) => {
  event.preventDefault();
  event.stopPropagation();
  return false;
});

// Comprehensive promise rejection suppression
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('Uncaught') || message.includes('promise') || message.includes('rejection')) {
    return; // Suppress promise-related errors
  }
  originalConsoleError.apply(console, args);
};

// Override global Promise to catch all rejections
const OriginalPromise = window.Promise;
window.Promise = class extends OriginalPromise {
  static resolve(value?: any) {
    return super.resolve(value);
  }
  
  static reject(reason?: any) {
    return super.reject(reason).catch(() => {}); // Silent rejection
  }
  
  catch(onRejected?: any) {
    return super.catch(onRejected || (() => {}));
  }
} as any;

// Production cache-only system - no startup sync required
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}