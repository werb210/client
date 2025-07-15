/**
 * FETCH WINDOW DEBUG ROUTE
 * Temporary development route to verify IndexedDB caching system
 * Shows cache status, fetch windows, and system verification
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { get, clear } from 'idb-keyval';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Database from 'lucide-react/dist/esm/icons/database';
import Clock from 'lucide-react/dist/esm/icons/clock';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import { isAllowedToFetchNow, getFetchWindowInfo } from '@/utils/fetchWindow';
import { getCacheStats, clearLenderCache } from '@/utils/lenderCache';

interface CacheStatus {
  productCount: number;
  lastFetch: string;
  cacheAge: string;
  nextFetchWindow: string;
  withinFetchWindow: boolean;
  indexedDBSize: number;
}

export default function FetchWindowDebugRoute() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<string>('');

  const loadCacheStatus = async () => {
    try {
      const stats = await getCacheStats();
      const windowInfo = getFetchWindowInfo();
      const withinWindow = isAllowedToFetchNow();
      
      setCacheStatus({
        productCount: stats.productCount,
        lastFetch: stats.lastFetch ? new Date(stats.lastFetch).toLocaleString() : 'Never',
        cacheAge: stats.age,
        nextFetchWindow: windowInfo.nextWindow.toLocaleString(),
        withinFetchWindow: withinWindow,
        indexedDBSize: stats.productCount
      });
    } catch (error) {
      console.error('Failed to load cache status:', error);
    }
  };

  useEffect(() => {
    loadCacheStatus();
    // DISABLED: Automatic polling to prevent console errors
    // const interval = setInterval(loadCacheStatus, 5000); // Refresh every 5 seconds
    // return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await clearLenderCache();
      setLastTestResult('✅ Cache cleared successfully');
      await loadCacheStatus();
    } catch (error) {
      setLastTestResult(`❌ Cache clear failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestFetch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/public/lenders');
      const data = await response.json();
      
      if (data.success) {
        setLastTestResult(`✅ API test successful: ${data.productCount || data.count || 'unknown'} products`);
      } else {
        setLastTestResult(`❌ API test failed: ${data.error || 'Unknown error'}`);
      }
      
      await loadCacheStatus();
    } catch (error) {
      setLastTestResult(`❌ API test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyIndexedDB = async () => {
    setIsLoading(true);
    try {
      const products = await get('lender_products_cache');
      const timestamp = await get('lender_products_cache_timestamp');
      const source = await get('lender_products_cache_source');
      
      if (products && Array.isArray(products)) {
        setLastTestResult(`✅ IndexedDB verification: ${products.length} products cached from ${source || 'unknown'} at ${timestamp ? new Date(timestamp).toLocaleString() : 'unknown time'}`);
      } else {
        setLastTestResult('❌ IndexedDB verification: No cached products found');
      }
    } catch (error) {
      setLastTestResult(`❌ IndexedDB verification error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Fetch Window Debug Interface
        </h1>
        <p className="text-gray-600">
          Development tool to verify IndexedDB caching system and fetch window controls
        </p>
      </div>

      {/* Cache Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            IndexedDB Cache Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cacheStatus ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cached Products</p>
                <p className="text-2xl font-bold">{cacheStatus.productCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cache Age</p>
                <p className="text-lg">{cacheStatus.cacheAge}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Fetch</p>
                <p className="text-sm">{cacheStatus.lastFetch}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Fetch Window</p>
                <p className="text-sm">{cacheStatus.nextFetchWindow}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading cache status...</p>
          )}
        </CardContent>
      </Card>

      {/* Fetch Window Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Fetch Window Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {cacheStatus?.withinFetchWindow ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <Badge variant="default" className="bg-green-100 text-green-800">
                  WITHIN FETCH WINDOW
                </Badge>
                <span className="text-sm text-gray-600">
                  Live API calls allowed (12:00 PM or 12:00 AM MST)
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  OUTSIDE FETCH WINDOW
                </Badge>
                <span className="text-sm text-gray-600">
                  Using cached data only
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Testing Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Testing Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <Button 
              onClick={handleTestFetch} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Test API Fetch
            </Button>
            
            <Button 
              onClick={handleVerifyIndexedDB} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Verify IndexedDB
            </Button>
            
            <Button 
              onClick={handleClearCache} 
              disabled={isLoading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cache
            </Button>
          </div>
          
          {lastTestResult && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-mono">{lastTestResult}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Fetch Windows:</span>
              <span>12:00 PM and 12:00 AM MST</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cache Technology:</span>
              <span>IndexedDB with idb-keyval</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Persistence:</span>
              <span>Survives browser restarts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">API Endpoint:</span>
              <span>/api/public/lenders</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}