import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { staffApi } from '@/lib/staffApi';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  details: any;
  timestamp: string;
}

export default function ConnectionTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: 'success' | 'error', details: any) => {
    setResults(prev => [...prev, {
      test,
      status,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Environment Variables
    addResult('Environment Check', 'success', {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      VITE_SIGNNOW_REDIRECT_URL: import.meta.env.VITE_SIGNNOW_REDIRECT_URL
    });

    // Test 2: Direct Fetch to Health Endpoint
    try {
      const response = await fetch('https://staffportal.replit.app/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      const data = await response.text();
      addResult('Direct Health Check', response.ok ? 'success' : 'error', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: data
      });
    } catch (error) {
      addResult('Direct Health Check', 'error', {
        error: error instanceof Error ? error.message : error,
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    // Test 3: StaffApi Health Check
    try {
      const result = await staffApi.healthCheck();
      addResult('StaffApi Health Check', result.success ? 'success' : 'error', result);
    } catch (error) {
      addResult('StaffApi Health Check', 'error', {
        error: error instanceof Error ? error.message : error
      });
    }

    // Test 4: CORS Preflight Test
    try {
      const response = await fetch('https://staffportal.replit.app/api/auth/register', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
          'Origin': window.location.origin
        }
      });
      
      addResult('CORS Preflight', response.ok ? 'success' : 'error', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error) {
      addResult('CORS Preflight', 'error', {
        error: error instanceof Error ? error.message : error
      });
    }

    // Test 5: Network Connectivity
    try {
      const start = Date.now();
      const response = await fetch('https://staffportal.replit.app', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      const duration = Date.now() - start;
      
      addResult('Basic Connectivity', 'success', {
        responseTime: `${duration}ms`,
        type: response.type
      });
    } catch (error) {
      addResult('Basic Connectivity', 'error', {
        error: error instanceof Error ? error.message : error
      });
    }

    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-teal-700">Connection Diagnostic Tool</CardTitle>
            <p className="text-sm text-gray-600">
              Comprehensive testing for client-staff backend connectivity
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Tests...' : 'Run Connection Tests'}
            </Button>

            {results.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Test Results:</h3>
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.status === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {result.test}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}