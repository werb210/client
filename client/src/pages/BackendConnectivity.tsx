import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: string;
}

export default function BackendConnectivity() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, status: 'success' | 'error', message: string, details?: string) => {
    setResults(prev => [...prev, { test, status, message, details }]);
  };

  const runConnectivityTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    const STAFF_API = 'https://staffportal.replit.app/api';
    const CLIENT_ORIGIN = window.location.origin;

    // Test 1: Basic health check
    try {
      const response = await fetch(`${STAFF_API}/health`, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.text();
        addResult('Health Check', 'success', `Staff backend is running (${response.status})`, data);
      } else {
        addResult('Health Check', 'error', `Staff backend returned ${response.status}`, await response.text());
      }
    } catch (error) {
      addResult('Health Check', 'error', 'Cannot reach staff backend', `${error}`);
    }

    // Test 2: CORS preflight for auth endpoints
    try {
      const response = await fetch(`${STAFF_API}/auth/register`, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Origin': CLIENT_ORIGIN,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
      const corsCredentials = response.headers.get('Access-Control-Allow-Credentials');
      
      if (corsOrigin === CLIENT_ORIGIN && corsCredentials === 'true') {
        addResult('CORS Configuration', 'success', 'CORS properly configured for client origin');
      } else {
        addResult('CORS Configuration', 'error', 'CORS misconfigured', 
          `Origin: ${corsOrigin}, Credentials: ${corsCredentials}`);
      }
    } catch (error) {
      addResult('CORS Configuration', 'error', 'CORS preflight failed', `${error}`);
    }

    // Test 3: Environment variables
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;
    if (envApiUrl === STAFF_API) {
      addResult('Environment Config', 'success', 'API URL correctly configured');
    } else {
      addResult('Environment Config', 'error', 'API URL mismatch', 
        `Expected: ${STAFF_API}, Got: ${envApiUrl}`);
    }

    // Test 4: Current user endpoint (typical first call)
    try {
      const response = await fetch(`${STAFF_API}/auth/current-user`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      
      if (response.status === 401) {
        addResult('Auth Endpoint', 'success', 'Auth endpoint responding (401 expected when not logged in)');
      } else if (response.ok) {
        addResult('Auth Endpoint', 'success', 'Auth endpoint responding with user data');
      } else {
        addResult('Auth Endpoint', 'error', `Auth endpoint error: ${response.status}`);
      }
    } catch (error) {
      addResult('Auth Endpoint', 'error', 'Cannot reach auth endpoint', `${error}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Staff Backend Connectivity Test</CardTitle>
          <p className="text-sm text-gray-600">
            Testing connection to https://staffportal.replit.app/api
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runConnectivityTests} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Running Tests...' : 'Test Backend Connection'}
          </Button>
          
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="border rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{result.test}</span>
                </div>
                <p className="text-sm text-gray-700">{result.message}</p>
                {result.details && (
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                    {result.details}
                  </pre>
                )}
              </div>
            ))}
          </div>
          
          {results.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ul className="text-sm space-y-1">
                <li>• If health check fails: Staff backend is down - redeploy it</li>
                <li>• If CORS fails: Update staff backend CORS to allow this client origin</li>
                <li>• If env config fails: Check .env.production file</li>
                <li>• If all pass: Registration should work normally</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}