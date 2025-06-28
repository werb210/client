import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ApiTest() {
  const [email, setEmail] = useState('todd@werboweski.com');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testDirectFetch = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('Testing direct fetch to staff backend...');
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
      
      const url = `${import.meta.env.VITE_API_BASE_URL}/auth/request-reset`;
      console.log('Full URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      let responseData;
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
        console.log('JSON response:', responseData);
      } else {
        responseData = await response.text();
        console.log('Text response preview:', responseData.substring(0, 500));
      }

      setResult({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        contentType,
        data: responseData,
        url,
      });

    } catch (error) {
      console.error('API Test error:', error);
      setResult({
        error: error.message,
        url: `${import.meta.env.VITE_API_BASE_URL}/auth/request-reset`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testHealthEndpoint = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/health`;
      console.log('Testing health endpoint:', url);

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      });

      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      setResult({
        endpoint: 'health',
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        contentType,
        data: responseData,
        url,
      });

    } catch (error) {
      console.error('Health endpoint error:', error);
      setResult({
        endpoint: 'health',
        error: error.message,
        url: `${import.meta.env.VITE_API_BASE_URL}/health`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-teal-700">
            API Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Environment</h3>
            <div className="text-sm space-y-1">
              <div><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'NOT SET'}</div>
              <div><strong>Mode:</strong> {import.meta.env.MODE}</div>
              <div><strong>Dev:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <div>
            <Label htmlFor="email">Test Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="todd@werboweski.com"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={testHealthEndpoint} 
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? 'Testing...' : 'Test Health Endpoint'}
            </Button>
            
            <Button 
              onClick={testDirectFetch} 
              disabled={isLoading}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {isLoading ? 'Testing...' : 'Test Password Reset'}
            </Button>
          </div>

          {result && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}