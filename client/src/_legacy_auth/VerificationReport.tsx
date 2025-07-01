import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { API_BASE_URL } from '@/constants';

interface VerificationItem {
  id: string;
  category: string;
  requirement: string;
  status: 'pass' | 'fail' | 'pending' | 'warning';
  details?: string;
  tested?: boolean;
}

export default function VerificationReport() {
  const [verificationResults, setVerificationResults] = useState<VerificationItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const verificationItems: VerificationItem[] = [
    {
      id: 'cors-credentials',
      category: 'CORS Configuration',
      requirement: 'All API calls use credentials: "include"',
      status: 'pending'
    },
    {
      id: 'cors-mode',
      category: 'CORS Configuration', 
      requirement: 'All API calls use mode: "cors"',
      status: 'pending'
    },
    {
      id: 'options-preflight',
      category: 'CORS Headers',
      requirement: 'OPTIONS preflight returns proper headers',
      status: 'pending'
    },
    {
      id: 'auth-endpoint',
      category: 'CORS Headers',
      requirement: 'GET /api/auth/user returns CORS headers',
      status: 'pending'
    },
    {
      id: 'no-fetch-errors',
      category: 'Connectivity',
      requirement: 'No "Failed to fetch" errors in diagnostics',
      status: 'pending'
    },
    {
      id: 'application-submit',
      category: 'API Endpoints',
      requirement: 'POST /api/applications/submit succeeds',
      status: 'pending'
    }
  ];

  const runVerification = async () => {
    setIsRunning(true);
    const results = [...verificationItems];

    // Test 1: Verify credentials configuration in code
    try {
      // Check if apiRequest function exists and has correct config
      const response = await fetch('/src/lib/api.ts');
      if (response.ok) {
        const apiCode = await response.text();
        const hasCredentials = apiCode.includes("credentials: 'include'");
        const hasCorsMode = apiCode.includes("mode: 'cors'");
        
        results[0].status = hasCredentials ? 'pass' : 'fail';
        results[0].details = hasCredentials ? 'Found credentials: "include" in API configuration' : 'Missing credentials: "include"';
        results[0].tested = true;

        results[1].status = hasCorsMode ? 'pass' : 'fail';
        results[1].details = hasCorsMode ? 'Found mode: "cors" in API configuration' : 'Missing mode: "cors"';
        results[1].tested = true;
      }
    } catch (error) {
      results[0].status = 'warning';
      results[0].details = 'Could not verify code configuration';
      results[1].status = 'warning';
      results[1].details = 'Could not verify code configuration';
    }

    // Test 2: OPTIONS preflight test
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
      const allowCredentials = response.headers.get('Access-Control-Allow-Credentials');
      const allowMethods = response.headers.get('Access-Control-Allow-Methods');

      if (response.ok || response.status === 204) {
        if (allowOrigin && allowCredentials === 'true' && allowMethods) {
          results[2].status = 'pass';
          results[2].details = `Origin: ${allowOrigin}, Credentials: ${allowCredentials}, Methods: ${allowMethods}`;
        } else {
          results[2].status = 'warning';
          results[2].details = `Missing headers - Origin: ${allowOrigin}, Credentials: ${allowCredentials}`;
        }
      } else {
        results[2].status = 'fail';
        results[2].details = `OPTIONS request failed with status ${response.status}`;
      }
      results[2].tested = true;
    } catch (error) {
      results[2].status = 'fail';
      results[2].details = error instanceof Error ? error.message : 'OPTIONS request failed';
      results[2].tested = true;
    }

    // Test 3: GET /api/auth/user CORS headers
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });

      const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
      const allowCredentials = response.headers.get('Access-Control-Allow-Credentials');

      if (response.status !== 0) {
        if (allowOrigin && allowCredentials === 'true') {
          results[3].status = 'pass';
          results[3].details = `Status: ${response.status}, Origin: ${allowOrigin}, Credentials: ${allowCredentials}`;
        } else {
          results[3].status = 'warning';
          results[3].details = `Status: ${response.status}, Missing CORS headers`;
        }
      } else {
        results[3].status = 'fail';
        results[3].details = 'Request blocked - likely CORS issue';
      }
      results[3].tested = true;
    } catch (error) {
      results[3].status = 'fail';
      results[3].details = error instanceof Error ? error.message : 'GET request failed';
      results[3].tested = true;

      // Check for "Failed to fetch" specifically
      if (error instanceof Error && error.message === 'Failed to fetch') {
        results[4].status = 'fail';
        results[4].details = 'Detected "Failed to fetch" error - CORS or network issue';
        results[4].tested = true;
      }
    }

    // Test 4: Application submit endpoint test
    try {
      const testPayload = {
        test: true,
        businessInfo: { legalName: 'Test Company' },
        personalDetails: { name: 'Test User' }
      };

      const response = await fetch(`${API_BASE_URL}/applications/submit`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      if (response.status === 401) {
        results[5].status = 'warning';
        results[5].details = 'Endpoint reachable but requires authentication (expected)';
      } else if (response.ok) {
        results[5].status = 'pass';
        results[5].details = `Submit endpoint working - Status: ${response.status}`;
      } else {
        results[5].status = 'warning';
        results[5].details = `Submit endpoint responds but with status: ${response.status}`;
      }
      results[5].tested = true;
    } catch (error) {
      results[5].status = 'fail';
      results[5].details = error instanceof Error ? error.message : 'Submit endpoint failed';
      results[5].tested = true;
    }

    // Set remaining untested items
    results.forEach(item => {
      if (!item.tested && item.status === 'pending') {
        item.status = 'warning';
        item.details = 'Test not completed';
      }
    });

    setVerificationResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'fail': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const passCount = verificationResults.filter(r => r.status === 'pass').length;
  const totalCount = verificationResults.length;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CORS Verification Report</h1>
        <p className="text-gray-600">
          Comprehensive verification of client application CORS configuration
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg">
              {verificationResults.length > 0 && (
                <span className={`font-semibold ${passCount === totalCount ? 'text-green-600' : 'text-red-600'}`}>
                  {passCount}/{totalCount} Requirements Met
                </span>
              )}
            </div>
            <Button onClick={runVerification} disabled={isRunning}>
              {isRunning ? 'Running Verification...' : 'Run CORS Verification'}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Client Origin:</strong> {window.location.origin}</p>
            <p><strong>Staff Backend:</strong> {API_BASE_URL}</p>
            <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
          </div>
        </CardContent>
      </Card>

      {verificationResults.length > 0 && (
        <div className="space-y-4">
          {verificationResults.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{item.requirement}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{item.category}</p>
                      {item.details && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Expected CORS Response Headers</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
{`HTTP/1.1 200 OK
Access-Control-Allow-Origin: ${window.location.origin}
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization`}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}