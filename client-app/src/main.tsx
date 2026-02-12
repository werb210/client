import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";
import "./styles/pwa.css";
import { checkEnv } from "./lib/envCheck";
import { registerServiceWorker } from "./pwa/serviceWorker";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";

checkEnv();

if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);

if (typeof window !== "undefined") {
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      void registerServiceWorker();
    }, 0);
  });
}
