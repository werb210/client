import React, { useState } from 'react';
import { usePublicLenders } from '@/hooks/usePublicLenders';

/**
 * DEBUG BYPASS COMPONENT
 * Temporarily shows all cached products to test if Step 2 UI works
 */
export function Step2DebugBypass() {
  const { data: products = [], isLoading, error } = usePublicLenders();
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="p-4 border-2 border-red-500 bg-red-50 rounded-lg">
      <h3 className="text-lg font-bold text-red-700 mb-2">🚨 DEBUG MODE - STEP 2 CACHE TEST</h3>
      
      <button 
        onClick={() => setShowDebug(!showDebug)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        {showDebug ? 'Hide' : 'Show'} Raw Cache Data ({products.length} products)
      </button>

      {showDebug && (
        <div className="mt-4 space-y-2">
          <div className="text-sm">
            <strong>Cache Status:</strong> {isLoading ? 'Loading...' : 'Loaded'}
          </div>
          <div className="text-sm">
            <strong>Error:</strong> {error ? error.message : 'None'}
          </div>
          <div className="text-sm">
            <strong>Product Count:</strong> {products.length}
          </div>

          {products.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold mb-2">First 5 Products from Cache:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {products.slice(0, 5).map((product, index) => (
                  <div key={index} className="p-2 bg-white rounded border text-xs">
                    <div><strong>Name:</strong> {product.name}</div>
                    <div><strong>Category:</strong> {product.category}</div>
                    <div><strong>Country:</strong> {product.country}</div>
                    <div><strong>Amount Range:</strong> ${product.minAmount?.toLocaleString()} - ${product.maxAmount?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {products.length === 0 && !isLoading && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
              <h4 className="font-bold text-yellow-800">⚠️ NO PRODUCTS IN CACHE</h4>
              <p className="text-yellow-700">IndexedDB cache is empty. Need to populate cache first.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}