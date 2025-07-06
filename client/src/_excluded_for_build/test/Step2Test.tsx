import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCategoryName } from '../utils/formatters';
import { AlertTriangle, Loader2 } from '@/lib/icons';

export default function Step2Test() {
  const [testData, setTestData] = useState({
    headquarters: 'US',
    lookingFor: 'capital',
    fundingAmount: 50000,
    accountsReceivableBalance: 10000,
    fundsPurpose: 'working_capital'
  });

  // Test the real-time API endpoint
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/loan-products/categories', testData],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('country', testData.headquarters === 'US' ? 'united_states' : 'canada');
      params.append('lookingFor', testData.lookingFor);
      params.append('fundingAmount', `$${testData.fundingAmount.toLocaleString()}`);
      params.append('accountsReceivableBalance', testData.accountsReceivableBalance.toString());
      params.append('fundsPurpose', testData.fundsPurpose);

      console.log('🔍 Testing API with params:', params.toString());
      
      const response = await fetch(`/api/loan-products/categories?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('✅ API Response:', data);
      return data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Step 2 API Test - Recommendation Engine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Parameters */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">Test Parameters</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-blue-600 mb-1">Headquarters:</label>
                  <select 
                    value={testData.headquarters}
                    onChange={(e) => setTestData(prev => ({...prev, headquarters: e.target.value}))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-blue-600 mb-1">Looking For:</label>
                  <select 
                    value={testData.lookingFor}
                    onChange={(e) => setTestData(prev => ({...prev, lookingFor: e.target.value}))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="capital">Capital</option>
                    <option value="equipment">Equipment</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-blue-600 mb-1">Funding Amount:</label>
                  <input 
                    type="number"
                    value={testData.fundingAmount}
                    onChange={(e) => setTestData(prev => ({...prev, fundingAmount: parseInt(e.target.value)}))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-blue-600 mb-1">AR Balance:</label>
                  <input 
                    type="number"
                    value={testData.accountsReceivableBalance}
                    onChange={(e) => setTestData(prev => ({...prev, accountsReceivableBalance: parseInt(e.target.value)}))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <Button onClick={() => refetch()} className="mt-4">
                Test API Call
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">Testing API endpoint...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2 text-red-800 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">API Error</span>
                </div>
                <p className="text-red-700">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
              </div>
            )}

            {/* Success State */}
            {apiResponse && !isLoading && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">API Response Success</h3>
                  <p className="text-green-700">
                    Found {apiResponse.totalProducts || 0} total products across {apiResponse.data?.length || 0} categories
                  </p>
                </div>

                {/* Product Categories Display */}
                {apiResponse.data && apiResponse.data.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Product Categories Found:</h4>
                    {apiResponse.data.map((category: any, index: number) => (
                      <div key={category.category} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium">{formatCategoryName(category.category)}</h5>
                            <p className="text-sm text-gray-600">
                              {category.count} products ({category.percentage}%)
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                              Category #{index + 1}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Raw Response */}
                <details className="border rounded p-4">
                  <summary className="cursor-pointer font-medium">Raw API Response</summary>
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}