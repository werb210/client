import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ApiConnectivityTest() {
  const [testResults, setTestResults] = useState<any[]>([]);

  const runConnectivityTest = async () => {
    console.log('[TEST] Starting comprehensive API connectivity test');
    const results: any[] = [];
    
    // Test 1: Direct fetch to /api/public/lenders
    try {
      console.log('[TEST] Testing direct fetch to /api/public/lenders');
      const response = await fetch('/api/public/lenders', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[TEST] Response status:', response.status);
      console.log('[TEST] Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[TEST] ✅ Direct fetch success:', data);
        results.push({
          test: 'Direct fetch to /api/public/lenders',
          status: 'SUCCESS',
          data: `${data.count || data.products?.length || 0} products`
        });
      } else {
        results.push({
          test: 'Direct fetch to /api/public/lenders',
          status: 'FAILED',
          error: `HTTP ${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      console.error('[TEST] ❌ Direct fetch error:', error);
      results.push({
        test: 'Direct fetch to /api/public/lenders',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Using lenderDataFetcher
    try {
      console.log('[TEST] Testing lenderDataFetcher');
      const { fetchLenderProducts } = await import('@/api/lenderDataFetcher');
      const result = await fetchLenderProducts();
      
      console.log('[TEST] ✅ lenderDataFetcher success:', result);
      results.push({
        test: 'lenderDataFetcher.fetchLenderProducts()',
        status: 'SUCCESS',
        data: `${result.count} products from ${result.source}`
      });
    } catch (error) {
      console.error('[TEST] ❌ lenderDataFetcher error:', error);
      results.push({
        test: 'lenderDataFetcher.fetchLenderProducts()',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Using usePublicLenders query
    try {
      console.log('[TEST] Testing fetchLenderProducts from API');
      const { fetchLenderProducts } = await import('@/api/lenderProducts');
      const products = await fetchLenderProducts();
      
      console.log('[TEST] ✅ fetchLenderProducts success:', products);
      results.push({
        test: 'api/lenderProducts.fetchLenderProducts()',
        status: 'SUCCESS',
        data: `${products.length} products`
      });
    } catch (error) {
      console.error('[TEST] ❌ fetchLenderProducts error:', error);
      results.push({
        test: 'api/lenderProducts.fetchLenderProducts()',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
    console.log('[TEST] All tests completed:', results);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Connectivity Test</h1>
      
      <Button onClick={runConnectivityTest} className="mb-6">
        Run Connectivity Test
      </Button>
      
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results:</h2>
          {testResults.map((result, index) => (
            <div 
              key={index} 
              className={`p-4 border rounded-lg ${
                result.status === 'SUCCESS' ? 'border-green-500 bg-green-50' :
                result.status === 'FAILED' ? 'border-yellow-500 bg-yellow-50' :
                'border-red-500 bg-red-50'
              }`}
            >
              <h3 className="font-medium">{result.test}</h3>
              <p className={`text-sm ${
                result.status === 'SUCCESS' ? 'text-green-700' :
                result.status === 'FAILED' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                Status: {result.status}
              </p>
              {result.data && (
                <p className="text-sm text-gray-600">Data: {result.data}</p>
              )}
              {result.error && (
                <p className="text-sm text-red-600">Error: {result.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">Environment Info:</h3>
        <p className="text-sm">VITE_API_BASE_URL: {import.meta.env.VITE_API_BASE_URL}</p>
        <p className="text-sm">DEV mode: {import.meta.env.DEV ? 'true' : 'false'}</p>
        <p className="text-sm">PROD mode: {import.meta.env.PROD ? 'true' : 'false'}</p>
      </div>
    </div>
  );
}