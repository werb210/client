import { useApp } from '@/store/app';

export default function Step6() {
  const { signature, set } = useApp();

  const handleNext = () => {
    // Navigate to step-7
    window.location.href = '/apply/step-7';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Step 6: Digital Signature</h1>
      <p className="text-gray-600 mb-4">Review and sign your application.</p>
      {/* Add your signature component here */}
      <button 
        onClick={handleNext}
        className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700"
      >
        Continue to Step 7
      </button>
    </div>
  );
}