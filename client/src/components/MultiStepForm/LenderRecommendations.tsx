import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApplication } from '@/context/ApplicationContext';
import { LenderProduct } from '@/types/lenderProducts';
import { CreditCard, TrendingUp, FileText, Play } from 'lucide-react';

interface LenderRecommendationsProps {
  onNext: () => void;
  onBack: () => void;
}

export function LenderRecommendations({ onNext, onBack }: LenderRecommendationsProps) {
  const { state, dispatch } = useApplication();
  const [selectedProduct, setSelectedProduct] = useState<string>(
    state.formData.selectedProduct || ''
  );

  const { data: lenderProducts, isLoading } = useQuery<LenderProduct[]>({
    queryKey: ['/api/lender-products'],
  });

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'term_loan':
        return <TrendingUp className="w-6 h-6 text-blue-500" />;
      case 'line_of_credit':
        return <CreditCard className="w-6 h-6 text-green-500" />;
      case 'invoice_factoring':
        return <FileText className="w-6 h-6 text-orange-500" />;
      default:
        return <TrendingUp className="w-6 h-6 text-gray-500" />;
    }
  };

  const getProductColor = (type: string) => {
    switch (type) {
      case 'term_loan':
        return 'bg-blue-100 border-blue-200';
      case 'line_of_credit':
        return 'bg-green-100 border-green-200';
      case 'invoice_factoring':
        return 'bg-orange-100 border-orange-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const handleProductSelect = (productType: string) => {
    setSelectedProduct(productType);
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        section: 'selectedProduct',
        data: productType,
      },
    });
  };

  const handleNext = () => {
    if (selectedProduct) {
      onNext();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          AI-Powered Lender Recommendations
        </h3>
        <p className="text-gray-600">
          Based on your business information, we recommend these financing options:
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {lenderProducts?.map((product) => (
          <Card
            key={product.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedProduct === product.type
                ? `ring-2 ring-blue-500 ${getProductColor(product.type)}`
                : 'hover:shadow-md'
            }`}
            onClick={() => handleProductSelect(product.type)}
          >
            <CardHeader className="text-center pb-4">
              <div className={`w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center ${getProductColor(product.type)}`}>
                {getProductIcon(product.type)}
              </div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              {selectedProduct === product.type && (
                <Badge className="bg-blue-500 text-white">Selected</Badge>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 text-center">{product.description}</p>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Range:</span>
                  <span className="font-medium">
                    ${product.minAmount?.toLocaleString()} - ${product.maxAmount?.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Interest Rate:</span>
                  <span className="font-medium">
                    {product.interestRateMin}% - {product.interestRateMax}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Term:</span>
                  <span className="font-medium">
                    {product.termMin} - {product.termMax} months
                  </span>
                </div>
              </div>

              {product.videoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(product.videoUrl, '_blank');
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Explainer
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Recommendation Badge */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">AI Recommendation</h4>
            <p className="text-sm text-blue-800">
              Based on your {state.formData.businessInfo?.industry} business with ${state.formData.businessInfo?.loanAmount?.toLocaleString()} funding needs, 
              we recommend starting with a <strong>Term Loan</strong> for the best rates and terms.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!selectedProduct}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
