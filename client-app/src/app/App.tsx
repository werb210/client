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
import ChatSupportWidget from "@/components/ChatSupportWidget";
import { useApplicationStore } from "../state/useApplicationStore";

export default function App() {
  const { loadFromServer, update } = useApplicationStore();
  const refreshing = useSessionRefreshing();
  const updateAvailable = useServiceWorkerUpdate();
  const [continuationError, setContinuationError] = useState<string | null>(null);
  useExitIntent(() => {
    trackEvent("client_exit_intent_detected");
  });

  const debugUpdateAvailable =
    typeof window !== "undefined" &&
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has("debugUpdateBanner");

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

  useEffect(() => {
    const continuation = window.__APP_CONTINUATION__;
    if (!continuation?.applicationId) return;

    loadFromServer({
      applicationId: continuation.applicationId,
      applicationToken: continuation.applicationId,
      currentStep: continuation.step,
      ...(continuation.data || {}),
    });
    update({
      applicationId: continuation.applicationId,
      applicationToken: continuation.applicationId,
      currentStep: continuation.step,
    });
  }, [loadFromServer, update]);

  useEffect(() => {
    if (window.__APP_CONTINUATION_ERROR__) {
      setContinuationError(window.__APP_CONTINUATION_ERROR__);
    }
  }, []);

  if (refreshing) {
    return <SessionRefreshOverlay />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfflineBanner />
      {continuationError && (
        <div className="mx-auto mt-4 w-full max-w-[var(--portal-max-width)] rounded border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {continuationError}
        </div>
      )}
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
      <ChatSupportWidget />
    </div>
  );
}
