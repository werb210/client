import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { staffApi } from '../api/staffApi';
import { 
  ArrowLeft, 
  Send, 
  FileSignature, 
  CheckCircle, 
  ExternalLink, 
  Loader2,
  AlertTriangle,
  Clock
} from 'lucide-react';

type SubmissionStatus = 'idle' | 'submitting' | 'submitted' | 'error';
type SigningStatus = 'pending' | 'ready' | 'completed' | 'error';

export default function Step6Signature() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [signingStatus, setSigningStatus] = useState<SigningStatus>('pending');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Get uploaded files from Step 5
  const uploadedFiles = state.step5DocumentUpload?.uploadedFiles || [];
  const selectedProduct = state.selectedProductId;

  useEffect(() => {
    // Auto-submit if not already submitted and we have all required data
    if (submissionStatus === 'idle' && hasRequiredData()) {
      handleSubmitApplication();
    }
  }, [submissionStatus]);

  useEffect(() => {
    // Start polling for signing URL if application is submitted
    if (applicationId && signingStatus === 'pending' && !isPolling) {
      startSigningStatusPolling();
    }
  }, [applicationId, signingStatus]);

  const hasRequiredData = () => {
    return (
      state.businessLocation &&
      state.selectedProductId &&
      state.businessName &&
      state.firstName &&
      uploadedFiles.length > 0
    );
  };

  const handleSubmitApplication = async () => {
    if (!hasRequiredData()) {
      toast({
        title: "Incomplete Application",
        description: "Please complete all previous steps before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmissionStatus('submitting');
    setSubmissionError(null);

    try {
      console.log('🚀 Starting application submission...');
      
      // Prepare uploaded files with File objects
      const filesWithFileObjects = uploadedFiles
        .filter(file => file.file)
        .map(file => ({
          file: file.file!,
          documentType: file.documentType
        }));

      const result = await staffApi.submitApplication(
        state,
        filesWithFileObjects,
        selectedProduct || 'unknown'
      );

      if (result.status === 'submitted' && result.applicationId) {
        setApplicationId(result.applicationId);
        setSubmissionStatus('submitted');
        
        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: {
            applicationId: result.applicationId,
            submittedAt: new Date().toISOString(),
            completed: false // Not completed until signed
          }
        });
        
        saveToStorage();
        
        toast({
          title: "Application Submitted Successfully",
          description: "Your application has been submitted. Preparing documents for signing...",
        });

        // Start checking for signing readiness
        setSigningStatus('pending');
        
      } else {
        throw new Error(result.error || 'Submission failed');
      }
      
    } catch (error) {
      console.error('❌ Application submission failed:', error);
      setSubmissionStatus('error');
      setSubmissionError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'Failed to submit application',
        variant: "destructive",
      });
    }
  };

  const startSigningStatusPolling = async () => {
    if (!applicationId || isPolling) return;
    
    setIsPolling(true);
    console.log('🔄 Starting signing status polling...');
    
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;
    
    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setIsPolling(false);
        setSigningStatus('error');
        toast({
          title: "Signing Preparation Timeout",
          description: "Document preparation is taking longer than expected. Please contact support.",
          variant: "destructive",
        });
        return;
      }
      
      attempts++;
      
      try {
        const statusResult = await staffApi.checkSigningStatus(applicationId);
        
        if (statusResult.status === 'ready' && statusResult.signUrl) {
          setSignUrl(statusResult.signUrl);
          setSigningStatus('ready');
          setIsPolling(false);
          
          toast({
            title: "Documents Ready for Signing",
            description: "Your documents are ready. Click to open SignNow.",
          });
          
        } else if (statusResult.status === 'completed') {
          setSigningStatus('completed');
          setIsPolling(false);
          handleSigningCompleted();
          
        } else if (statusResult.status === 'error') {
          setSigningStatus('error');
          setIsPolling(false);
          
          toast({
            title: "Document Preparation Error",
            description: statusResult.error || "Failed to prepare documents for signing",
            variant: "destructive",
          });
          
        } else {
          // Continue polling
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        }
        
      } catch (error) {
        console.error('❌ Failed to check signing status:', error);
        setTimeout(checkStatus, 10000); // Retry after 10 seconds
      }
    };
    
    // Start first check after 5 seconds
    setTimeout(checkStatus, 5000);
  };

  const handleOpenSignNow = () => {
    if (signUrl) {
      window.open(signUrl, '_blank');
      
      // Start polling to check if signing is completed
      setTimeout(() => {
        if (applicationId) {
          checkSigningCompletion();
        }
      }, 30000); // Check after 30 seconds
    }
  };

  const checkSigningCompletion = async () => {
    if (!applicationId) return;
    
    try {
      const statusResult = await staffApi.checkSigningStatus(applicationId);
      
      if (statusResult.status === 'completed') {
        handleSigningCompleted();
      }
      
    } catch (error) {
      console.error('❌ Failed to check signing completion:', error);
    }
  };

  const handleSigningCompleted = () => {
    setSigningStatus('completed');
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        applicationId: applicationId || undefined,
        submissionStatus: 'submitted',
        signedAt: new Date().toISOString(),
        completed: true
      }
    });
    
    saveToStorage();
    
    toast({
      title: "Signature Complete!",
      description: "Proceeding to final application submission...",
    });
    
    // Redirect to Step 7 for final submission
    setTimeout(() => {
      setLocation('/apply/step-7');
    }, 2000);
  };

  const handlePrevious = () => {
    setLocation('/apply/step-5');
  };

  const renderSubmissionSection = () => {
    switch (submissionStatus) {
      case 'idle':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Ready to Submit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your application is complete and ready for submission to the lender.
              </p>
              <Button onClick={handleSubmitApplication} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Submit Application
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
                Submitting Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Please wait while we submit your application and prepare the documents...
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
                Application Submitted Successfully
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-2">
                Application ID: <span className="font-mono">{applicationId}</span>
              </p>
              <p className="text-green-600">
                Your application has been submitted successfully. Documents are being prepared for signing.
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
              <Button onClick={handleSubmitApplication} variant="outline">
                Retry Submission
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  const renderSigningSection = () => {
    if (submissionStatus !== 'submitted') return null;

    switch (signingStatus) {
      case 'pending':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Preparing Documents for Signing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-gray-600">Please wait while we prepare your documents...</span>
              </div>
              <p className="text-sm text-gray-500">
                This usually takes 1-3 minutes. We'll notify you when ready.
              </p>
            </CardContent>
          </Card>
        );

      case 'ready':
        return (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <FileSignature className="w-5 h-5" />
                Documents Ready for Signing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Your documents are ready for electronic signature via SignNow.
              </p>
              <Button onClick={handleOpenSignNow} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open SignNow to Sign Documents
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                This will open SignNow in a new tab. Complete the signing process and return here.
              </p>
            </CardContent>
          </Card>
        );

      case 'completed':
        return (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Application Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Congratulations! Your application has been submitted and signed successfully.
              </p>
              <p className="text-green-600 text-sm">
                You will receive updates on your application status via email.
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
                Signing Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                There was an error preparing your documents for signing.
              </p>
              <Button onClick={() => setSigningStatus('pending')} variant="outline">
                Retry Document Preparation
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
                <FileSignature className="w-6 h-6 text-blue-600" />
                Application Submission & Signature
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Final step: Submit your application and sign the documents
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
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Selected Product:</span>
              <p className="font-medium">{selectedProduct || 'Not selected'}</p>
            </div>
            <div>
              <span className="text-gray-500">Funding Amount:</span>
              <p className="font-medium">
                ${state.fundingAmount?.toLocaleString() || 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Business Name:</span>
              <p className="font-medium">{state.businessName || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-gray-500">Documents Uploaded:</span>
              <p className="font-medium">{uploadedFiles.length} files</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Section */}
      {renderSubmissionSection()}

      {/* Signing Section */}
      {renderSigningSection()}

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handlePrevious}
              disabled={submissionStatus === 'submitting' || isPolling}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {signingStatus === 'completed' && (
              <Button onClick={() => setLocation('/dashboard')}>
                View Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}