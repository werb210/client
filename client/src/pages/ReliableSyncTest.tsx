/**
 * Reliable Sync Test Page
 * Tests the CLIENT INSTRUCTIONS implementation for reliable lender product sync
 */

import React, { useState, useEffect } from 'react';
import { useReliableLenderProducts } from '@/hooks/useReliableLenderProducts';
import { CachedDataBanner } from '@/components/CachedDataBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';










import {AlertCircle, CheckCircle, Clock, Database, HardDrive, RefreshCw, Server, Wifi, WifiOff} from 'lucide-react';
export default function ReliableSyncTest() {
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

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await forceSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Calculate categories from products
  const categories = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    const categoryMap = new Map();
    
    products.forEach(product => {
      const category = product.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { name: category, count: 0, products: [] });
      }
      categoryMap.get(category).count += 1;
      categoryMap.get(category).products.push(product);
    });
    
    return Array.from(categoryMap.values());
  }, [products]);

  // Source indicator
  const getSourceIcon = () => {
    switch (source) {
      case 'staff_api':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'cached_data':
        return <HardDrive className="h-4 w-4 text-blue-600" />;
      case 'fallback_data':
        return <WifiOff className="h-4 w-4 text-orange-600" />;
      default:
        return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSourceLabel = () => {
    switch (source) {
      case 'staff_api':
        return 'Live Staff API';
      case 'cached_data':
        return 'Cached Data';
      case 'fallback_data':
        return 'Fallback Data';
      default:
        return 'Unknown';
    }
  };

  const getSourceColor = () => {
    switch (source) {
      case 'staff_api':
        return 'bg-green-100 text-green-800';
      case 'cached_data':
        return 'bg-blue-100 text-blue-800';
      case 'fallback_data':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Reliable Sync System Test
          </h1>
          <p className="text-gray-600">
            CLIENT INSTRUCTIONS Implementation - Sync, Store, and Update Lender Products Reliably
          </p>
        </div>

        {/* Warning Banner */}
        <CachedDataBanner
          isVisible={!!warning}
          message={warning || ''}
          onRetry={handleManualSync}
          isRetrying={isManualSyncing}
        />

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Current sync status and data source information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Data Source */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getSourceIcon()}
                <div>
                  <p className="font-medium">Data Source</p>
                  <p className="text-sm text-gray-600">Current product data origin</p>
                </div>
              </div>
              <Badge className={getSourceColor()}>
                {getSourceLabel()}
              </Badge>
            </div>

            <Separator />

            {/* Product Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium">Products Available</p>
                  <p className="text-sm text-gray-600">Total lender products in system</p>
                </div>
              </div>
              <Badge variant="outline">
                {productCount} Products
              </Badge>
            </div>

            <Separator />

            {/* Last Sync */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="font-medium">Last Sync</p>
                  <p className="text-sm text-gray-600">Most recent data update</p>
                </div>
              </div>
              <Badge variant="outline">
                {syncStatus?.lastSync 
                  ? new Date(syncStatus.lastSync).toLocaleTimeString()
                  : 'Never'
                }
              </Badge>
            </div>

            <Separator />

            {/* Manual Sync */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Manual Sync</p>
                <p className="text-sm text-gray-600">Force refresh from staff API</p>
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

          </CardContent>
        </Card>

        {/* Product Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Product Categories ({categories.length})
            </CardTitle>
            <CardDescription>
              Available lender product categories and counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading products...</span>
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <div 
                    key={category.name}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {category.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </h3>
                      <Badge variant="secondary">
                        {category.count}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {category.products.slice(0, 3).map((product: any, idx: number) => (
                        <p key={idx} className="text-sm text-gray-600 truncate">
                          {product.name} ({product.lenderName})
                        </p>
                      ))}
                      {category.products.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{category.products.length - 3} more...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No product categories available</p>
                <p className="text-sm text-gray-500">Try forcing a sync to fetch from staff API</p>
              </div>
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
                productCount,
                source,
                warning,
                syncStatus,
                hasProducts: products.length > 0,
                apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}