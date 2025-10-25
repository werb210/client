import { useState, useEffect } from 'react';
import { getProducts } from "../api/products";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';






import {CheckCircle, Database, Loader2, RefreshCw, XCircle} from 'lucide-react';
interface ApiResponse {
  products?: any[];
  total?: number;
  message?: string;
  error?: string;
}

export default function StaffApiTest() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTested, setLastTested] = useState<Date | null>(null);

  const testStaffApi = async () => { /* ensure products fetched */ 
    setLoading(true);
    setError(null);
    setData(null);

    // Single canonical endpoint
    const url = 'https://staffportal.replit.app/api/public/lenders';

    try {
      // console.log(`Testing canonical endpoint: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });

      // console.log(`Status: ${response.status} ${response.statusText}`);
      // console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        // console.log('Staff API Success:', result);
        
        setData({
          ...result,
          endpoint: url,
          status: response.status,
          statusText: response.statusText
        });
        setLastTested(new Date());
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Staff API Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Check if it's a CORS error
      if (errorMessage.includes('CORS') || errorMessage.includes('Network')) {
        setError(`CORS or Network Error: ${errorMessage}. Staff app may need CORS configuration for client domain.`);
      } else {
        setError(`Connection failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testStaffApi();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const products = await getProducts();
return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Staff API Connection Test
        </h1>
        <p className="text-gray-600">
          Testing connection to staff app public lenders API (43+ products)
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              API Status
            </CardTitle>
            <Button onClick={testStaffApi} disabled={loading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              ) : error ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : data ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 bg-gray-300 rounded-full" />
              )}
              <span className="font-medium">
                {loading ? 'Testing...' : error ? 'Failed' : data ? 'Connected' : 'Not Tested'}
              </span>
            </div>
            
            <div>
              <span className="text-sm text-gray-600">Endpoint:</span>
              <p className="font-mono text-sm">https://staffportal.replit.app/api/public/lenders</p>
            </div>
            
            {lastTested && (
              <div>
                <span className="text-sm text-gray-600">Last Tested:</span>
                <p className="text-sm">{lastTested.toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-red-800 mb-2">Connection Error</h3>
            <p className="text-red-700">{error}</p>
            <div className="mt-4 text-sm text-red-600">
              <p><strong>Possible causes:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Staff app server is down or unreachable</li>
                <li>CORS policy blocking the request</li>
                <li>Network connectivity issues</li>
                <li>API endpoint has changed</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {data && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {data.total || (data.products?.length || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Products</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.products ? new Set(data.products.map((p: any) => p.productType || p.product_type)).size : 0}
                </div>
                <div className="text-sm text-gray-600">Product Types</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.products ? new Set(data.products.map((p: any) => p.lenderName || p.lender_name)).size : 0}
                </div>
                <div className="text-sm text-gray-600">Lenders</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.products?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Returned</div>
              </CardContent>
            </Card>
          </div>

          {data.products && data.products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.products.slice(0, 5).map((product: any, index: number) => {
                    const name = product.productName || product.product_name || 'Unknown Product';
                    const lender = product.lenderName || product.lender_name || 'Unknown Lender';
                    const type = product.productType || product.product_type || 'Unknown Type';
                    const minAmount = product.minAmount || product.min_amount || 0;
                    const maxAmount = product.maxAmount || product.max_amount || 0;

                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{name}</h4>
                            <p className="text-sm text-teal-700">{lender}</p>
                          </div>
                          <Badge variant="outline">{type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Amount: {formatCurrency(minAmount)} - {formatCurrency(maxAmount)}
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  
                  {data.products.length > 5 && (
                    <div className="text-center text-sm text-gray-500 p-4 border rounded-lg bg-gray-50">
                      ... and {data.products.length - 5} more products
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}