import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';

export default function UploadComplete() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="mx-auto max-w-md text-center bg-white rounded-lg shadow-lg p-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
        <h1 className="mb-6 text-2xl font-semibold text-gray-800">
          Thank you for the required documents.
        </h1>
        <p className="text-gray-600">
          We will review and complete your application package shortly.
        </p>
      </div>
    </div>
  );
}