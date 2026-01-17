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
  documentsDeferred: false,
  termsAccepted: false,
  typedSignature: "",
  signatureDate: "",
  applicationToken: undefined,
  applicationId: undefined,
  currentStep: 1,
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

  return {
    ...emptyApp,
    ...saved,
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
    documents: { ...emptyApp.documents, ...savedDocuments },
  };
}

export function useApplicationStore() {
  const [app, setApp] = useState<ApplicationData>(() =>
    hydrateApplication(OfflineStore.load())
  );
  const [initialized, setInitialized] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canAutosave = app.currentStep > 1;

  function init() {
    if (initialized) return;

    // Load lender products into offline cache
    const { ProductSync } = require("../lender/productSync");
    try {
      ProductSync.sync();
    } catch (error) {
      console.error("Product sync failed:", error);
    }

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
          kyc: app.kyc,
          productCategory: app.productCategory,
          matchPercentages: app.matchPercentages,
          business: app.business,
          applicant: app.applicant,
          documents: app.documents,
          documentsDeferred: app.documentsDeferred,
          termsAccepted: app.termsAccepted,
          typedSignature: app.typedSignature,
          signatureDate: app.signatureDate,
          currentStep: app.currentStep,
        }).catch((error) => {
          console.error("Autosave failed:", error);
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
