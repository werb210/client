import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthAPI } from '@/lib/authApi';
import { API_BASE_URL } from '@/constants';

export default function DebugTest() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testStaffBackend = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      addResult(`Testing connection to: ${API_BASE_URL}`);
      
      // Test 1: Basic connectivity to staff backend
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include'
        });
        addResult(`Health check: ${response.status} ${response.statusText}`);
        if (response.ok) {
          const data = await response.text();
          addResult(`Health response: ${data}`);
        }
      } catch (error) {
        addResult(`Health check failed: ${error}`);
      }

      // Test 1.5: Test root API endpoint
      try {
        const response = await fetch(`${API_BASE_URL}/`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include'
        });
        addResult(`Root API: ${response.status} ${response.statusText}`);
      } catch (error) {
        addResult(`Root API failed: ${error}`);
      }

      // Test 2: CORS preflight for auth/register
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'OPTIONS',
          mode: 'cors',
          headers: {
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        });
        addResult(`CORS preflight: ${response.status} ${response.statusText}`);
        
        // Log CORS headers
        const corsHeaders = [
          'Access-Control-Allow-Origin',
          'Access-Control-Allow-Methods',
          'Access-Control-Allow-Headers',
          'Access-Control-Allow-Credentials'
        ];
        
        corsHeaders.forEach(header => {
          const value = response.headers.get(header);
          addResult(`${header}: ${value || 'NOT SET'}`);
        });
      } catch (error) {
        addResult(`CORS preflight failed: ${error}`);
      }

      // Test 3: Actual registration attempt
      try {
        const testData = {
          email: 'debug@test.com',
          phone: '+15878881837',
          password: 'testpass123'
        };
        
        addResult(`Attempting registration with: ${JSON.stringify(testData)}`);
        
        // Direct fetch to bypass AuthAPI wrapper
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          body: JSON.stringify(testData)
        });
        
        addResult(`Registration response: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        addResult(`Response body: ${responseText}`);
        addResult(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
        
      } catch (error) {
        addResult(`Registration failed: ${error}`);
      }

    } catch (error) {
      addResult(`Test suite failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Staff Backend Debug Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testStaffBackend} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Run Debug Tests'}
          </Button>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-500">No tests run yet</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}