import { useState } from "react";
import { OfflineStore } from "./offline";
import { ApplicationData } from "../types/application";

const emptyApp: ApplicationData = {
  kyc: {},
  productCategory: null,
  business: {},
  applicant: {},
  documents: {},
  termsAccepted: false,
  applicationToken: undefined,
};

export function useApplicationStore() {
  const [app, setApp] = useState<ApplicationData>(emptyApp);
  const [initialized, setInitialized] = useState(false);

  function init() {
    if (initialized) return;

    const saved = OfflineStore.load();
    if (saved) setApp(saved);

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
