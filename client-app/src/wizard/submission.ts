import { filterRequirementsByAmount, type LenderProductRequirement } from "./requirements";
import type { ApplicationData } from "../types/application";

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
  if (!app.selectedProductId) return [];
  const requirements =
    (app.productRequirements?.[app.selectedProductId] || []) as LenderProductRequirement[];
  const filtered = filterRequirementsByAmount(requirements, app.kyc?.fundingAmount);
  return filtered
    .filter((entry) => entry.required)
    .filter((entry) => !app.documents[entry.document_type]);
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
      signature_date: app.signatureDate,
      application_token: app.applicationToken,
    },
    lender_product_id: app.selectedProductId,
    documents,
  };
}
