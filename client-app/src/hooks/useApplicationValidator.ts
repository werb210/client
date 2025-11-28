import { useApplicationStore } from "@/state/applicationStore";
import {
  validateFullApplication,
  FullApplicationPayload,
} from "@/utils/validateApplication";

export function useApplicationValidator() {
  const store = useApplicationStore();

  function validateAll() {
    const payload: FullApplicationPayload = {
      step1: store.kyc,
      step3: store.businessInfo,
      step4: store.applicantInfo,
      selectedProduct: store.selectedProduct,
      documents: store.documentUploads.map((d) => d.meta),
      requiredDocs: store.requiredDocuments,
    };

    return validateFullApplication(payload);
  }

  return { validateAll };
}
