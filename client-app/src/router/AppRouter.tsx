import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { StatusPage } from "../pages/StatusPage";
import { ApplicationPortalPage } from "../pages/ApplicationPortalPage";
import { ApplicationOffersPage } from "../pages/ApplicationOffersPage";
import { ResumePage } from "../pages/ResumePage";
import { OfflineFallback } from "../pages/OfflineFallback";
import { SessionExpiredPage } from "../pages/SessionExpiredPage";
import { SessionRevokedPage } from "../pages/SessionRevokedPage";
import SystemStatus from "../pages/SystemStatus";
import PublicApplyPage from "../pages/apply/PublicApplyPage";
import PublicApplySuccessPage from "../pages/apply/PublicApplySuccessPage";
import { ApplyPage } from "../pages/ApplyPage";
import { OfflineStore } from "../state/offline";
import { ClientProfileStore } from "../state/clientProfiles";
import { SessionGuard } from "../auth/sessionGuard";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useClientSession } from "../hooks/useClientSession";
import { useApplicationStore } from "../state/useApplicationStore";
import { clearReadiness, setReadiness } from "../state/readinessStore";
import { fetchReadinessContext, getLeadIdFromSearch } from "../services/readiness";
import {
  fetchContinuation,
  fetchReadinessSession,
  getContinuationSession,
  mapContinuationToReadinessContext,
} from "../api/continuation";
import {
  clearStoredReadinessSession,
  resolveReadinessSessionId,
} from "@/api/website";

const PortalEntry = lazy(() => import("../pages/PortalEntry").then((module) => ({ default: module.PortalEntry })));
const ContinueApplication = lazy(() => import("../pages/ContinueApplication"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Step1 = lazy(() => import("../wizard/Step1_KYC"));
const Step2 = lazy(() => import("../wizard/Step2_Product"));
const Step3 = lazy(() => import("../wizard/Step3_Business"));
const Step4 = lazy(() => import("../wizard/Step4_Applicant"));
const Step5 = lazy(() => import("../wizard/Step5_Documents"));
const Step6 = lazy(() => import("../wizard/Step6_Review"));

type GuardProps = {
  children: JSX.Element;
};

function RequireApplicationToken({ children }: GuardProps) {
  const { app } = useApplicationStore();
  const cached = OfflineStore.load();
  if (!app.applicationToken && !cached?.applicationToken) {
    return <Navigate to="/apply" replace />;
  }
  return children;
}

function RequirePortalSession({ children }: GuardProps) {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") || "";
  const { state } = useClientSession(token);

  if (!token || state === "missing") {
    return <Navigate to="/portal" replace />;
  }

  if (state === "expired") {
    return <Navigate to="/expired" replace />;
  }

  if (state === "revoked") {
    return <Navigate to="/revoked" replace />;
  }

  if (!ClientProfileStore.hasPortalSession(token)) {
    return <Navigate to="/portal" replace />;
  }

  return children;
}

function ReadinessLoader() {
  const location = useLocation();

  useEffect(() => {
    let active = true;

    const resolveLeadId = async () => {
      const searchLeadId = getLeadIdFromSearch(location.search);
      if (searchLeadId) {
        return searchLeadId;
      }

      const storedLeadId =
        typeof window !== "undefined"
          ? window.localStorage.getItem("leadId")
          : null;
      if (storedLeadId) {
        return storedLeadId;
      }

      try {
        const continuationSession = await getContinuationSession();
        const sessionLeadId =
          continuationSession?.leadId || continuationSession?.readinessLeadId;
        if (typeof sessionLeadId === "string" && sessionLeadId.trim()) {
          return sessionLeadId;
        }
      } catch {
        // no active continuation session
      }

      return null;
    };

    const loadReadiness = async () => {
      try {
        const readinessSessionId = resolveReadinessSessionId(location.search);
        if (readinessSessionId) {
          const sessionPayload = await fetchReadinessSession(readinessSessionId);
          if (!active) return;
          if (sessionPayload) {
            setReadiness(mapContinuationToReadinessContext(sessionPayload, readinessSessionId));
            return;
          }

          const continuation = await fetchContinuation(readinessSessionId);
          if (!active) return;
          if (continuation) {
            setReadiness(mapContinuationToReadinessContext(continuation, readinessSessionId));
            return;
          }

          clearStoredReadinessSession();
        }

        const leadId = await resolveLeadId();
        if (!active) return;
        if (!leadId) {
          clearReadiness();
          return;
        }

        const readiness = await fetchReadinessContext(leadId);
        if (!active) return;
        if (!readiness) {
          clearReadiness();
          return;
        }
        setReadiness(readiness);
      } catch {
        if (active) {
          clearReadiness();
        }
      }
    };

    void loadReadiness();
    return () => {
      active = false;
    };
  }, [location.search]);

  return null;
}

export default function AppRouter() {
  const { isOffline } = useNetworkStatus();

  if (isOffline) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<OfflineFallback />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <SessionGuard />
      <ReadinessLoader />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/apply" replace />} />
          <Route path="/portal" element={<PortalEntry />} />
          <Route path="/expired" element={<SessionExpiredPage />} />
          <Route path="/revoked" element={<SessionRevokedPage />} />
          <Route path="/system-status" element={<SystemStatus />} />
          <Route
            path="/status"
            element={
              <RequirePortalSession>
                <StatusPage />
              </RequirePortalSession>
            }
          />
          <Route path="/application/:id" element={<ApplicationPortalPage />} />
          <Route path="/application/:id/offers" element={<ApplicationOffersPage />} />
          <Route
            path="/application/:id/documents"
            element={<ApplicationPortalPage />}
          />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/continue/:token" element={<ContinueApplication />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/apply/success" element={<PublicApplySuccessPage />} />

          <Route path="/apply">
            <Route index element={<PublicApplyPage />} />
            <Route path="step-1" element={<Step1 />} />
            <Route
              path="step-2"
              element={
                <RequireApplicationToken>
                  <Step2 />
                </RequireApplicationToken>
              }
            />
            <Route
              path="step-3"
              element={
                <RequireApplicationToken>
                  <Step3 />
                </RequireApplicationToken>
              }
            />
            <Route
              path="step-4"
              element={
                <RequireApplicationToken>
                  <Step4 />
                </RequireApplicationToken>
              }
            />
            <Route
              path="step-5"
              element={
                <RequireApplicationToken>
                  <Step5 />
                </RequireApplicationToken>
              }
            />
            <Route
              path="step-6"
              element={
                <RequireApplicationToken>
                  <Step6 />
                </RequireApplicationToken>
              }
            />
          </Route>
          <Route path="/apply/:applicationId/*" element={<ApplyPage />} />

          <Route path="/application/step-1" element={<Step1 />} />
          <Route
            path="/application/step-2"
            element={
              <RequireApplicationToken>
                <Step2 />
              </RequireApplicationToken>
            }
          />
          <Route
            path="/application/step-3"
            element={
              <RequireApplicationToken>
                <Step3 />
              </RequireApplicationToken>
            }
          />
          <Route
            path="/application/step-4"
            element={
              <RequireApplicationToken>
                <Step4 />
              </RequireApplicationToken>
            }
          />
          <Route
            path="/application/step-5"
            element={
              <RequireApplicationToken>
                <Step5 />
              </RequireApplicationToken>
            }
          />
          <Route
            path="/application/step-6"
            element={
              <RequireApplicationToken>
                <Step6 />
              </RequireApplicationToken>
            }
          />

          <Route path="*" element={<Navigate to="/apply/step-1" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
