/**
 * Step 5 Layout Wrapper component
 * Provides consistent styling and layout for Step 5 document upload UI
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface Step5WrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  showIcon?: boolean;
}

export function Step5Wrapper({ 
  title, 
  description, 
  children, 
  showIcon = true 
}: Step5WrapperProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          {showIcon && (
            <div className="p-3 rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        {description && (
          <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
        )}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}