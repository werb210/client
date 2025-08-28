import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Loader2 } from 'lucide-react';
import { normalizeIntake, loadIntake, type Intake } from '@/utils/normalizeIntake';
import { fetchLenderProducts } from '@/api/lenderProducts';
import { useQuery } from '@tanstack/react-query';
import { getStoredApplicationId } from '@/lib/uuidUtils';
import { getProductRecommendations } from '@/lib/strictRecommendationEngine';

// Intake type now imported from normalizeIntake utility

type Props = {
  // we'll accept either; callers can pass whichever they have
  formData?: Partial<Intake> | any;
  intake?: Partial<Intake> | any;
  selectedProduct?: string;
  onProductSelect?: (product: string) => void;
  onContinue?: () => void;
  onPrevious?: () => void;
};

function PendingCard() {
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-orange-500" />
          <CardTitle>Product Matching Pending</CardTitle>
        </div>
        <CardDescription>
          We couldn't read your details from Step 1. Please go back and complete the form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" href="/apply/step-1">
          Back to Step 1
        </a>
      </CardContent>
    </Card>
  );
}

function Step2RecommendationEngine(props: Props) {
  // Use new normalizer to get intake data from props or sessionStorage
  const raw = props.intake ?? props.formData ?? {};
  const intake: Intake | null = normalizeIntake(raw) ?? normalizeIntake(loadIntake());

  if (!intake) return <PendingCard />;

  // Helper function for safe number formatting
  const fmt = (n: number) => (Number.isFinite(n) ? n.toLocaleString() : '—');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["lenderProducts"],
    queryFn: fetchLenderProducts
  });

  // Use your sophisticated recommendation engine!
  const recommendations = useMemo(() => {
    if (!products?.products) return [];
    
    // Map intake data to recommendation filters
    const filters = {
      country: intake.country as 'CA' | 'US',
      fundingAmount: intake.amount || 50000,
      lookingFor: (intake.industry === 'equipment' ? 'equipment' : 
                   intake.industry === 'both' ? 'both' : 'capital') as 'capital' | 'equipment' | 'both',
      accountsReceivableBalance: intake.accountsReceivableBalance || 0,
      fundsPurpose: intake.fundsPurpose as 'inventory' | 'expansion' | 'equipment' | 'working_capital' | 'other'
    };

    console.log('🎯 Using advanced recommendation engine with filters:', filters);
    
    // Transform products to LenderProduct format for the engine
    const lenderProducts = products.products.map((p: any) => ({
      id: p.id,
      name: p.productName || p.name,
      lender: p.lender || p.lender_name,
      category: p.category?.toLowerCase().replace(/\s+/g, '_') as any,
      country: p.countryOffered || p.country,
      minAmount: p.minAmount || p.min_amount || 0,
      maxAmount: p.maxAmount || p.max_amount || 999999999,
      minRevenue: p.minRevenue || 0,
      isActive: p.isActive !== false
    })).filter(p => p.isActive);

    try {
      // Use your built recommendation engine!
      const scoredRecommendations = getProductRecommendations(lenderProducts, filters);
      
      console.log(`🏆 Generated ${scoredRecommendations.length} scored recommendations`);
      return scoredRecommendations;
    } catch (error) {
      console.warn('⚠️ Fallback to simple filtering:', error);
      // Fallback to simple filtering if recommendation engine fails
      return lenderProducts.filter(p => 
        p.country === filters.country && 
        filters.fundingAmount >= p.minAmount && 
        filters.fundingAmount <= p.maxAmount
      ).map(p => ({ product: p, matchScore: 50, recommendationLevel: 'good' as const }));
    }
  }, [products, intake]);

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            <CardTitle>Finding matches...</CardTitle>
          </div>
          <CardDescription>
            Analyzing your profile: ${fmt(intake.amount)} • Country: {intake.country} • Revenue: ${fmt(intake.monthlyRevenue)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
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
            <Target className="h-5 w-5 text-red-500" />
            <CardTitle>Could not load recommendations</CardTitle>
          </div>
          <CardDescription>
            We'll match you with products after document review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button onClick={props.onPrevious} variant="outline">
              Back to Previous Step
            </Button>
            <Button onClick={props.onContinue}>
              Continue to Documents
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ready state - show scored recommendations
  if (recommendations && recommendations.length > 0) {
    // Display dynamic recommendations from Staff API
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-teal-600" />
            <CardTitle>Recommended Loan Products</CardTitle>
          </div>
          <CardDescription>
            Based on your profile: ${fmt(intake.amount)} • {intake.industry || 'business'} • {intake.country}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec: any) => (
              <Card key={rec.product.id} className={`border hover:bg-gray-50 ${
                rec.recommendationLevel === 'excellent' ? 'border-green-300 bg-green-50' :
                rec.recommendationLevel === 'good' ? 'border-blue-300 bg-blue-50' :
                'border-gray-300'
              }`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {rec.product.name}
                        {rec.recommendationLevel === 'excellent' && <span className="text-green-600 text-sm">⭐ Excellent Match</span>}
                        {rec.recommendationLevel === 'good' && <span className="text-blue-600 text-sm">✓ Good Match</span>}
                      </CardTitle>
                      <CardDescription>Offered by {rec.product.lender}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-700">
                        {rec.matchScore}% Match
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Amount: ${rec.product.minAmount?.toLocaleString()} - ${rec.product.maxAmount?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {rec.matchReasons?.slice(0, 2).join(' • ')}
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => props.onProductSelect?.(rec.product.id)}
                        variant={props.selectedProduct === rec.product.id ? "default" : "outline"}
                        size="sm"
                      >
                        {props.selectedProduct === rec.product.id ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex space-x-3 pt-4">
              <Button onClick={props.onPrevious} variant="outline">
                Review Information
              </Button>
              <Button 
                onClick={props.onContinue}
                disabled={!props.selectedProduct}
              >
                Continue with Selected Product
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback when no dynamic recommendations available
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-teal-600" />
          <CardTitle>Product Matching Pending</CardTitle>
        </div>
        <CardDescription>
          Profile received: ${fmt(intake.amount)} for {intake.industry || 'business'} in {intake.country}
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
            <Button onClick={props.onPrevious} variant="outline">
              Review Information
            </Button>
            <Button onClick={props.onContinue}>
              Continue to Documents
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Step2RecommendationEngine;
export { Step2RecommendationEngine };