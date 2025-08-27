import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Loader2 } from 'lucide-react';
import { normalizeIntake, loadIntake, type Intake } from '@/utils/normalizeIntake';
import { getRecommendations } from '@/lib/api';
import { getStoredApplicationId } from '@/lib/uuidUtils';

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

  const [state, setState] = useState<
    { status: "idle" | "pending" | "ready" | "error"; data?: any; error?: any }
  >({ status: "pending" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Get applicationId to fetch recommendations
        const applicationId = getStoredApplicationId();
        if (!applicationId) {
          if (!cancelled) setState({ status: "error", error: "No application ID found" });
          return;
        }

        // Call Staff App API for dynamic recommendations
        const recommendations = await getRecommendations(applicationId);
        if (!cancelled) setState({ status: "ready", data: recommendations });
      } catch (e) {
        console.warn('Failed to load recommendations from Staff API:', String(e));
        // Fallback to ready state with manual matching message
        if (!cancelled) setState({ status: "ready", data: null });
      }
    })();

    return () => { cancelled = true; };
  }, [intake]);

  if (state.status === "pending") {
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

  if (state.status === "error") {
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

  // Ready state - show dynamic recommendations or fallback message
  if (state.data && state.data.recommendations && state.data.recommendations.length > 0) {
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
            {state.data.recommendations.map((rec: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{rec.productName || rec.name}</h3>
                    <p className="text-gray-600">{rec.lenderName || rec.lender_name}</p>
                    <p className="text-sm text-gray-500 mt-1">{rec.description}</p>
                    {rec.interestRateMin && rec.interestRateMax && (
                      <p className="text-sm text-gray-700 mt-2">
                        Rate: {rec.interestRateMin}% - {rec.interestRateMax}%
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={() => props.onProductSelect?.(rec.id || rec.productId)}
                    variant={props.selectedProduct === (rec.id || rec.productId) ? "default" : "outline"}
                    size="sm"
                  >
                    {props.selectedProduct === (rec.id || rec.productId) ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
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