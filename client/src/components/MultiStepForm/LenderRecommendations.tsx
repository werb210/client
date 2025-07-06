import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApplication } from '@/context/ApplicationContext';
import { CreditCard, TrendingUp, FileText } from '@/lib/icons';
import { useQuery } from '@tanstack/react-query';

interface LenderRecommendationsProps {
  onNext: () => void;
  onBack: () => void;
}

export function LenderRecommendations({ onNext, onBack }: LenderRecommendationsProps) {
  const { state, dispatch } = useApplication();
  const [selectedProduct, setSelectedProduct] = useState<string>(
    state.formData.selectedProduct || ''
  );

  // Use synced lender products from database
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['synced-lender-products'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/lenders`);
      if (!res.ok) throw new Error('Failed to fetch lender products');
      const data = await res.json();
      console.log("Step 2 - Matched Products from Synced DB:", data);
      return data.products || data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const handleProductSelect = (productType: string) => {
    setSelectedProduct(productType);
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        section: 'selectedProduct',
        data: productType
      }
    });
  };

  const getProductColor = (type: string) => {
    const colors = {
      working_capital: 'bg-blue-100 text-blue-800',
      equipment_financing: 'bg-green-100 text-green-800',
      line_of_credit: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getProductIcon = (type: string) => {
    const icons = {
      working_capital: <CreditCard className="w-6 h-6" />,
      equipment_financing: <TrendingUp className="w-6 h-6" />,
      line_of_credit: <FileText className="w-6 h-6" />
    };
    return icons[type as keyof typeof icons] || <FileText className="w-6 h-6" />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Recommended Financing Options
        </h2>
        <p className="text-gray-600">
          Based on your business profile, here are our top recommendations
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {products.slice(0, 6).map((product: any) => (
          <Card
            key={product.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedProduct === product.category
                ? `ring-2 ring-blue-500 ${getProductColor(product.category)}`
                : 'hover:shadow-md'
            }`}
            onClick={() => handleProductSelect(product.category)}
          >
            <CardHeader className="text-center pb-4">
              <div className={`w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center ${getProductColor(product.category)}`}>
                {getProductIcon(product.category)}
              </div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              {selectedProduct === product.category && (
                <Badge className="bg-blue-500 text-white">Selected</Badge>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 text-center">
                Select to learn more about this financing option
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Previous
        </Button>
        <Button 
          onClick={onNext}
          disabled={!selectedProduct}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue with Selected Option
        </Button>
      </div>
    </div>
  );
}