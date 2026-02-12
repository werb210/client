import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";
import "./styles/pwa.css";
import { registerServiceWorker } from "./pwa/serviceWorker";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { validateEnv } from "./config/env";

if (import.meta.env.PROD) {
  validateEnv();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

if (typeof window !== "undefined") {
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      void registerServiceWorker();
    }, 0);
  });
}
