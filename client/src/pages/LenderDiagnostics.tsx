/**
 * Lender Diagnostics Page
 * Hardcoded sync tester page at /diagnostics/lenders as requested in CLIENT FIX INSTRUCTIONS
 */

import React, { useState, useEffect } from 'react';
import { useReliableLenderProducts } from '@/hooks/useReliableLenderProducts';
import { get } from 'idb-keyval';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Database from 'lucide-react/dist/esm/icons/database';
import Wifi from 'lucide-react/dist/esm/icons/wifi';
import WifiOff from 'lucide-react/dist/esm/icons/wifi-off';
import HardDrive from 'lucide-react/dist/esm/icons/hard-drive';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Info from 'lucide-react/dist/esm/icons/info';

export default function LenderDiagnostics() {
  const { 
    data: products, 
    isLoading, 
    warning, 
    source, 
    productCount, 
    forceSync, 
    syncStatus 
  } = useReliableLenderProducts();

  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [indexedDBProducts, setIndexedDBProducts] = useState<any[]>([]);
  const [manualFetchResult, setManualFetchResult] = useState<any>(null);

  // Get categories from products
  const categories = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  // Manual sync with comprehensive logging
  const handleManualSync = async () => {
    setIsManualSyncing(true);
    // console.log('🔄 Manual sync triggered from diagnostics page');
    
    try {
      await forceSync();
      // console.log('✅ Manual sync completed successfully');
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Manual fetch test (as requested in CLIENT FIX INSTRUCTIONS Step 3)
  const handleManualFetch = async () => {
    // console.log('🧪 Running manual fetch test...');
    try {
      const response = await fetch('https://staffportal.replit.app/api/public/lenders');
      const data = await response.json();
      
      // Handle both direct array and object with products array
      const productArray = Array.isArray(data) ? data : (data.products || []);
      const productCount = productArray.length;
      
      // console.log('Live Products:', productCount, data);
      setManualFetchResult({ success: true, count: productCount, data });
    } catch (error) {
      console.error('❌ Error fetching live products', error);
      setManualFetchResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  // Check IndexedDB directly (as requested in CLIENT FIX INSTRUCTIONS Step 4)
  const checkIndexedDB = async () => {
    try {
      const cachedProducts = await get('lender_products_cache');
      // console.log('🗃️ IndexedDB products:', cachedProducts?.length || 0, cachedProducts);
      setIndexedDBProducts(cachedProducts || []);
    } catch (error) {
      console.error('❌ Error checking IndexedDB:', error);
    }
  };

  // Load IndexedDB data on mount
  useEffect(() => {
    checkIndexedDB();
  }, []);

  // Determine data source status
  const getDataSourceStatus = () => {
    switch (source) {
      case 'staff_api':
        return {
          icon: <Wifi className="h-5 w-5 text-green-600" />,
          label: 'Using live data from Staff API',
          color: 'text-green-700 bg-green-50 border-green-200',
          status: '🟢 SUCCESS'
        };
      case 'cached_data':
        return {
          icon: <HardDrive className="h-5 w-5 text-blue-600" />,
          label: 'Using cached data from last sync',
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          status: '🟡 Still stale, needs sync'
        };
      case 'fallback_data':
        return {
          icon: <WifiOff className="h-5 w-5 text-orange-600" />,
          label: 'Using fallback sample data',
          color: 'text-orange-700 bg-orange-50 border-orange-200',
          status: '🔴 No connection or empty staff DB'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-600" />,
          label: 'Unknown data source',
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          status: '❓ Unknown'
        };
    }
  };

  const dataSourceStatus = getDataSourceStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Lender Products Diagnostics
          </h1>
          <p className="text-gray-600">
            CLIENT FIX INSTRUCTIONS - Confirm Staff Sync vs Cached vs Fallback
          </p>
        </div>

        {/* Data Source Status Alert */}
        <Alert className={dataSourceStatus.color}>
          <div className="flex items-center gap-3">
            {dataSourceStatus.icon}
            <div>
              <AlertDescription className="font-medium">
                {dataSourceStatus.label} - {dataSourceStatus.status}
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Warning Banner */}
        {warning && (
          <Alert className="border-orange-200 bg-orange-50 text-orange-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Live data unavailable. Using cached lender products.
            </AlertDescription>
          </Alert>
        )}

        {/* Comprehensive Status Display */}
        <Card>
          <CardHeader>
            <CardTitle>Live Diagnostic Status</CardTitle>
            <CardDescription>
              Real-time API response analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Live Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm text-gray-600">Live Source:</p>
                <p className="text-sm font-mono">Staff API (https://staffportal.replit.app/api/public/lenders)</p>
              </div>
              
              {/* Status */}
              <div>
                <p className="font-medium text-sm text-gray-600">Status:</p>
                <p className="text-sm">
                  {manualFetchResult?.success === false ? (
                    <span className="text-red-600">❌ Error: {manualFetchResult.error}</span>
                  ) : manualFetchResult?.count === 0 ? (
                    <span className="text-red-600">❌ Invalid Response (Empty Array)</span>
                  ) : manualFetchResult?.count > 0 ? (
                    <span className="text-green-600">✅ Valid Response</span>
                  ) : (
                    <span className="text-gray-600">⏳ Click "Test Fetch" to check</span>
                  )}
                </p>
              </div>
            </div>

            {/* Product Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm text-gray-600">Product Count:</p>
                <p className="text-sm">
                  {manualFetchResult?.count !== undefined ? (
                    <span>{manualFetchResult.count} (Fallback: {productCount} used)</span>
                  ) : (
                    <span>0 (Fallback: {productCount} used)</span>
                  )}
                </p>
              </div>
              
              {/* Categories */}
              <div>
                <p className="font-medium text-sm text-gray-600">Categories:</p>
                <p className="text-sm">
                  [{categories.map(cat => cat.replace(/_/g, ' ')).join(', ')}]
                </p>
              </div>
            </div>

            {/* Raw API Response */}
            {manualFetchResult && (
              <div>
                <p className="font-medium text-sm text-gray-600 mb-2">Raw API Response:</p>
                <div className="bg-gray-100 rounded p-3 text-xs font-mono max-h-40 overflow-auto">
                  <pre>{JSON.stringify(manualFetchResult.data, null, 2)}</pre>
                </div>
                {manualFetchResult.data && !Array.isArray(manualFetchResult.data) && (
                  <p className="text-sm text-red-600 mt-2">
                    🔍 Raw API Response is not an array - proof of invalid structure
                  </p>
                )}
                {manualFetchResult.data && Array.isArray(manualFetchResult.data) && manualFetchResult.data.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    🔍 Raw API Response is empty array - staff database contains 0 products
                  </p>
                )}
              </div>
            )}

          </CardContent>
        </Card>

        {/* Manual Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Diagnostic Tests</CardTitle>
            <CardDescription>
              Run manual tests to verify sync functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Manual Sync Button */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">🔄 Sync Now</p>
                <p className="text-sm text-gray-600">Triggers real-time API fetch</p>
              </div>
              <Button 
                onClick={handleManualSync}
                disabled={isManualSyncing || isLoading}
                size="sm"
              >
                {isManualSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Force Sync
                  </>
                )}
              </Button>
            </div>

            {/* Manual Fetch Test */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">🧪 Manual Fetch Test</p>
                <p className="text-sm text-gray-600">Direct API call test</p>
              </div>
              <Button 
                onClick={handleManualFetch}
                variant="outline"
                size="sm"
              >
                Test Fetch
              </Button>
            </div>

            {/* Manual Fetch Results */}
            {manualFetchResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <strong>Manual Fetch Result:</strong>
                <pre className="mt-2 text-xs">
                  {JSON.stringify(manualFetchResult, null, 2)}
                </pre>
              </div>
            )}

            {/* Check IndexedDB */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">🗃️ Check IndexedDB</p>
                <p className="text-sm text-gray-600">Verify local cache</p>
              </div>
              <Button 
                onClick={checkIndexedDB}
                variant="outline"
                size="sm"
              >
                Check Cache
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Category List */}
        <Card>
          <CardHeader>
            <CardTitle>Product Categories ({categories.length})</CardTitle>
            <CardDescription>
              Available lender product categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No categories available</p>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>
              Technical details for troubleshooting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 rounded p-4 text-sm overflow-auto">
              {JSON.stringify({
                env: {
                  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
                },
                sync: {
                  productCount,
                  source,
                  warning,
                  syncStatus,
                  indexedDBCount: indexedDBProducts.length
                },
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}