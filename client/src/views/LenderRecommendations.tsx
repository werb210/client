import { useState, useEffect } from 'react';
import { fetchLenderProducts } from '../services/lenderProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface LenderRecommendationsProps {
  applicationId: string;
  allDocumentsAccepted: boolean;
}

export default function LenderRecommendations({ applicationId, allDocumentsAccepted }: LenderRecommendationsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!allDocumentsAccepted) {
      return; // Don't fetch until docs are approved
    }

    const loadLenderProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // ✅ Only fetch when docs are fully accepted
        const { products } = await fetchLenderProducts(applicationId);
        setProducts(products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lender products');
      } finally {
        setLoading(false);
      }
    };

    loadLenderProducts();
  }, [applicationId, allDocumentsAccepted]);

  // Show waiting message if documents not approved
  if (!allDocumentsAccepted) {
    return (
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-600" />
            <CardTitle className="text-orange-700">Document Review Pending</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Waiting for required documents to be approved…
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-2">Loading lender recommendations...</span>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent>
          <Alert className="border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // ✅ Render product list when docs approved and products loaded
  if (products.length > 0) {
    return renderProductList(products);
  }

  return (
    <Card>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No matching lender products found for your application.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function renderProductList(products: any[]) {
  return (
    <div className="space-y-4">
      <Card className="border-2 border-green-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <CardTitle className="text-green-700">
              Lender Recommendations Ready
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Found {products.length} matching lender products for your application:
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <Card key={product.id || index} className="border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{product.name || product.lender}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Category:</strong> {product.category || product.productCategory}
                  </p>
                  {product.interestRateMin && (
                    <p className="text-sm text-gray-600">
                      <strong>Rate:</strong> {product.interestRateMin}% - {product.interestRateMax}%
                    </p>
                  )}
                  {product.maxAmountUsd && (
                    <p className="text-sm text-gray-600">
                      <strong>Max Amount:</strong> ${product.maxAmountUsd.toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}