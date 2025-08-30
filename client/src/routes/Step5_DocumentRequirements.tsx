import { useState, useEffect } from 'react';
import { useFormDataContext } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { StepHeader } from '@/components/StepHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLenderProducts } from '@/hooks/useLenderProducts';

export default function Step5DocumentRequirements() {
  const { state, dispatch } = useFormDataContext();
  const [, setLocation] = useLocation();

  // Get selected product from Step 2 - check multiple possible field names
  const selectedProductId = state.selectedProduct || state.step2?.selectedProduct || state.step2?.selectedCategory;
  const { products } = useLenderProducts();
  const selectedProduct = products?.find(p => p.id === selectedProductId);

  // Get required documents from selected product
  const requiredDocs = selectedProduct?.requiredDocuments || [
    'Business Financial Statements', 
    'Bank Statements (3 months)',
    'Tax Returns (2 years)',
    'Business Registration'
  ];

  const handleContinue = () => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step5: {
          selectedProductId,
          requiredDocuments: requiredDocs,
          productName: selectedProduct?.name || 'Selected Product',
          lenderName: selectedProduct?.lender || 'Selected Lender'
        },
      },
    });
    setLocation('/step6');
  };

  const handleBack = () => {
    setLocation('/step4');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <StepHeader
          stepNumber={5}
          totalSteps={7}
          title="Document Requirements"
          description="Required documents for your selected lender product"
        />

        <div className="max-w-4xl mx-auto mt-8">
          {selectedProduct ? (
            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <CardTitle className="text-xl text-green-700">
                      {selectedProduct.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      by {selectedProduct.lender}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Product Details:</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
                    <div>
                      <strong>Amount Range:</strong> ${selectedProduct.minAmount?.toLocaleString()} - ${selectedProduct.maxAmount?.toLocaleString()}
                    </div>
                    <div>
                      <strong>Interest Rate:</strong> {selectedProduct.interestRateMin}% - {selectedProduct.interestRateMax}%
                    </div>
                    <div>
                      <strong>Term:</strong> {selectedProduct.termMinMonths} - {selectedProduct.termMaxMonths} months
                    </div>
                    <div>
                      <strong>Category:</strong> {selectedProduct.category}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Required Documents ({requiredDocs.length})
                  </h3>
                  <div className="grid gap-3">
                    {requiredDocs.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <span className="flex-1">{doc}</span>
                        <Badge variant="outline">Required</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    These documents are specifically required for <strong>{selectedProduct.name}</strong> 
                    by {selectedProduct.lender}. Having all documents ready will speed up your application process.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-700">No Product Selected</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    Please go back to Step 2 and select a lender product to see specific document requirements.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-3">General Document Requirements:</h3>
                  <div className="grid gap-2">
                    {requiredDocs.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <div className="w-5 h-5 border border-gray-400 rounded flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 justify-center mt-8">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="px-8"
            >
              ← Back
            </Button>
            <Button 
              onClick={handleContinue}
              className="px-8 bg-teal-600 hover:bg-teal-700"
            >
              Continue to Upload →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}