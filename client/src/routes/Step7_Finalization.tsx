import React, { useState } from 'react';
import { logger } from '@/lib/utils';
import { useLocation } from 'wouter';

import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';

import { Checkbox } from '@/components/ui/checkbox';

import { useFormData } from '@/context/FormDataContext';

import { useToast } from '@/hooks/use-toast';

import { StepHeader } from '@/components/StepHeader';

import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Send from 'lucide-react/dist/esm/icons/send';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import Mail from 'lucide-react/dist/esm/icons/mail';

type SubmissionStatus = 'idle' | 'submitting' | 'submitted' | 'error';

/**
 * Step 6: Confirm and Submit Application (Email-Based Signing)
 * NEW WORKFLOW:
 * 1. Display terms and conditions
 * 2. On submit: POST /api/public/applications with full form data and documents
 * 3. Backend creates SignNow document and sends email invite
 * 4. Show email confirmation message to user
 */
export default function Step6ConfirmAndSubmit() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get uploaded documents
  const uploadedFiles = state.uploadedDocuments || [];

  const handleSubmit = async () => {
    logger.log('🚀 handleSubmit called!', { termsAccepted, privacyAccepted });
    
    if (!termsAccepted || !privacyAccepted) {
      logger.log('❌ Terms not accepted', { termsAccepted, privacyAccepted });
      toast({
        title: "Terms Required",
        description: "Please accept both Terms & Conditions and Privacy Policy to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Validate required form data
    if (!state.step1 || !state.step3 || !state.step4) {
      logger.log('❌ Missing required form data');
      toast({
        title: "Incomplete Application",
        description: "Please complete all previous steps before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmissionStatus('submitting');
    setError(null);

    try {
      // ✅ USER REQUIREMENT: Add comprehensive submission logging
      console.log("📤 Submitting application:", state);
      console.log("📤 Application Business Name:", state.step3?.businessName || state.step3?.operatingName || 'NOT FOUND');
      console.log("📤 Application Legal Name:", state.step3?.legalName || state.step3?.businessLegalName || 'NOT FOUND');
      console.log("📤 Applicant Name:", `${state.step4?.firstName || ''} ${state.step4?.lastName || ''}`.trim() || 'NOT FOUND');
      console.log("📤 Document Count:", uploadedFiles.length);

      // Prepare form data for submission
      const fullFormData = {
        step1: state.step1,
        step3: state.step3,
        step4: state.step4,
        documents: uploadedFiles,
        termsAccepted,
        privacyAccepted,
        submittedAt: new Date().toISOString()
      };

      // ✅ USER REQUIREMENT: Add console logging before submission
      console.log("📤 Submitting form data:", fullFormData);
      
      logger.log('🏁 Step 6: Submitting application with POST /api/public/applications...');
      
      // Submit complete application - backend will create SignNow document and send email
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify(fullFormData)
      });
      
      console.log("📥 Application submission response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Error response data:", errorData);
        throw new Error(errorData.message || `Submission failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("📥 Application submission response:", result);

      setSubmissionStatus('submitted');
      
      // Mark application as complete in state
      dispatch({
        type: 'MARK_COMPLETE'
      });
      
      toast({
        title: "Application Submitted Successfully!",
        description: "We've sent an email with your application for signature.",
      });

      logger.log('✅ Application submitted:', result);
      
    } catch (error) {
      logger.error('❌ Submission failed:', error);
      setSubmissionStatus('error');
      setError(error instanceof Error ? error.message : 'Submission failed');
      
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setLocation('/apply/step-5'); // Go back to Step 5 since Step 6 is removed
  };

  const canSubmit = termsAccepted && privacyAccepted && state.step1 && state.step3 && state.step4;

  // Show clean confirmation after successful submission
  if (submissionStatus === 'submitted') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">🎉 You're almost done!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg">
              Thank you for submitting your application. Our team is reviewing your information and documents.
            </p>
            <p className="text-gray-600">
              We'll reach out shortly if we need anything else or to discuss next steps.
            </p>
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              📩 Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>If you have any questions, feel free to reach out:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Email: <a href="mailto:info@boreal.financial" className="text-blue-600 underline">info@boreal.financial</a></li>
                <li>Phone: 1-888-811-1887</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <StepHeader 
        stepNumber={6}
        title="Final Review & Terms"
        description="Review terms and finalize your application"
        totalSteps={6}
      />

      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Document Count:</span>
              <p className="font-medium">{uploadedFiles.length} documents uploaded</p>
            </div>
            <div>
              <span className="text-gray-500">Selected Product:</span>
              <p className="font-medium">{state.step2?.selectedCategoryName || state.step2?.selectedCategory || 'Not selected'}</p>
            </div>
            <div>
              <span className="text-gray-500">Funding Amount:</span>
              <p className="font-medium">${state.step1?.requestedAmount?.toLocaleString() || state.step1?.fundingAmount?.toLocaleString() || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-500">Business Name:</span>
              <p className="font-medium">{state.step3?.operatingName || state.step3?.businessName || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Terms of Service */}
          <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
            <h4 className="font-semibold mb-3">Boreal Financial Terms of Service</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>1. Application Processing:</strong> By submitting this application, you authorize Boreal Financial to share your information with potential lenders in our network.</p>
              
              <p><strong>2. Credit Authorization:</strong> You authorize lenders to perform credit checks and verify the information provided in this application.</p>
              
              <p><strong>3. Information Accuracy:</strong> You certify that all information provided is true, complete, and accurate to the best of your knowledge.</p>
              
              <p><strong>4. No Guarantee:</strong> Submission of this application does not guarantee loan approval. Final lending decisions are made by individual lenders.</p>
              
              <p><strong>5. Service Fees:</strong> Boreal Financial does not charge fees for application submission or lender matching services.</p>
              
              <p><strong>6. Communication:</strong> You consent to receive communications from Boreal Financial and our lending partners via phone, email, and text message.</p>
              
              <p><strong>7. Data Retention:</strong> Your application data will be retained according to our privacy policy and applicable regulations.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <label htmlFor="terms" className="text-sm leading-relaxed">
              I have read and agree to the <a href="#" className="text-blue-600 underline">Terms of Service</a> and understand that my application will be shared with potential lenders.
            </label>
          </div>

          {/* Privacy Policy */}
          <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
            <h4 className="font-semibold mb-3">Privacy Policy Summary</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Information Collection:</strong> We collect business and personal information necessary to process your loan application.</p>
              
              <p><strong>Information Sharing:</strong> Your information is shared with qualified lenders in our network for loan matching purposes.</p>
              
              <p><strong>Data Security:</strong> We employ industry-standard security measures to protect your personal and business information.</p>
              
              <p><strong>Third-Party Services:</strong> We may use third-party services for credit verification, identity verification, and application processing.</p>
              
              <p><strong>Communication Preferences:</strong> You can update your communication preferences at any time through your account dashboard.</p>
              
              <p><strong>Data Rights:</strong> You have the right to access, update, or request deletion of your personal information subject to regulatory requirements.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="privacy" 
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
            />
            <label htmlFor="privacy" className="text-sm leading-relaxed">
              I acknowledge that I have read and understand the <a href="#" className="text-blue-600 underline">Privacy Policy</a> and consent to the collection and use of my information as described.
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Finalization Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Final Submission
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissionStatus === 'idle' && (
            <div className="space-y-4">
              <Alert className={canSubmit ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                <CheckCircle className={`h-4 w-4 ${canSubmit ? 'text-green-600' : 'text-yellow-600'}`} />
                <AlertDescription className={canSubmit ? 'text-green-800' : 'text-yellow-800'}>
                  {canSubmit 
                    ? "Ready to submit your application. This will create a SignNow document and send you an email for signature."
                    : "Please accept both terms and conditions to proceed with submission."}
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleSubmit} 
                disabled={!canSubmit}
                className="w-full"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Application
              </Button>
            </div>
          )}

          {submissionStatus === 'submitting' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Submitting your application...</p>
              <p className="text-sm text-gray-500">Creating SignNow document and sending email...</p>
            </div>
          )}

          {submissionStatus === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error || 'Failed to submit application'}
                </AlertDescription>
              </Alert>
              <Button onClick={handleSubmit} variant="outline" className="w-full">
                Retry Submission
              </Button>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center gap-2"
              disabled={submissionStatus === 'submitting'}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}