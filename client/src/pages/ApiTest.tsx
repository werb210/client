import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchLenderProducts } from '@/api/lenderProducts';

export default function ApiTest() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<string>('');

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setProducts([]);
    setApiSource('');
    
    try {
      // Diagnostic 1: Check environment variables
      console.log('=== DIAGNOSTIC 1: Environment Variables ===');
      console.log('VITE_STAFF_API_URL:', import.meta.env.VITE_STAFF_API_URL);
      console.log('Expected URL: https://staffportal.replit.app');
      
      // Diagnostic 2: Direct fetch test
      console.log('=== DIAGNOSTIC 2: Direct Fetch Test ===');
      const directUrl = 'https://staffportal.replit.app/api/public/lenders';
      console.log('Testing direct fetch to:', directUrl);
      
      try {
        const directResponse = await fetch(directUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        console.log('Direct fetch status:', directResponse.status);
        console.log('Direct fetch ok:', directResponse.ok);
        console.log('Response headers:', Object.fromEntries(directResponse.headers.entries()));
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log('✅ Direct fetch success! Product count:', directData.length);
        } else {
          console.log('❌ Direct fetch failed with status:', directResponse.status);
        }
      } catch (directError) {
        console.log('❌ Direct fetch error:', directError);
      }
      
      // Diagnostic 3: Use existing API function
      console.log('=== DIAGNOSTIC 3: Using API Function ===');
      console.log('Testing lender products API...');
      const result = await fetchLenderProducts();
      setProducts(result);
      setApiSource(result.length > 8 ? 'Staff API (43+ products)' : 'Local Fallback (8 products)');
      console.log(`API Test Success: ${result.length} products loaded`);
      
      // Diagnostic 4: CORS Check
      console.log('=== DIAGNOSTIC 4: CORS Status ===');
      if (result.length > 8) {
        console.log('🎉 CORS RESOLVED! Staff API accessible with 43+ products');
      } else {
        console.log('⚠️ CORS still blocked - using 8-product local fallback');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('API Test Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
            <CardTitle className="text-2xl font-bold">Lender Products API Test</CardTitle>
            <p className="text-teal-100">Testing connection to staff backend and product data</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={testApi} 
                  disabled={loading}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {loading ? 'Testing...' : 'Test API Connection'}
                </Button>
                
                {apiSource && (
                  <div className="text-sm text-gray-600">
                    <strong>Source:</strong> {apiSource}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-red-800 font-semibold">API Error</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {products.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-green-800 font-semibold">
                      Success: {products.length} Products Loaded
                    </h3>
                    <p className="text-green-600">
                      {products.length > 8 
                        ? '🎉 Staff API connected! Full product dataset available.'
                        : '⚠️ Using local fallback. Staff API may need CORS configuration.'
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.slice(0, 6).map((product) => (
                      <div key={product.id} className="border rounded-lg p-4 bg-white">
                        <h4 className="font-semibold text-gray-900">{product.productName}</h4>
                        <p className="text-sm text-gray-600">{product.lenderName}</p>
                        <p className="text-sm text-teal-600">{product.productType}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          ${product.minAmount?.toLocaleString()} - ${product.maxAmount?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {products.length > 6 && (
                    <p className="text-center text-gray-500">
                      ...and {products.length - 6} more products
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}