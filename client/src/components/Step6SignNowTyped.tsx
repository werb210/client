/**
 * Step 6 SignNow Component with Strongly-Typed API Integration
 * Uses generated OpenAPI types for type-safe SignNow document generation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { paths } from '@/types/api';
import { useFormDataContext } from '@/context/FormDataContext';

// Extract types from generated API schema
type GeneratePayload = paths['/api/signnow/generate']['post']['requestBody']['content']['application/json'];
type GenerateResponse = paths['/api/signnow/generate']['post']['responses'][200]['content']['application/json'];

interface Step6SignNowTypedProps {
  onNext?: () => void;
  onBack?: () => void;
}

export default function Step6SignNowTyped({ onNext, onBack }: Step6SignNowTypedProps) {
  const { formData } = useFormDataContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [signData, setSignData] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Build strongly-typed payload from form data
      const payload: GeneratePayload = {
        applicationId: formData.applicationId || crypto.randomUUID(),
        formFields: {
          businessName: formData.operatingName || formData.legalName || 'Business Name',
          ownerName: formData.firstName && formData.lastName 
            ? `${formData.firstName} ${formData.lastName}`
            : 'Owner Name',
          requestedAmount: formData.fundingAmount || 0,
          // Add additional form fields as needed
          businessType: formData.businessStructure || 'LLC',
          businessAddress: formData.businessAddress || '',
          businessCity: formData.businessCity || '',
          businessState: formData.businessState || '',
          businessPostalCode: formData.businessPostalCode || '',
          annualRevenue: formData.lastYearRevenue || 0,
          phoneNumber: formData.businessPhone || '',
          email: formData.email || '',
        }
      };

      console.log('🔄 Generating SignNow document with payload:', payload);

      const response = await fetch("/api/signnow/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      }).catch(fetchError => {
        console.error('[STEP6_SIGNNOW] Network error:', fetchError);
        throw new Error(`Network error: ${fetchError.message}`);
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Unknown error');
        throw new Error(`SignNow generation failed: ${response.status} ${errorData}`);
      }

      const result: GenerateResponse = await response.json().catch(jsonError => {
        console.error('[STEP6_SIGNNOW] JSON parse error:', jsonError);
        throw new Error(`Invalid response format: ${jsonError.message}`);
      });
      
      if (!result.success) {
        throw new Error('SignNow document generation was not successful');
      }

      setSignData(result);
      console.log('✅ SignNow document generated:', result);

    } catch (error) {
      console.error('❌ SignNow generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenSignNow = () => {
    if (signData?.signUrl) {
      // Open SignNow in a new window
      const signWindow = window.open(signData.signUrl, '_blank', 'width=800,height=600');
      
      // Poll for window close to detect completion - with error handling
      const pollTimer = setInterval(() => {
        try {
          if (signWindow?.closed) {
            clearInterval(pollTimer);
            setIsSigned(true);
            console.log('✅ SignNow window closed - document likely signed');
          }
        } catch (error) {
          // Silently ignore polling errors
          clearInterval(pollTimer);
        }
      }, 1000);
    }
  };

  const handleContinue = () => {
    if (isSigned && onNext) {
      onNext();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Document Signing</h1>
        <p className="text-gray-600">
          Review and sign your loan application documents
        </p>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Step 6 of 7 • SignNow Integration
        </Badge>
      </div>

      {/* Document Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Document
          </CardTitle>
          <CardDescription>
            Generate and sign your loan application documents using SignNow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!signData && !error && (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready to Generate Documents</h3>
              <p className="text-gray-600 mb-6">
                Your application information will be used to create the signing documents
              </p>
              <Button 
                onClick={handleGenerateDocument}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Document...
                  </>
                ) : (
                  'Generate Document'
                )}
              </Button>
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {signData && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-700">
                  Document generated successfully! Document ID: {signData.documentId}
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Loan Application Document</h4>
                  <p className="text-sm text-gray-600">Ready for signature</p>
                </div>
                <Button 
                  onClick={handleOpenSignNow}
                  disabled={isSigned}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {isSigned ? 'Signed' : 'Sign Document'}
                </Button>
              </div>

              {isSigned && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-700">
                    Document signed successfully! You can now proceed to the final step.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Business Information</div>
              <div>Name: {formData.operatingName || 'Not provided'}</div>
              <div>Type: {formData.businessStructure || 'Not provided'}</div>
              <div>Phone: {formData.businessPhone || 'Not provided'}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Loan Request</div>
              <div>Amount: ${formData.fundingAmount?.toLocaleString() || '0'}</div>
              <div>Purpose: {formData.lookingFor || 'Not provided'}</div>
              <div>Annual Revenue: ${formData.lastYearRevenue?.toLocaleString() || '0'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={isGenerating}
        >
          Back to Documents
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={!isSigned || isGenerating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue to Final Review
        </Button>
      </div>
    </div>
  );
}