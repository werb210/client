import { useApp } from '@/store/app';

export default function Step1() {
  const { intake, set } = useApp();

  const handleNext = () => {
    // Navigate to step-2
    window.location.href = '/apply/step-2';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Step 1: Financial Profile</h1>
      <p className="text-gray-600 mb-4">Complete your financial information to get started.</p>
      {/* Add your step 1 form components here */}
      <button 
        onClick={handleNext}
        className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700"
      >
        Continue to Step 2
      </button>
    </div>
  );
}