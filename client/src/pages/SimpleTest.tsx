import { useState } from 'react';
import { API_BASE_URL } from '@/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SimpleTest() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const testResults: any[] = [];

    // Test 1: Health endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
      });
      testResults.push({
        test: 'Health Endpoint',
        url: `${API_BASE_URL}/health`,
        status: response.status,
        ok: response.ok,
        result: response.ok ? 'PASS' : 'FAIL',
        body: response.ok ? await response.text() : `Error: ${response.statusText}`
      });
    } catch (error) {
      testResults.push({
        test: 'Health Endpoint',
        url: `${API_BASE_URL}/health`,
        result: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Auth endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
      });
      testResults.push({
        test: 'Auth Endpoint',
        url: `${API_BASE_URL}/auth/user`,
        status: response.status,
        ok: response.ok,
        result: response.status === 401 ? 'PASS (401 expected)' : response.ok ? 'PASS' : 'FAIL',
        body: response.status === 401 ? 'Unauthorized (expected)' : response.ok ? await response.text() : `Error: ${response.statusText}`
      });
    } catch (error) {
      testResults.push({
        test: 'Auth Endpoint',
        url: `${API_BASE_URL}/auth/user`,
        result: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setResults(testResults);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Staff Backend Connectivity Test
        </h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              API Base URL: <code className="bg-gray-100 px-2 py-1 rounded">{API_BASE_URL}</code>
            </p>
            <Button onClick={runTests} disabled={isLoading} className="mt-4">
              {isLoading ? 'Running Tests...' : 'Run Connectivity Tests'}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {results.map((result, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <h3 className="font-medium text-lg">{result.test}</h3>
                  <p className="text-sm text-gray-600">{result.url}</p>
                  <div className={`inline-block px-2 py-1 rounded text-sm font-medium mt-2 ${
                    result.result.includes('PASS') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.result}
                  </div>
                  {result.status && (
                    <p className="text-sm mt-1">Status: {result.status}</p>
                  )}
                  {result.error && (
                    <p className="text-sm text-red-600 mt-1">Error: {result.error}</p>
                  )}
                  {result.body && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Response:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {result.body}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}