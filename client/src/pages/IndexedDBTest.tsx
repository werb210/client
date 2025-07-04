/**
 * IndexedDB Test Page
 * Tests the new idb-keyval caching system for lender products
 */

import React from 'react';
import { useLenderProducts } from '@/lib/useLenderProducts';
import { get, set } from 'idb-keyval';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function IndexedDBTest() {
  const { data: products, isLoading, isError, error, refetch } = useLenderProducts();
  const [cacheStatus, setCacheStatus] = React.useState<any>(null);

  // Cache management functions
  const getCacheStatus = async () => {
    const cachedProducts = await get('lender_products_cache');
    const cachedTimestamp = await get('lender_products_cache_ts');
    
    return {
      hasCache: Boolean(cachedProducts && Array.isArray(cachedProducts)),
      productCount: cachedProducts?.length || 0,
      timestamp: cachedTimestamp,
      age: cachedTimestamp ? Date.now() - new Date(cachedTimestamp).getTime() : null
    };
  };

  const invalidateCache = async () => {
    await set('lender_products_cache', null);
    await set('lender_products_cache_ts', null);
    refetch();
  };

  // Load cache status on component mount
  React.useEffect(() => {
    getCacheStatus().then(setCacheStatus);
  }, []);

  const handleRefreshCache = () => {
    getCacheStatus().then(setCacheStatus);
  };

  const handleInvalidateCache = async () => {
    await invalidateCache();
    await getCacheStatus().then(setCacheStatus);
  };

  const handleTestWebSocket = () => {
    // Test WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('[Test] WebSocket connected successfully');
    };
    
    ws.onmessage = (event) => {
      console.log('[Test] WebSocket message received:', event.data);
    };
    
    ws.onerror = (error) => {
      console.error('[Test] WebSocket error:', error);
    };
    
    setTimeout(() => {
      ws.close();
    }, 2000);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          IndexedDB Caching Test
        </h1>
        <p className="text-gray-600">
          Testing idb-keyval caching system with 5-minute refetch intervals and WebSocket updates
        </p>
      </div>

      {/* Cache Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Status
          </CardTitle>
          <CardDescription>
            IndexedDB cache information and controls
          </CardDescription>
        </CardHeader>
        <CardContent data-testid="cache-status">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Cache Status</div>
              <div className="font-semibold">
                <Badge 
                  data-testid="cache-status-badge"
                  variant={cacheStatus?.hasCache ? "default" : "secondary"} 
                  className={cacheStatus?.hasCache ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {cacheStatus?.hasCache ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Empty
                    </>
                  )}
                </Badge>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Products Cached</div>
              <div className="font-semibold text-lg" data-testid="cache-count">
                {cacheStatus?.productCount || 0}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Cache Age</div>
              <div className="font-semibold">
                {cacheStatus?.age ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.round(cacheStatus.age / 1000 / 60)} min
                  </span>
                ) : 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleRefreshCache} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button onClick={handleInvalidateCache} variant="outline" size="sm" data-testid="clear-cache-btn">
              Clear Cache
            </Button>
            <Button onClick={handleTestWebSocket} variant="outline" size="sm" data-testid="test-websocket-btn">
              Test WebSocket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Status</CardTitle>
          <CardDescription>
            Current API fetch status and error handling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span data-testid="api-status">
                {isLoading ? (
                  <Badge variant="secondary">Loading...</Badge>
                ) : isError ? (
                  <Badge variant="destructive">Error</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
                )}
              </span>
            </div>
            
            {isError && (
              <div className="text-sm text-red-600">
                {String(error)}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Products Fetched:</span>
              <span className="font-semibold" data-testid="products-fetched">{products?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      {products && products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cached Products</CardTitle>
            <CardDescription>
              Products currently available from IndexedDB cache
            </CardDescription>
          </CardHeader>
          <CardContent data-testid="products-display">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 6).map((product: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="font-semibold text-sm mb-1">
                    {product.name || product.lenderName || 'Unknown Product'}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {product.category || 'Unknown Category'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Amount: ${product.minAmount?.toLocaleString()} - ${product.maxAmount?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Country: {product.country || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
            
            {products.length > 6 && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                ... and {products.length - 6} more products
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Implementation Details */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div>✅ idb-keyval for IndexedDB storage</div>
            <div>✅ 5-minute automatic refetch intervals</div>
            <div>✅ WebSocket listener for real-time updates</div>
            <div>✅ Graceful degradation on API failure</div>
            <div>✅ Cache keys: lender_products_cache, lender_products_cache_ts</div>
            <div>✅ Fallback data when staff database empty</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}