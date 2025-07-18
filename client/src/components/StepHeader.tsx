import React from 'react';

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  description: string;
  totalSteps?: number;
}

export function StepHeader({ stepNumber, title, description, totalSteps = 6 }: StepHeaderProps) {
  const progressPercentage = (stepNumber / totalSteps) * 100;
  
  return (
    <div className="text-center space-y-4">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          Step {stepNumber}: {title}
        </h1>
        <p className="text-gray-600 mt-2">
          {description}
        </p>
      </div>
    </div>
  );
}