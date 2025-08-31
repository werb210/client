export function buildSubmission(appState: any, uploaded: Array<{type:string}>){
  const step1 = appState.step1;
  const step2 = appState.step2;
  const step3 = appState.step3;
  const step4 = appState.step4;
  const step5 = appState.step5 || {};
  const step6 = appState.step6 || {};
  const bypass = JSON.parse(localStorage.getItem('bf:step5:bypass') || '[]');

  return {
    // 17 top-level fields
    step1,
    step3,
    step4,
    signatureComplete: step6.completed ?? false,
    signatureTimestamp: step6.submittedAt ?? null,
    signNowDocumentId: step6.documentId ?? null,
    lenderProductId: step2?.selectedProductId ?? null,
    lenderId: appState.lenderId ?? null,
    loanProductCategory: step2?.selectedCategory ?? null,
    loanProductCategoryLabel: step2?.selectedCategoryName ?? null,
    submissionTimestamp: new Date().toISOString(),
    termsAccepted: appState.termsAccepted ?? true,
    privacyAccepted: appState.privacyAccepted ?? true,
    applicationId: step6.applicationId ?? appState.id,
    documentCount: uploaded?.length ?? 0,
    documentTypes: uploaded?.map(f => f.type) ?? [],
    bypassDocuments: bypass
  };
}