// @ts-nocheck
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";
import "./styles/pwa.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { validateEnv } from "./config/env";
import { clearClientStorage } from "./auth/logout";
import { bootstrapContinuation } from "./api/applicationProgress";
import { getAccessToken } from "./services/token";
import { processQueue } from "./lib/uploadQueue";

validateEnv();

window.addEventListener("online", () => {
  void processQueue();
});

async function hydrateContinuation() {
  try {
    const continuation = await bootstrapContinuation();

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
  } catch (error: unknown) {
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

const accessToken = getAccessToken();
const bootstrapPromise = accessToken ? hydrateContinuation() : Promise.resolve();

void bootstrapPromise.finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
});


if (!import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker?.register("/sw.js");
  });
}
