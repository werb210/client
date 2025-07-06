import { usePublicLenders } from '@/hooks/usePublicLenders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, DollarSign, MapPin, Building2 } from '@/lib/icons';
import { LenderProduct } from '@/api/lenderProducts';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getCategoryDisplayName = (category: string) => {
  const categoryMap: Record<string, string> = {
    'term_loan': 'Term Loans',
    'line_of_credit': 'Lines of Credit',
    'factoring': 'Factoring Solutions',
    'merchant_cash_advance': 'Merchant Cash Advances',
    'sba_loan': 'SBA Loans',
    'equipment_financing': 'Equipment Financing',
    'invoice_factoring': 'Invoice Factoring',
    'purchase_order_financing': 'Purchase Order Financing',
    'working_capital': 'Working Capital',
    'revenue_based_financing': 'Revenue Based Financing',
    'asset_based_lending': 'Asset Based Lending'
  };
  return categoryMap[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getCategoryDescription = (category: string) => {
  const descriptions: Record<string, string> = {
    'term_loan': 'Fixed-rate loans with predictable monthly payments for business expansion and capital investments.',
    'line_of_credit': 'Flexible credit facilities that provide access to funds as needed for working capital and cash flow management.',
    'factoring': 'Immediate cash flow solutions by selling your accounts receivable at a discount.',
    'merchant_cash_advance': 'Fast funding based on future credit card sales, ideal for retail and restaurant businesses.',
    'sba_loan': 'Government-backed loans offering favorable terms and lower down payments for qualified businesses.',
    'equipment_financing': 'Specialized financing for purchasing business equipment, machinery, and technology.',
    'invoice_factoring': 'Convert outstanding invoices into immediate cash to improve working capital.',
    'purchase_order_financing': 'Funding to fulfill large customer orders when you lack sufficient working capital.',
    'working_capital': 'Short-term financing to cover operational expenses and maintain business operations.',
    'revenue_based_financing': 'Funding based on your business revenue with flexible repayment terms.',
    'asset_based_lending': 'Secured financing using business assets as collateral for larger loan amounts.'
  };
  return descriptions[category] || 'Specialized financing solutions tailored to your business needs.';
};

export default function LendersByCategory() {
  const { data: products, isLoading, error } = usePublicLenders();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
            <p className="text-gray-600">Loading authentic lender products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-700 font-medium">Unable to load lender products</p>
            <p className="text-red-600 text-sm mt-1">Please check your connection and try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group products by category
  const productsByCategory = (products || []).reduce((acc, product) => {
    const category = product.productType;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, LenderProduct[]>);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(productsByCategory).sort();

  const totalProducts = products?.length || 0;
  const totalCategories = sortedCategories.length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lender Products by Category
        </h1>
        <p className="text-gray-600 mb-4">
          Comprehensive directory of {totalProducts} authentic financing products across {totalCategories} categories
        </p>
        
        <div className="flex gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            <span>{totalProducts} Products</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>{totalCategories} Categories</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {sortedCategories.map((category) => {
          const categoryProducts = productsByCategory[category];
          const categoryName = getCategoryDisplayName(category);
          const categoryDesc = getCategoryDescription(category);
          
          return (
            <div key={category} className="space-y-4">
              <div className="border-l-4 border-teal-500 pl-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  {categoryName}
                </h2>
                <p className="text-gray-600 text-sm mb-2">{categoryDesc}</p>
                <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                  {categoryProducts.length} {categoryProducts.length === 1 ? 'Product' : 'Products'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-gray-900">
                        {product.productName}
                      </CardTitle>
                      <CardDescription className="font-medium text-teal-700">
                        {product.lenderName}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}
                        </span>
                      </div>

                      {product.geography && product.geography.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span>{product.geography.join(', ')}</span>
                        </div>
                      )}

                      {product.minRevenue && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Min. Revenue:</span> {formatCurrency(product.minRevenue)}
                        </div>
                      )}

                      {product.industries && product.industries.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Industries:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.industries.slice(0, 3).map((industry, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {industry}
                              </Badge>
                            ))}
                            {product.industries.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.industries.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {product.description && (
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {category !== sortedCategories[sortedCategories.length - 1] && (
                <Separator className="mt-6" />
              )}
            </div>
          );
        })}
      </div>

      {totalProducts === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No lender products available at this time.</p>
        </div>
      )}
    </div>
  );
}