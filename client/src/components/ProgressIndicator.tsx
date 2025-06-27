import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const stepLabels = [
  "Business Details",
  "Lender Options",
  "Product Questions",
  "Personal Info",
  "Documents",
  "Signature",
  "Review"
];

export function ProgressIndicator({ currentStep, totalSteps, className }: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {stepLabels[currentStep - 1] || `Step ${currentStep}`}
        </h3>
        <span className="text-sm text-gray-500 font-medium">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div
                key={stepNumber}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  {
                    "bg-blue-500 text-white": isActive,
                    "bg-green-500 text-white": isCompleted,
                    "bg-gray-200 text-gray-500": !isActive && !isCompleted,
                  }
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex-1 mx-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
