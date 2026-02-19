import { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { OfflineStore } from "./offline";
import { ApplicationData } from "../types/application";
import { clearDraft } from "../client/autosave";
import { clearSubmissionIdempotencyKey } from "../client/submissionIdempotency";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { trackEvent } from "../utils/analytics";
import { loadLocalBackup, useLocalBackup } from "../system/useLocalBackup";
import { buildApiUrl } from "../lib/api";

const emptyApp: ApplicationData = {
  kyc: {},
  productCategory: null,
  matchPercentages: {},
  eligibleProducts: [],
  eligibleCategories: [],
  eligibilityReasons: [],
  business: {},
  applicant: {},
  documents: {},
  productRequirements: {},
  documentsDeferred: false,
  selectedProduct: undefined,
  selectedProductId: undefined,
  selectedProductType: undefined,
  requires_closing_cost_funding: undefined,
  termsAccepted: false,
  typedSignature: "",
  coApplicantSignature: "",
  signatureDate: "",
  applicationToken: undefined,
  continuationToken: undefined,
  readinessSessionToken: undefined,
  applicationId: undefined,
  currentStep: 1,
  linkedApplicationTokens: [],
  documentReviewComplete: undefined,
  financialReviewComplete: undefined,
  readinessScore: undefined,
  readinessLeadId: undefined,
  ocrComplete: undefined,
  creditSummaryComplete: undefined,
};

const CLIENT_DRAFT_KEY = "boreal_client_draft";
const BOREAL_DRAFT_KEY = "boreal_draft";
const APPLICATION_STATE_KEY = "application_state";

function loadClientDraft(): ApplicationData | null {
  try {
    const raw = localStorage.getItem(CLIENT_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApplicationData;
  } catch (_error) {
    return null;
  }
}



function loadApplicationStateDraft(): ApplicationData | null {
  try {
    const raw = localStorage.getItem(APPLICATION_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApplicationData;
  } catch (_error) {
    return null;
  }
}

function loadBorealDraft(): ApplicationData | null {
  try {
    const raw = localStorage.getItem(BOREAL_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApplicationData;
  } catch (_error) {
    return null;
  }
}

function hydrateApplication(saved: ApplicationData | null): ApplicationData {
  if (!saved) return emptyApp;

  const savedKyc = saved.kyc || {};
  const savedMatchPercentages = saved.matchPercentages || {};
  const savedEligibleProducts = saved.eligibleProducts || [];
  const savedEligibleCategories = saved.eligibleCategories || [];
  const savedEligibilityReasons = saved.eligibilityReasons || [];
  const savedBusiness = saved.business || {};
  const savedApplicant = saved.applicant || {};
  const savedDocuments = saved.documents || {};
  const savedProductRequirements = saved.productRequirements || {};
  const normalizedDocuments = Object.fromEntries(
    Object.entries(savedDocuments).map(([key, value]) => {
      const entry = value as {
        name?: string;
        base64?: string;
        category?: string;
        productId?: string;
        status?: "uploaded" | "accepted" | "rejected";
      };
      return [
        key,
        {
          name: entry.name || key,
          base64: entry.base64 || "",
          category: entry.category || key,
          productId: entry.productId,
          status: entry.status,
        },
      ];
    })
  );
  const savedClosingCostFunding =
    typeof saved.requires_closing_cost_funding === "boolean"
      ? saved.requires_closing_cost_funding
      : undefined;

  return {
    ...emptyApp,
    ...saved,
    requires_closing_cost_funding: savedClosingCostFunding,
    kyc: { ...emptyApp.kyc, ...savedKyc },
    matchPercentages: {
      ...emptyApp.matchPercentages,
      ...savedMatchPercentages,
    },
    eligibleProducts: savedEligibleProducts,
    eligibleCategories: savedEligibleCategories,
    eligibilityReasons: savedEligibilityReasons,
    business: { ...emptyApp.business, ...savedBusiness },
    applicant: { ...emptyApp.applicant, ...savedApplicant },
    documents: { ...emptyApp.documents, ...normalizedDocuments },
    productRequirements: {
      ...emptyApp.productRequirements,
      ...savedProductRequirements,
    },
    linkedApplicationTokens:
      saved.linkedApplicationTokens || emptyApp.linkedApplicationTokens,
    documentReviewComplete: saved.documentReviewComplete,
    financialReviewComplete: saved.financialReviewComplete,
    readinessScore:
      typeof saved.readinessScore === "number" ? saved.readinessScore : undefined,
    readinessLeadId:
      typeof saved.readinessLeadId === "string" ? saved.readinessLeadId : undefined,
    ocrComplete: typeof saved.ocrComplete === "boolean" ? saved.ocrComplete : undefined,
    creditSummaryComplete:
      typeof saved.creditSummaryComplete === "boolean"
        ? saved.creditSummaryComplete
        : undefined,
  };
}

export function useApplicationStore() {
  const [app, setApp] = useState<ApplicationData>(() =>
    hydrateApplication(loadApplicationStateDraft() || loadBorealDraft() || loadClientDraft() || OfflineStore.load())
  );
  const [initialized, setInitialized] = useState(false);
  const [autosaveError, setAutosaveError] = useState<string | null>(null);
  const { isOffline } = useNetworkStatus();
  const trackedStep = useRef<number | undefined>(undefined);

  const canAutosave = (app.currentStep ?? 0) >= 1;

  useLocalBackup(app);

  useEffect(() => {
    const serialized = JSON.stringify(app);
    localStorage.setItem(BOREAL_DRAFT_KEY, serialized);
    localStorage.setItem(APPLICATION_STATE_KEY, serialized);
  }, [app]);

  const saveToServer = useMemo(
    () =>
      debounce(async (state: ApplicationData) => {
        if (!state.applicationToken) return;

        await fetch(buildApiUrl("/api/application/update"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        });
      }, 1500),
    []
  );

  function init() {
    if (initialized) return;

    const { ProductSync } = require("../lender/productSync");
    ProductSync.invalidateCache();
    void ProductSync.sync().catch((error: unknown) => {
      console.error("Product sync failed:", error);
    });

    setInitialized(true);
  }

  function update(part: Partial<ApplicationData>) {
    setApp((state) => {
      const updated = { ...state, ...part };
      OfflineStore.save(updated);

      if (!canAutosave) {
        return updated;
      }

      if (isOffline) {
        setAutosaveError("You're offline. Changes will sync when you reconnect.");
        return updated;
      }

      if (updated) {
        if (typeof saveToServer === "function") {
          void saveToServer(updated);
        }
      }

      return updated;
    });
  }


  function loadFromServer(state: Partial<ApplicationData>) {
    setApp((prev) => {
      const next = hydrateApplication({ ...prev, ...state } as ApplicationData);
      OfflineStore.save(next);
      return next;
    });
  }

  function reset() {
    setApp(emptyApp);
    OfflineStore.clear();
    localStorage.removeItem(CLIENT_DRAFT_KEY);
    localStorage.removeItem(BOREAL_DRAFT_KEY);
    localStorage.removeItem(APPLICATION_STATE_KEY);
    clearDraft();
    clearSubmissionIdempotencyKey();
  }

  useEffect(() => {
    if (!initialized) {
      init();
    }
  }, [initialized]);

  useEffect(() => {
    if (app.applicationToken) return;
    const backup = loadLocalBackup<ApplicationData>();
    if (!backup) return;
    setApp((prev) => ({ ...prev, ...backup }));
  }, [app.applicationToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(CLIENT_DRAFT_KEY, JSON.stringify(app));
    }, 300);

    return () => clearTimeout(timer);
  }, [app]);

  useEffect(() => {
    if (!app.currentStep || trackedStep.current === app.currentStep) return;
    trackedStep.current = app.currentStep;
    trackEvent("application_step_view", { step: app.currentStep });
    trackEvent("client_step_progressed", { step: app.currentStep });
  }, [app.currentStep]);

  useEffect(() => {
    if (!isOffline) {
      setAutosaveError(null);
    }
  }, [isOffline]);

  useEffect(() => {
    if (isOffline || !app.applicationToken || !canAutosave) return;
    if (!app) return;

    if (app) {
      if (typeof saveToServer === "function") {
        void saveToServer(app);
      }
    }
  }, [app, canAutosave, isOffline, saveToServer]);

  useEffect(() => {
    const persist = () => {
      localStorage.setItem(APPLICATION_STATE_KEY, JSON.stringify(app));
    };

    window.addEventListener("blur", persist);
    window.addEventListener("beforeunload", persist);

    return () => {
      window.removeEventListener("blur", persist);
      window.removeEventListener("beforeunload", persist);
    };
  }, [app]);

  useEffect(() => {
    return () => {
      saveToServer.cancel();
    };
  }, [saveToServer]);

  return {
    app,
    initialized,
    init,
    update,
    reset,
    loadFromServer,
    autosaveError,
    applicationToken: app.applicationToken,
    setToken(token: string) {
      const next = { ...app, applicationToken: token };
      update(next);
    },
  };
}
