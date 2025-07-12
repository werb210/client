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
});

window.addEventListener('error', (event) => {
  event.preventDefault();
});

// Production cache-only system - no startup sync required
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}