import React from 'react';
import { usePublicLenders } from '@/hooks/usePublicLenders';
interface LenderProduct {
  id: string;
  product_name: string;
  lender_name: string;
  product_type: string;
  geography: string[];
  min_amount: number;
  max_amount: number;
  min_revenue?: number;
  industries?: string[];
  video_url?: string;
  description?: string;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Play } from '@/lib/icons';

interface ProductsByCountry {
  [country: string]: {
    [category: string]: LenderProduct[];
  };
}

function ProductCard({ product }: { product: LenderProduct }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProductTypeLabel = (type: string) => {
    const labels = {
      'equipment_financing': 'Equipment Financing',
      'invoice_factoring': 'Invoice Factoring', 
      'line_of_credit': 'Line of Credit',
      'working_capital': 'Working Capital',
      'term_loan': 'Term Loan',
      'purchase_order_financing': 'Purchase Order Financing'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg">{product.product_name}</CardTitle>
          <Badge variant="outline">{getProductTypeLabel(product.product_type)}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{product.lender_name}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Amount Range:</span>
            <div className="text-muted-foreground">
              {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
            </div>
          </div>
          
          {product.min_revenue && (
            <div>
              <span className="font-medium">Min. Revenue:</span>
              <div className="text-muted-foreground">{formatCurrency(product.min_revenue)}</div>
            </div>
          )}

          {product.geography && product.geography.length > 0 && (
            <div>
              <span className="font-medium">Geography:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {product.geography.map((geo, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {geo}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {product.industries && product.industries.length > 0 && (
            <div>
              <span className="font-medium">Industries:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {product.industries.map((industry, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {product.description}
          </p>
        )}

        {product.video_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(product.video_url, '_blank')}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Watch Explainer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function CountrySection({ country, categories }: { country: string; categories: { [category: string]: LenderProduct[] } }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{country}</h2>
      {Object.entries(categories).map(([category, products]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-semibold text-muted-foreground">
            {category} ({products.length} products)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LenderProductsList() {
  const { data: products, isLoading, error } = usePublicLenders();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Products</h3>
          <p className="text-red-700 mb-4">{error.message}</p>
          <p className="text-sm text-red-600">
            Please check your connection or try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Products Available</h3>
          <p className="text-slate-600">
            No lender products are currently available in the database.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Organize products by country and category
  const organized: ProductsByCountry = {};
  
  products.forEach(product => {
    // Use first geography entry or 'Global' as country
    const country = product.geography?.[0] || 'Global';
    const category = product.product_type;
    
    if (!organized[country]) {
      organized[country] = {};
    }
    if (!organized[country][category]) {
      organized[country][category] = [];
    }
    organized[country][category].push(product);
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Available Lender Products</h1>
        <p className="text-muted-foreground">
          Browse our comprehensive catalog of financing solutions organized by country and product type
        </p>
      </div>

      {Object.entries(organized)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([country, categories]) => (
          <CountrySection key={country} country={country} categories={categories} />
        ))}
    </div>
  );
}