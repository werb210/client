import { filterRequirementsByAmount, type LenderProductRequirement } from "./requirements";
import type { ApplicationData } from "../types/application";
import { ClientProfileStore } from "../state/clientProfiles";

export type SubmissionDocument = {
  document_type: string;
  name: string;
  category?: string;
  product_id?: string;
  status?: "uploaded" | "accepted" | "rejected";
};

export type SubmissionPayload = {
  application: {
    kyc: ApplicationData["kyc"];
    business: ApplicationData["business"];
    applicant: ApplicationData["applicant"];
    product_category: ApplicationData["productCategory"];
    selected_product: ApplicationData["selectedProduct"];
    selected_product_type: ApplicationData["selectedProductType"];
    requires_closing_cost_funding?: ApplicationData["requires_closing_cost_funding"];
    terms_accepted: ApplicationData["termsAccepted"];
    typed_signature?: ApplicationData["typedSignature"];
    signature_date?: ApplicationData["signatureDate"];
    application_token?: ApplicationData["applicationToken"];
  };
  lender_product_id: string;
  documents: SubmissionDocument[];
};

export function getMissingRequiredDocs(app: ApplicationData) {
  const requirementsKey =
    app.productRequirements?.aggregated
      ? "aggregated"
      : app.selectedProductId;
  if (!requirementsKey) return [];
  const requirements =
    (app.productRequirements?.[requirementsKey] || []) as LenderProductRequirement[];
  const filtered = filterRequirementsByAmount(requirements, app.kyc?.fundingAmount);
  return filtered
    .filter((entry) => entry.required)
    .filter((entry) => !app.documents[entry.document_type]);
}

export function shouldBlockForMissingDocuments(app: ApplicationData) {
  if (app.documentsDeferred) return false;
  return getMissingRequiredDocs(app).length > 0;
}

export function buildSubmissionPayload(app: ApplicationData): SubmissionPayload {
  if (!app.selectedProductId) {
    throw new Error("Missing lender product selection.");
  }
  const documents = Object.entries(app.documents || {}).map(
    ([document_type, document]) => ({
      document_type,
      name: document.name,
      category: document.category,
      product_id: document.productId,
      status: document.status,
    })
  );

  return {
    application: {
      kyc: app.kyc,
      business: app.business,
      applicant: app.applicant,
      product_category: app.productCategory,
      selected_product: app.selectedProduct,
      selected_product_type: app.selectedProductType,
      requires_closing_cost_funding: app.requires_closing_cost_funding,
      terms_accepted: app.termsAccepted,
      typed_signature: app.typedSignature,
      co_applicant_signature: app.coApplicantSignature,
      signature_date: app.signatureDate,
      application_token: app.applicationToken,
    },
    lender_product_id: app.selectedProductId,
    documents,
  };
}

export function getPostSubmitRedirect({
  token,
  applicationId,
}: {
  token?: string;
  applicationId?: string | null;
}) {
  if (applicationId) {
    return `/application/${applicationId}`;
  }
  if (token && ClientProfileStore.hasPortalSession(token)) {
    return `/status?token=${token}`;
  }
  return "/portal";
}

export function canSubmitApplication({
  isOnline,
  hasIdempotencyKey,
  termsAccepted,
  typedSignature,
  partnerSignature,
  missingIdDocs,
  missingRequiredDocs,
  docsAccepted,
  processingComplete,
  documentsDeferred,
}: {
  isOnline: boolean;
  hasIdempotencyKey: boolean;
  termsAccepted: boolean;
  typedSignature: boolean;
  partnerSignature: boolean;
  missingIdDocs: number;
  missingRequiredDocs: number;
  docsAccepted: boolean;
  processingComplete: boolean;
  documentsDeferred: boolean;
}) {
  return (
    isOnline &&
    hasIdempotencyKey &&
    termsAccepted &&
    typedSignature &&
    partnerSignature &&
    missingIdDocs === 0 &&
    (documentsDeferred || missingRequiredDocs === 0) &&
    docsAccepted &&
    processingComplete
  );
}
