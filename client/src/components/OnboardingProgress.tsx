import { useFormData } from '@/context/FormDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  stepNumber: number;
}

const progressSteps: ProgressStep[] = [
  {
    id: 'financial-profile',
    title: 'Financial Profile',
    description: 'Basic funding requirements and business info',
    required: true,
    stepNumber: 1
  },
  {
    id: 'recommendations',
    title: 'Lender Recommendations',
    description: 'AI-powered matching with suitable lenders',
    required: true,
    stepNumber: 2
  },
  {
    id: 'business-details',
    title: 'Business Details',
    description: 'Company information and structure',
    required: true,
    stepNumber: 3
  },
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Owner and applicant details',
    required: true,
    stepNumber: 4
  },
  {
    id: 'documents',
    title: 'Document Upload',
    description: 'Required documents (can be uploaded later)',
    required: false,
    stepNumber: 5
  },
  {
    id: 'signature',
    title: 'Electronic Signature',
    description: 'Legal binding of the application',
    required: true,
    stepNumber: 6
  },
  {
    id: 'submission',
    title: 'Final Submission',
    description: 'Review and submit complete application',
    required: true,
    stepNumber: 7
  }
];

export function OnboardingProgress() {
  const { state } = useFormData();
  
  const getStepStatus = (step: ProgressStep) => {
    switch (step.id) {
      case 'financial-profile':
        return state.step1Completed ? 'completed' : state.currentStep === 1 ? 'active' : 'pending';
      case 'recommendations':
        return state.step2Completed ? 'completed' : state.currentStep === 2 ? 'active' : 'pending';
      case 'business-details':
        return state.step3Completed ? 'completed' : state.currentStep === 3 ? 'active' : 'pending';
      case 'personal-info':
        return state.step4Completed ? 'completed' : state.currentStep === 4 ? 'active' : 'pending';
      case 'documents':
        return state.step5Completed ? 'completed' : 
               state.bypassedDocuments ? 'bypassed' :
               state.currentStep === 5 ? 'active' : 'pending';
      case 'signature':
        return state.step6Completed ? 'completed' : state.currentStep === 6 ? 'active' : 'pending';
      case 'submission':
        return state.isComplete ? 'completed' : state.currentStep === 7 ? 'active' : 'pending';
      default:
        return 'pending';
    }
  };

  const completedSteps = progressSteps.filter(step => getStepStatus(step) === 'completed').length;
  const totalSteps = progressSteps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'bypassed':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'active':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'bypassed':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Application Progress
            </h3>
            <Badge variant="outline" className="text-xs">
              {completedSteps}/{totalSteps} Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          {progressSteps.map((step) => {
            const status = getStepStatus(step);
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${getStepColor(status)}`}
              >
                <div className="flex items-center gap-2">
                  {getStepIcon(status)}
                  <span className="text-xs font-medium w-4">
                    {step.stepNumber}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {step.title}
                    </p>
                    {!step.required && (
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    )}
                    {status === 'bypassed' && (
                      <Badge variant="outline" className="text-xs text-orange-600">
                        Bypassed
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {state.bypassedDocuments && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Documents Pending</span>
            </div>
            <p className="text-xs text-orange-600 mt-1">
              You can upload required documents later through the warning banner.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}