import { useCanon } from '@/providers/CanonProvider';
import { submitCanon } from '@/lib/submitCanon';
import { useState } from 'react';

export default function Step7() {
  const { canon } = useCanon();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Use canonical state instead of localStorage

      console.log('🚀 [STEP7] Submitting with canonical state:', Object.keys(canon).length, 'fields');

      const { traceId } = await submitCanon(canon);
      
      // Handle success
      console.log('TRACE', traceId, 'CANON_KEYS', Object.keys(canon).length);
      alert(`Application submitted successfully! traceId=${traceId}`);
      
      // Clear canonical state after successful submission
      localStorage.removeItem('bf:canon:v1');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      console.error('❌ [STEP7] Submission failed:', errorMessage);
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get current state for display from canonical store
  const selectedCategory = canon.selectedCategoryName || 'Not selected';
  const selectedLender = canon.selectedLenderName || 'Not selected';
  const requestedAmount = canon.fundingAmount || 0;
  const businessAge = canon.salesHistory || 'Not specified';
  const monthlyRevenue = canon.averageMonthlyRevenue || 0;
  const documents = canon.uploadedDocuments || [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Step 7: Submit Application</h1>
      <p className="text-gray-600 mb-4">Review and submit your completed application.</p>
      
      <div className="bg-gray-50 p-4 rounded mb-6">
        <h3 className="font-semibold mb-2">Application Summary:</h3>
        <p>Selected Category: {selectedCategory}</p>
        <p>Lender: {selectedLender}</p>
        <p>Requested Amount: ${requestedAmount.toLocaleString()}</p>
        <p>Business Age: {businessAge}</p>
        <p>Monthly Revenue: ${monthlyRevenue.toLocaleString()}</p>
        <p>Documents: {Array.isArray(documents) ? documents.length : 0} files</p>
        <p>Canonical Fields: {Object.keys(canon).length}</p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          <p className="font-semibold">Submission Error:</p>
          <p>{submitError}</p>
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