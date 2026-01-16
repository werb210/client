import { useState } from "react";
import { OfflineStore } from "./offline";
import { ApplicationData } from "../types/application";

const emptyApp: ApplicationData = {
  kyc: {},
  productCategory: null,
  matchPercentages: {},
  business: {},
  applicant: {},
  documents: {},
  termsAccepted: false,
  typedSignature: "",
  applicationToken: undefined,
};

function hydrateApplication(saved: ApplicationData | null): ApplicationData {
  if (!saved) return emptyApp;

  const savedKyc = saved.kyc || {};
  const savedMatchPercentages = saved.matchPercentages || {};
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

  function init() {
    if (initialized) return;

    // Load lender products into offline cache
    const { ProductSync } = require("../lender/productSync");
    ProductSync.sync();

    setInitialized(true);
  }

  function update(part: Partial<ApplicationData>) {
    setApp((prev) => {
      const next = { ...prev, ...part };
      OfflineStore.save(next);
      return next;
    });
  }

  function reset() {
    setApp(emptyApp);
    OfflineStore.clear();
  }

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
