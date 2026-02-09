import { useEffect, useRef, useState } from "react";
import { OfflineStore } from "./offline";
import { ApplicationData } from "../types/application";
import { ClientAppAPI } from "../api/clientApp";

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
};

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
  };
}

export function useApplicationStore() {
  const [app, setApp] = useState<ApplicationData>(() =>
    hydrateApplication(OfflineStore.load())
  );
  const [initialized, setInitialized] = useState(false);
  const autosaveErrorShown = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canAutosave = app.currentStep > 1;

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
  }

  useEffect(() => {
    if (!initialized) {
      init();
    }
  }, [initialized]);

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

      if (app.applicationToken) {
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
            autosaveErrorShown.current = false;
          })
          .catch((error) => {
            console.error("Autosave failed:", error);
            if (!autosaveErrorShown.current) {
              autosaveErrorShown.current = true;
              alert("Autosave failed. Please check your connection.");
            }
          });
      }
    }, 500);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [app, canAutosave]);

  return {
    app,
    initialized,
    init,
    update,
    reset,
    applicationToken: app.applicationToken,
    setToken(token: string) {
      const next = { ...app, applicationToken: token };
      update(next);
    }
  };
}
