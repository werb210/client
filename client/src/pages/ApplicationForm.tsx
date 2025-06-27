import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { ApplicationProvider, useApplication } from '@/context/ApplicationContext';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { BusinessDetails } from '@/components/MultiStepForm/BusinessDetails';
import { LenderRecommendations } from '@/components/MultiStepForm/LenderRecommendations';
import { ProductQuestions } from '@/components/MultiStepForm/ProductQuestions';
import { PersonalDetails } from '@/components/MultiStepForm/PersonalDetails';
import { DocumentStep } from '@/components/MultiStepForm/DocumentStep';
import { SignatureStep } from '@/components/MultiStepForm/SignatureStep';
import { ReviewStep } from '@/components/MultiStepForm/ReviewStep';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Application } from '@shared/schema';
import { ArrowLeft, Save } from 'lucide-react';

function ApplicationFormContent() {
  const { state, dispatch, saveProgress } = useApplication();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useRouter();
  const queryClient = useQueryClient();
  const [applicationId, setApplicationId] = useState<number | undefined>();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async () => {
      const applicationData = {
        status: 'draft',
        currentStep: state.currentStep,
        businessLegalName: state.formData.businessInfo?.legalName,
        industry: state.formData.businessInfo?.industry,
        headquarters: state.formData.businessInfo?.headquarters,
        annualRevenue: state.formData.businessInfo?.revenue,
        useOfFunds: state.formData.businessInfo?.useOfFunds,
        requestedAmount: state.formData.businessInfo?.loanAmount,
        selectedProduct: state.formData.selectedProduct,
        applicantName: state.formData.personalDetails?.name,
        applicantEmail: state.formData.personalDetails?.email,
        applicantPhone: state.formData.personalDetails?.phone,
        termsAccepted: state.formData.signature?.termsAccepted,
        signatureCompleted: state.formData.signature?.signed,
        formData: state.formData,
      };

      if (applicationId) {
        const response = await apiRequest('PATCH', `/api/applications/${applicationId}`, applicationData);
        return await response.json();
      } else {
        const response = await apiRequest('POST', '/api/applications', applicationData);
        const newApp = await response.json();
        setApplicationId(newApp.id);
        return newApp;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error('Auto-save failed:', error);
    },
  });

  const handleSaveDraft = async () => {
    try {
      await saveProgress();
      await autoSaveMutation.mutateAsync();
      toast({
        title: "Draft saved",
        description: "Your progress has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Unable to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToDashboard = () => {
    setLocation('/');
  };

  const handleSaveAndExit = async () => {
    await handleSaveDraft();
    setLocation('/');
  };

  const handleNext = () => {
    if (state.currentStep < 7) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  };

  const handleBack = () => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
    }
  };

  const handleComplete = () => {
    toast({
      title: "Application Submitted!",
      description: "Your application has been submitted successfully. You will receive updates via email.",
    });
    setLocation('/');
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <BusinessDetails onNext={handleNext} />;
      case 2:
        return <LenderRecommendations onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <ProductQuestions onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <PersonalDetails onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <DocumentStep onNext={handleNext} onBack={handleBack} applicationId={applicationId} />;
      case 6:
        return <SignatureStep onNext={handleNext} onBack={handleBack} />;
      case 7:
        return <ReviewStep onBack={handleBack} onComplete={handleComplete} applicationId={applicationId} />;
      default:
        return <BusinessDetails onNext={handleNext} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="text-white text-sm w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Financial Portal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/api/logout'}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Financial Application</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSaveDraft}
                disabled={autoSaveMutation.isPending}
                className="text-blue-500 hover:text-blue-600"
              >
                <Save className="w-4 h-4 mr-1" />
                {autoSaveMutation.isPending ? 'Saving...' : 'Save Draft'}
              </Button>
            </div>
            
            <ProgressIndicator currentStep={state.currentStep} totalSteps={7} />
          </CardHeader>
        </Card>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Controls */}
        {state.currentStep !== 7 && (
          <div className="flex items-center justify-between mt-6">
            <Button 
              variant="outline"
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost"
                onClick={handleSaveAndExit}
                className="text-gray-600 hover:text-gray-800"
              >
                Save & Exit
              </Button>
            </div>
          </div>
        )}

        {/* Offline Status Indicator */}
        {!state.isOnline && (
          <div className="fixed bottom-4 right-4 p-3 bg-orange-50 border border-orange-200 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-orange-800">
                Working offline - Changes will sync when connection is restored
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationForm() {
  return (
    <ApplicationProvider>
      <ApplicationFormContent />
    </ApplicationProvider>
  );
}
