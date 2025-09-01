import { useState } from "react";
import { getProducts } from "../api/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TestResult {
  endpoint: string;
  status: 'testing' | 'success' | 'error';
  data?: any;
  error?: string;
  responseTime?: number;
}

export const ApiEndpointTester = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testEndpoint = async (url: string, label: string): Promise<TestResult> => { /* ensure products fetched */ 
    const startTime = Date.now();
    try {
      const response = await fetch(url, { credentials: 'include' }).catch(fetchError => {
        throw new Error(`Network error: ${fetchError.message}`);
      });
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        return {
          endpoint: label,
          status: 'error',
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }
      
      const data = await response.json().catch(jsonError => {
        throw new Error(`JSON parse error: ${jsonError.message}`);
      });
      return {
        endpoint: label,
        status: 'success',
        data: data,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint: label,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      };
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests = [

      { url: '/api/public/lenders', label: 'Staff Public API - 43 Products (Production)' },
      { url: '/api/lenders/products', label: 'Staff Direct API - All Products' },
    ];

    const testResults: TestResult[] = [];

    for (const test of tests) {
      setResults(prev => [...prev, { endpoint: test.label, status: 'testing' }]);
      
      const result = await testEndpoint(test.url, test.label).catch(error => ({
        endpoint: test.label,
        status: 'error' as const,
        error: `Test failed: ${error.message}`,
        responseTime: 0
      }));
      testResults.push(result);
      
      setResults(prev => 
        prev.map(r => r.endpoint === test.label ? result : r)
      );
    }

    setIsRunning(false);
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const products = await getProducts();
return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">API Endpoint Tester</h2>
        <Button onClick={runTests} disabled={isRunning}>
          {isRunning ? 'Running Tests...' : 'Test All Endpoints'}
        </Button>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <p><strong>Development Mode:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</p>
        <p><strong>Staff API URL:</strong> {import.meta.env.VITE_STAFF_API_URL || 'Not set'}</p>
        <p><strong>Expected Behavior:</strong></p>
        <ul className="list-disc ml-4 mt-2">
          <li>Development: Local API endpoints have been removed - using staff backend only</li>
          <li>Production: Should use staff endpoints (/api/public/lenders)</li>
        </ul>
      </div>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{result.endpoint}</CardTitle>
                {getStatusBadge(result.status)}
              </div>
            </CardHeader>
            <CardContent>
              {result.responseTime && (
                <p className="text-sm text-gray-600 mb-2">
                  Response time: {result.responseTime}ms
                </p>
              )}
              
              {result.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                  <p className="text-red-700 text-sm">{result.error}</p>
                </div>
              )}
              
              {result.data && (
                <div className="bg-gray-50 border rounded p-3">
                  <p className="text-sm font-medium mb-2">Response:</p>
                  {result.data.products ? (
                    <div>
                      <p className="text-sm">Products found: {result.data.products.length}</p>
                      {result.data.products.slice(0, 2).map((product: any) => (
                        <div key={product.id} className="mt-2 text-xs bg-white p-2 rounded">
                          <strong>{product.lender_name}</strong> - {product.product_name}
                        </div>
                      ))}
                      {result.data.products.length > 2 && (
                        <p className="text-xs text-gray-500 mt-1">
                          ...and {result.data.products.length - 2} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};