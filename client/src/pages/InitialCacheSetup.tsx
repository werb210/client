/**
 * Initial Cache Setup Page
 * One-time setup to populate IndexedDB cache with 41 products
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';

export default function InitialCacheSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const populateCache = async () => {
    setIsLoading(true);
    try {
      // Use finalizedLenderSync to populate cache
      const { syncLenderProducts } = await import('../lib/finalizedLenderSync');
      const result = await syncLenderProducts();
      
      setResult({
        success: result.success,
        productCount: result.productCount,
        source: result.source,
        errors: result.errors,
        message: result.success 
          ? `Successfully cached ${result.productCount} products from ${result.source}` 
          : `Failed to populate cache: ${result.errors.join(', ')}`
      });
      
      // Refresh cache status after population
      await checkCacheStatus();
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        message: 'Cache operation failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkCacheStatus = async () => {
    try {
      const { get } = await import('idb-keyval');
      
      // Check both cache keys for backward compatibility
      let products = await get('lenderProducts'); // New cache system
      if (!products || !Array.isArray(products) || products.length === 0) {
        products = await get('lender_products_cache'); // Old cache system
      }
      
      const timestamp = await get('lender_products_cache_ts') || await get('lenderProductsLastFetched');
      
      setCacheStats({
        productCount: products?.length || 0,
        source: products?.length > 0 ? 'IndexedDB Cache' : 'No cache',
        lastFetched: timestamp ? new Date(timestamp).toLocaleString() : 'Never'
      });
    } catch (error) {
      setCacheStats({
        productCount: 0,
        source: 'Error',
        lastFetched: 'Error'
      });
    }
  };

  React.useEffect(() => {
    checkCacheStatus();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Initial Cache Setup</h1>
        <p className="text-slate-600">Populate IndexedDB cache for strict cache-only operation</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cache Population */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5" />
              Cache Population
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              This will fetch products from the staff API and store them in IndexedDB 
              for cache-only operation in Steps 2 and 5. Required for proper application function.
            </p>
            
            <Button 
              onClick={populateCache} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Populating Cache...
                </>
              ) : (
                'Populate Cache'
              )}
            </Button>
            
            {result && (
              <div className={`p-4 rounded-lg ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <p className={`font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message}
                  </p>
                </div>
                {result.productCount && (
                  <p className={`text-sm mt-1 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.productCount} products cached
                  </p>
                )}
                {result.error && (
                  <p className="text-sm text-red-700 mt-1">
                    Error: {result.error}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cache Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Cache Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cacheStats ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Products Cached:</span>
                  <Badge variant={cacheStats.productCount > 0 ? "default" : "destructive"}>
                    {cacheStats.productCount}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Data Source:</span>
                  <Badge variant="outline">
                    {cacheStats.source || 'unknown'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Last Updated:</span>
                  <span className="text-sm text-slate-500">
                    {cacheStats.lastFetched}
                  </span>
                </div>
                
                <Button 
                  onClick={checkCacheStatus} 
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Refresh Status
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-500">Loading cache status...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-slate-600 space-y-2">
            <p><strong>1. Cache Population:</strong> Click "Populate Cache" to fetch and store 41 products in IndexedDB.</p>
            <p><strong>2. Cache-Only Operation:</strong> After population, Steps 2 and 5 will use only cached data (no live API calls).</p>
            <p><strong>3. Scheduled Refresh:</strong> Cache automatically refreshes at noon and midnight MST only.</p>
            <p><strong>4. Production Ready:</strong> This ensures consistent performance and reduces server load.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}