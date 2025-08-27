import "./lib/console-guard"; // keep as first import
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// IMPORTANT: no top-level await; load guard as a side-effect and ignore failures
import("./lib/fetch-guard").catch(console.warn);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);