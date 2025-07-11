import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignNowNetworkTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, status: 'success' | 'error' | 'info', details: any) => {
    setTestResults(prev => [...prev, { test, status, details, timestamp: new Date().toISOString() }]);
  };

  const testSignNowIntegration = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: Environment Variable
    addResult('Environment Check', 'info', {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      expectedValue: '/api',
      matches: import.meta.env.VITE_API_BASE_URL === '/api'
    });

    // Test 2: OPTIONS Request
    const testId = 'test-uuid-12345';
    const signNowUrl = `${import.meta.env.VITE_API_BASE_URL}/applications/${testId}/signnow`;
    
    addResult('Endpoint Construction', 'info', {
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      testId: testId,
      fullUrl: signNowUrl
    });

    try {
      // Test OPTIONS request
      const optionsResponse = await fetch(signNowUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      addResult('OPTIONS Request', optionsResponse.ok ? 'success' : 'error', {
        status: optionsResponse.status,
        statusText: optionsResponse.statusText,
        headers: Object.fromEntries(optionsResponse.headers.entries())
      });

    } catch (error) {
      addResult('OPTIONS Request', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'Network/CORS Error'
      });
    }

    try {
      // Test POST request
      const postResponse = await fetch(signNowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: testId,
          test: true
        })
      });

      const responseText = await postResponse.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      addResult('POST Request', postResponse.ok ? 'success' : 'error', {
        status: postResponse.status,
        statusText: postResponse.statusText,
        headers: Object.fromEntries(postResponse.headers.entries()),
        body: responseData
      });

    } catch (error) {
      addResult('POST Request', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof TypeError && error.message.includes('CORS') ? 'CORS Error' : 'Network Error'
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>SignNow Network Integration Test</CardTitle>
          <CardDescription>
            Test the SignNow endpoint integration and verify CORS resolution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testSignNowIntegration}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Run SignNow Network Test'}
          </Button>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <Card key={index} className={`border-l-4 ${
                result.status === 'success' ? 'border-l-green-500' :
                result.status === 'error' ? 'border-l-red-500' :
                'border-l-blue-500'
              }`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {result.status === 'success' ? '✅' : 
                     result.status === 'error' ? '❌' : 'ℹ️'}
                    {result.test}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {result.timestamp}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Expected Results:</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Environment: VITE_API_BASE_URL = "/api"</li>
              <li>✅ OPTIONS Request: Status 200/204 (No CORS errors)</li>
              <li>❌ POST Request: Status 404/501 (Staff backend not implemented)</li>
              <li>🚫 No CORS errors in any request</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}