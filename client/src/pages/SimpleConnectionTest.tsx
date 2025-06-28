import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/constants';

export default function SimpleConnectionTest() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setResult('Testing connection...\n');
    
    try {
      // Test basic fetch to staff backend
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });

      setResult(prev => prev + `Response status: ${response.status}\n`);
      setResult(prev => prev + `Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}\n`);
      
      if (response.ok) {
        const text = await response.text();
        setResult(prev => prev + `Response body: ${text}\n`);
        setResult(prev => prev + '✅ Connection successful\n');
      } else {
        const errorText = await response.text();
        setResult(prev => prev + `Error response: ${errorText}\n`);
        setResult(prev => prev + '❌ Connection failed\n');
      }
    } catch (error) {
      setResult(prev => prev + `Network error: ${error}\n`);
      setResult(prev => prev + '❌ Network request failed\n');
      
      // Additional debugging
      if (error instanceof TypeError && error.message.includes('CORS')) {
        setResult(prev => prev + '🔍 This appears to be a CORS issue\n');
      }
    }
    
    setIsLoading(false);
  };

  const testOTPEndpoint = async () => {
    setIsLoading(true);
    setResult('Testing registration endpoint...\n');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'test@example.com',
          phone: '+15878881837',
          password: 'testpass123'
        })
      });

      setResult(prev => prev + `Registration Response status: ${response.status}\n`);
      
      const responseText = await response.text();
      setResult(prev => prev + `Registration Response: ${responseText}\n`);
      
      if (response.ok) {
        setResult(prev => prev + '✅ Registration endpoint working\n');
      } else {
        setResult(prev => prev + '❌ Registration endpoint failed\n');
      }
    } catch (error) {
      setResult(prev => prev + `Registration Error: ${error}\n`);
      setResult(prev => prev + '❌ Registration request failed\n');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Simple Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
            <p><strong>Current Origin:</strong> {window.location.origin}</p>
          </div>
          
          <div className="space-x-2">
            <Button onClick={testConnection} disabled={isLoading}>
              Test Basic Connection
            </Button>
            <Button onClick={testOTPEndpoint} disabled={isLoading} variant="outline">
              Test Registration
            </Button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}