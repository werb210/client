import { usePublicLenders } from '@/hooks/usePublicLenders';
import { getProducts } from "../api/products";
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
import { Skeleton } from '@/components/ui/skeleton';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Database from 'lucide-react/dist/esm/icons/database';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Play from 'lucide-react/dist/esm/icons/play';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestLenderAPI() {
  const { data: products, isLoading, error } = usePublicLenders();

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

  const products = await getProducts();
return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Lender Products API Test
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Testing connection to: https://staffportal.replit.app/api/public/lenders
        </p>
      </div>

      {/* API Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            API Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting to API...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>Connection Failed: {error.message}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Connected Successfully - {products?.length || 0} products loaded</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
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
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">API Error</h3>
            <p className="text-red-700 mb-4">{error.message}</p>
            <p className="text-sm text-red-600">
              This could indicate CORS issues, network problems, or the API being unavailable.
            </p>
          </CardContent>
        </Card>
      ) : products && products.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Available Lender Products ({products.length})
          </h2>
          
          {products.map((product: LenderProduct) => (
            <Card key={product.id} className="border-2 hover:border-teal-200 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-slate-900">{product.product_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-600">{product.lender_name}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {getProductTypeLabel(product.product_type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Funding Range:</span>
                    <div className="text-slate-600">
                      {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                    </div>
                  </div>
                  {product.min_revenue && (
                    <div>
                      <span className="font-medium text-slate-700">Min. Annual Revenue:</span>
                      <div className="text-slate-600">{formatCurrency(product.min_revenue)}</div>
                    </div>
                  )}
                  {product.geography && product.geography.length > 0 && (
                    <div>
                      <span className="font-medium text-slate-700">Geography:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.geography.map((geo, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {geo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.industries && product.industries.length > 0 && (
                    <div>
                      <span className="font-medium text-slate-700">Industries:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.industries.map((industry, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {product.description && (
                  <div>
                    <p className="text-slate-700 text-sm leading-relaxed">{product.description}</p>
                  </div>
                )}

                {product.video_url && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(product.video_url, '_blank')}
                      className="flex-shrink-0"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Explainer Video
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Products Available</h3>
            <p className="text-slate-600">
              The API connected successfully but no lender products were found in the database.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}