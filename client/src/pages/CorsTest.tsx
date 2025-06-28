import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '@/constants';

interface CorsTestResult {
  test: string;
  url: string;
  method: string;
  origin: string;
  status?: number;
  ok?: boolean;
  result: 'PASS' | 'FAIL';
  headers?: Record<string, string | null>;
  error?: string;
  timing?: number;
}

export default function CorsTest() {
  const [results, setResults] = useState<CorsTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runCorsTests = async () => {
    setIsLoading(true);
    const testResults: CorsTestResult[] = [];
    const clientOrigin = window.location.origin;

    // Test 1: OPTIONS preflight for auth/user
    try {
      const start = Date.now();
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Origin': clientOrigin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      const timing = Date.now() - start;

      testResults.push({
        test: 'CORS Preflight (/auth/user)',
        url: `${API_BASE_URL}/auth/user`,
        method: 'OPTIONS',
        origin: clientOrigin,
        status: response.status,
        ok: response.ok,
        result: (response.ok || response.status === 204) ? 'PASS' : 'FAIL',
        timing,
        headers: {
          'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
          'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
      });
    } catch (error) {
      testResults.push({
        test: 'CORS Preflight (/auth/user)',
        url: `${API_BASE_URL}/auth/user`,
        method: 'OPTIONS',
        origin: clientOrigin,
        result: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Actual GET request to auth/user
    try {
      const start = Date.now();
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      const timing = Date.now() - start;

      testResults.push({
        test: 'GET /auth/user (with credentials)',
        url: `${API_BASE_URL}/auth/user`,
        method: 'GET',
        origin: clientOrigin,
        status: response.status,
        ok: response.ok,
        result: (response.ok || response.status === 401) ? 'PASS' : 'FAIL',
        timing,
        headers: {
          'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
        }
      });
    } catch (error) {
      testResults.push({
        test: 'GET /auth/user (with credentials)',
        url: `${API_BASE_URL}/auth/user`,
        method: 'GET',
        origin: clientOrigin,
        result: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Health endpoint
    try {
      const start = Date.now();
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      const timing = Date.now() - start;

      testResults.push({
        test: 'GET /health',
        url: `${API_BASE_URL}/health`,
        method: 'GET',
        origin: clientOrigin,
        status: response.status,
        ok: response.ok,
        result: response.ok ? 'PASS' : 'FAIL',
        timing,
        headers: {
          'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
        }
      });
    } catch (error) {
      testResults.push({
        test: 'GET /health',
        url: `${API_BASE_URL}/health`,
        method: 'GET',
        origin: clientOrigin,
        result: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setResults(testResults);
    setIsLoading(false);
  };

  const getStatusColor = (result: string) => {
    switch (result) {
      case 'PASS': return 'bg-green-100 text-green-800';
      case 'FAIL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CORS Diagnostic Test</h1>
        <p className="text-gray-600">
          Testing CORS configuration between client and staff backend
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Client Origin:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{window.location.origin}</code></p>
              <p><strong>API Base URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{API_BASE_URL}</code></p>
            </div>
            <div>
              <p><strong>Environment:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{import.meta.env.MODE}</code></p>
              <p><strong>Protocol:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{window.location.protocol}</code></p>
            </div>
          </div>
          <Button onClick={runCorsTests} disabled={isLoading} className="mt-4">
            {isLoading ? 'Running CORS Tests...' : 'Run CORS Tests'}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Test Results</h2>
          
          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{result.test}</CardTitle>
                  <Badge className={getStatusColor(result.result)}>
                    {result.result}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.url}</code></p>
                  <p><strong>Method:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.method}</code></p>
                  <p><strong>Origin:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.origin}</code></p>
                  
                  {result.status && (
                    <p><strong>Status:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.status}</code></p>
                  )}
                  
                  {result.timing && (
                    <p><strong>Response Time:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.timing}ms</code></p>
                  )}
                  
                  {result.error && (
                    <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                  )}
                  
                  {result.headers && (
                    <div className="mt-3">
                      <p className="font-medium mb-2">CORS Response Headers:</p>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(result.headers, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>CORS Troubleshooting Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-3">
                <div>
                  <p className="font-medium text-green-700">✅ Expected for PASS:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>OPTIONS request returns 200 or 204</li>
                    <li>Access-Control-Allow-Origin matches client origin exactly</li>
                    <li>Access-Control-Allow-Credentials: true</li>
                    <li>GET requests work with credentials: 'include'</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium text-red-700">❌ Common FAIL causes:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Backend not running or unreachable</li>
                    <li>Origin not in CORS allowlist</li>
                    <li>Missing Access-Control-Allow-Credentials header</li>
                    <li>CORS middleware misconfigured</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}