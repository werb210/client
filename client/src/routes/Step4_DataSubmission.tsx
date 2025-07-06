import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useFormData } from '@/context/FormDataContext';
import { useToast } from '@/hooks/use-toast';
import { staffApi } from '../api/staffApi';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  Building,
  DollarSign,
  MapPin,
  User,
  FileText,
  Clock,
  Loader2,
  AlertTriangle
} from '@/lib/icons';

type SubmissionStatus = 'idle' | 'submitting' | 'submitted' | 'error';

/**
 * Step 4: Data Submission
 * Per specification: Submit all Step 1-4 data + uploaded documents to staff endpoint
 * POST /applications/submit
 */
export default function Step4DataSubmission() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Get data from previous steps
  const selectedProduct = state.step2Recommendations?.selectedProduct;
  const businessInfo = state.step3BusinessDetails;
  const financialProfile = state.step1FinancialProfile;

  // Check if we have uploaded documents from a potential previous step
  const uploadedDocuments = state.step5DocumentUpload?.uploadedFiles || [];

  const hasRequiredData = () => {
    return (
      financialProfile &&
      selectedProduct &&
      businessInfo
    );
  };

  const handleSubmitToStaff = async () => {
    if (!hasRequiredData()) {
      toast({
        title: "Incomplete Information",
        description: "Please complete all previous steps before continuing.",
        variant: "destructive",
      });
      return;
    }

    setSubmissionStatus('submitting');
    setSubmissionError(null);

    try {
      console.log('🚀 Step 4: Submitting all data to POST /applications/submit...');
      
      // Prepare uploaded files with File objects
      const filesWithFileObjects = uploadedDocuments
        .filter(file => file.file)
        .map(file => ({
          file: file.file!,
          documentType: file.documentType
        }));

      // Step 1: Submit complete application data to staff backend
      const result = await staffApi.submitApplication(
        state, // Complete form state with all steps
        filesWithFileObjects, // Any uploaded documents
        selectedProduct?.product_name || 'unknown'
      );

      if (result.status === 'submitted' && result.applicationId) {
        console.log('✅ Step 4: Application submitted successfully, ID:', result.applicationId);
        setApplicationId(result.applicationId);
        
        // Store application ID in state
        dispatch({
          type: 'SET_APPLICATION_ID',
          payload: result.applicationId
        });

        // Step 2: Initiate signing process with pre-fill data (do not show SignNow yet)
        console.log('🔄 Step 4: Initiating signing with POST /applications/initiate-signing...');
        
        // Prepare pre-fill data from Steps 3 and 4
        const prefilData = {
          step3BusinessDetails: state.step3BusinessDetails,
          step4ApplicantInfo: state.step4ApplicantInfo
        };
        
        console.log('📋 Sending pre-fill data for SignNow Smart Fields:', prefilData);
        
        const signingResponse = await staffApi.initiateSigning(result.applicationId, prefilData);
        
        if (signingResponse.status === 'ready' && signingResponse.signUrl) {
          console.log('✅ Step 4: Signing initiated successfully, URL received');
          setSubmissionStatus('submitted');
          
          // Store signing URL in context for Step 6
          dispatch({
            type: 'UPDATE_STEP6_SIGNATURE',
            payload: {
              signingUrl: signingResponse.signUrl,
              documentId: result.applicationId
            }
          });
          
          dispatch({
            type: 'SET_SIGNING_URL',
            payload: signingResponse.signUrl
          });
          
          saveToStorage();
          
          toast({
            title: "Application Submitted & Signing Ready",
            description: `Application ID: ${result.applicationId}. Ready for signing workflow.`,
          });

          // Auto-redirect to Step 6 with signingUrl ready
          setTimeout(() => {
            setLocation('/apply/step-6');
          }, 2000);
          
        } else {
          throw new Error(signingResponse.error || 'Signing initiation failed');
        }
        
      } else {
        throw new Error(result.error || 'Submission failed');
      }
      
    } catch (error) {
      console.error('❌ Step 4 submission failed:', error);
      setSubmissionStatus('error');
      setSubmissionError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'Failed to submit application',
        variant: "destructive",
      });
    }
  };

  const handleManualContinue = () => {
    // Allow manual progression to Step 6 for testing
    setLocation('/apply/step-6');
  };

  const handleBack = () => {
    setLocation('/apply/step-3');
  };

  const renderSubmissionSection = () => {
    switch (submissionStatus) {
      case 'idle':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Ready to Submit Complete Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                All Steps 1-4 data will be submitted to the staff backend endpoint POST /applications/submit.
                This will generate your application ID and initiate the signing workflow.
              </p>
              <Button onClick={handleSubmitToStaff} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Submit to Staff Backend
              </Button>
            </CardContent>
          </Card>
        );

      case 'submitting':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                Submitting to POST /applications/submit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Sending complete application data to staff backend...
              </p>
            </CardContent>
          </Card>
        );

      case 'submitted':
        return (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Application Submitted Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-2">
                Application ID: <span className="font-mono">{applicationId}</span>
              </p>
              <p className="text-green-600 mb-4">
                Your complete application has been submitted to the staff backend. 
                Proceeding to SignNow signing workflow...
              </p>
              <Button onClick={handleManualContinue} variant="outline">
                Continue to Signing
              </Button>
            </CardContent>
          </Card>
        );

      case 'error':
        return (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                Submission Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                {submissionError || 'Failed to submit application to staff backend'}
              </p>
              <Button onClick={handleSubmitToStaff} variant="outline">
                Retry Submission
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Step 4: Submit Complete Application
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Send all collected data to staff backend for processing
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Data Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 - Financial Profile */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium">Financial Profile (Step 1)</span>
              </div>
              <div className="ml-6 text-sm text-gray-600 space-y-1">
                <p>Funding Amount: ${financialProfile?.fundingAmount?.toLocaleString() || 'Not specified'}</p>
                <p>Looking For: {financialProfile?.lookingFor || 'Not specified'}</p>
                <p>Industry: {financialProfile?.industry || 'Not specified'}</p>
                <p>Business Location: {financialProfile?.businessLocation || 'Not specified'}</p>
              </div>
            </div>

            {/* Step 2 - Selected Product */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Selected Product (Step 2)</span>
              </div>
              <div className="ml-6 text-sm text-gray-600 space-y-1">
                <p className="font-medium">{selectedProduct?.product_name || 'No product selected'}</p>
                {selectedProduct?.lender_name && (
                  <p>Lender: {selectedProduct.lender_name}</p>
                )}
                {selectedProduct?.product_type && (
                  <p>Type: {selectedProduct.product_type}</p>
                )}
              </div>
            </div>

            {/* Step 3 - Business Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Business Details (Step 3)</span>
              </div>
              <div className="ml-6 text-sm text-gray-600 space-y-1">
                <p>Business Name: {businessInfo?.operatingName || businessInfo?.legalName || 'Not provided'}</p>
                <p>Structure: {businessInfo?.businessStructure || 'Not specified'}</p>
                <p>Location: {businessInfo?.businessCity}, {businessInfo?.businessState}</p>
                <p>Phone: {businessInfo?.businessPhone || 'Not provided'}</p>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Documents</span>
              </div>
              <div className="ml-6 text-sm text-gray-600">
                <p>{uploadedDocuments.length} document(s) ready for submission</p>
                {uploadedDocuments.length > 0 && (
                  <ul className="mt-1 list-disc list-inside">
                    {uploadedDocuments.slice(0, 3).map((doc, idx) => (
                      <li key={idx} className="truncate">{doc.name}</li>
                    ))}
                    {uploadedDocuments.length > 3 && (
                      <li>...and {uploadedDocuments.length - 3} more</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Readiness Status */}
          <Alert className={hasRequiredData() ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
            <CheckCircle className={`h-4 w-4 ${hasRequiredData() ? 'text-green-600' : 'text-yellow-600'}`} />
            <AlertDescription className={hasRequiredData() ? 'text-green-800' : 'text-yellow-800'}>
              {hasRequiredData() 
                ? "All required data collected. Ready to submit to POST /applications/submit"
                : "Missing required information from previous steps"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Submission Section */}
      {renderSubmissionSection()}

      {/* API Specification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Integration Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Endpoint:</strong> POST /applications/submit</p>
            <p><strong>Payload:</strong> All Steps 1-4 data + uploaded documents</p>
            <p><strong>Response:</strong> applicationId + signingStatus = "pending"</p>
            <p><strong>Next Step:</strong> Redirect to Step 6 for SignNow polling</p>
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
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {submissionStatus === 'submitted' && (
              <Button 
                onClick={handleManualContinue}
                className="flex items-center gap-2"
              >
                Continue to SignNow
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}