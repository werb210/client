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
};

export function useApplicationStore() {
  const [app, setApp] = useState<ApplicationData>(emptyApp);
  const [initialized, setInitialized] = useState(false);

  function init() {
    if (initialized) return;
    const saved = OfflineStore.load();
    if (saved) setApp(saved);
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

  return { app, initialized, init, update, reset };
}
