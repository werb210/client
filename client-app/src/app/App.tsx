import { Suspense, lazy, useEffect } from "react";
import AppRouter from "../router/AppRouter";
import { Header } from "../components/Header";
import { OfflineBanner } from "../components/OfflineBanner";
import { InstallPromptBanner } from "../components/InstallPromptBanner";
import { UpdateAvailableBanner } from "../components/UpdateAvailableBanner";
import { SessionRefreshOverlay } from "../components/SessionRefreshOverlay";
import { useSessionRefreshing } from "../hooks/useSessionRefreshing";
import { useServiceWorkerUpdate } from "../hooks/useServiceWorkerUpdate";
import { applyServiceWorkerUpdate } from "../pwa/serviceWorker";
import { hydratePortalSessionsFromIndexedDb } from "../state/portalSessions";

const ChatBot = lazy(() => import("../components/ChatBot"));

export default function App() {
  const refreshing = useSessionRefreshing();
  const updateAvailable = useServiceWorkerUpdate();
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
        <AppRouter />
      </main>
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  );
}
