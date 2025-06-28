import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SimpleBackendTest() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testUrls = [
    'https://staffportal.replit.app',
    'https://staffportal.replit.app/api',
    'https://staffportal.replit.app/api/health',
    'https://staffportal.replit.app/api/users'
  ];

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);
    const testResults = [];

    for (const url of testUrls) {
      try {
        const startTime = Date.now();
        const response = await fetch(url, {
          method: 'GET',
          mode: 'no-cors' // First try without CORS to see if URL exists
        });
        const timing = Date.now() - startTime;
        
        testResults.push({
          url,
          status: 'reachable',
          message: `No-CORS request completed (${timing}ms)`,
          timing
        });
      } catch (error: any) {
        testResults.push({
          url,
          status: 'error',
          message: `Error: ${error.message}`,
          error: error.name
        });
      }
    }

    // Now try with CORS
    for (const url of testUrls) {
      try {
        const startTime = Date.now();
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include'
        });
        const timing = Date.now() - startTime;
        
        testResults.push({
          url: url + ' (CORS)',
          status: response.ok ? 'success' : 'http_error',
          message: `${response.status} ${response.statusText} (${timing}ms)`,
          timing,
          statusCode: response.status
        });
      } catch (error: any) {
        testResults.push({
          url: url + ' (CORS)',
          status: 'cors_error',
          message: `CORS Error: ${error.message}`,
          error: error.name
        });
      }
    }

    setResults(testResults);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'reachable': return 'bg-blue-100 text-blue-800';
      case 'http_error': return 'bg-orange-100 text-orange-800';
      case 'cors_error': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Simple Backend Connectivity Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Test basic connectivity to staff backend URLs
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing Connectivity...' : 'Run Connectivity Tests'}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              {results.map((result, index) => (
                <div key={index} className={`p-3 rounded border ${getStatusColor(result.status)}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{result.url}</p>
                      <p className="text-xs">{result.message}</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {result.status.toUpperCase()}
                      </Badge>
                      {result.timing && (
                        <Badge variant="outline" className="text-xs">
                          {result.timing}ms
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">What the results mean:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>REACHABLE</strong>: URL exists but may have CORS restrictions</li>
              <li>• <strong>SUCCESS</strong>: Full access with CORS enabled</li>
              <li>• <strong>HTTP_ERROR</strong>: Server responds but with error status</li>
              <li>• <strong>CORS_ERROR</strong>: Server blocks cross-origin requests</li>
              <li>• <strong>ERROR</strong>: URL completely unreachable</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}