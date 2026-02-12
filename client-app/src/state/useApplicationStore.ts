import { useEffect, useRef, useState } from "react";
import { OfflineStore } from "./offline";
import { ApplicationData } from "../types/application";
import { ClientAppAPI } from "../api/clientApp";
import { clearDraft } from "../client/autosave";
import { clearSubmissionIdempotencyKey } from "../client/submissionIdempotency";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { trackEvent } from "../utils/analytics";

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
  applicationId: undefined,
  currentStep: 1,
  linkedApplicationTokens: [],
  documentReviewComplete: undefined,
  financialReviewComplete: undefined,
  readinessScore: undefined,
};

const CLIENT_DRAFT_KEY = "boreal_client_draft";

function loadClientDraft(): ApplicationData | null {
  try {
    const raw = localStorage.getItem(CLIENT_DRAFT_KEY);
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
  };
}

export function useApplicationStore() {
  const [app, setApp] = useState<ApplicationData>(() =>
    hydrateApplication(loadClientDraft() || OfflineStore.load())
  );
  const [initialized, setInitialized] = useState(false);
  const [autosaveError, setAutosaveError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSync = useRef<ApplicationData | null>(null);
  const { isOffline } = useNetworkStatus();
  const trackedStep = useRef<number | undefined>(undefined);

  const canAutosave = app.currentStep >= 1;

  function init() {
    if (initialized) return;

    // Load lender products into offline cache
    const { ProductSync } = require("../lender/productSync");
    ProductSync.invalidateCache();
    void ProductSync.sync().catch((error: unknown) => {
      console.error("Product sync failed:", error);
    });

    setInitialized(true);
  }

  function update(part: Partial<ApplicationData>) {
    setApp((prev) => ({ ...prev, ...part }));
  }

  function reset() {
    setApp(emptyApp);
    OfflineStore.clear();
    localStorage.removeItem(CLIENT_DRAFT_KEY);
    clearDraft();
    clearSubmissionIdempotencyKey();
  }

  useEffect(() => {
    if (!initialized) {
      init();
    }
  }, [initialized]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(CLIENT_DRAFT_KEY, JSON.stringify(app));
    }, 300);

    return () => clearTimeout(timer);
  }, [app]);

  useEffect(() => {
    if (!app.currentStep || trackedStep.current === app.currentStep) return;
    trackedStep.current = app.currentStep;
    trackEvent("client_step_progressed", { step: app.currentStep });
  }, [app.currentStep]);

  useEffect(() => {
    if (!canAutosave) {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      return;
    }

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      OfflineStore.save(app);

      if (!app.applicationToken) return;

      if (isOffline) {
        pendingSync.current = app;
        setAutosaveError("You're offline. Changes will sync when you reconnect.");
        return;
      }

      void ClientAppAPI.update(app.applicationToken, {
        financialProfile: app.kyc,
        productCategory: app.productCategory,
        selectedProduct: app.selectedProduct,
        selectedProductId: app.selectedProductId,
        selectedProductType: app.selectedProductType,
        requires_closing_cost_funding: app.requires_closing_cost_funding,
        business: app.business,
        applicant: app.applicant,
        documents: app.documents,
        documentsDeferred: app.documentsDeferred,
        termsAccepted: app.termsAccepted,
        typedSignature: app.typedSignature,
        coApplicantSignature: app.coApplicantSignature,
        signatureDate: app.signatureDate,
        currentStep: app.currentStep,
      })
        .then(() => {
          pendingSync.current = null;
          setAutosaveError(null);
        })
        .catch((error) => {
          console.error("Autosave failed:", error);
          pendingSync.current = app;
          setAutosaveError("Autosave failed. We'll retry when you're back online.");
        });
    }, 500);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [app, canAutosave, isOffline]);

  useEffect(() => {
    if (isOffline || !pendingSync.current || !app.applicationToken) return;
    const pending = pendingSync.current;
    pendingSync.current = null;
    void ClientAppAPI.update(app.applicationToken, {
      financialProfile: pending.kyc,
      productCategory: pending.productCategory,
      selectedProduct: pending.selectedProduct,
      selectedProductId: pending.selectedProductId,
      selectedProductType: pending.selectedProductType,
      requires_closing_cost_funding: pending.requires_closing_cost_funding,
      business: pending.business,
      applicant: pending.applicant,
      documents: pending.documents,
      documentsDeferred: pending.documentsDeferred,
      termsAccepted: pending.termsAccepted,
      typedSignature: pending.typedSignature,
      coApplicantSignature: pending.coApplicantSignature,
      signatureDate: pending.signatureDate,
      currentStep: pending.currentStep,
    })
      .then(() => {
        setAutosaveError(null);
      })
      .catch((error) => {
        console.error("Autosave failed:", error);
        pendingSync.current = pending;
        setAutosaveError("Autosave failed. We'll retry when you're back online.");
      });
  }, [app.applicationToken, isOffline]);

  return {
    app,
    initialized,
    init,
    update,
    reset,
    autosaveError,
    applicationToken: app.applicationToken,
    setToken(token: string) {
      const next = { ...app, applicationToken: token };
      update(next);
    }
  };
}
