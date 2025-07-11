import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLenderProducts } from '../api/lenderProducts';

export default function LenderDataTest() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: lenderProducts, isLoading, error, refetch } = useQuery({
    queryKey: ['lender-products', refreshTrigger],
    queryFn: fetchLenderProducts,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    refetch();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Lender Product Data Test</h1>
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Data
          </button>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              isLoading ? 'bg-yellow-500' : 
              error ? 'bg-red-500' : 
              'bg-green-500'
            }`}></span>
            <span className="text-sm">
              {isLoading ? 'Loading...' : 
               error ? 'Error' : 
               `${lenderProducts?.length || 0} products loaded`}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800">Error Details:</h3>
          <p className="text-red-700">{error.message}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading lender products...</span>
        </div>
      )}

      {lenderProducts && lenderProducts.length > 0 && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Success!</h3>
            <p className="text-green-700">
              Successfully loaded {lenderProducts.length} lender products.
            </p>
            <div className="mt-2 text-sm text-green-600">
              <p>Categories: {[...new Set(lenderProducts.map(p => p.category))].join(', ')}</p>
              <p>Countries: {[...new Set(lenderProducts.map(p => p.country))].join(', ')}</p>
              <p>Max Funding: ${Math.max(...lenderProducts.map(p => p.maxAmount)).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lenderProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{product.lenderName}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Amount: ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}</p>
                  <p>Geography: {product.geography.join(', ')}</p>
                  {product.minRevenue > 0 && (
                    <p>Min Revenue: ${product.minRevenue.toLocaleString()}/mo</p>
                  )}
                </div>
                {product.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}