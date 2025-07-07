import { useState } from 'react';
import { useFormData } from '@/context/FormDataContext';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, HelpCircle, RotateCcw } from 'lucide-react';

export function OnboardingSidebar() {
  const { state } = useFormData();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Financial Profile';
      case 2: return 'Recommendations';
      case 3: return 'Business Details';
      case 4: return 'Personal Info';
      case 5: return 'Documents';
      case 6: return 'Signature';
      case 7: return 'Submission';
      default: return 'Getting Started';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Tell us about your funding needs and business basics';
      case 2: return 'Review AI-powered lender recommendations';
      case 3: return 'Provide your business details and structure';
      case 4: return 'Share personal information as business owner';
      case 5: return 'Upload required documents or proceed to upload later';
      case 6: return 'Sign your application electronically';
      case 7: return 'Review and submit your complete application';
      default: return 'Begin your loan application journey';
    }
  };

  const getStepTips = (step: number) => {
    switch (step) {
      case 1: return [
        'Select "Both Capital & Equipment" if you need flexibility',
        'Business location affects available lenders',
        'Revenue history helps with better matching'
      ];
      case 2: return [
        'Product categories are filtered based on your profile',
        'Match percentages show compatibility',
        'Select the category that best fits your needs'
      ];
      case 3: return [
        'Legal name should match incorporation documents',
        'Employee count affects loan eligibility',
        'Business start date determines experience level'
      ];
      case 4: return [
        'SSN/SIN is required for credit checks',
        'Partner information needed if ownership < 100%',
        'Regional formatting adapts to your location'
      ];
      case 5: return [
        'Bank statements are typically the most important',
        'Use bypass option if documents aren\'t ready',
        'You can upload documents later via warning banner'
      ];
      case 6: return [
        'Electronic signature is legally binding',
        'Review all information before signing',
        'Signature initiates the formal review process'
      ];
      case 7: return [
        'Review all information for accuracy',
        'Terms acceptance is required for submission',
        'You\'ll receive confirmation and next steps'
      ];
      default: return [];
    }
  };

  const restartOnboarding = () => {
    localStorage.removeItem('boreal-onboarding-complete');
    localStorage.removeItem('boreal-walkthrough-seen');
    window.location.reload();
  };

  if (!isExpanded) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-l-lg shadow-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-40 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Application Guide
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowHelp(!showHelp)}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setIsExpanded(false)}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Step Info */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                Step {state.currentStep}: {getStepTitle(state.currentStep)}
              </CardTitle>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                Current
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              {getStepDescription(state.currentStep)}
            </p>
            
            {/* Step Tips */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                💡 Tips for this step:
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                {getStepTips(state.currentStep).map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Progress Component */}
        <OnboardingProgress />

        {/* Help Section */}
        {showHelp && (
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-900 dark:text-yellow-100">
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="text-xs text-yellow-800 dark:text-yellow-200 space-y-2">
                <p>• All required fields must be completed to proceed</p>
                <p>• Your progress is automatically saved</p>
                <p>• Use the bypass option for documents if needed</p>
                <p>• Contact support if you encounter issues</p>
              </div>
              <Button
                onClick={restartOnboarding}
                variant="outline"
                size="sm"
                className="w-full text-xs mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Restart Walkthrough
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-900 dark:text-gray-100">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {state.bypassedDocuments && (
              <Button
                onClick={() => window.location.href = `/upload-documents/${state.applicationId}`}
                variant="outline"
                size="sm"
                className="w-full text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                📄 Upload Pending Documents
              </Button>
            )}
            
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              🏠 Return to Home
            </Button>
          </CardContent>
        </Card>

        {/* Application Summary */}
        {state.currentStep > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-900 dark:text-gray-100">
                Your Application
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {state.fundingAmount && (
                  <div className="flex justify-between">
                    <span>Funding Amount:</span>
                    <span className="font-medium">${state.fundingAmount?.toLocaleString()}</span>
                  </div>
                )}
                {state.lookingFor && (
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium capitalize">{state.lookingFor}</span>
                  </div>
                )}
                {state.businessLocation && (
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{state.businessLocation}</span>
                  </div>
                )}
                {state.selectedCategoryName && (
                  <div className="flex justify-between">
                    <span>Selected:</span>
                    <span className="font-medium text-xs">{state.selectedCategoryName}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}