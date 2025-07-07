import { useState, useEffect } from 'react';
import { useFormData } from '@/context/FormDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, ChevronLeft, CheckCircle, Circle, Play } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  required: boolean;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Boreal Financial',
    description: 'This walkthrough will guide you through the loan application process. You can skip this at any time.',
    target: 'body',
    position: 'top',
    required: false
  },
  {
    id: 'step1-funding',
    title: 'Select Your Funding Type',
    description: 'Start by choosing what type of financing you need. This helps us recommend the best products for your business.',
    target: '[data-onboarding="funding-type"]',
    position: 'bottom',
    required: true
  },
  {
    id: 'step1-amount',
    title: 'Funding Amount',
    description: 'Enter how much funding you need. This will help filter suitable lenders for your business.',
    target: '[data-onboarding="funding-amount"]',
    position: 'bottom',
    required: true
  },
  {
    id: 'step1-location',
    title: 'Business Location',
    description: 'Select your business location. This determines regional requirements and available lenders.',
    target: '[data-onboarding="business-location"]',
    position: 'bottom',
    required: true
  },
  {
    id: 'step2-recommendations',
    title: 'Review Recommendations',
    description: 'Based on your profile, we\'ll show matching lenders. Select the category that best fits your needs.',
    target: '[data-onboarding="recommendations"]',
    position: 'top',
    required: true
  },
  {
    id: 'step3-business',
    title: 'Business Details',
    description: 'Provide your business information. This helps lenders understand your company and make better decisions.',
    target: '[data-onboarding="business-details"]',
    position: 'top',
    required: true
  },
  {
    id: 'step4-personal',
    title: 'Personal Information',
    description: 'Share your personal details as the business owner. This is required for the application process.',
    target: '[data-onboarding="personal-info"]',
    position: 'top',
    required: true
  },
  {
    id: 'step5-documents',
    title: 'Upload Documents',
    description: 'Upload required documents or use the bypass option to proceed and upload later.',
    target: '[data-onboarding="documents"]',
    position: 'top',
    required: false
  },
  {
    id: 'step6-signature',
    title: 'Electronic Signature',
    description: 'Sign your application electronically. This legally binds your application and initiates the review process.',
    target: '[data-onboarding="signature"]',
    position: 'top',
    required: true
  },
  {
    id: 'step7-submit',
    title: 'Final Submission',
    description: 'Review and submit your complete application. You\'ll receive confirmation and next steps.',
    target: '[data-onboarding="final-submit"]',
    position: 'top',
    required: true
  }
];

export function OnboardingWalkthrough() {
  const { state } = useFormData();
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  // Check if user has seen onboarding before
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('boreal-onboarding-complete');
    const hasSeenWalkthrough = localStorage.getItem('boreal-walkthrough-seen');
    
    if (!hasSeenOnboarding && !hasSeenWalkthrough && state.currentStep === 1) {
      setIsActive(true);
    }
  }, [state.currentStep]);

  // Track step completion based on form state
  useEffect(() => {
    const newCompletedSteps = [];
    
    if (state.step1Completed) newCompletedSteps.push('step1-funding', 'step1-amount', 'step1-location');
    if (state.step2Completed) newCompletedSteps.push('step2-recommendations');
    if (state.step3Completed) newCompletedSteps.push('step3-business');
    if (state.step4Completed) newCompletedSteps.push('step4-personal');
    if (state.step5Completed) newCompletedSteps.push('step5-documents');
    if (state.step6Completed) newCompletedSteps.push('step6-signature');
    if (state.isComplete) newCompletedSteps.push('step7-submit');
    
    setCompletedSteps(newCompletedSteps);
  }, [state]);

  const currentStep = onboardingSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / onboardingSteps.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < onboardingSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleStart = () => {
    setHasStarted(true);
    setCurrentStepIndex(0);
  };

  const handleComplete = () => {
    localStorage.setItem('boreal-onboarding-complete', 'true');
    setIsActive(false);
  };

  const handleSkip = () => {
    localStorage.setItem('boreal-walkthrough-seen', 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {!hasStarted ? 'Welcome Walkthrough' : currentStep.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {hasStarted && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Step {currentStepIndex + 1} of {onboardingSteps.length}</span>
                <Badge variant={currentStep.required ? 'destructive' : 'secondary'}>
                  {currentStep.required ? 'Required' : 'Optional'}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!hasStarted ? (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Play className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Let's get you started!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We'll guide you through the loan application process step by step. This takes about 2-3 minutes.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">What you'll learn:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    How to select the right funding type
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Understanding our recommendation system
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Document upload and bypass options
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Electronic signature process
                  </li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleStart} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  Start Walkthrough
                </Button>
                <Button onClick={handleSkip} variant="outline" className="flex-1">
                  Skip for Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  {completedSteps.includes(currentStep.id) ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentStep.description}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handlePrevious} 
                  variant="outline" 
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {currentStepIndex === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}