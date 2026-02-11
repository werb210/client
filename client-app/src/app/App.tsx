import { lazy, Suspense, useEffect, useState } from "react";
import AppRouter from "../router/AppRouter";
import { Header } from "../components/Header";
import { OfflineBanner } from "../components/OfflineBanner";
import { InstallPromptBanner } from "../components/InstallPromptBanner";
import { UpdateAvailableBanner } from "../components/UpdateAvailableBanner";
import { ErrorBoundary } from "../utils/errorBoundary";
import { SessionRefreshOverlay } from "../components/SessionRefreshOverlay";
import { useSessionRefreshing } from "../hooks/useSessionRefreshing";
import { useServiceWorkerUpdate } from "../hooks/useServiceWorkerUpdate";
import { applyServiceWorkerUpdate } from "../pwa/serviceWorker";
import { hydratePortalSessionsFromIndexedDb } from "../state/portalSessions";

const AiChatWidget = lazy(() =>
  import("../components/ai/AiChatWidget").then((module) => ({ default: module.AiChatWidget }))
);

export default function App() {
  const refreshing = useSessionRefreshing();
  const updateAvailable = useServiceWorkerUpdate();
  const [showChatWidget, setShowChatWidget] = useState(false);
  const debugUpdateAvailable =
    typeof window !== "undefined" &&
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has("debugUpdateBanner");

  useEffect(() => {
    if (updateAvailable) {
      console.info("A new version is available.");
    }
  }, [updateAvailable]);

  useEffect(() => {
    void hydratePortalSessionsFromIndexedDb();
  }, []);

  useEffect(() => {
    const schedule =
      window.requestIdleCallback ||
      ((callback: IdleRequestCallback) => window.setTimeout(() => callback({} as IdleDeadline), 200));

    const cancel =
      window.cancelIdleCallback ||
      ((id: number) => window.clearTimeout(id));

    const callbackId = schedule(() => setShowChatWidget(true));

    return () => cancel(callbackId);
  }, []);

  if (refreshing) {
    return <SessionRefreshOverlay />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfflineBanner />
      <InstallPromptBanner />
      <UpdateAvailableBanner
        updateAvailable={updateAvailable || debugUpdateAvailable}
        onApplyUpdate={() => void applyServiceWorkerUpdate()}
      />
      <main className="flex-1">
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </main>
      {showChatWidget ? (
        <Suspense fallback={null}>
          <AiChatWidget />
        </Suspense>
      ) : null}
    </div>
  );
}
