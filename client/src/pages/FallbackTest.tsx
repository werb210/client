import React, { useState } from 'react';
import { fetchLenderProducts } from '@/lib/api';
import { LenderProduct } from '../../../shared/lenderProductSchema';

export function FallbackTest() {
  const [products, setProducts] = useState<LenderProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFallback = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // console.log('🧪 [FALLBACK_TEST] Testing fallback system...');
      const data = await fetchLenderProducts();
      setProducts(data);
      // console.log(`✅ [FALLBACK_TEST] Success! Got ${data.length} products`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ [FALLBACK_TEST] Failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFallback = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // console.log('📦 [FALLBACK_TEST] Testing direct fallback file...');
      const response = await fetch('/fallback/lenders.json');
      if (!response.ok) {
        throw new Error(`Fallback fetch failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProducts(data.data);
      // console.log(`✅ [FALLBACK_TEST] Direct fallback success! Got ${data.data.length} products`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ [FALLBACK_TEST] Direct fallback failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Fallback System Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>🌍 VITE_API_BASE_URL: {import.meta.env.VITE_API_BASE_URL}</div>
            <div>🌍 VITE_STAFF_API_URL: {import.meta.env.VITE_STAFF_API_URL}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="space-x-4">
            <button
              onClick={testFallback}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test API with Fallback'}
            </button>
            
            <button
              onClick={testDirectFallback}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Direct Fallback'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Results ({products.length} products)
            </h2>
            <div className="grid gap-4">
              {products.map((product, index) => (
                <div key={product.id || index} className="border rounded p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><strong>Lender:</strong> {product.lenderName}</div>
                    <div><strong>Product:</strong> {product.name}</div>
                    <div><strong>Category:</strong> {product.category}</div>
                    <div><strong>Geography:</strong> {Array.isArray(product.geography) ? product.geography.join(', ') : product.geography}</div>
                    <div><strong>Min Amount:</strong> ${product.minAmount?.toLocaleString()}</div>
                    <div><strong>Max Amount:</strong> ${product.maxAmount?.toLocaleString()}</div>
                    <div><strong>Rate:</strong> {product.interestRateMin}</div>
                    <div><strong>Terms:</strong> {product.termMinMonths}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}