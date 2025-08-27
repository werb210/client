import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight } from 'lucide-react';

type Props = {
  formData?: any;
  selectedProduct?: string;
  onProductSelect?: (product: string) => void;
  onContinue?: () => void;
  onPrevious?: () => void;
};

function Step2RecommendationEngine({ formData, selectedProduct, onProductSelect, onContinue, onPrevious }: Props) {
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
            <Button onClick={onContinue}>
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