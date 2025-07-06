import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentUpload } from '@/components/DocumentUpload';
import { useApplication } from '@/context/ApplicationContext';
import { Document } from '@shared/schema';
import { File, Trash2 } from '@/lib/icons';

interface DocumentStepProps {
  onNext: () => void;
  onBack: () => void;
  applicationId?: number;
}

const requiredDocuments = [
  {
    name: 'Business Financial Statements',
    description: 'Last 2 years of profit & loss statements',
    required: true,
  },
  {
    name: 'Bank Statements',
    description: 'Last 3 months of business bank statements',
    required: true,
  },
  {
    name: 'Tax Returns',
    description: 'Business tax returns for last 2 years',
    required: true,
  },
  {
    name: 'Business License',
    description: 'Copy of current business license',
    required: false,
  },
  {
    name: 'Articles of Incorporation',
    description: 'Business formation documents',
    required: false,
  },
];

export function DocumentStep({ onNext, onBack, applicationId }: DocumentStepProps) {
  const { state } = useApplication();
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);

  const { data: documents, refetch } = useQuery<Document[]>({
    queryKey: [`/api/applications/${applicationId}/documents`],
    enabled: !!applicationId,
  });

  useEffect(() => {
    if (documents) {
      setUploadedDocuments(documents);
    }
  }, [documents]);

  const handleDocumentsChange = (newDocuments: Document[]) => {
    setUploadedDocuments(newDocuments);
    refetch();
  };

  const getDocumentStatus = (docType: string) => {
    return uploadedDocuments.some(doc => 
      doc.fileName.toLowerCase().includes(docType.toLowerCase().split(' ')[0])
    );
  };

  const requiredDocumentsUploaded = requiredDocuments
    .filter(doc => doc.required)
    .every(doc => getDocumentStatus(doc.name));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <p className="text-sm text-gray-600">
            Please upload the following documents to complete your application. 
            Required documents are marked with an asterisk (*).
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {requiredDocuments.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <File className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {doc.name}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                  </h4>
                  <p className="text-sm text-gray-500">{doc.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getDocumentStatus(doc.name) ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Uploaded</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Not uploaded</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {applicationId && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
          </CardHeader>
          
          <CardContent>
            <DocumentUpload
              applicationId={applicationId}
              onDocumentsChange={handleDocumentsChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Uploaded Documents List */}
      {uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <File className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.fileName}</h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(doc.fileSize)} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!requiredDocumentsUploaded}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Continue to Signature
        </Button>
      </div>

      {!requiredDocumentsUploaded && (
        <p className="text-sm text-red-600 text-center">
          Please upload all required documents to continue.
        </p>
      )}
    </div>
  );
}
