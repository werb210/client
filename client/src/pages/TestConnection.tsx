import { useState } from 'react';
// Test connection component
import { API_BASE_URL } from '@/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TestResult {
  connected: boolean;
  error?: string;
  apiTest?: string;
}

export default function TestConnection() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const tests = {
        health: null as any,
        cors: null as any,
        auth: null as any
      };

      // Test 1: Health endpoint
      try {
        const healthResponse = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
        });
        tests.health = {
          success: healthResponse.ok,
          status: healthResponse.status,
          message: healthResponse.ok ? 'Health endpoint accessible' : `HTTP ${healthResponse.status}`
        };
      } catch (error) {
        tests.health = {
          success: false,
          message: error instanceof Error ? error.message : 'Health test failed'
        };
      }

      // Test 2: CORS preflight test
      try {
        const corsResponse = await fetch(`${API_BASE_URL}/api/health`, {
          method: 'OPTIONS',
          mode: 'cors',
          headers: {
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        });
        tests.cors = {
          success: corsResponse.ok || corsResponse.status === 204,
          status: corsResponse.status,
          message: 'CORS preflight response received'
        };
      } catch (error) {
        tests.cors = {
          success: false,
          message: 'CORS preflight failed - likely CORS misconfiguration'
        };
      }

      // Test 3: API endpoint
      try {
        const apiResponse = await fetch(`${API_BASE_URL}/api/lender-products`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
        });
        tests.auth = {
          success: apiResponse.status !== 0,
          status: apiResponse.status,
          message: apiResponse.ok ? 'API endpoint accessible' : `HTTP ${apiResponse.status}`
        };
      } catch (error) {
        tests.auth = {
          success: false,
          message: error instanceof Error ? error.message : 'API test failed'
        };
      }

      setResult({
        connected: tests.health.success || tests.auth.success,
        error: !tests.health.success && !tests.auth.success ? 'All connectivity tests failed' : undefined,
        apiTest: JSON.stringify(tests, null, 2)
      } as TestResult);
      
    } catch (error) {
      setResult({
        connected: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
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
                {API_BASE_URL}
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
                {result.apiTest && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Detailed Test Results:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
                      {result.apiTest}
                    </pre>
                  </div>
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