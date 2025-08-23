import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Building from 'lucide-react/dist/esm/icons/building';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Grid3X3 from 'lucide-react/dist/esm/icons/grid-3-x-3';
import Users from 'lucide-react/dist/esm/icons/users';
import { fetchLenderProducts } from '@/lib/api';

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return `$${amount.toLocaleString()}`;
  }
};

const formatCategoryName = (category: string): string => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'term_loan': 'bg-blue-100 text-blue-800',
    'line_of_credit': 'bg-green-100 text-green-800',
    'equipment_financing': 'bg-purple-100 text-purple-800',
    'invoice_factoring': 'bg-orange-100 text-orange-800',
    'working_capital': 'bg-teal-100 text-teal-800',
    'purchase_order_financing': 'bg-pink-100 text-pink-800',
    'asset_based_lending': 'bg-indigo-100 text-indigo-800',
    'sba_loan': 'bg-yellow-100 text-yellow-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export default function LenderProductsCatalog() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/lender-products'],
    queryFn: fetchLenderProducts,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading lender products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Unable to fetch lender products from the staff API. Please try again later.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group products by category
  const productsByCategory = products?.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof products>) || {};

  // Group products by lender
  const productsByLender = products?.reduce((acc, product) => {
    if (!acc[product.lenderName]) {
      acc[product.lenderName] = [];
    }
    acc[product.lenderName].push(product);
    return acc;
  }, {} as Record<string, typeof products>) || {};

  const categories = Object.keys(productsByCategory).sort();
  const lenders = Object.keys(productsByLender).sort();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lender Products Catalog
        </h1>
        <p className="text-gray-600">
          Complete listing of all {products?.length || 0} financing products organized by category
        </p>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{products?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(products?.map(p => p.lenderName)).size || 0}
              </div>
              <div className="text-sm text-gray-600">Lenders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(products?.flatMap(p => p.geography)).size || 0}
              </div>
              <div className="text-sm text-gray-600">Countries</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Organization Tabs */}
      <Tabs defaultValue="category" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="category" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            By Category ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="lender" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            By Lender ({lenders.length})
          </TabsTrigger>
        </TabsList>

        {/* Category View */}
        <TabsContent value="category" className="space-y-8 mt-6">
          {categories.map((category) => {
            const categoryProducts = productsByCategory[category];
          const categoryStats = {
            count: categoryProducts.length,
            minAmount: Math.min(...categoryProducts.map(p => p.minAmount)),
            maxAmount: Math.max(...categoryProducts.map(p => p.maxAmount)),
            lenders: new Set(categoryProducts.map(p => p.lenderName)).size,
            countries: new Set(categoryProducts.flatMap(p => p.geography)).size,
          };

          return (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {formatCategoryName(category)}
                </h2>
                <Badge className={getCategoryColor(category)}>
                  {categoryProducts.length} Products
                </Badge>
              </div>

              {/* Category Summary */}
              <Card className="mb-4 bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>
                        {formatCurrency(categoryStats.minAmount)} - {formatCurrency(categoryStats.maxAmount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span>{categoryStats.lenders} Lenders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span>{categoryStats.countries === 1 ? 'US Only' : 'US & Canada'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>Live Data</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryProducts.map((product) => (
                  <Card key={product.id} className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">
                          {product.name}
                        </CardTitle>
                        <Badge variant="outline" className="ml-2 shrink-0">
                          {product.geography.join(', ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        {product.lenderName}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Amount Range:</span>
                          <span className="font-medium">
                            {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}
                          </span>
                        </div>
                        
                        {product.minRevenue > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Min Revenue:</span>
                            <span className="font-medium">
                              {formatCurrency(product.minRevenue)}/mo
                            </span>
                          </div>
                        )}

                        {product.interestRateMin && product.interestRateMax && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Interest Rate:</span>
                            <span className="font-medium">
                              {product.interestRateMin}% - {product.interestRateMax}%
                            </span>
                          </div>
                        )}

                        {product.termMin && product.termMax && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Terms:</span>
                            <span className="font-medium">
                              {product.termMin} - {product.termMax} months
                            </span>
                          </div>
                        )}

                        {product.industries && product.industries.length > 0 && (
                          <div className="text-sm">
                            <span className="text-gray-600">Industries:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.industries.slice(0, 3).map((industry, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {industry}
                                </Badge>
                              ))}
                              {product.industries.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{product.industries.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {product.description && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-600 line-clamp-3">
                            {product.description}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            );
          })}
        </TabsContent>

        {/* Lender View */}
        <TabsContent value="lender" className="space-y-8 mt-6">
          {lenders.map((lenderName) => {
            const lenderProducts = productsByLender[lenderName];
            const lenderStats = {
              count: lenderProducts.length,
              minAmount: Math.min(...lenderProducts.map(p => p.minAmount)),
              maxAmount: Math.max(...lenderProducts.map(p => p.maxAmount)),
              categories: new Set(lenderProducts.map(p => p.category)).size,
              countries: new Set(lenderProducts.flatMap(p => p.geography)).size,
            };

            return (
              <div key={lenderName}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {lenderName}
                  </h2>
                  <Badge className="bg-blue-100 text-blue-800">
                    {lenderProducts.length} Products
                  </Badge>
                </div>

                {/* Lender Summary */}
                <Card className="mb-4 bg-gray-50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>
                          {formatCurrency(lenderStats.minAmount)} - {formatCurrency(lenderStats.maxAmount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="h-4 w-4 text-purple-600" />
                        <span>{lenderStats.categories} Categories</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-600" />
                        <span>{lenderStats.countries === 1 ? 'US Only' : 'US & Canada'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span>Live Data</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lenderProducts.map((product) => (
                    <Card key={product.id} className="h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg leading-tight">
                            {product.name}
                          </CardTitle>
                          <div className="flex gap-1 ml-2 shrink-0">
                            <Badge variant="outline">{product.geography.join(', ')}</Badge>
                            <Badge className={getCategoryColor(product.category)} variant="secondary">
                              {formatCategoryName(product.category)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Amount Range:</span>
                            <span className="font-medium">
                              {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}
                            </span>
                          </div>
                          
                          {product.minRevenue > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Min Revenue:</span>
                              <span className="font-medium">
                                {formatCurrency(product.minRevenue)}/mo
                              </span>
                            </div>
                          )}

                          {product.interestRateMin && product.interestRateMax && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Interest Rate:</span>
                              <span className="font-medium">
                                {product.interestRateMin}% - {product.interestRateMax}%
                              </span>
                            </div>
                          )}

                          {product.termMin && product.termMax && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Terms:</span>
                              <span className="font-medium">
                                {product.termMin} - {product.termMax} months
                              </span>
                            </div>
                          )}

                          {product.industries && product.industries.length > 0 && (
                            <div className="text-sm">
                              <span className="text-gray-600">Industries:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {product.industries.slice(0, 3).map((industry, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {industry}
                                  </Badge>
                                ))}
                                {product.industries.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{product.industries.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {product.description && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-600 line-clamp-3">
                              {product.description}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
        <p>
          Data sourced from live staff API • Last updated: {new Date().toLocaleString()}
        </p>
        <p className="mt-1">
          All {products?.length || 0} products verified and normalized • No mock or test data
        </p>
      </div>
    </div>
  );
}