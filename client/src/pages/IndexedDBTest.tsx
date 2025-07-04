/**
 * IndexedDB Test Page
 * Tests the new idb-keyval caching system for lender products
 */

import React from 'react';
import { useLenderProducts, useLenderProductsCache } from '@/lib/useLenderProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function IndexedDBTest() {
  const { data: products, isLoading, isError, error, refetch } = useLenderProducts();
  const { invalidateCache, getCacheStatus } = useLenderProductsCache();
  
  const [cacheStatus, setCacheStatus] = React.useState<any>(null);

  // Load cache status on component mount
  React.useEffect(() => {
    getCacheStatus().then(setCacheStatus);
  }, [getCacheStatus]);

  const handleRefreshCache = () => {
    getCacheStatus().then(setCacheStatus);
  };

  const handleInvalidateCache = async () => {
    await invalidateCache();
    setCacheStatus(null);
    refetch();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">IndexedDB Caching System Test</h1>
        <p className="text-muted-foreground">
          Testing idb-keyval implementation with 5-minute refresh intervals and graceful degradation
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* API Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              API Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </>
              ) : isError ? (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Error</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Connected</span>
                </>
              )}
            </div>
            {isError && (
              <p className="text-xs text-red-600 mt-1">
                {error?.message || 'Unknown error'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Products Count */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Products Loaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {products?.length === 0 ? 'No products available' : 'Products cached'}
            </p>
          </CardContent>
        </Card>

        {/* Cache Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Cache Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs">Has Cache:</span>
                <Badge variant={cacheStatus?.hasCache ? 'default' : 'secondary'}>
                  {cacheStatus?.hasCache ? 'Yes' : 'No'}
                </Badge>
              </div>
              {cacheStatus?.timestamp && (
                <div className="text-xs text-muted-foreground">
                  Cached: {new Date(cacheStatus.timestamp).toLocaleTimeString()}
                </div>
              )}
              {cacheStatus?.age && (
                <div className="text-xs text-muted-foreground">
                  Age: {Math.round(cacheStatus.age / 1000 / 60)} minutes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cache Controls</CardTitle>
          <CardDescription>
            Test IndexedDB operations and cache invalidation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handleRefreshCache} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Cache Status
            </Button>
            <Button onClick={handleInvalidateCache} variant="destructive">
              <Database className="h-4 w-4 mr-2" />
              Clear Cache & Refetch
            </Button>
            <Button onClick={() => refetch()} variant="secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Manual Refetch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      {products && products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cached Products</CardTitle>
            <CardDescription>
              Products loaded from IndexedDB cache or API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.slice(0, 6).map((product, index) => (
                <div key={product.id || index}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.lenderName}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {product.category}
                        </Badge>
                        <Badge variant="secondary">
                          {product.country}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>${product.minAmount?.toLocaleString()} - ${product.maxAmount?.toLocaleString()}</div>
                      {product.interestRateMin && product.interestRateMax && (
                        <div className="text-muted-foreground">
                          {product.interestRateMin}% - {product.interestRateMax}%
                        </div>
                      )}
                    </div>
                  </div>
                  {index < products.slice(0, 6).length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
              {products.length > 6 && (
                <p className="text-sm text-muted-foreground text-center pt-4">
                  ... and {products.length - 6} more products
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Cache Configuration</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Storage: IndexedDB via idb-keyval</li>
                <li>• Refresh Interval: 5 minutes</li>
                <li>• Stale Time: 4 minutes</li>
                <li>• Garbage Collection: 10 minutes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Graceful Degradation</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• API failure → Load from cache</li>
                <li>• No cache → Show error message</li>
                <li>• WebSocket updates → Invalidate cache</li>
                <li>• Fallback data when staff DB empty</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}