import React, { useState, useEffect } from 'react';
import { getProducts } from "../api/products";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Database from 'lucide-react/dist/esm/icons/database';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import { get, set, clear } from 'idb-keyval';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticStatus {
  liveApiProductCount: number;
  fallbackCacheCount: number;
  isUsingLiveData: boolean;
  syncTimestamp: number;
  indexedDBCount: number;
  apiResponseTime: number;
  categories: string[];
  errors: string[];
}

export default function LenderDiagnosticsFinalized() {
  const [status, setStatus] = useState<DiagnosticStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => { /* ensure products fetched */ 
    setIsLoading(true);
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {
      // Check IndexedDB cache
      const cachedProducts = await get('lender_products_cache');
      const cacheTimestamp = await get('lender_products_cache_ts');
      
      // Test live API connection
      const response = await fetch('/api/v1/products');
      
      const apiResponseTime = Date.now() - startTime;
      
      if (!response.ok) {
        errors.push(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.products) {
        errors.push('Invalid API response structure');
      }
      
      const liveProducts = data.products || [];
      const categories: string[] = Array.from(new Set(liveProducts.map((p: any) => p.category).filter(Boolean)));
      
      // Determine if using live data
      const isUsingLiveData = liveProducts.length >= 40 && errors.length === 0;
      
      setStatus({
        liveApiProductCount: liveProducts.length,
        fallbackCacheCount: cachedProducts ? cachedProducts.length : 0,
        isUsingLiveData,
        syncTimestamp: cacheTimestamp || 0,
        indexedDBCount: cachedProducts ? cachedProducts.length : 0,
        apiResponseTime,
        categories,
        errors
      });
      
    } catch (error) {
      errors.push(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to cache data
      const cachedProducts = await get('lender_products_cache');
      const cacheTimestamp = await get('lender_products_cache_ts');
      
      setStatus({
        liveApiProductCount: 0,
        fallbackCacheCount: cachedProducts ? cachedProducts.length : 0,
        isUsingLiveData: false,
        syncTimestamp: cacheTimestamp || 0,
        indexedDBCount: cachedProducts ? cachedProducts.length : 0,
        apiResponseTime: Date.now() - startTime,
        categories: [] as string[],
        errors
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forceSyncFromStaff = async () => {
    setIsLoading(true);
    
    try {
      // Clear IndexedDB
      await clear();
      
      // Force fresh API call
      const response = await fetch('/api/v1/products');
      
      const data = await response.json();
      
      if (data.success && data.products) {
        // Store in IndexedDB
        await set('lender_products_cache', data.products);
        await set('lender_products_cache_ts', Date.now());
        
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${data.products.length} products from Staff API`,
        });
        
        // Refresh diagnostics
        await runDiagnostics();
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Could not sync from Staff API",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const products = await getProducts();
return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Lender Product Diagnostics</h1>
        <p className="text-slate-600">Production sync status and health monitoring</p>
      </div>

      {/* Warning Banner */}
      {status && !status.isUsingLiveData && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <h3 className="font-semibold text-amber-800">Using Fallback Cache</h3>
            <p className="text-sm text-amber-700">
              Application is not using live Staff API data. Please check connectivity.
            </p>
          </div>
        </div>
      )}

      {/* Cache Missing Warning Banner */}
      {status && status.indexedDBCount === 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">❌ Lender Cache Missing</h3>
            <p className="text-sm text-red-700">
              IndexedDB cache is empty. Products should be populated by scheduled refresh (noon/midnight MST).
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Live API Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Live API Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Product Count:</span>
                  <Badge variant={status.liveApiProductCount === 41 ? "default" : "destructive"}>
                    {status.liveApiProductCount}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Response Time:</span>
                  <Badge variant={status.apiResponseTime < 1000 ? "default" : "secondary"}>
                    {status.apiResponseTime}ms
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Categories:</span>
                  <Badge variant={status.categories.length === 8 ? "default" : "destructive"}>
                    {status.categories.length}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  {status.isUsingLiveData ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* IndexedDB Cache */}
        <Card>
          <CardHeader>
            <CardTitle>IndexedDB Cache</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Cached Products:</span>
                  <Badge variant="outline">
                    {status.indexedDBCount}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Last Sync:</span>
                  <span className="text-sm text-slate-500">
                    {status.syncTimestamp ? new Date(status.syncTimestamp).toLocaleString() : 'Never'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Data Source:</span>
                  <Badge variant={status.isUsingLiveData ? "default" : "secondary"}>
                    {status.isUsingLiveData ? 'Live API' : 'Fallback Cache'}
                  </Badge>
                </div>
              </>
            ) : (
              <div className="text-center py-4">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={forceSyncFromStaff}
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Force Sync from Staff
            </Button>
            
            <Button 
              onClick={runDiagnostics}
              variant="outline"
              className="w-full"
            >
              Refresh Diagnostics
            </Button>
            
            <div className="text-xs text-slate-500">
              Staff API: {import.meta.env.VITE_API_BASE_URL}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Checklist */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Deployment Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {import.meta.env.VITE_API_BASE_URL === 'https://staffportal.replit.app/api' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>VITE_API_BASE_URL is set to production staff URL</span>
            </div>
            
            <div className="flex items-center gap-2">
              {status?.liveApiProductCount === 41 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>/api/public/lenders returns 41 products</span>
            </div>
            
            <div className="flex items-center gap-2">
              {status?.categories.length === 8 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Product categories: all 8 visible in filters</span>
            </div>
            
            <div className="flex items-center gap-2">
              {status?.isUsingLiveData ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Step 2 shows matching results from synced data</span>
            </div>
            
            <div className="flex items-center gap-2">
              {status && status.indexedDBCount > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>IndexedDB properly caches lender data on failure</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Log */}
      {status && status.errors.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Error Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.errors.map((error, index) => (
                <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Categories */}
      {status && status.categories.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Available Product Categories ({status.categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {status.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
// injected: local-first products fetch
import { getProducts, loadSelectedCategories } from "../api/products";
/* injected load on mount (pseudo):
useEffect(() => { (async () => {
  const cats = loadSelectedCategories();
  const products = await getProducts({ useCacheFirst: true });
  // apply category filter if present
  const selected = cats && cats.length ? products.filter(p => cats.includes((p.category||"").toLowerCase())) : products;
  setState({ products: selected });
})(); }, []);
*/
