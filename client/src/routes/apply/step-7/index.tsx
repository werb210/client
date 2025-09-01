import { buildSubmissionPayload } from './payload';
import { api } from '@/lib/http';

export default function Step7() {

  const handleSubmit = async () => {
    try {
      const payload = buildSubmissionPayload();
      await api('/api/v1/applications', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
      });
      // Handle success
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit application. Please try again.');
    }
  };
  
  // Get current state for display
  const step2 = JSON.parse(localStorage.getItem('bf:step2') || '{}');
  const docs = JSON.parse(localStorage.getItem('bf:docs') || '{"uploadedDocuments":[],"bypassedDocuments":[]}');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Step 7: Submit Application</h1>
      <p className="text-gray-600 mb-4">Review and submit your completed application.</p>
      
      <div className="bg-gray-50 p-4 rounded mb-6">
        <h3 className="font-semibold mb-2">Application Summary:</h3>
        <p>Selected Category: {step2.selectedCategoryName || 'Not selected'}</p>
        <p>Lender: {step2.selectedLenderName || 'Not selected'}</p>
        <p>Documents Uploaded: {docs.uploadedDocuments.length}</p>
        <p>Bypassed Documents: {docs.bypassedDocuments.length}</p>
      </div>
      
      <button 
        onClick={handleSubmit}
        className="bg-orange-600 text-white px-8 py-3 rounded hover:bg-orange-700 font-semibold"
      >
        Submit Application
      </button>
    </div>
  );
}