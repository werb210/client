import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { validateStrictDocumentRequirements, generateDocumentProgressSummary } from '../utils/strictDocumentValidation';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'completed' | 'uploading' | 'error';
  documentType: string;
  file?: File;
}

interface StrictDocumentValidationProps {
  uploadedFiles: UploadedFile[];
  className?: string;
}

export function StrictDocumentValidation({ uploadedFiles, className = '' }: StrictDocumentValidationProps) {
  const validation = validateStrictDocumentRequirements(uploadedFiles);
  
  const getProgressColor = (current: number, required: number) => {
    if (current === 0) return 'bg-gray-200';
    if (current < required) return 'bg-yellow-500';
    if (current === required) return 'bg-green-500';
    return 'bg-blue-500'; // More than required
  };

  const getStatusIcon = (current: number, required: number) => {
    if (current === required) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (current < required) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Status Alert */}
      {validation.errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-800">
            <strong>Document Requirements Not Met:</strong>
            <ul className="mt-2 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm">• {error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-800">
            <ul className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-sm">• {warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.canProceed && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-800">
            <strong>All document requirements satisfied!</strong> You can proceed to the next step.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Indicators */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Accountant Documents Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(validation.accountantDocsCount, validation.requiredAccountantDocs)}
              <span className="font-medium text-sm">Accountant Documents</span>
            </div>
            <span className="text-sm text-gray-600">
              {validation.accountantDocsCount}/{validation.requiredAccountantDocs}
            </span>
          </div>
          <Progress 
            value={(validation.accountantDocsCount / validation.requiredAccountantDocs) * 100} 
            className="h-2"
          />
          <p className="text-xs text-gray-500">
            Required: Accountant prepared financial statements
          </p>
        </div>

        {/* Tax Documents Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(validation.taxDocsCount, validation.requiredTaxDocs)}
              <span className="font-medium text-sm">Tax Documents</span>
            </div>
            <span className="text-sm text-gray-600">
              {validation.taxDocsCount}/{validation.requiredTaxDocs}
            </span>
          </div>
          <Progress 
            value={(validation.taxDocsCount / validation.requiredTaxDocs) * 100} 
            className="h-2"
          />
          <p className="text-xs text-gray-500">
            Required: Business or personal tax returns
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700">
          {generateDocumentProgressSummary(validation)}
        </p>
        {!validation.canProceed && (
          <p className="text-xs text-gray-600 mt-1">
            Upload the missing documents to continue to Step 6
          </p>
        )}
      </div>
    </div>
  );
}