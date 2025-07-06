import { useLocation } from "wouter";

export default function Portal() {
  const [, navigate] = useLocation();

  const handleStartApplication = () => {
    navigate("/apply/step-1");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-blue-900">
          Welcome to Boreal Financial
        </h1>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
          Start your commercial financing application and get matched with the best lenders for your business.
        </p>
        <button
          onClick={handleStartApplication}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300 text-lg"
        >
          Start Application
        </button>
        
        {/* Quick info section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-600 mb-2">7 Steps</div>
            <div className="text-gray-600">Simple application process</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-600 mb-2">41+ Lenders</div>
            <div className="text-gray-600">Comprehensive matching</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-600 mb-2">Fast Approval</div>
            <div className="text-gray-600">Quick processing time</div>
          </div>
        </div>
      </div>
    </div>
  );
}