import { useApp } from '@/store/app';

export function buildSubmissionPayload() {
  const { intake: step1, step2, documents, signature, consents } = useApp.getState();
  
  return {
    step1,
    step3: step1?.businessDetails ?? {},      // map your 11 fields here
    step4: step1?.applicants ?? {},           // map your 28 fields here
    signatureComplete: !!signature.completed,
    signatureTimestamp: signature.signedAt ?? null,
    signNowDocumentId: signature.documentId ?? null,
    lenderProductId: step2.selectedProductId ?? null,
    lenderId: step2.selectedLenderName ?? null,
    loanProductCategory: step2.selectedCategory ?? null,
    loanProductCategoryLabel: step2.selectedCategoryName ?? null,
    submissionTimestamp: new Date().toISOString(),
    termsAccepted: !!consents.communicationConsent,
    privacyAccepted: !!consents.documentMaintenanceConsent,
    applicationId: step1?.applicationId ?? null,
    documentCount: documents.uploadedDocuments.length,
    documentTypes: documents.uploadedDocuments.map((d: any) => d.type).filter(Boolean),
    bypassDocuments: documents.bypassedDocuments,
  };
}