import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { DynamicDocumentRequirements } from './DynamicDocumentRequirements';

// Define the UploadedFile type to match DynamicDocumentRequirements
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: "uploading" | "completed" | "error";
  documentType: string;
  preview?: string;
  uploadProgress?: number;
}

export const Step5Documents: React.FC = () => {
  const [, setLocation] = useLocation();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [allRequiredDocsComplete, setAllRequiredDocsComplete] = useState(false);
  const [totalRequiredDocs, setTotalRequiredDocs] = useState(0);

  // Mock form data - in real implementation this would come from FormDataProvider
  const formData = {
    headquarters: 'united_states',
    lookingFor: 'capital',
    fundingAmount: '$50000',
    accountsReceivableBalance: '$25000'
  };

  // Mock selected product - in real implementation this would come from Step 2
  const selectedProduct = 'Term Loan';

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleRequirementsChange = (allComplete: boolean, totalRequirements: number) => {
    setAllRequiredDocsComplete(allComplete);
    setTotalRequiredDocs(totalRequirements);
  };

  const handleContinue = () => {
    if (allRequiredDocsComplete) {
      setLocation('/apply/step-6');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Upload Required Documents</h1>
        <p className="text-lg text-gray-600">
          Upload the documents required for your loan application
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Document Upload Progress
          </span>
          <span className="text-sm text-gray-500">
            {uploadedFiles.length} files uploaded
          </span>
        </div>
        
        {totalRequiredDocs > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {allRequiredDocsComplete ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
              <span className={`text-sm font-medium ${
                allRequiredDocsComplete ? 'text-green-600' : 'text-orange-600'
              }`}>
                {allRequiredDocsComplete 
                  ? 'All required documents uploaded!' 
                  : `Please upload all ${totalRequiredDocs} required document types`
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Document Requirements Component */}
      <DynamicDocumentRequirements
        formData={formData}
        uploadedFiles={uploadedFiles}
        onFilesUploaded={handleFilesUploaded}
        selectedProduct={selectedProduct}
        onRequirementsChange={handleRequirementsChange}
        applicationId="test-app-123"
      />

      {/* Upload Summary */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Files Uploaded:</span>
                <span className="font-medium">{uploadedFiles.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Size:</span>
                <span className="font-medium">
                  {(uploadedFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Required Documents Status:</span>
                <span className={`font-medium ${
                  allRequiredDocsComplete ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {allRequiredDocsComplete ? 'Complete' : 'Incomplete'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Alert */}
      {!allRequiredDocsComplete && totalRequiredDocs > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please upload all required documents before proceeding to the next step. 
            Missing documents may delay the processing of your application.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/apply/step-4')}
        >
          Back to Previous Step
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={!allRequiredDocsComplete}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          Continue to Signature
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Document Upload Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Accepted formats: PDF, DOC, DOCX, JPG, PNG</li>
            <li>• Maximum file size: 10MB per file</li>
            <li>• Ensure documents are clear and readable</li>
            <li>• Multiple files can be uploaded for each document type</li>
            <li>• All personal information should be clearly visible</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};