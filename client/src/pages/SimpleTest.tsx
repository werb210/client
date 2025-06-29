export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Client Application Test
        </h1>
        <p className="text-gray-600">
          This page confirms the React application is loading correctly.
        </p>
        <div className="mt-4 space-y-2">
          <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
}