import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";
import "./styles/pwa.css";
import { registerServiceWorker } from "./pwa/serviceWorker";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (typeof window !== "undefined") {
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      void registerServiceWorker();
    }, 0);
  });
}
