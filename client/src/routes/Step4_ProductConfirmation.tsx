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
type PollingStatus = 'idle' | 'polling' | 'ready_to_sign' | 'error';

/**
 * Step 4: Confirm Loan Product & Continue
 * Submits payload to staff backend and initiates signing workflow
 */
export default function Step4ProductConfirmation() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [pollingStatus, setPollingStatus] = useState<PollingStatus>('idle');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Get data from previous steps
  const selectedProduct = state.step2Recommendations?.selectedProduct;
  const businessInfo = state.step3BusinessDetails;
  const personalInfo = state.step4ApplicantInfo;
  const financialProfile = state.step1FinancialProfile;

  useEffect(() => {
    // Start polling if we have an application ID and haven't started yet
    if (applicationId && pollingStatus === 'idle' && !isPolling) {
      startSigningStatusPolling();
    }
  }, [applicationId, pollingStatus]);

  const hasRequiredData = () => {
    return (
      financialProfile?.completed &&
      selectedProduct &&
      businessInfo?.completed &&
      personalInfo?.completed
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
      console.log('🚀 Step 4: Submitting payload to staff backend...');
      
      // Prepare form fields from Steps 1-4
      const formFields = {
        // Step 1 Financial Profile
        headquarters: financialProfile.businessLocation || 'US',
        industry: financialProfile.industry || '',
        lookingFor: financialProfile.lookingFor || '',
        fundingAmount: financialProfile.fundingAmount || 0,
        salesHistory: financialProfile.salesHistory || '',
        averageMonthlyRevenue: financialProfile.averageMonthlyRevenue || 0,
        accountsReceivableBalance: financialProfile.accountsReceivableBalance || 0,
        fixedAssetsValue: financialProfile.fixedAssetsValue || 0,
        equipmentValue: financialProfile.equipmentValue,
        
        // Step 3 Business Details
        businessName: businessInfo.operatingName || businessInfo.legalName || '',
        businessAddress: businessInfo.businessStreetAddress || '',
        businessCity: businessInfo.businessCity || '',
        businessState: businessInfo.businessState || '',
        businessZipCode: businessInfo.businessPostalCode || '',
        businessPhone: businessInfo.businessPhone || '',
        businessEmail: businessInfo.businessEmail || '',
        businessWebsite: businessInfo.businessWebsite || '',
        businessStructure: businessInfo.businessStructure || '',
        businessRegistrationDate: businessInfo.businessStartDate || '',
        businessTaxId: businessInfo.businessTaxId || '',
        businessDescription: businessInfo.businessDescription || '',
        numberOfEmployees: businessInfo.employeeCount || '',
        
        // Step 4 Personal Details
        firstName: personalInfo.firstName || '',
        lastName: personalInfo.lastName || '',
        title: personalInfo.title || '',
        dateOfBirth: personalInfo.dateOfBirth || '',
        socialSecurityNumber: personalInfo.socialSecurityNumber || '',
        personalEmail: personalInfo.personalEmail || '',
        personalPhone: personalInfo.personalPhone || '',
        homeAddress: personalInfo.homeAddress || '',
        homeCity: personalInfo.homeCity || '',
        homeState: personalInfo.homeState || '',
        homeZipCode: personalInfo.homePostalCode || '',
        ownershipPercentage: personalInfo.ownershipPercentage || '',
        creditScore: personalInfo.creditScore || '',
        personalIncome: personalInfo.personalAnnualIncome || '',
        
        // Partner information if applicable
        partnerFirstName: personalInfo.partnerFirstName || '',
        partnerLastName: personalInfo.partnerLastName || '',
        partnerEmail: personalInfo.partnerEmail || '',
        partnerPhone: personalInfo.partnerPhone || '',
        partnerOwnership: personalInfo.partnerOwnershipPercentage || '',
      };

      // Submit to staff API with minimal document payload (pre-signature)
      const result = await staffApi.submitApplication(
        { 
          step1FinancialProfile: financialProfile,
          step3BusinessDetails: businessInfo,
          step4ApplicantDetails: personalInfo 
        },
        [], // No documents at this stage
        selectedProduct?.id?.toString() || selectedProduct?.product_name || 'unknown'
      );

      if (result.status === 'submitted' && result.applicationId) {
        setApplicationId(result.applicationId);
        setSubmissionStatus('submitted');
        
        // Store application ID and submission status
        dispatch({
          type: 'UPDATE_STEP4_SUBMISSION',
          payload: {
            applicationId: result.applicationId,
            submissionStatus: 'submitted',
            submittedAt: new Date().toISOString(),
            signingStatus: 'pending'
          }
        });
        
        saveToStorage();
        
        toast({
          title: "Application Submitted to Staff",
          description: `Application ID: ${result.applicationId}. Checking signing status...`,
        });

        // Start polling for signing readiness
        setPollingStatus('polling');
        
      } else {
        throw new Error(result.error || 'Submission failed');
      }
      
    } catch (error) {
      console.error('❌ Step 4 submission failed:', error);
      setSubmissionStatus('error');
      setSubmissionError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'Failed to submit to staff backend',
        variant: "destructive",
      });
    }
  };

  const startSigningStatusPolling = async () => {
    if (!applicationId || isPolling) return;
    
    setIsPolling(true);
    setPollingStatus('polling');
    console.log('🔄 Step 4: Starting signing status polling...');
    
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;
    
    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setIsPolling(false);
        setPollingStatus('error');
        toast({
          title: "Polling Timeout",
          description: "Document preparation is taking longer than expected.",
          variant: "destructive",
        });
        return;
      }
      
      attempts++;
      
      try {
        const statusResult = await staffApi.checkSigningStatus(applicationId);
        
        if (statusResult.status === 'ready' && statusResult.signUrl) {
          setPollingStatus('ready_to_sign');
          setIsPolling(false);
          
          // Store signing URL and status
          dispatch({
            type: 'UPDATE_STEP4_SUBMISSION',
            payload: {
              applicationId,
              signingStatus: 'ready_to_sign',
              signUrl: statusResult.signUrl
            }
          });
          
          saveToStorage();
          
          toast({
            title: "Ready to Sign!",
            description: "Your documents are ready for signature. Proceeding to next step...",
          });
          
          // Auto-proceed to next step after 2 seconds
          setTimeout(() => {
            setLocation('/apply/step-5');
          }, 2000);
          
        } else if (statusResult.status === 'error') {
          setPollingStatus('error');
          setIsPolling(false);
          
          toast({
            title: "Document Preparation Error",
            description: statusResult.error || "Failed to prepare documents",
            variant: "destructive",
          });
          
        } else {
          // Continue polling - status is still 'pending'
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        }
        
      } catch (error) {
        console.error('❌ Failed to check signing status:', error);
        // Retry after delay
        setTimeout(checkStatus, 10000);
      }
    };
    
    // Start first check after 5 seconds
    setTimeout(checkStatus, 5000);
  };

  const handleManualProceed = () => {
    // Allow manual progression if automatic polling doesn't work
    setLocation('/apply/step-5');
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
                Ready to Submit to Staff Backend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your application data will be submitted to the staff backend for processing and document preparation.
              </p>
              <Button onClick={handleSubmitToStaff} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Submit to Staff & Continue
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
                Submitting to Staff Backend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Please wait while we submit your application data to the staff system...
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
                Submitted Successfully
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-2">
                Application ID: <span className="font-mono">{applicationId}</span>
              </p>
              <p className="text-green-600">
                Your application has been submitted to the staff backend successfully.
              </p>
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
                {submissionError || 'Failed to submit application'}
              </p>
              <Button onClick={handleSubmitToStaff} variant="outline">
                Retry Submission
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  const renderPollingSection = () => {
    if (submissionStatus !== 'submitted') return null;

    switch (pollingStatus) {
      case 'polling':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Checking Signing Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-gray-600">Polling /applications/{applicationId}/signing-status every 10s...</span>
              </div>
              <p className="text-sm text-gray-500">
                Waiting for status: "ready_to_sign". This usually takes 1-3 minutes.
              </p>
            </CardContent>
          </Card>
        );

      case 'ready_to_sign':
        return (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="w-5 h-5" />
                Ready to Sign!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Your documents are prepared and ready for signature. Proceeding automatically...
              </p>
              <Button onClick={handleManualProceed} variant="outline">
                Continue to Next Step
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
                Polling Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                There was an error checking the signing status.
              </p>
              <div className="space-x-2">
                <Button onClick={() => setPollingStatus('polling')} variant="outline">
                  Retry Polling
                </Button>
                <Button onClick={handleManualProceed} variant="secondary">
                  Continue Anyway
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
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
                Step 4: Confirm Loan Product & Continue
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Review your selections and submit to staff backend
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selected Product */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Selected Product</span>
              </div>
              <p className="text-gray-600 ml-6">
                {selectedProduct?.product_name || 'No product selected'}
              </p>
              {selectedProduct?.lender_name && (
                <p className="text-sm text-gray-500 ml-6">
                  by {selectedProduct.lender_name}
                </p>
              )}
            </div>

            {/* Funding Amount */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium">Funding Amount</span>
              </div>
              <p className="text-gray-600 ml-6">
                ${financialProfile?.fundingAmount?.toLocaleString() || 'Not specified'}
              </p>
            </div>

            {/* Business Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Business</span>
              </div>
              <p className="text-gray-600 ml-6">
                {businessInfo?.operatingName || businessInfo?.legalName || 'Not provided'}
              </p>
              <p className="text-sm text-gray-500 ml-6">
                {businessInfo?.businessCity}, {businessInfo?.businessState}
              </p>
            </div>

            {/* Primary Applicant */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Primary Applicant</span>
              </div>
              <p className="text-gray-600 ml-6">
                {personalInfo?.firstName} {personalInfo?.lastName}
              </p>
              <p className="text-sm text-gray-500 ml-6">
                {personalInfo?.title} • {personalInfo?.ownershipPercentage}% ownership
              </p>
            </div>
          </div>

          {/* Completion Status */}
          <Alert className={hasRequiredData() ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
            <CheckCircle className={`h-4 w-4 ${hasRequiredData() ? 'text-green-600' : 'text-yellow-600'}`} />
            <AlertDescription className={hasRequiredData() ? 'text-green-800' : 'text-yellow-800'}>
              {hasRequiredData() 
                ? "All required information collected. Ready to submit to staff backend."
                : "Please complete all previous steps before continuing."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Submission Section */}
      {renderSubmissionSection()}

      {/* Polling Section */}
      {renderPollingSection()}

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
            
            {pollingStatus === 'ready_to_sign' && (
              <Button 
                onClick={handleManualProceed}
                className="flex items-center gap-2"
              >
                Continue to Document Upload
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}