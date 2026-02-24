import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";
import "./styles/pwa.css";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { validateEnv } from "./config/env";
import { clearClientStorage } from "./auth/logout";
import { fetchApplicationContinuation } from "./api/applicationProgress";
import { registerSW } from "virtual:pwa-register";

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error("Missing VITE_API_BASE_URL");
}

if (import.meta.env.PROD) {
  validateEnv();
}

async function bootstrapContinuation() {
  try {
    const continuation = await fetchApplicationContinuation();

    if (!continuation?.exists) {
      if (window.location.pathname === "/") {
        window.location.replace("/apply");
      }
      return;
    }

    const step = Math.max(1, Math.min(6, Number(continuation.step) || 1));
    const applicationId = continuation.applicationId || "";
    if (!applicationId) return;

    window.__APP_CONTINUATION__ = {
      applicationId,
      step,
      data: continuation.data || {},
    };

    const targetPath = `/application/step-${step}`;
    if (window.location.pathname !== targetPath) {
      window.location.replace(targetPath);
      return;
    }
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) {
      clearClientStorage();
      window.location.replace("/apply");
      return;
    }
    if (status >= 500) {
      window.__APP_CONTINUATION_ERROR__ =
        "We couldn't resume your application right now. You can still start a new one.";
    }
  }
}

void bootstrapContinuation().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </React.StrictMode>
  );

});

registerSW({
  immediate: true
});
