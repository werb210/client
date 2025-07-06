import React from 'react';
// Icons replaced with Unicode symbols to fix build timeout

interface Step {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProgressMonitorProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressMonitor({ steps, currentStep }: ProgressMonitorProps) {
  return (
    <div className="mb-6">
      {/* Mobile: Vertical progress indicator */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-xs text-gray-500">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">{steps[currentStep].title}</h3>
        </div>
      </div>

      {/* Desktop: Horizontal steps */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 transition-all duration-200 ${
                  isActive ? "border-teal-600 bg-teal-600 text-white shadow-lg" :
                  isCompleted ? "border-orange-500 bg-orange-500 text-white" :
                  "border-gray-300 bg-white text-gray-400"
                }`}>
                  <StepIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                <span className={`mt-2 text-xs lg:text-sm font-medium text-center max-w-20 lg:max-w-24 transition-colors duration-200 ${
                  isActive ? "text-teal-600" : 
                  isCompleted ? "text-orange-600" : 
                  "text-gray-400"
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <span className={`w-4 h-4 mx-2 lg:mx-4 mt-[-20px] transition-colors duration-200 flex items-center justify-center ${
                  isCompleted ? "text-orange-400" : "text-gray-300"
                }`}>→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}