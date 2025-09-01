import { useApp } from '@/store/app';

export default function Step4() {
  const { intake, set } = useApp();

  const handleNext = () => {
    // Navigate to step-5
    window.location.href = '/apply/step-5';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Step 4: Applicant Information</h1>
      <p className="text-gray-600 mb-4">Provide applicant details.</p>
      {/* Add your step 4 form components here */}
      <button 
        onClick={handleNext}
        className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700"
      >
        Continue to Step 5
      </button>
    </div>
  );
}