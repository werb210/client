import React, { useState } from 'react';
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
  const { data: allProducts = [], isLoading, error } = usePublicLenders();

  // Debug cache status and field validation
  React.useEffect(() => {
    if (!isLoading) {
      // console.log(`[STEP2] Cache status: ${allProducts.length} products, error:`, error?.message || 'none');
      if (allProducts.length > 0) {
        const sample = allProducts[0];
        // console.log('[STEP2] Sample product:', sample);
        
        // Detailed field analysis
        const fieldCheck = {
          hasMinAmount: !!sample?.minAmount,
          hasMaxAmount: !!sample?.maxAmount,
          hasCountry: !!sample?.country,
          minAmountType: typeof sample?.minAmount,
          maxAmountType: typeof sample?.maxAmount,
          minAmountValue: sample?.minAmount,
          maxAmountValue: sample?.maxAmount,
          isMinAmountNaN: isNaN(sample?.minAmount),
          isMaxAmountNaN: isNaN(sample?.maxAmount),
          allFields: Object.keys(sample || {})
        };
        // console.log('[STEP2] Field validation:', fieldCheck);
        
        // Additional field mapping check
        const hasAPIFields = !!(sample?.amountMin && sample?.amountMax);
        const hasSchemaFields = !!(sample?.minAmount && sample?.maxAmount);
        // console.log('[STEP2] Field mapping check:', { hasAPIFields, hasSchemaFields });
        
        // Check for field name variations and problematic products
        const fieldAnalysis = allProducts.map(p => ({
          hasMinAmount: !!p.minAmount,
          hasMaxAmount: !!p.maxAmount,
          hasAmountMin: !!p.amountMin,
          hasAmountMax: !!p.amountMax,
          minAmountType: typeof p.minAmount,
          maxAmountType: typeof p.maxAmount,
          amountMinType: typeof p.amountMin,
          amountMaxType: typeof p.amountMax
        }));
        
        const withSchemaFields = fieldAnalysis.filter(p => p.hasMinAmount && p.hasMaxAmount).length;
        const withAPIFields = fieldAnalysis.filter(p => p.hasAmountMin && p.hasAmountMax).length;
        
        // console.log(`[STEP2] Field analysis - Schema format: ${withSchemaFields}, API format: ${withAPIFields}, Total: ${allProducts.length}`);
        
        if (fieldAnalysis.length > 0) {
          // console.log('[STEP2] Field structure sample:', fieldAnalysis[0]);
        }
      }
    }
  }, [allProducts, isLoading, error]);
  
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

      {isLoading ? (
        <div className="p-6 border border-blue-200 bg-blue-50 rounded-lg text-center">
          <p className="text-blue-700">Loading financing products from cache...</p>
        </div>
      ) : allProducts.length === 0 ? (
        <div className="p-6 border border-amber-200 bg-amber-50 rounded-lg text-center space-y-4">
          <p className="text-amber-700">No products in cache. Please populate the cache first.</p>
          <div className="text-sm text-amber-600 space-y-2">
            <p>Debug info:</p>
            <p>• Loading: {String(isLoading)}</p>
            <p>• Products: {allProducts.length}</p>
            <p>• Error: {error?.message || 'none'}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-700">Options to populate cache:</p>
            <div className="flex gap-2 justify-center">
              <a href="/cache-management" className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                Cache Management
              </a>
              <a href="/initial-cache-setup" className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                Initial Setup
              </a>
            </div>
          </div>
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
                  <strong>Funding Range:</strong> {
                    (() => {
                      // Check ALL possible field name variations for amount fields
                      const validProducts = allProducts.filter(p => {
                        if (!p) return false;
                        
                        // Try many possible field name combinations
                        const amountFields = [
                          [p.minAmount, p.maxAmount],
                          [p.amountMin, p.amountMax],
                          [p.minAmountUsd, p.maxAmountUsd],
                          [p.amount_min, p.amount_max],
                          [p.min_amount, p.max_amount],
                          [p.fundingMin, p.fundingMax],
                          [p.loanMin, p.loanMax],
                        ];
                        
                        // Check if any field pair has valid numeric values
                        return amountFields.some(([min, max]) => {
                          if (!min || !max) return false;
                          
                          const minNum = typeof min === 'number' ? min : parseFloat(String(min));
                          const maxNum = typeof max === 'number' ? max : parseFloat(String(max));
                          
                          return !isNaN(minNum) && !isNaN(maxNum) && minNum > 0 && maxNum > 0;
                        });
                      });
                      
                      if (validProducts.length === 0) {
                        // Show detailed field analysis for debugging
                        const sampleFields = allProducts.length > 0 ? Object.keys(allProducts[0]) : [];
                        return `No amount fields found. Sample fields: ${sampleFields.slice(0, 5).join(', ')}...`;
                      }
                      
                      // Extract min/max amounts from any valid field combination
                      const amounts = validProducts.map(p => {
                        // Try all possible field combinations
                        const fieldPairs = [
                          [p.minAmount, p.maxAmount],
                          [p.amountMin, p.amountMax],
                          [p.minAmountUsd, p.maxAmountUsd],
                          [p.amount_min, p.amount_max],
                          [p.min_amount, p.max_amount],
                          [p.fundingMin, p.fundingMax],
                          [p.loanMin, p.loanMax],
                        ];
                        
                        for (const [minField, maxField] of fieldPairs) {
                          if (minField && maxField) {
                            const min = typeof minField === 'number' ? minField : parseFloat(String(minField));
                            const max = typeof maxField === 'number' ? maxField : parseFloat(String(maxField));
                            
                            if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0) {
                              return { min, max };
                            }
                          }
                        }
                        
                        return null;
                      }).filter(a => a !== null);
                      
                      if (amounts.length === 0) {
                        return 'Unable to parse amount fields';
                      }
                      
                      const min = Math.min(...amounts.map(a => a.min));
                      const max = Math.max(...amounts.map(a => a.max));
                      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
                    })()
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Available Markets:</strong> {
                    allProducts.length > 0 
                      ? Array.from(new Set(allProducts.map(p => p.country).filter(Boolean))).join(', ') || 'Not specified'
                      : 'None'
                  }
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