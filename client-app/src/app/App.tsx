import { useEffect, useState } from "react";
import AppRouter from "../router/AppRouter";
import { Header } from "../components/Header";
import { OfflineBanner } from "../components/OfflineBanner";
import { InstallPromptBanner } from "../components/InstallPromptBanner";
import { UpdateAvailableBanner } from "../components/UpdateAvailableBanner";
import { SessionRefreshOverlay } from "../components/SessionRefreshOverlay";
import CapitalReadinessPopup from "../components/CapitalReadinessPopup";
import CapitalScorePreview from "../components/CapitalScorePreview";
import ProductComparisonPopup from "../components/ProductComparisonPopup";
import QuickContact from "../components/QuickContact";
import { useSessionRefreshing } from "../hooks/useSessionRefreshing";
import { useServiceWorkerUpdate } from "../hooks/useServiceWorkerUpdate";
import { applyServiceWorkerUpdate } from "../pwa/serviceWorker";
import { hydratePortalSessionsFromIndexedDb } from "../state/portalSessions";
import { useExitIntent } from "../hooks/useExitIntent";
import { trackEvent } from "../utils/analytics";
import { FloatingChatButton } from "../modules/chat/components/FloatingChatButton";
import { ChatDrawer } from "../modules/chat/components/ChatDrawer";

export default function App() {
  const refreshing = useSessionRefreshing();
  const [chatOpen, setChatOpen] = useState(false);
  const updateAvailable = useServiceWorkerUpdate();
  useExitIntent(() => {
    trackEvent("client_exit_intent_detected");
  });

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
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: window.location.pathname,
    });
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
      <footer className="border-t py-4">
        <div className="flex gap-4 justify-center">
          <CapitalReadinessPopup />
          <ProductComparisonPopup />
          <CapitalScorePreview />
        </div>
      </footer>
      <QuickContact />
      <FloatingChatButton onClick={() => setChatOpen(true)} />
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
