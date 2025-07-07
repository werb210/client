import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFormDataContext } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { DynamicDocumentRequirements } from '@/components/DynamicDocumentRequirements';
import { 
  ArrowRight, 
  ArrowLeft, 
  Save,
  FileText,
  CheckCircle
} from 'lucide-react';

import type { UploadedFile } from '../components/DynamicDocumentRequirements';

export default function Step5DocumentUpload() {
  const { state, dispatch } = useFormDataContext();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for tracking uploaded files and requirements completion
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    (state.uploadedDocuments || []).map(doc => ({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      status: (doc.status as "completed" | "uploading" | "error") || "completed",
      documentType: doc.documentType,
      file: new File([], doc.name) // Create placeholder File object for existing documents
    }))
  );
  const [allRequirementsComplete, setAllRequirementsComplete] = useState(false);
  const [totalRequirements, setTotalRequirements] = useState(0);

  // Handle file upload from DynamicDocumentRequirements component
  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    
    // Update form data state using unified schema
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        uploadedDocuments: files,
      }
    });
  };

  // Handle requirements completion status
  const handleRequirementsChange = (allComplete: boolean, total: number) => {
    setAllRequirementsComplete(allComplete);
    setTotalRequirements(total);
  };

  // Get selected product from previous steps for document categorization
  const selectedProduct = state.selectedProductId || '';
  
  // Navigation handlers
  const handlePrevious = () => {
    setLocation('/apply/step-4');
  };

  const handleNext = () => {
    if (!allRequirementsComplete) {
      toast({
        title: "Required Documents Missing",
        description: "Please upload all required documents before proceeding.",
        variant: "destructive",
      });
      return;
    }

    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        uploadedDocuments: uploadedFiles,
      }
    });
    
    dispatch({
      type: 'MARK_STEP_COMPLETE',
      payload: 5
    });
    setLocation('/apply/step-6');
  };

  const handleSaveAndContinueLater = () => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        uploadedDocuments: uploadedFiles,
      }
    });
    
    toast({
      title: "Progress Saved",
      description: "Your document uploads have been saved. You can continue later.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="bg-gradient-to-r from-teal-600 to-orange-500 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-white">
                  Document Upload
                </CardTitle>
                <p className="text-white/90 mt-2">
                  Upload the required documents for your application
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <FileText className="w-3 h-3" />
                  <span>{uploadedFiles.length} Uploaded</span>
                </Badge>
                {allRequirementsComplete && (
                  <Badge variant="default" className="flex items-center space-x-1 bg-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Complete</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dynamic Document Requirements Component */}
      <DynamicDocumentRequirements
        formData={{
          lookingFor: state.lookingFor,
          businessLocation: state.businessLocation,
          fundingAmount: state.fundingAmount?.toString(),
          accountsReceivableBalance: state.accountsReceivableBalance?.toString()
        }}
        uploadedFiles={uploadedFiles}
        onFilesUploaded={handleFilesUploaded}
        onRequirementsChange={handleRequirementsChange}
        selectedProduct={selectedProduct}
        applicationId={state.applicationId || 'test-app-123'}
      />

      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {allRequirementsComplete 
                ? `All ${totalRequirements} required documents uploaded` 
                : `${totalRequirements} required documents needed`}
            </div>
            <div className="text-sm text-gray-500">
              Step 5 of 7
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <Button
          onClick={handleNext}
          disabled={!allRequirementsComplete}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          <span>Continue to Signature</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}