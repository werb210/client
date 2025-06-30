import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useComprehensiveForm } from '@/context/ComprehensiveFormContext';
import { Step1BusinessBasics } from '@/components/forms/Step1BusinessBasics';
import { Step2ProductSelection } from '@/components/forms/Step2ProductSelection';
import { Step3BusinessDetails } from '@/components/forms/Step3BusinessDetails';
import { Step4ApplicantInfo } from '@/components/forms/Step4ApplicantInfo';
import { Step5DocumentUpload } from '@/components/forms/Step5DocumentUpload';
import { Step6Consents } from '@/components/forms/Step6Consents';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { number: 1, title: 'Business Basics', description: 'Location, industry, and funding needs' },
  { number: 2, title: 'Product Selection', description: 'AI-powered recommendations' },
  { number: 3, title: 'Business Details', description: 'Structure, address, and operations' },
  { number: 4, title: 'Applicant Details', description: 'Primary applicant and partner info' },
  { number: 5, title: 'Document Upload', description: 'Required business documents' },
  { number: 6, title: 'Consents', description: 'Authorization and agreements' },
  { number: 7, title: 'Signature', description: 'Electronic signature completion' },
];

function StepIndicator() {
  const { state } = useComprehensiveForm();
  const progressPercentage = ((state.currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Application Progress
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Step {state.currentStep} of {steps.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                    state.currentStep === step.number
                      ? "bg-teal-600 text-white"
                      : state.currentStep > step.number
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  )}
                >
                  {state.currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center min-w-0">
                  <div
                    className={cn(
                      "text-xs font-medium truncate",
                      state.currentStep >= step.number
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block mt-1 max-w-24 truncate">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mx-4 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ComprehensiveApplication() {
  const [, navigate] = useLocation();
  const { state, updateFormData, setCurrentStep, markStepComplete } = useComprehensiveForm();

  useEffect(() => {
    // Load saved form data from localStorage on mount
    const savedData = localStorage.getItem('comprehensive-application-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        updateFormData(parsed.formData || {});
        setCurrentStep(parsed.currentStep || 1);
      } catch (error) {
        console.warn('Failed to load saved application data:', error);
      }
    }
  }, [updateFormData, setCurrentStep]);

  useEffect(() => {
    // Save form data to localStorage whenever it changes
    const dataToSave = {
      formData: state.formData,
      currentStep: state.currentStep,
      completedSteps: Array.from(state.completedSteps),
    };
    localStorage.setItem('comprehensive-application-data', JSON.stringify(dataToSave));
  }, [state.formData, state.currentStep, state.completedSteps]);

  const handleStepSubmit = (data: any) => {
    updateFormData(data);
    markStepComplete(state.currentStep);
  };

  const handleNext = () => {
    if (state.currentStep < steps.length) {
      setCurrentStep(state.currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (state.currentStep > 1) {
      setCurrentStep(state.currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Step1BusinessBasics
            defaultValues={state.formData}
            onSubmit={handleStepSubmit}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step2ProductSelection
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <Step3BusinessDetails
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <Step4ApplicantInfo
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <Step5DocumentUpload
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <Step6Consents
            defaultValues={state.formData}
            onSubmit={handleStepSubmit}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <Step3BusinessDetails
            defaultValues={state.formData}
            onSubmit={handleStepSubmit}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <Step4ApplicantDetails
            defaultValues={state.formData}
            onSubmit={handleStepSubmit}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Document Upload</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Upload required business documents for verification.
                  This will integrate with the existing document upload system.
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      markStepComplete(5);
                      handleNext();
                    }}
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    Continue
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 6:
        return (
          <Step6Consents
            defaultValues={state.formData}
            onSubmit={handleStepSubmit}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 7:
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Electronic Signature</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Complete your application with an electronic signature.
                  This will integrate with the existing SignNow workflow.
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      // Complete application
                      console.log('Application completed:', state.formData);
                      navigate('/dashboard');
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Complete Application
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StepIndicator />
      <div className="py-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
}