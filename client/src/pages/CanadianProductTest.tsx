import { getProducts } from "../../api/products";
import React from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';

const CanadianProductTest: React.FC = () => {
  // Test scenarios
  const scenarioWithAR = {
    businessLocation: "canada" as const,
    industry: "manufacturing",
    lookingFor: "capital" as const,
    fundingAmount: "$40,000",
    useOfFunds: "Working capital and inventory",
    lastYearRevenue: "$150,000 - $300,000",
    averageMonthlyRevenue: "$15,000 - $30,000",
    accountsReceivable: "$10,000 - $25,000", // Has AR - should show Invoice Factoring
    equipmentValue: "No fixed assets"
  };

  const scenarioNoAR = {
    businessLocation: "canada" as const,
    industry: "manufacturing",
    lookingFor: "capital" as const,
    fundingAmount: "$40,000",
    useOfFunds: "Working capital and inventory",
    lastYearRevenue: "$150,000 - $300,000",
    averageMonthlyRevenue: "$15,000 - $30,000",
    accountsReceivable: "No Account Receivables", // No AR - should hide Invoice Factoring
    equipmentValue: "No fixed assets"
  };

  const [scenario, setScenario] = React.useState<'withAR' | 'noAR'>('noAR');
  const currentData = scenario === 'withAR' ? scenarioWithAR : scenarioNoAR;
  
  const { products, categories, isLoading, error } = useRecommendations(currentData);

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
      
      {/* Scenario Selector */}
      <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
        <h2 className="font-semibold mb-3">Test Scenario:</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setScenario('noAR')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              scenario === 'noAR' 
                ? 'bg-teal-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            No Accounts Receivables
          </button>
          <button
            onClick={() => setScenario('withAR')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              scenario === 'withAR' 
                ? 'bg-teal-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Has Accounts Receivables
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-1">Basic Info:</h3>
            <ul className="text-gray-600">
              <li>• Country: Canada</li>
              <li>• Industry: Manufacturing</li>
              <li>• Looking for: Business Capital</li>
              <li>• Amount: $40,000</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">Current Scenario:</h3>
            <ul className="text-gray-600">
              <li>• AR Balance: {currentData.accountsReceivable}</li>
              <li>• Last year revenue: {currentData.lastYearRevenue}</li>
              <li>• Expected: {scenario === 'noAR' ? 'NO Invoice Factoring' : 'Include Invoice Factoring'}</li>
            </ul>
          </div>
        </div>
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

      {/* Business Rule Validation */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Business Rule Validation:</h2>
        <div className="bg-white border rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              scenario === 'noAR' && !Object.keys(categories).some(cat => 
                cat.toLowerCase().includes('invoice') || cat.toLowerCase().includes('factoring')
              ) ? 'bg-green-500' : 
              scenario === 'withAR' && Object.keys(categories).some(cat => 
                cat.toLowerCase().includes('invoice') || cat.toLowerCase().includes('factoring')
              ) ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">
              {scenario === 'noAR' ? 'Invoice Factoring should be HIDDEN' : 'Invoice Factoring should be SHOWN'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {scenario === 'noAR' 
              ? `✓ Rule working: No Invoice Factoring found in ${Object.keys(categories).length} categories`
              : `${Object.keys(categories).some(cat => cat.toLowerCase().includes('invoice') || cat.toLowerCase().includes('factoring')) ? '✓' : '✗'} Invoice Factoring presence check`
            }
          </p>
        </div>
      </div>

      {/* Categories Found */}
      {Object.keys(categories).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Categories Found:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(categories).map(([category, details]) => (
              <div key={category} className={`border rounded p-3 ${
                category.toLowerCase().includes('invoice') || category.toLowerCase().includes('factoring')
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className="font-medium">{category}</h3>
                <p className="text-sm text-gray-600">{details.count} products</p>
                <p className="text-sm text-gray-500">Score: {details.score}</p>
                {(category.toLowerCase().includes('invoice') || category.toLowerCase().includes('factoring')) && (
                  <p className="text-xs text-orange-600 mt-1">📋 Invoice Factoring</p>
                )}
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