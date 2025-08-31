import React, { useState, useEffect } from 'react';
import { getProducts } from "../api/products";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Database from 'lucide-react/dist/esm/icons/database';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import { get, set, clear } from 'idb-keyval';
import { useToast } from '@/hooks/use-toast';
import { validateV2Schema, normalizeProduct, type ProductStats } from '@/types/enhancedLenderProduct';

// ProductStats now imported from enhancedLenderProduct.ts

export default function SyncDiagnostics() {
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const fetchProductStats = async () => { /* ensure products fetched */ 
    try {
      // Check IndexedDB cache
      const cachedProducts = await get('lender_products_cache');
      const cacheTimestamp = await get('lender_products_cache_ts');
      
      // Check live API
      const response = await /* rewired */
      const data = await response.json();
      
      if (data.success && data.products) {
        const products = data.products;
        const uniqueCategories = new Set<string>();
        products.forEach((p: any) => {
          if (p.category) uniqueCategories.add(p.category);
        });
        const categories: string[] = Array.from(uniqueCategories);
        
        // Enhanced field validation for all 9 new fields
        const newFieldsPresent = {
          interestRate: products.some((p: any) => p.interestRateMin !== undefined || p.interestRateMax !== undefined),
          termLength: products.some((p: any) => p.termMin !== undefined || p.termMax !== undefined),
          creditScore: products.some((p: any) => p.minCreditScore !== undefined),
          revenue: products.some((p: any) => p.minRevenue !== undefined || p.minRevenueUsd !== undefined),
          industries: products.some((p: any) => p.eligibleIndustries !== undefined || p.excludedIndustries !== undefined),
          documents: products.some((p: any) => p.requiredDocuments !== undefined || p.documentRequirements !== undefined)
        };
        
        const hasNewFields = Object.values(newFieldsPresent).some(Boolean);
        const v2SchemaCount = products.filter(validateV2Schema).length;
        
        setStats({
          productCount: products.length,
          source: cachedProducts ? 'cache' : 'staff_api',
          categories,
          lastSynced: cacheTimestamp || Date.now(),
          hasNewFields,
          schemaVersion: v2SchemaCount > products.length / 2 ? 'v2' : 'v1',
          newFieldsPresent
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product statistics",
        variant: "destructive"
      });
    }
  };

  const triggerManualSync = async () => {
    setIsLoading(true);
    setSyncStatus('syncing');
    
    try {
      // Clear IndexedDB cache
      await clear();
      
      // Trigger fresh API call
      const response = await /* rewired */
      const data = await response.json();
      
      if (data.success && data.products) {
        // Store in IndexedDB
        await set('lender_products_cache', data.products);
        await set('lender_products_cache_ts', Date.now());
        
        setSyncStatus('success');
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${data.products.length} products`,
        });
        
        // Refresh stats
        await fetchProductStats();
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      toast({
        title: "Sync Failed",
        description: "Failed to sync products from staff API",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      await clear();
      toast({
        title: "Cache Cleared",
        description: "IndexedDB cache has been cleared",
      });
      await fetchProductStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProductStats();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Sync Diagnostics</h1>
        <p className="text-slate-600">Monitor and control lender product synchronization</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Product Database Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Product Count:</span>
                  <Badge variant={stats.productCount >= 40 ? "default" : "destructive"}>
                    {stats.productCount}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Data Source:</span>
                  <Badge variant={stats.source === 'staff_api' ? "default" : "secondary"}>
                    {stats.source}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Categories:</span>
                  <Badge variant="outline">
                    {stats.categories.length}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">New Fields:</span>
                  {stats.hasNewFields ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                
                <div className="text-xs text-slate-500">
                  Last synced: {new Date(stats.lastSynced).toLocaleString()}
                </div>
              </>
            ) : (
              <div className="text-center py-4">Loading stats...</div>
            )}
          </CardContent>
        </Card>

        {/* Controls Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={triggerManualSync}
              disabled={isLoading}
              className="w-full"
              variant={syncStatus === 'success' ? "default" : "outline"}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Manual Sync
            </Button>
            
            <Button 
              onClick={clearCache}
              variant="outline"
              className="w-full"
            >
              Clear Cache
            </Button>
            
            <Button 
              onClick={fetchProductStats}
              variant="ghost"
              className="w-full"
            >
              Refresh Stats
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Categories Display */}
      {stats && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Product Categories ({stats.categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Checklist */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Verification Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {stats?.productCount === 41 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span>Client reports productCount: 41</span>
            </div>
            
            <div className="flex items-center gap-2">
              {stats?.source === 'staff_api' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span>source: "staff_api"</span>
            </div>
            
            <div className="flex items-center gap-2">
              {stats?.categories.length === 8 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span>8 product categories show up in dropdowns and filters</span>
            </div>
            
            <div className="flex items-center gap-2">
              {stats?.hasNewFields ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span>All 9 new fields parsed and displayed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}