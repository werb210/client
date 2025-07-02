import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, Target, TrendingUp, Shield, Lightbulb, Loader2, CheckCircle } from 'lucide-react';
import { useComprehensiveForm } from '@/context/ComprehensiveFormContext';
import { useStaffRecommendations, convertStep1ToRecommendationData, convertRevenueToMonthly } from '@/hooks/useStaffRecommendations';
import { generateIndustryInsights } from '@/lib/industryInsights';

interface Step2Props {
  onNext: () => void;
  onPrevious: () => void;
}

export function Step2ProductSelection({ onNext, onPrevious }: Step2Props) {
  const { state, updateFormData } = useComprehensiveForm();
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  // Convert Step 1 data to recommendation format
  const recommendationData = convertStep1ToRecommendationData(state.formData);
  const monthlyRevenue = convertRevenueToMonthly(state.formData.lastYearRevenue || '');

  // Get staff database recommendations using your business rules
  const { recommendations, isLoading, error } = useStaffRecommendations(recommendationData, monthlyRevenue);
  
  // Get industry insights
  const industryInsights = generateIndustryInsights(state.formData.industry || '');

  const handleContinue = () => {
    if (selectedProduct && recommendations) {
      // Find the selected product from recommendations
      const selectedStaffProduct = recommendations.allFilteredProducts.find(p => p.id === selectedProduct);
      if (selectedStaffProduct) {
        updateFormData({
          selectedProductId: selectedStaffProduct.id,
          selectedProductName: selectedStaffProduct.productName,
          selectedLenderName: selectedStaffProduct.lenderName,
        });
      }
      onNext();
    }
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
        <span className="ml-2 text-gray-600">Loading product recommendations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-600">Failed to load product categories</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Industry Insights & Recommendations</CardTitle>
        <CardDescription>
          Based on your business profile, here are the best loan products for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Summary Section */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Your Profile Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Headquarters: <span className="font-medium">{formData.headquarters}</span></div>
            <div>Funding Amount: <span className="font-medium">{formatCurrency(formData.fundingAmount)}</span></div>
            <div>Industry: <span className="font-medium">{state.formData.industry || 'Not specified'}</span></div>
            <div>Purpose: <span className="font-medium">{formData.fundsPurpose || 'Not specified'}</span></div>
          </div>
        </div>

        {/* Geographic Filter Indicator */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            <strong>Country Filter Active:</strong> Showing loan products available in {formData.headquarters}
          </p>
        </div>

        {/* Industry Insights Section */}
        {industryInsights && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              {industryInsights.title}
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Trends
                </h4>
                <ul className="space-y-1">
                  {industryInsights.trends.map((trend, index) => (
                    <li key={index} className="text-purple-700">• {trend}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {industryInsights.recommendations.map((rec, index) => (
                    <li key={index} className="text-purple-700">• {rec}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {industryInsights.riskFactors.map((risk, index) => (
                    <li key={index} className="text-purple-700">• {risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Product Selection Instructions */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-800">Select Your Preferred Loan Product</h4>
              <p className="text-sm text-amber-700">
                Please click on the lender product below that best matches your business needs.
                Each option shows availability, terms, and match percentage.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Product Categories */}
        <div className="space-y-4">
          {productCategories.length > 0 ? (
            productCategories.map((category, index) => (
              <ProductCategoryCard 
                key={category.category}
                category={category}
                index={index}
                isSelected={selectedProduct === category.category}
                onSelect={setSelectedProduct}
              />
            ))
          ) : (
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Matching Product Categories Found
              </h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any loan product categories that match your current criteria. 
                Try adjusting your funding amount or business location in the previous step.
              </p>
              <Button variant="outline" onClick={onPrevious}>
                Go Back and Adjust Criteria
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={onPrevious}
            className="min-w-[120px]"
          >
            Previous
          </Button>
          
          <Button 
            onClick={handleContinue}
            disabled={!selectedProduct}
            className={`min-w-[120px] ${!selectedProduct ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {!selectedProduct ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Select a Product to Continue
              </>
            ) : (
              <>
                Continue to Application
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Product Categories: {productCategories.length}</p>
            <p>Selected Product: {selectedProduct || 'None'}</p>
            <p>Headquarters: {formData.headquarters}</p>
            <p>Funding Amount: ${formData.fundingAmount}</p>
            <p>Looking For: {formData.lookingFor}</p>
            <p>AR Balance: ${formData.accountsReceivableBalance}</p>
            <p>Purpose: {formData.fundsPurpose}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}