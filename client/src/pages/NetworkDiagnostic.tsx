import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import { staffApi } from '@/lib/staffApi';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  url?: string;
  timing?: number;
}

export default function NetworkDiagnostic() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPhone, setTestPhone] = useState('+15878881837');

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Environment Variable Check
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    addResult({
      test: 'Environment Configuration',
      status: apiBaseUrl ? 'success' : 'error',
      message: `API Base URL: ${apiBaseUrl || 'NOT SET'}`,
      details: { VITE_API_BASE_URL: apiBaseUrl }
    });

    // Test 2: Basic Health Check
    try {
      const startTime = Date.now();
      const response = await fetch(`${apiBaseUrl}/health`);
      const timing = Date.now() - startTime;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        addResult({
          test: 'Health Check API',
          status: response.ok ? 'success' : 'warning',
          message: `Status: ${response.status}, Response: JSON`,
          details: data,
          url: `${apiBaseUrl}/health`,
          timing
        });
      } else {
        const text = await response.text();
        addResult({
          test: 'Health Check API',
          status: 'error',
          message: `Status: ${response.status}, Response: HTML/Text (CORS Issue)`,
          details: { contentType, preview: text.substring(0, 100) },
          url: `${apiBaseUrl}/health`,
          timing
        });
      }
    } catch (error) {
      addResult({
        test: 'Health Check API',
        status: 'error',
        message: `Network Error: ${(error as Error).message}`,
        url: `${apiBaseUrl}/health`
      });
    }

    // Test 3: CORS Preflight Test
    try {
      const startTime = Date.now();
      const response = await fetch(`${apiBaseUrl}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      const timing = Date.now() - startTime;
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
      };

      addResult({
        test: 'CORS Preflight',
        status: response.ok ? 'success' : 'error',
        message: `Status: ${response.status}`,
        details: corsHeaders,
        timing
      });
    } catch (error) {
      addResult({
        test: 'CORS Preflight',
        status: 'error',
        message: `Error: ${(error as Error).message}`
      });
    }

    // Test 4: Staff API Client Test
    try {
      const startTime = Date.now();
      const result = await staffApi.healthCheck();
      const timing = Date.now() - startTime;
      
      addResult({
        test: 'Staff API Client',
        status: result.success ? 'success' : 'error',
        message: result.success ? 'Connection successful' : result.error || 'Failed',
        details: result.data,
        timing
      });
    } catch (error) {
      addResult({
        test: 'Staff API Client',
        status: 'error',
        message: `Error: ${(error as Error).message}`
      });
    }

    // Test 5: Registration API Test
    try {
      const startTime = Date.now();
      const result = await staffApi.register(testEmail, 'testpass123', testPhone);
      const timing = Date.now() - startTime;
      
      addResult({
        test: 'Registration API',
        status: result.success || result.error?.includes('already exists') ? 'success' : 'error',
        message: result.success ? 'API responding correctly' : result.error || 'Failed',
        details: result.data,
        timing
      });
    } catch (error) {
      addResult({
        test: 'Registration API',
        status: 'error',
        message: `Error: ${(error as Error).message}`
      });
    }

    // Test 6: Direct apiFetch Test
    try {
      const startTime = Date.now();
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'direct-test@example.com',
          password: 'testpass123',
          phone: '+15878881837'
        })
      });
      const timing = Date.now() - startTime;
      
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
        addResult({
          test: 'Direct apiFetch',
          status: 'success',
          message: `Status: ${response.status}, Content: JSON`,
          details: responseData,
          timing
        });
      } else {
        const text = await response.text();
        addResult({
          test: 'Direct apiFetch',
          status: 'error',
          message: `Status: ${response.status}, Content: HTML (CORS Issue)`,
          details: { contentType, preview: text.substring(0, 100) },
          timing
        });
      }
    } catch (error) {
      addResult({
        test: 'Direct apiFetch',
        status: 'error',
        message: `Error: ${(error as Error).message}`
      });
    }

    setIsRunning(false);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Diagnostic Tool</CardTitle>
            <p className="text-sm text-gray-600">
              Diagnose API connectivity and CORS configuration between client and staff backend
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-email">Test Email</Label>
                <Input
                  id="test-email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="test-phone">Test Phone</Label>
                <Input
                  id="test-phone"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </div>
            </div>
            
            <Button onClick={runDiagnostics} disabled={isRunning} className="w-full">
              {isRunning ? 'Running Diagnostics...' : 'Run Network Diagnostics'}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{result.test}</h3>
                  <div className="flex items-center gap-2">
                    {result.timing && (
                      <span className="text-sm text-gray-500">{result.timing}ms</span>
                    )}
                    <Badge variant={getBadgeVariant(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">{result.message}</p>
                  {result.url && (
                    <p className="text-xs text-gray-500">URL: {result.url}</p>
                  )}
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600">Show Details</summary>
                      <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}