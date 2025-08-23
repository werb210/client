import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, DollarSign, MapPin, Calendar } from 'lucide-react';
import { fetchLenderProducts } from '@/lib/api';
import type { LenderProduct } from '@/api/__generated__/staff.d.ts';

// Extract unique categories and count products per category
function analyzeProductCategories(products: LenderProduct[]) {
  const categoryStats: Record<string, {
    count: number;
    products: LenderProduct[];
    geographies: Set<string>;
    lenders: Set<string>;
    minAmount: number;
    maxAmount: number;
  }> = {};

  products.forEach(product => {
    const category = product.productCategory;
    
    if (!categoryStats[category]) {
      categoryStats[category] = {
        count: 0,
        products: [],
        geographies: new Set(),
        lenders: new Set(),
        minAmount: Infinity,
        maxAmount: 0
      };
    }

    categoryStats[category].count++;
    categoryStats[category].products.push(product);
    categoryStats[category].lenders.add(product.lender);
    
    if (product.geography && Array.isArray(product.geography)) {
      product.geography.forEach(geo => {
        categoryStats[category].geographies.add(geo);
      });
    }

    if (product.minAmountUsd < categoryStats[category].minAmount) {
      categoryStats[category].minAmount = product.minAmountUsd;
    }
    if (product.maxAmountUsd > categoryStats[category].maxAmount) {
      categoryStats[category].maxAmount = product.maxAmountUsd;
    }
  });

  return categoryStats;
}

// Format currency for display
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format category name for display
function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function LenderCategoriesTest() {
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['lender-products'],
    queryFn: fetchLenderProducts,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-gray-600">Loading lender product categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {error instanceof Error ? error.message : 'Failed to load lender products'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryStats = analyzeProductCategories(products);
  const totalProducts = products.length;
  const totalCategories = Object.keys(categoryStats).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lender Product Categories
          </h1>
          <p className="text-lg text-gray-600">
            Complete overview of {totalProducts} products across {totalCategories} categories
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalProducts}</div>
              <p className="text-sm text-gray-500">Active lending products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalCategories}</div>
              <p className="text-sm text-gray-500">Product categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-500" />
                Markets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">US + CA</div>
              <p className="text-sm text-gray-500">Geographic coverage</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(categoryStats)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([category, stats]) => (
              <Card key={category} className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {formatCategoryName(category)}
                    </CardTitle>
                    <Badge variant="secondary" className="text-sm">
                      {stats.count} products
                    </Badge>
                  </div>
                  <CardDescription>
                    Available from {stats.lenders.size} lenders across {Array.from(stats.geographies).join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Amount Range */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Funding Range</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {formatCurrency(stats.minAmount)} - {formatCurrency(stats.maxAmount)}
                      </Badge>
                    </div>
                  </div>

                  {/* Lenders */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Lenders ({stats.lenders.size})</h4>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(stats.lenders).slice(0, 4).map(lender => (
                        <Badge key={lender} variant="outline" className="text-xs">
                          {lender}
                        </Badge>
                      ))}
                      {stats.lenders.size > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{stats.lenders.size - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Sample Products */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Sample Products</h4>
                    <div className="space-y-1">
                      {stats.products.slice(0, 2).map(product => (
                        <div key={product.id} className="text-sm text-gray-600">
                          • {product.product} ({product.lender})
                        </div>
                      ))}
                      {stats.products.length > 2 && (
                        <div className="text-sm text-gray-500">
                          • +{stats.products.length - 2} more products
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* API Info */}
        <div className="mt-8 text-center">
          <Card className="inline-block">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Data sourced from Staff API at https://staffportal.replit.app/api/lender-products
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}