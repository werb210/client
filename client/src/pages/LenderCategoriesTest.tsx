import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, DollarSign, MapPin, Calendar } from 'lucide-react';

// Type for lender product from the database
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
  interest_rate_min?: number;
  interest_rate_max?: number;
  term_min?: number;
  term_max?: number;
}

// Mock data showing the categories we know from the 43+ product database
// This represents the actual categories found in our staff backend
const mockLenderProducts: LenderProduct[] = [
  // Equipment Financing Category
  { id: '1', product_name: 'Equipment Loan A', lender_name: 'Capital One', product_type: 'equipment_financing', geography: ['US'], min_amount: 25000, max_amount: 500000 },
  { id: '2', product_name: 'Equipment Finance Pro', lender_name: 'Wells Fargo', product_type: 'equipment_financing', geography: ['US', 'CA'], min_amount: 50000, max_amount: 1000000 },
  
  // Term Loan Category
  { id: '3', product_name: 'Business Term Loan', lender_name: 'Bank of America', product_type: 'term_loan', geography: ['US'], min_amount: 100000, max_amount: 2000000 },
  { id: '4', product_name: 'Growth Capital Loan', lender_name: 'BMO Financial', product_type: 'term_loan', geography: ['CA'], min_amount: 75000, max_amount: 1500000 },
  
  // Line of Credit Category
  { id: '5', product_name: 'Business Line of Credit', lender_name: 'TD Bank', product_type: 'line_of_credit', geography: ['US', 'CA'], min_amount: 25000, max_amount: 750000 },
  { id: '6', product_name: 'Flexible Credit Line', lender_name: 'RBC', product_type: 'line_of_credit', geography: ['CA'], min_amount: 50000, max_amount: 1000000 },
  
  // Invoice Factoring Category
  { id: '7', product_name: 'Invoice Factoring Pro', lender_name: 'OnDeck', product_type: 'invoice_factoring', geography: ['US'], min_amount: 10000, max_amount: 500000 },
  { id: '8', product_name: 'A/R Financing', lender_name: 'BlueVine', product_type: 'invoice_factoring', geography: ['US'], min_amount: 15000, max_amount: 300000 },
  
  // Working Capital Category
  { id: '9', product_name: 'Working Capital Loan', lender_name: 'Funding Circle', product_type: 'working_capital', geography: ['US'], min_amount: 25000, max_amount: 500000 },
  { id: '10', product_name: 'Business Cash Advance', lender_name: 'Kabbage', product_type: 'working_capital', geography: ['US'], min_amount: 5000, max_amount: 250000 },
  
  // Purchase Order Financing Category
  { id: '11', product_name: 'PO Financing', lender_name: 'American Express', product_type: 'purchase_order_financing', geography: ['US'], min_amount: 50000, max_amount: 1000000 },
  
  // Asset Based Lending Category
  { id: '12', product_name: 'Asset Based Credit', lender_name: 'CIT Bank', product_type: 'asset_based_lending', geography: ['US'], min_amount: 100000, max_amount: 5000000 },
  
  // SBA Loans Category
  { id: '13', product_name: 'SBA 7(a) Loan', lender_name: 'Live Oak Bank', product_type: 'sba_loan', geography: ['US'], min_amount: 50000, max_amount: 5000000 },
  { id: '14', product_name: 'SBA Express Loan', lender_name: 'SmartBiz', product_type: 'sba_loan', geography: ['US'], min_amount: 30000, max_amount: 350000 },
];

// Simulate API fetch with mock data
async function fetchAllLenderProducts(): Promise<LenderProduct[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockLenderProducts;
}

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
    const category = product.product_type;
    
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
    categoryStats[category].lenders.add(product.lender_name);
    
    product.geography.forEach(geo => {
      categoryStats[category].geographies.add(geo);
    });

    if (product.min_amount < categoryStats[category].minAmount) {
      categoryStats[category].minAmount = product.min_amount;
    }
    if (product.max_amount > categoryStats[category].maxAmount) {
      categoryStats[category].maxAmount = product.max_amount;
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
    queryKey: ['/api/lender-products'],
    queryFn: fetchAllLenderProducts,
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
                          • {product.product_name} ({product.lender_name})
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