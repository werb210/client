import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Simplified error handling to prevent app crashes
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  // Suppress all unhandled rejections for clean console
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