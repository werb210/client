import React from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';

const CanadianProductTest: React.FC = () => {
  // Canadian business capital scenario: $40,000, manufacturing
  const canadianFormData = {
    businessLocation: "canada" as const,
    industry: "manufacturing",
    lookingFor: "capital" as const,
    fundingAmount: "$40,000",
    useOfFunds: "Working capital and inventory",
    lastYearRevenue: "$150,000 - $300,000",
    averageMonthlyRevenue: "$15,000 - $30,000",
    accountsReceivable: "$10,000 - $25,000",
    equipmentValue: "No fixed assets"
  };

  const { products, categories, isLoading, error } = useRecommendations(canadianFormData);

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Canadian Product Test</h1>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Canadian Product Test</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-700">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Canadian Business Capital Test</h1>
      
      {/* Test Scenario */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Test Scenario:</h2>
        <ul className="text-sm">
          <li>• Country: Canada</li>
          <li>• Industry: Manufacturing</li>
          <li>• Looking for: Business Capital</li>
          <li>• Amount: $40,000</li>
          <li>• Last year revenue: $150,000 - $300,000</li>
        </ul>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold text-gray-600">Total Products</h3>
          <p className="text-2xl font-bold text-teal-600">{products.length}</p>
        </div>
        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold text-gray-600">Categories</h3>
          <p className="text-2xl font-bold text-orange-600">{Object.keys(categories).length}</p>
        </div>
        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold text-gray-600">Expected</h3>
          <p className="text-sm text-gray-500">Should find Canadian working capital, line of credit, term loans</p>
        </div>
      </div>

      {/* Categories Found */}
      {Object.keys(categories).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Categories Found:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(categories).map(([category, details]) => (
              <div key={category} className="bg-white border rounded p-3">
                <h3 className="font-medium">{category}</h3>
                <p className="text-sm text-gray-600">{details.count} products</p>
                <p className="text-sm text-gray-500">Score: {details.score}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Products */}
      {products.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Matching Products:</h2>
          <div className="space-y-3">
            {products.slice(0, 10).map((match, index) => (
              <div key={match.product.id} className="bg-white border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{match.product.productName}</h3>
                    <p className="text-sm text-gray-600">{match.product.lenderName}</p>
                    <p className="text-sm text-gray-500">{match.product.category} • {match.product.country}</p>
                    <p className="text-sm text-gray-500">
                      Range: ${match.product.amountRange.min.toLocaleString()} - ${match.product.amountRange.max.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm">
                      Score: {match.score}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {products.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h2 className="font-semibold text-yellow-800 mb-2">No Products Found</h2>
          <p className="text-yellow-700 text-sm">
            This indicates a filtering issue. For a Canadian business looking for $40,000 in capital, 
            we should find several products including working capital lines and term loans.
          </p>
        </div>
      )}
    </div>
  );
};

export default CanadianProductTest;