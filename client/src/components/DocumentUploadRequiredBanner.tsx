import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DocumentUploadRequiredBannerProps {
  uploadedCount: number;
  requiredCount: number;
  isVisible: boolean;
}

export function DocumentUploadRequiredBanner({ 
  uploadedCount, 
  requiredCount, 
  isVisible 
}: DocumentUploadRequiredBannerProps) {
  if (!isVisible || uploadedCount >= requiredCount) {
    return null;
  }

  const remainingCount = requiredCount - uploadedCount;

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Upload Required Documents</AlertTitle>
      <AlertDescription className="text-orange-700">
        Upload {remainingCount} of {requiredCount} required documents before finalizing your application.
        Current progress: {uploadedCount}/{requiredCount} documents uploaded.
      </AlertDescription>
    </Alert>
  );
}