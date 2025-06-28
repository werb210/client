import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthAPI } from '@/lib/authApi';
import { API_BASE_URL } from '@/constants';

interface DebugResult {
  step: string;
  status: 'success' | 'error' | 'pending' | 'info';
  message: string;
  details?: string;
}

export default function DebugChecklist() {
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: DebugResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Step 1: API Base URL
    addResult({
      step: 'API Base URL',
      status: 'info',
      message: `Development API URL: ${API_BASE_URL}`,
      details: 'Checking .env configuration'
    });

    // Step 2: Dev-server origin
    const origin = window.location.origin;
    addResult({
      step: 'Dev-server Origin',
      status: 'info',
      message: `Current origin: ${origin}`,
      details: 'This must be in staff backend CORS allowlist or match /.*\\.replit\\.dev$/'
    });

    // Step 3: Test basic connectivity
    try {
      addResult({
        step: 'Testing Connectivity',
        status: 'pending',
        message: 'Testing basic connection to staff backend...'
      });

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
      });

      if (response.ok) {
        addResult({
          step: 'Basic Connectivity',
          status: 'success',
          message: 'Staff backend is reachable',
          details: `Status: ${response.status}`
        });
      } else {
        addResult({
          step: 'Basic Connectivity',
          status: 'error',
          message: `Backend returned ${response.status}`,
          details: await response.text()
        });
      }
    } catch (error) {
      addResult({
        step: 'Basic Connectivity',
        status: 'error',
        message: 'Network request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Step 4: Test SMS OTP request
    try {
      addResult({
        step: 'Testing SMS OTP',
        status: 'pending',
        message: 'Testing SMS OTP request with test phone...'
      });

      const result = await AuthAPI.resendOtp({ email: 'test@example.com' });
      
      addResult({
        step: 'SMS OTP Request',
        status: 'success',
        message: 'OTP request successful',
        details: JSON.stringify(result, null, 2)
      });
    } catch (error) {
      const err = error as Error;
      addResult({
        step: 'SMS OTP Request',
        status: 'error',
        message: 'OTP request failed',
        details: err.message
      });
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Checklist</CardTitle>
          <CardDescription>
            Verify API connectivity and CORS configuration step by step
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostic Check'}
          </Button>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{result.step}</span>
                </div>
                <p className="text-sm text-gray-700">{result.message}</p>
                {result.details && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {result.details}
                  </pre>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Manual Network Inspection</h3>
            <p className="text-sm text-gray-700 mb-2">
              To inspect failed requests manually:
            </p>
            <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
              <li>Open browser DevTools (F12)</li>
              <li>Go to Network tab</li>
              <li>Click "Send Verification Code" on login page</li>
              <li>Look for the POST request status:
                <ul className="ml-4 mt-1 list-disc list-inside">
                  <li><code>(blocked:cors)</code> = CORS issue</li>
                  <li><code>502/404/500</code> = Backend error</li>
                  <li><code>No request shown</code> = JS error before fetch</li>
                </ul>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}