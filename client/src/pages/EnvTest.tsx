import { useEffect } from 'react';

export default function EnvTest() {
  useEffect(() => {
    console.log('🔍 Environment Variable Test:');
    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('All import.meta.env:', import.meta.env);
    console.log('Current endpoint would be:', `${import.meta.env.VITE_API_BASE_URL}/applications/test/signnow`);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variable Test</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>VITE_API_BASE_URL:</strong> {import.meta.env.VITE_API_BASE_URL}</p>
        <p><strong>Expected:</strong> /api</p>
        <p><strong>Match:</strong> {import.meta.env.VITE_API_BASE_URL === '/api' ? '✅ YES' : '❌ NO'}</p>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-semibold">All Environment Variables:</h2>
        <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
          {JSON.stringify(import.meta.env, null, 2)}
        </pre>
      </div>
    </div>
  );
}