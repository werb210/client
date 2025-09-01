type AnyObj = Record<string, any>;
const read = (k:string) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };

export function buildSubmissionPayload(): AnyObj {
  const step1 = read('bf:intake') || {};
  const step2 = read('bf:step2')  || {};
  const step3 = read('bf:step3')  || {};
  const step4 = read('bf:step4')  || {};
  const docs  = read('bf:docs')   || { uploadedDocuments: [], bypassedDocuments: [] };

  const payload: AnyObj = {
    step1, step3, step4,
    loanProductCategory:       step2.selectedCategory || null,
    loanProductCategoryLabel:  step2.selectedCategoryName || null,
    lenderProductId:           step2.selectedProductId || null,
    lenderId:                  step2.selectedLenderName ? step2.selectedLenderName : null,
    documentCount:             Array.isArray(docs.uploadedDocuments) ? docs.uploadedDocuments.length : 0,
    documentTypes:             (docs.uploadedDocuments || []).map((d:any) => d?.type || d?.name).filter(Boolean),
    bypassDocuments:           docs.bypassedDocuments || [],
    submissionTimestamp:       new Date().toISOString(),
    termsAccepted:             true,
    privacyAccepted:           true,
  };
  console.log('[Step7] payload', payload);
  return payload;
}