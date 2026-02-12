import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";
import "./styles/pwa.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { checkEnv } from "./lib/envCheck";
import { registerServiceWorker } from "./pwa/serviceWorker";

checkEnv();

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
