import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useFormData } from '@/contexts/FormDataProvider';
import { 
  useUploadDocument, 
  useFinalizeApplication,
  getRequiredDocuments 
} from '@/api/applicationHooks';
import { DocStatus, DocumentCategory } from '@/types/ApplicationForm';

interface DocumentUploadProps {
  onUpload: (file: File, category: DocumentCategory) => void;
  uploads: DocStatus[];
  isUploading: boolean;
}

const DocumentUploader: React.FC<DocumentUploadProps> = ({ 
  onUpload, 
  uploads, 
  isUploading 
}) => {
  const { formData } = useFormData();
  const requiredDocs = getRequiredDocuments(
    formData.step3BusinessDetails?.businessStructure,
    formData.step1FinancialProfile?.lookingFor
  );

  const handleFileSelect = (category: DocumentCategory) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onUpload(file, category);
      }
    };
    input.click();
  };

  const getUploadStatus = (category: string) => {
    return uploads.find(u => u.category === category);
  };

  return (
    <div className="space-y-4">
      {requiredDocs.map((doc) => {
        const status = getUploadStatus(doc.category);
        const isComplete = status?.status === 'uploaded';
        const isUploading = status?.status === 'uploading';
        const hasError = status?.status === 'error';

        return (
          <Card key={doc.category} className="border-l-4 border-l-teal-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    isComplete ? 'bg-green-100 text-green-600' :
                    isUploading ? 'bg-blue-100 text-blue-600' :
                    hasError ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isComplete ? <CheckCircle className="w-5 h-5" /> :
                     isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> :
                     hasError ? <AlertCircle className="w-5 h-5" /> :
                     <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-medium">{doc.label}</h4>
                    {status?.fileName && (
                      <p className="text-sm text-gray-500">{status.fileName}</p>
                    )}
                    {doc.required && (
                      <span className="text-xs text-teal-600 font-medium">Required</span>
                    )}
                  </div>
                </div>
                
                <Button
                  variant={isComplete ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleFileSelect(doc.category as DocumentCategory)}
                  disabled={isUploading}
                >
                  {isComplete ? 'Replace' : 'Upload'}
                </Button>
              </div>
              
              {hasError && (
                <Alert className="mt-2" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Upload failed. Please try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export const Step5Documents: React.FC = () => {
  const [, navigate] = useLocation();
  const { formData, applicationId } = useFormData();
  const [uploads, setUploads] = useState<DocStatus[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadDoc = useUploadDocument(applicationId || '');
  const finalize = useFinalizeApplication(applicationId || '');

  const requiredDocs = getRequiredDocuments(
    formData.step3BusinessDetails?.businessStructure,
    formData.step1FinancialProfile?.lookingFor
  );

  // Calculate completion progress
  const allUploaded = requiredDocs.every(req =>
    uploads.some(u => u.category === req.category && u.status === 'uploaded')
  );
  
  const completedUploads = uploads.filter(u => u.status === 'uploaded').length;
  const progressPercentage = (completedUploads / requiredDocs.length) * 100;

  useEffect(() => {
    setUploadProgress(progressPercentage);
  }, [progressPercentage]);

  const handleUpload = (file: File, category: DocumentCategory) => {
    // Update UI immediately
    setUploads(prev => [
      ...prev.filter(u => u.category !== category),
      { 
        category, 
        fileName: file.name, 
        status: 'uploading' 
      }
    ]);

    // Prepare FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    uploadDoc.mutate(formData, {
      onSuccess: (response) => {
        setUploads(prev => prev.map(u => 
          u.category === category 
            ? { 
                ...u, 
                status: 'uploaded', 
                uploadedAt: new Date().toISOString(),
                fileId: response.fileId 
              }
            : u
        ));
      },
      onError: () => {
        setUploads(prev => prev.map(u => 
          u.category === category ? { ...u, status: 'error' } : u
        ));
      }
    });
  };

  const handleContinueToSign = () => {
    if (!applicationId) {
      console.error('No application ID available');
      return;
    }

    finalize.mutate(undefined, {
      onSuccess: (response) => {
        // Navigate to signing page with SignNow URL
        navigate(`/sign/${applicationId}`, { 
          state: { signUrl: response.signUrl } 
        });
      },
      onError: (error) => {
        console.error('Finalization failed:', error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Required Documents
        </h2>
        <p className="text-gray-600">
          Please upload all required documents to complete your application
        </p>
      </div>

      {/* Progress indicator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Upload Progress
            <span className="text-sm font-normal text-gray-500">
              {completedUploads} of {requiredDocs.length} documents
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={uploadProgress} className="w-full" />
        </CardContent>
      </Card>

      {/* Document upload interface */}
      <DocumentUploader
        onUpload={handleUpload}
        uploads={uploads}
        isUploading={uploadDoc.isPending}
      />

      {/* File upload guidelines */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Upload Guidelines:</strong> Files must be in PDF, JPG, PNG, DOC, or DOCX format. 
          Maximum file size: 10MB per document. Ensure all text is clearly readable.
        </AlertDescription>
      </Alert>

      {/* Continue button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          disabled={!allUploaded || finalize.isPending}
          onClick={handleContinueToSign}
          className="px-8"
        >
          {finalize.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparing documents...
            </>
          ) : (
            <>
              Continue to Sign
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Error handling */}
      {finalize.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to prepare documents for signing. Please try again or contact support.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};