import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, Target, TrendingUp, Shield, Lightbulb, Loader2 } from 'lucide-react';
import { useComprehensiveForm } from '@/context/ComprehensiveFormContext';
import { useProductCategories } from '@/hooks/useProductCategories';
import { ProductCategoryCard } from '@/components/ProductCategoryCard';
import { generateIndustryInsights } from '@/lib/industryInsights';
import { RecommendationFormData } from '@/lib/recommendation';
import MainLayout from '@/components/layout/MainLayout';

interface Step2Props {
  onNext: () => void;
  onPrevious: () => void;
}

export function Step2ProductSelection({ onNext, onPrevious }: Step2Props) {
  const { state, updateFormData } = useComprehensiveForm();
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  // Create form data for recommendation filtering
  const formData: RecommendationFormData = {
    headquarters: state.formData.headquarters || 'US',
    fundingAmount: state.formData.fundingAmount || 0,
    lookingFor: state.formData.lookingFor || 'capital',
    accountsReceivableBalance: state.formData.accountsReceivableBalance || 0,
    fundsPurpose: state.formData.fundsPurpose || '',
  };

  // Get product categories based on filtering
  const { data: productCategories = [], isLoading, error } = useProductCategories(formData);
  
  // Get industry insights
  const industryInsights = generateIndustryInsights(state.formData.industry || '');

  const handleContinue = () => {
    if (selectedProduct) {
      // Find the selected category and its first product for basic data
      const selectedCategory = productCategories.find(cat => cat.category === selectedProduct);
      if (selectedCategory && selectedCategory.products.length > 0) {
        const firstProduct = selectedCategory.products[0];
        updateFormData({
          selectedProductId: firstProduct.id,
          selectedProductName: firstProduct.product_name,
          selectedLenderName: firstProduct.lender_name,
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
      <div className="flex items-center justify-center p-modern-2xl">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue-600" />
        <span className="ml-modern-sm body-modern text-modern-secondary">Loading product recommendations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-modern-2xl">
        <AlertCircle className="h-8 w-8 text-error-500" />
        <span className="ml-modern-sm body-modern text-error-600">Failed to load product categories</span>
      </div>
    );
  }

  return (
    <MainLayout>
      <Card className="card-modern">
        <CardHeader className="p-modern-xl">
          <CardTitle className="heading-modern-h2">Industry Insights & Recommendations</CardTitle>
          <CardDescription className="body-modern-large text-modern-secondary">
            Based on your business profile, here are the best loan products for you
          </CardDescription>
        </CardHeader>
      <CardContent className="p-modern-xl space-y-modern-xl">
        {/* Profile Summary Section */}
        <div className="bg-brand-blue-50 p-modern-lg rounded-modern-lg">
          <h3 className="heading-modern-h4 text-brand-blue-900 mb-modern-sm">Your Profile Summary</h3>
          <div className="grid grid-cols-2 gap-modern-lg body-modern-small">
            <div>Headquarters: <span className="font-medium text-modern-primary">{formData.headquarters}</span></div>
            <div>Funding Amount: <span className="font-medium text-modern-primary">{formatCurrency(formData.fundingAmount)}</span></div>
            <div>Industry: <span className="font-medium text-modern-primary">{state.formData.industry || 'Not specified'}</span></div>
            <div>Purpose: <span className="font-medium text-modern-primary">{formData.fundsPurpose || 'Not specified'}</span></div>
          </div>
        </div>

        {/* Geographic Filter Indicator */}
        <div className="bg-success-50 p-modern-md rounded-modern-lg border border-success-200">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-success-600 mr-modern-sm" />
            <span className="body-modern-small text-success-700">
              Showing products available in {formData.headquarters}
            </span>
          </div>
        </div>

        {/* Industry Insights Section */}
        {industryInsights && (
          <div className="bg-purple-50 p-modern-lg rounded-modern-lg border border-purple-200 card-modern">
            <h3 className="heading-modern-h4 text-purple-900 mb-modern-sm flex items-center">
              <Lightbulb className="w-5 h-5 mr-modern-sm" />
              {industryInsights.title}
            </h3>
            <div className="grid md:grid-cols-3 gap-modern-lg body-modern-small">
              <div>
                <h4 className="body-modern font-medium text-purple-800 mb-modern-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-modern-xs" />
                  Trends
                </h4>
                <ul className="space-y-modern-xs">
                  {industryInsights.trends.map((trend, index) => (
                    <li key={index} className="text-purple-700">• {trend}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="body-modern font-medium text-purple-800 mb-modern-sm flex items-center">
                  <Target className="w-4 h-4 mr-modern-xs" />
                  Recommendations
                </h4>
                <ul className="space-y-modern-xs">
                  {industryInsights.recommendations.map((rec, index) => (
                    <li key={index} className="text-purple-700">• {rec}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="body-modern font-medium text-purple-800 mb-modern-sm flex items-center">
                  <Shield className="w-4 h-4 mr-modern-xs" />
                  Risk Factors
                </h4>
                <ul className="space-y-modern-xs">
                  {industryInsights.riskFactors.map((risk, index) => (
                    <li key={index} className="text-purple-700">• {risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Product Selection Instructions */}
        <div className="bg-amber-50 p-modern-lg rounded-modern-lg border border-amber-200 card-modern">
          <div className="flex items-start space-x-modern-sm">
            <Target className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="body-modern font-semibold text-amber-800">Select Your Preferred Loan Product</h4>
              <p className="body-modern-small text-amber-700">
                Please click on the lender product below that best matches your business needs.
                Each option shows availability, terms, and match percentage.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Product Categories */}
        <div className="space-y-modern-lg">
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
            <div className="text-center p-modern-2xl card-modern">
              <AlertCircle className="h-12 w-12 text-warning-500 mx-auto mb-modern-lg" />
              <h3 className="heading-modern-h4 text-modern-primary mb-modern-sm">
                No Matching Product Categories Found
              </h3>
              <p className="body-modern text-modern-secondary mb-modern-lg">
                We couldn't find any loan product categories that match your current criteria. 
                Try adjusting your funding amount or business location in the previous step.
              </p>
              <Button variant="outline" onClick={onPrevious} className="btn-modern btn-modern-outline">
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
    </MainLayout>
  );
}