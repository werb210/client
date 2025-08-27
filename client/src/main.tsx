import './lib/console-guard';
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