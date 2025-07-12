import { useState } from 'react';
import { usePublicLenders } from '@/hooks/usePublicLenders';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface Step2Props {
  formData: any;
  selectedProduct: string;
  onProductSelect: (product: string) => void;
  onContinue: () => void;
  onPrevious: () => void;
}

/**
 * PRODUCTION SIMPLE STEP 2
 * Shows all cached products directly without complex filtering
 */
export function Step2ProductionSimple({ 
  formData, 
  selectedProduct, 
  onProductSelect, 
  onContinue, 
  onPrevious 
}: Step2Props) {
  
  // Direct cache access - no complex filtering
  const { data: allProducts = [] } = usePublicLenders();
  
  const handleProductClick = (categoryKey: string) => {
    const isCurrentlySelected = selectedProduct === categoryKey;
    onProductSelect(isCurrentlySelected ? '' : categoryKey);
  };

  const handleContinue = () => {
    if (selectedProduct) {
      onContinue();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Business Financing Options</h2>
        <p className="text-muted-foreground">
          We found {allProducts.length} financing products for your business. Select one to continue.
        </p>
      </div>

      {allProducts.length === 0 ? (
        <div className="p-6 border border-amber-200 bg-amber-50 rounded-lg text-center">
          <p className="text-amber-700">No products available. Please populate the cache first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedProduct === 'business_financing' 
                ? 'ring-2 ring-orange-500 bg-orange-50' 
                : 'hover:border-orange-300'
            }`}
            onClick={() => handleProductClick('business_financing')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Business Financing</span>
                    {selectedProduct === 'business_financing' && (
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    {allProducts.length} available products from our lending network
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">100%</div>
                  <div className="text-sm text-muted-foreground">Match Score</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  <strong>Product Count:</strong> {allProducts.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Funding Range:</strong> ${Math.min(...allProducts.map(p => p.minAmount || 0)).toLocaleString()} - ${Math.max(...allProducts.map(p => p.maxAmount || 0)).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Available Markets:</strong> {Array.from(new Set(allProducts.map(p => p.country))).join(', ')}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!selectedProduct}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}