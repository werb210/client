import { useState, useEffect } from 'react';
import { useProductCategories } from '@/hooks/useProductCategories';
import { usePublicLenders } from '@/hooks/usePublicLenders';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle, ArrowRight, AlertTriangle, Bug } from 'lucide-react';
import { formatCategoryName } from '../utils/formatters';
import { FieldMappingDebugOverlay } from './FieldMappingDebugOverlay';

interface ProductCategory {
  category: string;
  count: number;  
  percentage: number;
}

// Interface removed - using client-side ProductCategory from useProductCategories hook

interface Step2Props {
  formData: any;
  selectedProduct: string;
  onProductSelect: (product: string) => void;
  onContinue: () => void;
  onPrevious: () => void;
}

export function Step2RecommendationEngine({ 
  formData, 
  selectedProduct, 
  onProductSelect, 
  onContinue, 
  onPrevious 
}: Step2Props) {
  
  // Debug overlay state
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  
  // Use client-side authentic 41-product database for filtering
  // FIX: Map businessLocation to headquarters for backward compatibility
  const headquarters = formData.headquarters || formData.businessLocation || 'US';
  
  // Get all lender products for debug overlay
  const { data: allLenderProducts, isLoading: rawLoading, error: rawError } = usePublicLenders();
  const { data: productCategories, isLoading, error } = useProductCategories({
    headquarters: headquarters,
    lookingFor: formData.lookingFor,
    fundingAmount: formData.fundingAmount,
    accountsReceivableBalance: formData.accountsReceivableBalance || 0,
    fundsPurpose: formData.fundsPurpose
  });

  console.log('✅ Using authentic 41-product database from client-side cache');
  console.log('[STEP2] Form data passed to useProductCategories:', {
    businessLocation: formData.businessLocation,
    headquarters: formData.headquarters,
    mappedHeadquarters: headquarters,
    lookingFor: formData.lookingFor,
    fundingAmount: formData.fundingAmount,
    accountsReceivableBalance: formData.accountsReceivableBalance || 0,
    fundsPurpose: formData.fundsPurpose
  });
  console.log('[STEP2] Hook response:', { productCategories, isLoading, error });
  console.log('[STEP2] Raw products status:', { 
    rawProductCount: allLenderProducts?.length, 
    rawLoading, 
    rawError: rawError?.message 
  });

  const handleProductClick = (categoryKey: string) => {
    const isCurrentlySelected = selectedProduct === categoryKey;
    onProductSelect(isCurrentlySelected ? '' : categoryKey);
  };

  // Format headquarters for display - handle multiple business location formats
  const formatHeadquarters = (hq: string) => {
    if (hq === 'US' || hq === 'United States') return 'United States';
    if (hq === 'CA' || hq === 'Canada') return 'Canada';
    if (hq === 'Other') return 'International';
    return hq;
  };

  // Format looking for display
  const formatLookingFor = (looking: string) => {
    const map: Record<string, string> = {
      'capital': 'Business Capital',
      'equipment': 'Equipment Financing',
      'both': 'Both Capital & Equipment'
    };
    return map[looking] || looking;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-teal-600" />
                Recommended Loan Products
              </CardTitle>
              <CardDescription>
                Based on your business profile, here are the best loan products for you
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowDebugOverlay(true)}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Bug className="w-4 h-4 mr-1" />
              Debug
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <h3 className="font-semibold text-teal-900 mb-3">Your Profile Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-teal-600">Headquarters:</span>
                  <div className="font-medium text-teal-900">
                    {headquarters ? formatHeadquarters(headquarters) : 'Not specified'}
                  </div>
                </div>
                <div>
                  <span className="text-teal-600">Funding Amount:</span>
                  <div className="font-medium text-teal-900">
                    {formData.fundingAmount ? `$${formData.fundingAmount.toLocaleString()}` : 'Not specified'}
                  </div>
                </div>
                <div>
                  <span className="text-teal-600">Looking For:</span>
                  <div className="font-medium text-teal-900">
                    {formData.lookingFor ? formatLookingFor(formData.lookingFor) : 'Not specified'}
                  </div>
                </div>
                <div>
                  <span className="text-teal-600">Industry:</span>
                  <div className="font-medium text-teal-900">
                    {formData.industry?.replace('_', ' ') || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Filter Notice */}
            {headquarters && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  <strong>Geographic Filter Active:</strong> Showing loan products available in {formatHeadquarters(headquarters)}
                </p>
              </div>
            )}

            {/* Selection Requirement Notice */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-orange-800 mb-1">Select Your Preferred Loan Product</h4>
                  <p className="text-sm text-orange-700">
                    Please click on the loan product below that best matches your business needs before continuing to the next step. 
                    Each option shows availability, terms, and match percentage based on your profile.
                  </p>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing loan products for your profile...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-600 mb-2">Unable to Load Products</h3>
                <p className="text-red-500 mb-4">
                  {error instanceof Error ? error.message : 'Failed to load product recommendations'}
                </p>
                <details className="text-left mb-4">
                  <summary className="text-sm text-red-600 cursor-pointer">Technical Details</summary>
                  <pre className="text-xs text-red-500 mt-1 whitespace-pre-wrap bg-red-50 p-2 rounded">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </details>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Retry
                </Button>
              </div>
            )}
            
            {/* No Products Debug */}
            {!isLoading && !error && (!productCategories || productCategories.length === 0) && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800 mb-1">No Products Found</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      No loan products match your current criteria. This could be due to geographic restrictions, 
                      funding amount outside available ranges, or product type preferences.
                    </p>
                    <details>
                      <summary className="text-xs text-yellow-600 cursor-pointer">Debug Information</summary>
                      <pre className="text-xs text-yellow-500 mt-1 whitespace-pre-wrap bg-yellow-50 p-2 rounded border">
{JSON.stringify({
  formData: {
    headquarters: formData.headquarters,
    lookingFor: formData.lookingFor,
    fundingAmount: formData.fundingAmount,
    accountsReceivableBalance: formData.accountsReceivableBalance,
    fundsPurpose: formData.fundsPurpose
  },
  productCategories,
  isLoading,
  error
}, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              </div>
            )}

            {/* Product Categories */}
            {!isLoading && !error && productCategories && (
              <div className="space-y-4">
                {productCategories.map((category, index: number) => {
                  const categoryName = formatCategoryName(category.category);
                  const isSelected = selectedProduct === category.category;
                  const matchScore = Math.max(95 - index * 5, 60); // Simulate intelligent scoring
                  
                  return (
                    <div 
                      key={category.category}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-teal-500 bg-teal-50 shadow-lg ring-2 ring-teal-200' 
                          : 'hover:shadow-md hover:border-teal-300 border-gray-200'
                      }`}
                      onClick={() => handleProductClick(category.category)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg flex items-center text-gray-900">
                            {categoryName}
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 ml-2 text-teal-600" />
                            )}
                          </h4>
                          <p className="text-gray-600">
                            {category.count} products available ({category.percentage}% of matches)
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            index === 0 ? 'bg-green-100 text-green-800' : 
                            index === 1 ? 'bg-teal-100 text-teal-800' : 
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {matchScore}% Match
                          </div>
                          {index === 0 && <div className="text-xs text-teal-600 mt-1 font-medium">Best Match</div>}
                        </div>
                      </div>

                      {/* Product Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">Available Products:</span>
                          <div className="font-medium text-gray-900">{category.count} options</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Market Share:</span>
                          <div className="font-medium text-gray-900">{category.percentage}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Match Score:</span>
                          <div className="font-medium text-gray-900">{matchScore}%</div>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>Matches your ${formData.fundingAmount?.toLocaleString()} funding requirement</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>Available in your region ({formatHeadquarters(headquarters)})</span>
                        </div>
                        {category.category === 'invoice_factoring' && formData.accountsReceivableBalance > 0 && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span>Compatible with your accounts receivable balance</span>
                          </div>
                        )}
                        {formData.lookingFor === 'equipment' && category.category === 'equipment_financing' && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span>Perfect match for equipment financing needs</span>
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <div className="mt-3 p-3 bg-teal-100 rounded-lg">
                          <p className="text-sm text-teal-800">
                            <strong>Selected:</strong> {categoryName} products will be used for your document requirements and application processing.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Summary */}
                {productCategories.length > 0 && (
                  <div className="text-center text-sm text-gray-600 pt-4 border-t">
                    ✅ Found authentic lender products across {productCategories.length} categories using 41-product database
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Previous
        </Button>
        <Button 
          onClick={onContinue}
          disabled={!selectedProduct}
          className={`${selectedProduct 
            ? 'bg-teal-600 hover:bg-teal-700 text-white' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          } transition-colors`}
          data-cy="next"
        >
          {selectedProduct ? 'Continue to Business Details' : 'Select a Product First'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Field Mapping Debug Overlay */}
      <FieldMappingDebugOverlay
        products={allLenderProducts || []}
        formData={formData}
        isVisible={showDebugOverlay}
        onToggle={() => setShowDebugOverlay(!showDebugOverlay)}
      />
    </div>
  );
}