import { useState } from 'react';
import { testStaffBackendConnection } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestConnection() {
  const [result, setResult] = useState<{ connected: boolean; error?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const connectionResult = await testStaffBackendConnection();
      setResult(connectionResult);
    } catch (error) {
      setResult({
        connected: false,
        error: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Staff Backend Connection Test
        </h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Staff Backend Connectivity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Current API Base URL: <code className="bg-gray-100 px-2 py-1 rounded">
                {import.meta.env.VITE_API_BASE_URL || 'https://staffportal.replit.app/api'}
              </code>
            </div>
            
            <Button 
              onClick={testConnection}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing Connection...' : 'Test Connection'}
            </Button>

            {result && (
              <div className={`p-4 rounded-lg ${
                result.connected 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-medium ${
                  result.connected ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.connected ? '✅ Connection Successful' : '❌ Connection Failed'}
                </h3>
                {result.error && (
                  <p className="text-red-700 mt-2 text-sm">
                    Error: {result.error}
                  </p>
                )}
              </div>
            )}

            <div className="text-sm text-gray-500 mt-4">
              <h4 className="font-medium mb-2">Troubleshooting Steps:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Verify staff backend is deployed and running</li>
                <li>Check CORS configuration allows this client domain</li>
                <li>Ensure API_BASE_URL environment variable is correct</li>
                <li>Test staff backend health endpoint directly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}