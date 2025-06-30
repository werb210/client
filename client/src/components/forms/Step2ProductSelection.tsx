import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Play, Loader2, AlertCircle } from 'lucide-react';
import { useLocalLenders, LenderProduct } from '@/hooks/useLocalLenders';
import { useComprehensiveForm } from '@/context/ComprehensiveFormContext';
import { filterProducts, RecommendationFormData } from '@/lib/recommendation';

interface Step2Props {
  onNext: () => void;
  onPrevious: () => void;
}

export function Step2ProductSelection({ onNext, onPrevious }: Step2Props) {
  const { state, updateFormData } = useComprehensiveForm();
  const { data: products = [], isLoading, error } = useLocalLenders();
  
  const handleProductSelect = (product: LenderProduct) => {
    updateFormData({
      selectedProductId: product.id,
      selectedProductName: product.product_name,
      selectedLenderName: product.lender_name,
    });
    onNext();
  };

  // Create form data for recommendation filtering
  const formData: RecommendationFormData = {
    headquarters: state.formData.headquarters || 'US',
    fundingAmount: state.formData.fundingAmount || 0,
    lookingFor: state.formData.lookingFor || 'capital',
    accountsReceivableBalance: state.formData.accountsReceivableBalance || 0,
    fundsPurpose: state.formData.fundsPurpose || '',
  };

  // Apply new business rules filtering
  const recommendedProducts = filterProducts(products, formData);

  const getProductTypeLabel = (type: string) => {
    const labels = {
      'equipment_financing': 'Equipment Financing',
      'invoice_factoring': 'Invoice Factoring', 
      'line_of_credit': 'Line of Credit',
      'working_capital': 'Working Capital',
      'term_loan': 'Term Loan',
      'purchase_order_financing': 'Purchase Order Financing',
      'commercial_real_estate': 'Commercial Real Estate',
      'merchant_cash_advance': 'Merchant Cash Advance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading lender products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-600">Failed to load lender products</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Recommended Financing Options
        </h2>
        <p className="text-gray-600">
          Based on your business profile, here are the best matches from our lender network
        </p>
      </div>

      {/* Recommendations */}
      {recommendedProducts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendedProducts.map((product) => (
            <Card 
              key={product.id} 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-blue-300"
              onClick={() => handleProductSelect(product)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-gray-900 mb-1">
                      {getProductTypeLabel(product.product_type)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 font-medium">
                      {product.lender_name}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Amount Range */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Funding Range</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                  </p>
                </div>

                {/* Geography */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Available In</p>
                  <div className="flex gap-1">
                    {product.geography.map((geo) => (
                      <Badge key={geo} variant="outline" className="text-xs">
                        {geo}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Interest Rate */}
                {product.interest_rate_min && product.interest_rate_max && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Interest Rate</p>
                    <p className="text-sm text-gray-600">
                      {product.interest_rate_min}% - {product.interest_rate_max}%
                    </p>
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Video Link */}
                {product.video_url && (
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(product.video_url, '_blank');
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Watch Video
                    </Button>
                  </div>
                )}

                {/* Select Button */}
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductSelect(product);
                  }}
                >
                  Select This Option
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Matching Products Found
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any lender products that match your current criteria. 
            Try adjusting your funding amount or business location in the previous step.
          </p>
          <Button variant="outline" onClick={onPrevious}>
            Go Back and Adjust Criteria
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="min-w-[120px]"
        >
          Previous
        </Button>
        
        {recommendedProducts.length === 0 && (
          <Button 
            onClick={onNext}
            className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
          >
            Continue Anyway
          </Button>
        )}
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Total Products: {products.length}</p>
          <p>Recommended: {recommendedProducts.length}</p>
          <p>Headquarters: {formData.headquarters}</p>
          <p>Funding Amount: ${formData.fundingAmount}</p>
          <p>Looking For: {formData.lookingFor}</p>
          <p>AR Balance: ${formData.accountsReceivableBalance}</p>
          <p>Purpose: {formData.fundsPurpose}</p>
        </div>
      )}
    </div>
  );
}