import { qaProvenance } from "./lib/products";
import './lib/console-guard';
import "./styles/hotfix.css";
// MUST be first so Tailwind base resets apply
import "./index.css";
import "./lib/production-console";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// IMPORTANT: no top-level await; load guard as a side-effect and ignore failures
import("./lib/fetch-guard").catch(console.warn);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

try {
  if (localStorage.getItem("CATALOG_DIAG") === "1") {
    qaProvenance();
  }
} catch {}