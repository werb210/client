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

  // Staff recommendations are disabled - provide fallback data
  const recommendationData = null;
  const monthlyRevenue = 0;

  // Get staff database recommendations (returns disabled state)
  const { recommendations, isLoading, error } = useStaffRecommendations();
  
  // Get industry insights (safe access)
  const industry = state?.formData?.industry ?? '';
  const industryInsights = generateIndustryInsights(industry);

  const handleContinue = () => {
    // Since recommendations are always disabled, always use fallback
    updateFormData({
      selectedProductId: selectedProduct || "pending",
      selectedProductName: "Product Selection Pending",
      selectedLenderName: "To Be Determined",
    });
    onNext();
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
            Product recommendations are currently processed server-side after document review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button onClick={onPrevious} variant="outline">
              Back to Previous Step
            </Button>
            <Button onClick={onNext}>
              Continue to Document Upload
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Since recommendations are disabled, always show the pending state
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-teal-600" />
          <CardTitle>Product Matching Pending</CardTitle>
        </div>
        <CardDescription>
          We'll match you with the perfect lender products after reviewing your documents and business profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <p className="text-teal-800">
              <strong>Next Steps:</strong> Upload your documents and our team will:
            </p>
            <ul className="mt-2 text-teal-700 list-disc list-inside">
              <li>Review your business profile</li>
              <li>Match you with suitable lenders</li>
              <li>Present the best financing options</li>
            </ul>
          </div>
          <div className="flex space-x-3">
            <Button onClick={onPrevious} variant="outline">
              Review Information
            </Button>
            <Button onClick={handleContinue}>
              Continue to Documents
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}