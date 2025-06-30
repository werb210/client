import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useFormData } from '@/context/FormDataContext';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  PenTool, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { getSignNowUrl, checkSignatureStatus } from '@/lib/api';
import MainLayout from '@/components/layout/MainLayout';

interface SignatureStatus {
  signed: boolean;
  signedAt?: string;
  documentUrl?: string;
}

export default function Step6Signature() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useFormData();
  const { toast } = useToast();
  const [isPolling, setIsPolling] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>({ signed: false });

  // Generate application ID from form data (in real app this would come from backend)
  const applicationId = React.useMemo(() => {
    const businessName = state.step3BusinessDetails?.businessAddress?.street || 'unknown';
    const timestamp = Date.now();
    return `app_${businessName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;
  }, [state.step3BusinessDetails]);

  // Mutation to get SignNow URL
  const signUrlMutation = useMutation({
    mutationFn: (appId: string) => getSignNowUrl(appId),
    onSuccess: (data) => {
      // Redirect to SignNow in same tab
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error('Failed to get sign URL:', error);
      toast({
        title: "Signature Error",
        description: "Failed to initialize signature process. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Poll for signature status
  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/signatures/status', applicationId],
    queryFn: () => checkSignatureStatus(applicationId),
    enabled: isPolling,
    refetchInterval: isPolling ? 3000 : false, // Poll every 3 seconds
  });

  // Update signature status when data changes
  useEffect(() => {
    if (statusData) {
      setSignatureStatus(statusData);
      if (statusData.signed) {
        setIsPolling(false);
        toast({
          title: "Signature Complete",
          description: "Your application has been successfully signed and submitted.",
          variant: "default",
        });
      }
    }
  }, [statusData, toast]);

  // Check for return from SignNow (URL parameters)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const signatureComplete = urlParams.get('signature_complete');
    const signed = urlParams.get('signed');
    
    if (signatureComplete === 'true' || signed === 'true') {
      setIsPolling(true);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleInitiateSignature = () => {
    signUrlMutation.mutate(applicationId);
  };

  const handleWaitForSignature = () => {
    setIsPolling(true);
    refetchStatus();
  };

  const handleCompleteApplication = () => {
    // Navigate to final submission step
    setLocation('/step7-submit');
    
    toast({
      title: "Signature Complete",
      description: "Proceeding to final application review and submission.",
      variant: "default",
    });
  };

  const handleBackToDocuments = () => {
    setLocation('/step5-documents');
  };

  // Calculate completion progress
  const completedSteps = [
    state.step1FinancialProfile.businessLocation,
    state.step3BusinessDetails?.businessStructure,
    state.step4FinancialInfo?.annualRevenue,
    state.step5DocumentUpload?.categories?.some(cat => cat.documents.length > 0),
  ].filter(Boolean).length;
  
  const totalSteps = 5; // Steps 1-5 before signature
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Step 6: Electronic Signature
          </h1>
          <p className="text-gray-600">
            Complete your application with a secure electronic signature
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Application Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Completed Steps</span>
                <span>{completedSteps} of {totalSteps}</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              <p className="text-sm text-gray-600">
                Your application is {progressPercentage}% complete and ready for signature.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Signature Status */}
        {!signatureStatus.signed ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-blue-500" />
                Electronic Signature Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next:</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    You'll be redirected to SignNow to review and sign your application
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    The signature process is secure and legally binding
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    You'll return here automatically after signing
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    Your application will be immediately submitted for review
                  </li>
                </ul>
              </div>

              {!isPolling ? (
                <div className="flex gap-4">
                  <Button 
                    onClick={handleInitiateSignature}
                    disabled={signUrlMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {signUrlMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Preparing Document...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4" />
                        Sign Application Now
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleWaitForSignature}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Already Signed? Check Status
                  </Button>
                </div>
              ) : (
                <Alert>
                  <Clock className="h-4 w-4 animate-pulse" />
                  <AlertDescription>
                    Waiting for signature completion... We're checking for your signature every few seconds.
                  </AlertDescription>
                </Alert>
              )}

              {signUrlMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to initialize signature process. Please try again or contact support.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Signature Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  ✅ Your application has been successfully signed and submitted for review.
                </p>
                {signatureStatus.signedAt && (
                  <p className="text-sm text-green-600 mt-2">
                    Signed on: {new Date(signatureStatus.signedAt).toLocaleString()}
                  </p>
                )}
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleCompleteApplication}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete Application
                </Button>
                {signatureStatus.documentUrl && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(signatureStatus.documentUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View Signed Document
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBackToDocuments}>
            ← Back to Documents
          </Button>
          
          {signatureStatus.signed && (
            <Button onClick={handleCompleteApplication}>
              Complete Application →
            </Button>
          )}
        </div>

        {/* Application Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Application Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                <p><strong>Location:</strong> {state.step1FinancialProfile.businessLocation}</p>
                <p><strong>Industry:</strong> {state.step1FinancialProfile.industry}</p>
                <p><strong>Monthly Revenue:</strong> {state.step1FinancialProfile.monthlyRevenue}</p>
              </div>
              
              {state.step3BusinessDetails && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Business Details</h4>
                  <p><strong>Structure:</strong> {state.step3BusinessDetails.businessStructure}</p>
                  <p><strong>Incorporation:</strong> {state.step3BusinessDetails.incorporationDate}</p>
                  <p><strong>Tax ID:</strong> {state.step3BusinessDetails.taxId}</p>
                </div>
              )}
              
              {state.step4FinancialInfo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Financial Information</h4>
                  <p><strong>Annual Revenue:</strong> {state.step4FinancialInfo.annualRevenue}</p>
                  <p><strong>Employees:</strong> {state.step4FinancialInfo.numberOfEmployees}</p>
                </div>
              )}
              
              {state.step5DocumentUpload && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                  <p><strong>Categories:</strong> {state.step5DocumentUpload.categories?.length || 0}</p>
                  <p><strong>Uploaded:</strong> {
                    state.step5DocumentUpload.categories?.reduce((acc, cat) => 
                      acc + cat.documents.filter(doc => doc.status === 'completed').length, 0
                    ) || 0
                  }</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}