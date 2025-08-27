import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Loader2 } from 'lucide-react';

type Intake = {
  product_id?: string | null;
  country?: "CA" | "US" | null;
  amount?: number | null;
  timeInBusinessMonths?: number | null;
  monthlyRevenue?: number | null;
  industry?: string | null;
};

type Props = {
  // we'll accept either; callers can pass whichever they have
  formData?: Partial<Intake> | any;
  intake?: Partial<Intake> | any;
  selectedProduct?: string;
  onProductSelect?: (product: string) => void;
  onContinue?: () => void;
  onPrevious?: () => void;
};

function toNumber(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalize(raw: any): Intake | null {
  if (!raw || typeof raw !== "object") return null;

  const amount = toNumber(raw.amount ?? raw.loanAmount ?? raw.loan_amount ?? raw.fundingAmount);
  const tib = toNumber(raw.timeInBusinessMonths ?? raw.time_in_business);
  const rev = toNumber(raw.monthlyRevenue ?? raw.monthly_revenue ?? raw.averageMonthlyRevenue);

  const country =
    raw.country ??
    raw.countryOffered ??
    raw.country_offered ??
    raw.headquarters ??
    raw.businessLocation ??
    null;

  const product_id = raw.product_id ?? raw.id ?? null;

  return {
    product_id,
    country: country === "CA" || country === "US" ? country : null,
    amount,
    timeInBusinessMonths: tib,
    monthlyRevenue: rev,
    industry: raw.industry ?? null,
  };
}

function Step2RecommendationEngine(props: Props) {
  // Accept both names; default to {} so we never destructure undefined
  const raw = props.intake ?? props.formData ?? {};
  const intake = useMemo(() => normalize(raw), [raw]);

  const hasEnoughForMatch =
    !!intake?.country &&
    typeof intake?.amount === "number" &&
    (intake?.amount ?? 0) > 0;

  const [state, setState] = useState<
    { status: "idle" | "pending" | "ready" | "error"; data?: any; error?: any }
  >({ status: hasEnoughForMatch ? "pending" : "idle" });

  useEffect(() => {
    if (!hasEnoughForMatch) return;

    let cancelled = false;
    (async () => {
      try {
        // Since recommendations are disabled, simulate pending then show the fallback
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!cancelled) setState({ status: "ready", data: null });
      } catch (e) {
        if (!cancelled) setState({ status: "error", error: String(e) });
      }
    })();

    return () => { cancelled = true; };
  }, [hasEnoughForMatch, intake]);

  // ——— UX states ———
  if (!hasEnoughForMatch) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-500" />
            <CardTitle>Product Matching Pending</CardTitle>
          </div>
          <CardDescription>
            Enter your amount and country to see matching lenders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800">
                <strong>Missing Information:</strong> Please complete Step 1 with:
              </p>
              <ul className="mt-2 text-orange-700 list-disc list-inside">
                <li>Funding amount (how much you need)</li>
                <li>Business location (US or Canada)</li>
                <li>Basic business information</li>
              </ul>
            </div>
            <div className="flex space-x-3">
              <Button onClick={props.onPrevious} variant="outline">
                Back to Step 1
              </Button>
              <Button onClick={props.onContinue} disabled>
                Continue (Complete Step 1 first)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state.status === "pending") {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            <CardTitle>Finding matches...</CardTitle>
          </div>
          <CardDescription>
            Analyzing your profile: ${intake?.amount?.toLocaleString() || 'amount not set'} in {intake?.country || 'location not set'}
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

  // Ready state - show the pending message since recommendations are disabled
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-teal-600" />
          <CardTitle>Product Matching Pending</CardTitle>
        </div>
        <CardDescription>
          Profile received: ${intake?.amount?.toLocaleString() || 'amount not set'} for {intake?.industry || 'industry not set'} business in {intake?.country || 'location not set'}
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