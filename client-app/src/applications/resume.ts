import type { ApplicationData } from "../types/application";

type StatusPayload = Record<string, any>;

export function extractApplicationFromStatus(
  status: StatusPayload,
  token: string
): Partial<ApplicationData> {
  const source = status?.application ?? status ?? {};

  return {
    applicationToken: token,
    applicationId: status?.applicationId || source?.applicationId,
    kyc: source.financialProfile || source.kyc || {},
    productCategory: source.productCategory || source.product_category || null,
    business: source.business || {},
    applicant: source.applicant || {},
    documents: source.documents || {},
    documentsDeferred:
      source.documentsDeferred ?? source.documents_deferred ?? false,
    selectedProduct: source.selectedProduct || source.selected_product,
    selectedProductId: source.selectedProductId || source.selected_product_id,
    selectedProductType:
      source.selectedProductType || source.selected_product_type,
    requires_closing_cost_funding:
      source.requires_closing_cost_funding ?? false,
    termsAccepted: source.termsAccepted ?? source.terms_accepted ?? false,
    typedSignature: source.typedSignature || source.typed_signature,
    coApplicantSignature:
      source.coApplicantSignature || source.co_applicant_signature,
    signatureDate: source.signatureDate || source.signature_date,
    currentStep: source.currentStep || source.current_step || 1,
    linkedApplicationTokens:
      source.linkedApplicationTokens || source.linked_application_tokens,
    documentReviewComplete:
      source.documentReviewComplete ??
      source.document_review_complete ??
      source.ocrComplete ??
      source.ocr_complete,
    financialReviewComplete:
      source.financialReviewComplete ??
      source.financial_review_complete ??
      source.creditSummaryComplete ??
      source.credit_summary_complete,
  };
}

export function getResumeRoute(app: Partial<ApplicationData>) {
  const stepRaw = app.currentStep || 1;
  const step = Math.min(6, Math.max(1, Number(stepRaw) || 1));
  return `/apply/step-${step}`;
}
