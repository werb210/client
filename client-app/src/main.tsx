import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";
import "./styles/pwa.css";
import { loadRuntimeConfig } from "./config/runtimeConfig";

async function bootstrap() {
  await loadRuntimeConfig();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

void bootstrap();
