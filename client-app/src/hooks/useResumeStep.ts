import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApplicationStore } from "@/state/applicationStore";
import { useClientSession } from "@/state/useClientSession";

/**
 * useResumeStep
 * -------------
 * Automatically routes the user to:
 *  - the correct step if they are mid-application
 *  - login if no session exists
 *  - the client portal if application is already submitted
 *
 * Includes hydration-safe guards for SSR/CSR mismatch.
 */

export function useResumeStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, applicationId } = useClientSession();
  const { currentStep, isSubmitted, hydrateFromServer } = useApplicationStore();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isOnLogin = location.pathname.startsWith("/login");
    const isOnPortal = location.pathname.startsWith("/portal");
    const isOnApplication = location.pathname.includes("step");

    // 1. No session → force login
    if (!token || !applicationId) {
      if (!isOnLogin) navigate("/login");
      return;
    }

    // 2. Fetch server state (status, last completed step, etc.)
    //    Ensures hydration before routing.
    void hydrateFromServer(token);

    // 3. Already submitted → always go to portal
    if (isSubmitted) {
      if (!isOnPortal) navigate("/portal");
      return;
    }

    // 4. User is in application flow → route to their saved step
    if (!isOnApplication && !isOnPortal && !isOnLogin) {
      navigate(`/step${currentStep}`);
      return;
    }
  }, [token, applicationId, currentStep, isSubmitted]);
}
