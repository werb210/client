import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface CorsTestResult {
  test: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function CorsTest() {
  const [results, setResults] = useState<CorsTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (testId: string, update: Partial<CorsTestResult>) => {
    setResults(prev => prev.map(result => 
      result.test === testId ? { ...result, ...update } : result
    ));
  };

  const runCorsTests = async () => {
    setIsRunning(true);
    
    const tests: CorsTestResult[] = [
      {
        test: 'simple-fetch',
        status: 'pending',
        message: 'Testing simple fetch to staff API'
      },
      {
        test: 'preflight-check',
        status: 'pending', 
        message: 'Testing CORS preflight behavior'
      },
      {
        test: 'response-headers',
        status: 'pending',
        message: 'Checking CORS response headers'
      },
      {
        test: 'network-connectivity',
        status: 'pending',
        message: 'Testing basic network connectivity'
      }
    ];

    setResults(tests);

    // Test 1: Simple fetch
    try {
      // console.log('=== CORS Test 1: Simple Fetch ===');
      const response = await fetch('https://staffportal.replit.app/api/public/lenders', {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });

      updateResult('simple-fetch', {
        status: 'success',
        message: `HTTP ${response.status} - ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        }
      });
    } catch (error) {
      console.error('Simple fetch failed:', error);
      updateResult('simple-fetch', {
        status: 'error',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Test 2: Check for CORS preflight
    try {
      // console.log('=== CORS Test 2: Preflight Check ===');
      const response = await fetch('https://staffportal.replit.app/api/public/lenders', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      const corsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
      };

      updateResult('preflight-check', {
        status: corsHeaders['access-control-allow-origin'] ? 'success' : 'warning',
        message: corsHeaders['access-control-allow-origin'] 
          ? `CORS headers present - Origin: ${corsHeaders['access-control-allow-origin']}`
          : 'No CORS headers found in preflight response',
        details: corsHeaders
      });
    } catch (error) {
      console.error('Preflight check failed:', error);
      updateResult('preflight-check', {
        status: 'error',
        message: `Preflight failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Test 3: Response Headers Analysis
    try {
      // console.log('=== CORS Test 3: Response Headers ===');
      const response = await fetch('https://staffportal.replit.app/api/public/lenders', {
        method: 'HEAD', // Just get headers
        mode: 'no-cors' // Bypass CORS to see what server returns
      });

      updateResult('response-headers', {
        status: 'success',
        message: 'Server responded to HEAD request',
        details: {
          status: response.status,
          type: response.type,
          headers: Object.fromEntries(response.headers.entries())
        }
      });
    } catch (error) {
      console.error('Response headers test failed:', error);
      updateResult('response-headers', {
        status: 'error',
        message: `Header check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Test 4: Network Connectivity (using no-cors to bypass CORS completely)
    try {
      // console.log('=== CORS Test 4: Network Connectivity ===');
      const response = await fetch('https://staffportal.replit.app', {
        method: 'GET',
        mode: 'no-cors'
      });

      updateResult('network-connectivity', {
        status: 'success',
        message: 'Staff app domain is reachable',
        details: {
          type: response.type,
          status: response.status
        }
      });
    } catch (error) {
      console.error('Network connectivity test failed:', error);
      updateResult('network-connectivity', {
        status: 'error',
        message: `Network unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runCorsTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'pending': return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      default: return <div className="h-5 w-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CORS Diagnostic Test
        </h1>
        <p className="text-gray-600">
          Testing cross-origin resource sharing between client and staff applications
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Test Progress</CardTitle>
            <Button onClick={runCorsTests} disabled={isRunning} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              Run Tests
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.test} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="mt-0.5">
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium capitalize">
                      {result.test.replace('-', ' ')}
                    </h3>
                    <Badge variant="outline" className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                  
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick CORS Fix Guide</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p><strong>If tests show CORS errors:</strong></p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Staff app needs CORS middleware with client domain allowlist</li>
            <li>Add <code>Access-Control-Allow-Origin</code> header for your client domain</li>
            <li>Ensure <code>/api/public/lenders</code> endpoint exists and returns JSON</li>
            <li>Verify staff app is deployed and responding to requests</li>
          </ol>
          
          <p className="mt-4"><strong>If network tests fail:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Staff app may be sleeping (wake it by visiting the URL)</li>
            <li>Deployment may have failed</li>
            <li>DNS or SSL certificate issues</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}