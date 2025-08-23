import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Target from 'lucide-react/dist/esm/icons/target';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Lightbulb from 'lucide-react/dist/esm/icons/lightbulb';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
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
  const monthlyRevenue = convertRevenueToMonthly(state.formData.revenueLastYear?.toString() || "0");

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
          selectedProductName: selectedStaffProduct.name,
          selectedLenderName: selectedStaffProduct.lenderName,
        });
      }
      onNext();
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            <CardTitle>Finding Your Perfect Financing Options</CardTitle>
          </div>
          <CardDescription>
            Analyzing your business profile against our database of 43+ lender products...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle>Unable to Load Recommendations</CardTitle>
          </div>
          <CardDescription>
            We're having trouble connecting to our lender database. Please check your connection or try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
            <Button onClick={onNext} disabled={!selectedProduct}>
              Continue Without Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.totalMatches === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-500" />
            <CardTitle>No Perfect Matches Found</CardTitle>
          </div>
          <CardDescription>
            Based on your criteria, we couldn't find exact matches. Consider adjusting your requirements or exploring broader options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button onClick={onPrevious} variant="outline">
              Adjust Requirements
            </Button>
            <Button onClick={onNext}>
              Continue Anyway
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Recommended Financing Options
              </CardTitle>
              <CardDescription className="text-lg">
                We found {recommendations.totalMatches} products that match your business profile
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">
                {Math.round(recommendations.averageScore)}%
              </div>
              <div className="text-sm text-gray-500">Avg Match Score</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Industry Insights */}
      {industryInsights && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Industry Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800">{String(industryInsights)}</p>
          </CardContent>
        </Card>
      )}

      {/* Product Categories */}
      <div className="grid gap-6">
        {Object.entries(recommendations.productsByCategory).map(([category, products], index) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">{category.replace('_', ' ')}</span>
                <Badge variant="secondary">{products.length} options</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid gap-4 p-6">
                {products.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    data-testid={`product-card--e2e-runner-${index}`}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedProduct === product.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProduct(product.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{product.productName}</h4>
                          {selectedProduct === product.id && (
                            <CheckCircle className="h-4 w-4 text-teal-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{product.lenderName}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            ${parseFloat(product.amountRange.min).toLocaleString()} - 
                            ${parseFloat(product.amountRange.max).toLocaleString()}
                          </span>
                          <span>Geography: {product.geography.join(', ')}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-teal-600">
                          {Math.round(product.matchScore)}%
                        </div>
                        <div className="text-xs text-gray-500">Match Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Best Match Highlight */}
      {recommendations.bestMatch && (
        <Card className="border-2 border-teal-200 bg-teal-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-teal-800">Top Recommendation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">{recommendations.bestMatch.name}</h4>
                <p className="text-teal-700">{recommendations.bestMatch.lenderName}</p>
                <p className="text-sm text-teal-600 mt-1">{recommendations.bestMatch.description}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {Math.round(recommendations.bestMatch.matchScore)}%
                </div>
                <div className="text-sm text-teal-500">Perfect Match</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button onClick={onPrevious} variant="outline" size="lg">
          Previous Step
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedProduct}
          size="lg"
          className="bg-teal-600 hover:bg-teal-700"
        >
          Continue with Selected Product
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}