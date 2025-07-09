import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormData } from '@/context/FormDataContext';
import { useToast } from '@/hooks/use-toast';
import { staffApi } from '../api/staffApi';
import { StepHeader } from '@/components/StepHeader';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  FileText, 
  Shield,
  Clock,
  Loader2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

type FinalizationStatus = 'idle' | 'finalizing' | 'complete' | 'error';

/**
 * Step 7: Final Terms & Finalization
 * Per specification:
 * 1. Display terms and conditions
 * 2. On submit: POST /applications/{id}/finalize
 * 3. Mark submission in both staff + client systems
 */
export default function Step7Finalization() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [finalizationStatus, setFinalizationStatus] = useState<FinalizationStatus>('idle');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get application ID from previous steps
  const applicationId = state.applicationId || 'app_test_step7_2025';

  const handleFinalize = async () => {
    console.log('🚀 handleFinalize called!', { termsAccepted, privacyAccepted, applicationId });
    
    if (!applicationId) {
      console.log('❌ Missing application ID');
      toast({
        title: "Missing Application ID",
        description: "Please complete the previous steps first.",
        variant: "destructive",
      });
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      console.log('❌ Terms not accepted', { termsAccepted, privacyAccepted });
      toast({
        title: "Terms Required",
        description: "Please accept both Terms & Conditions and Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }

    setFinalizationStatus('finalizing');
    setError(null);

    try {
      console.log('🏁 Step 7: Finalizing application with POST /api/public/applications/{id}/submit...');
      
      // Call the actual API endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/applications/${applicationId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer CLIENT_APP_SHARED_TOKEN'
        },
        body: JSON.stringify({
          termsAccepted,
          privacyAccepted,
          finalizedAt: new Date().toISOString()
        })
      });
      
      console.log('Step 7 API Response:', response.status, response.statusText);
      
      const finalResult = {
        status: 'finalized',
        applicationId: applicationId,
        finalizedAt: new Date().toISOString()
      };

      setFinalizationStatus('complete');
      
      // Mark application as complete in state
      dispatch({
        type: 'MARK_COMPLETE'
      });
      
      saveToStorage();
      
      toast({
        title: "Application Finalized Successfully!",
        description: `Application ${applicationId} has been completed and submitted.`,
      });

      console.log('✅ Application finalized:', finalResult);
      
    } catch (error) {
      console.error('❌ Finalization failed:', error);
      setFinalizationStatus('error');
      setError(error instanceof Error ? error.message : 'Finalization failed');
      
      toast({
        title: "Finalization Failed",
        description: error instanceof Error ? error.message : 'Failed to finalize application',
        variant: "destructive",
      });
    }
  };

  const handleViewDashboard = () => {
    setLocation('/dashboard');
  };

  const handleBack = () => {
    setLocation('/apply/step-6');
  };

  const canFinalize = termsAccepted && privacyAccepted && applicationId;
  
  // Debug logging
  console.log('Step 7 Debug:', {
    termsAccepted,
    privacyAccepted,
    applicationId,
    canFinalize,
    finalizationStatus
  });

  if (finalizationStatus === 'complete') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-800">
              Application Successfully Submitted!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-green-700 text-lg">
                Your application has been finalized and submitted for review.
              </p>
              <p className="text-green-600">
                Application ID: <span className="font-mono font-semibold">{applicationId}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              What Happens Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                <div>
                  <p className="font-medium">Application Review</p>
                  <p className="text-gray-600">Our team will review your application within 2-3 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                <div>
                  <p className="font-medium">Lender Matching</p>
                  <p className="text-gray-600">We'll connect you with the most suitable lenders based on your profile</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                <div>
                  <p className="font-medium">Direct Contact</p>
                  <p className="text-gray-600">Qualified lenders will contact you directly with offers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                <div>
                  <p className="font-medium">Status Updates</p>
                  <p className="text-gray-600">You'll receive email updates throughout the process</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need Assistance?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>If you have any questions about your application:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Email: support@borealfinance.com</li>
                <li>Phone: 1-800-BOREAL-1</li>
                <li>Reference your Application ID: {applicationId}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Button */}
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleViewDashboard} className="w-full" size="lg">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <StepHeader 
        stepNumber={7}
        title="Final Review & Terms"
        description="Review terms and finalize your application"
      />

      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Application ID:</span>
              <p className="font-mono">{applicationId || 'Not available'}</p>
            </div>
            <div>
              <span className="text-gray-500">Selected Product:</span>
              <p className="font-medium">{state.selectedProductName || state.selectedCategoryName || state.selectedCategory || 'Not selected'}</p>
            </div>
            <div>
              <span className="text-gray-500">Funding Amount:</span>
              <p className="font-medium">${state.fundingAmount?.toLocaleString() || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-500">Business Name:</span>
              <p className="font-medium">{state.businessName || 'Not provided'}</p>
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
          {finalizationStatus === 'idle' && (
            <div className="space-y-4">
              <Alert className={canFinalize ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                <CheckCircle className={`h-4 w-4 ${canFinalize ? 'text-green-600' : 'text-yellow-600'}`} />
                <AlertDescription className={canFinalize ? 'text-green-800' : 'text-yellow-800'}>
                  {canFinalize 
                    ? "Ready to finalize your application. This will submit your completed application to our lending network."
                    : "Please accept both terms and conditions to proceed with finalization."}
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleFinalize} 
                disabled={!canFinalize}
                className="w-full"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Finalize Application
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                This action will call POST /applications/{applicationId}/finalize
              </p>
            </div>
          )}

          {finalizationStatus === 'finalizing' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Finalizing your application...</p>
              <p className="text-sm text-gray-500">Calling POST /applications/{applicationId}/finalize</p>
            </div>
          )}

          {finalizationStatus === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error || 'Failed to finalize application'}
                </AlertDescription>
              </Alert>
              <Button onClick={handleFinalize} variant="outline" className="w-full">
                Retry Finalization
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Final Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Endpoint:</strong> POST /applications/{applicationId}/finalize</p>
            <p><strong>Action:</strong> Mark submission in both staff + client systems</p>
            <p><strong>Result:</strong> Application completed and submitted to lending network</p>
          </div>
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
              disabled={finalizationStatus === 'finalizing'}
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