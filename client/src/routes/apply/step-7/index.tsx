import { useSubmitApplication } from '@/hooks/useSubmitApplication';
import { useState } from 'react';

export default function Step7() {
  const { submitApplication, isSubmitting, error } = useSubmitApplication();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);

    try {
      // Get form data from localStorage
      const step1Data = JSON.parse(localStorage.getItem('bf:intake') || '{}');
      const step3Data = JSON.parse(localStorage.getItem('bf:step3') || '{}');
      const docsData = JSON.parse(localStorage.getItem('bf:docs') || '{"uploadedDocuments":[]}');
      const step2Data = JSON.parse(localStorage.getItem('bf:step2') || '{}');

      // Build payload according to user specifications
      const payload = {
        product_id: step2Data.selectedProductId || '',
        country: step1Data.country || 'US',
        amount: step1Data.amountRequested || 0,
        years_in_business: step1Data.years_in_business || 0,
        monthly_revenue: step1Data.monthly_revenue || 0,
        business_legal_name: step3Data.legalName || step3Data.businessLegalName || '',
        industry: step1Data.industry || '',
        contact_name: step3Data.contactName || '',
        contact_email: step3Data.contactEmail || '',
        contact_phone: step3Data.contactPhone || '',
        documents: docsData.uploadedDocuments.map((doc: any) => ({
          type: doc.type || 'document',
          url: doc.url,
        })),
      };

      console.log('🚀 [STEP7] Submitting with payload:', payload);

      const result = await submitApplication(payload);
      
      // Handle success
      alert(`Application submitted successfully! ID: ${result.submission_id || 'Generated'}`);
      
      // Clear form data after successful submission
      localStorage.removeItem('bf:intake');
      localStorage.removeItem('bf:step2');
      localStorage.removeItem('bf:step3');
      localStorage.removeItem('bf:docs');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      console.error('❌ [STEP7] Submission failed:', errorMessage);
      setSubmitError(errorMessage);
    }
  };
  
  // Get current state for display
  const step2 = JSON.parse(localStorage.getItem('bf:step2') || '{}');
  const docs = JSON.parse(localStorage.getItem('bf:docs') || '{"uploadedDocuments":[],"bypassedDocuments":[]}');

  // Get step1 data to show business criteria
  const step1Data = JSON.parse(localStorage.getItem('bf:intake') || '{}');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Step 7: Submit Application</h1>
      <p className="text-gray-600 mb-4">Review and submit your completed application.</p>
      
      <div className="bg-gray-50 p-4 rounded mb-6">
        <h3 className="font-semibold mb-2">Application Summary:</h3>
        <p>Selected Category: {step2.selectedCategoryName || 'Not selected'}</p>
        <p>Lender: {step2.selectedLenderName || 'Not selected'}</p>
        <p>Requested Amount: ${step1Data.amountRequested?.toLocaleString() || 'Not specified'}</p>
        <p>Business Age: {step1Data.years_in_business ? `${step1Data.years_in_business} months` : 'Not specified'}</p>
        <p>Monthly Revenue: ${step1Data.monthly_revenue?.toLocaleString() || 'Not specified'}</p>
        <p>Documents Uploaded: {docs.uploadedDocuments.length}</p>
        <p>Bypassed Documents: {docs.bypassedDocuments.length}</p>
      </div>

      {(submitError || error) && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          <p className="font-semibold">Validation Error:</p>
          <p>{submitError || error}</p>
          <p className="text-sm mt-2 text-red-600">Please check that years in business ≥ 12 months and monthly revenue ≥ $15,000</p>
        </div>
      )}
      
      <button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-orange-600 text-white px-8 py-3 rounded hover:bg-orange-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </div>
  );
}