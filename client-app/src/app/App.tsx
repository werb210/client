import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  classifyReadiness,
  estimateClientCommission,
  getSessionId,
  trackEvent,
} from "../utils/analytics";
import { persistAttributionFromUrl } from "../utils/attribution";
import ChatSupportWidget from "@/components/ChatSupportWidget";
import { useApplicationStore } from "../state/useApplicationStore";
import { useReadinessBridge } from "@/hooks/useReadinessBridge";
import { apiRequest } from "@/services/api";
import { endCall } from "@/services/voiceService";

export default function App() {
  const { app, loadFromServer, update } = useApplicationStore();
  const appRef = useRef(app);
  const refreshing = useSessionRefreshing();
  const updateAvailable = useServiceWorkerUpdate();
  const [continuationError, setContinuationError] = useState<string | null>(null);

  useEffect(() => {
    appRef.current = app;
  }, [app]);

  useExitIntent(() => {
    trackEvent("client_exit_intent_detected");
  });

  const setStep1Data = useCallback((step1Data: Record<string, unknown>) => {
    update({
      readinessSessionToken: localStorage.getItem("creditSessionToken") || appRef.current.readinessSessionToken,
      kyc: {
        ...appRef.current.kyc,
        ...step1Data,
      },
    });
  }, [update]);

  const setStep3Data = useCallback((step3Data: Record<string, unknown>) => {
    update({
      business: {
        ...appRef.current.business,
        ...step3Data,
      },
    });
  }, [update]);

  const setStep4Data = useCallback((step4Data: Record<string, unknown>) => {
    update({
      applicant: {
        ...appRef.current.applicant,
        ...step4Data,
      },
    });
  }, [update]);

  useReadinessBridge(setStep1Data, setStep3Data, setStep4Data);

  const debugUpdateAvailable =
    typeof window !== "undefined" &&
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has("debugUpdateBanner");

  useEffect(() => {
    void hydratePortalSessionsFromIndexedDb();
  }, []);

  useEffect(() => {
    persistAttributionFromUrl();
  }, []);

  useEffect(() => {
    const sessionId = getSessionId();

    trackEvent("client_session_started", {
      session_id: sessionId,
    });
  }, []);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: window.location.pathname,
    });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const estimatedValue = estimateClientCommission(
        Number(app.kyc?.fundingAmount || 0)
      );

      trackEvent("application_abandoned", {
        current_step: app.currentStep,
        estimated_commission_value: estimatedValue,
        underwriting_readiness: classifyReadiness(),
        risk_level:
          (app.currentStep || 0) <= 2
            ? "low_intent"
            : (app.currentStep || 0) <= 4
              ? "medium_intent"
              : "high_intent",
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [app.currentStep]);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session");

    if (!session) return;

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiBaseUrl) return;

    void apiRequest(`${apiBaseUrl}/api/credit-readiness/session/${session}`)
      .then((data) => {
        localStorage.setItem("creditPrefill", JSON.stringify(data));
      })
      .catch(() => {
        // ignore prefill fetch failures
      });
  }, []);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  if (refreshing) {
    return <SessionRefreshOverlay />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-white flex flex-col">
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
      <main className="max-w-7xl mx-auto px-6 py-14 md:py-20 w-full flex-1">
        <AppRouter />
      </main>
      <footer className="bg-brand-bgAlt border-t border-subtle py-8 text-center text-sm text-gray-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row gap-4 justify-center">
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
