import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestStaffBackend() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    const tests = [
      {
        name: 'Health Check',
        url: 'https://staffportal.replit.app/api/health',
        method: 'GET'
      },
      {
        name: 'Registration Test',
        url: 'https://staffportal.replit.app/api/auth/register',
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'testpass123',
          phone: '+15878881837'
        }
      }
    ];

    for (const test of tests) {
      try {
        const response = await fetch(test.url, {
          method: test.method,
          credentials: 'include',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          ...(test.body && { body: JSON.stringify(test.body) })
        });

        const contentType = response.headers.get('content-type');
        let responseData;
        
        if (contentType?.includes('application/json')) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          responseData = text.substring(0, 200) + (text.length > 200 ? '...' : '');
        }

        setResults(prev => [...prev, {
          test: test.name,
          status: response.status,
          ok: response.ok,
          contentType,
          data: responseData,
          success: response.ok && contentType?.includes('application/json')
        }]);
      } catch (error) {
        setResults(prev => [...prev, {
          test: test.name,
          status: 'ERROR',
          ok: false,
          error: error.message,
          success: false
        }]);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Staff Backend API Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Run API Tests'}
            </Button>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{result.test}</h3>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Content-Type:</strong> {result.contentType || 'N/A'}</p>
                      <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>
                      {result.error && (
                        <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                      )}
                      <div>
                        <strong>Response:</strong>
                        <pre className="bg-gray-100 p-2 rounded mt-1 text-sm overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}