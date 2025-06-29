import { usePublicLenders } from '@/hooks/usePublicLenders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Database, CheckCircle } from 'lucide-react';

export default function TestLenderAPI() {
  const { data: products, isLoading, error } = usePublicLenders();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Lender Products API Test
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Testing connection to: https://staffportal.replit.app/api/public/lenders
        </p>
      </div>

      {/* API Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            API Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Connecting to lender products API...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>Connection failed: {error.message}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Successfully connected - Found {products?.length || 0} products</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Lender Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="border rounded p-4">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Cannot access lender products database
              </h3>
              <p className="text-red-600 mb-4">
                Error: {error.message}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-red-800 mb-2">Possible causes:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Staff backend CORS headers not configured for client domain</li>
                  <li>• API endpoint not available or requires authentication</li>
                  <li>• Network connectivity issues</li>
                  <li>• Staff backend server not running</li>
                </ul>
              </div>
            </div>
          ) : products && products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={product.id || index} className="border rounded p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.productType}</h3>
                  {product.lenderName && (
                    <p className="text-gray-600 mb-2">Lender: {product.lenderName}</p>
                  )}
                  <p className="text-gray-700 mb-3">{product.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Min Amount:</span>
                      <p>${product.minAmount?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Max Amount:</span>
                      <p>${product.maxAmount?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Interest Rate:</span>
                      <p>{product.interestRate}%</p>
                    </div>
                    <div>
                      <span className="font-medium">Processing Time:</span>
                      <p>{product.processingTime || 'N/A'}</p>
                    </div>
                  </div>
                  {product.qualifications && product.qualifications.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">Qualifications:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.qualifications.map((qual, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {qual}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No products available
              </h3>
              <p className="text-gray-600">
                The lender products database appears to be empty or not configured.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raw API Response */}
      {products && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Raw API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(products, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}