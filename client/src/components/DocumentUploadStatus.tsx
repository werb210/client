import React from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import type { DocumentVerificationResult } from '../hooks/useDocumentVerification';

interface DocumentUploadStatusProps {
  verificationResult: DocumentVerificationResult;
  localUploadedFiles: any[];
  isLoading: boolean;
}

export const DocumentUploadStatus: React.FC<DocumentUploadStatusProps> = ({
  verificationResult,
  localUploadedFiles,
  isLoading
}) => {
  const { documents, requiredDocuments, missingDocuments, hasUploadedDocuments } = verificationResult;
  
  // Combine backend and local documents for display
  const allDocuments = [
    ...documents.map(doc => ({
      name: doc.fileName,
      type: doc.documentType,
      status: 'verified' as const,
      source: 'backend' as const
    })),
    ...localUploadedFiles
      .filter(local => !documents.some(backend => backend.fileName === local.name))
      .map(local => ({
        name: local.name,
        type: local.documentType || local.category,
        status: local.status || 'uploaded' as const,
        source: 'local' as const
      }))
  ];

  const getStatusIcon = (status: string, source: string) => {
    if (source === 'backend' || status === 'verified' || status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (status === 'uploading') {
      return <Clock className="w-4 h-4 text-blue-600" />;
    }
    if (status === 'error' || status === 'failed') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return <FileText className="w-4 h-4 text-gray-600" />;
  };

  const getStatusBadge = (status: string, source: string) => {
    if (source === 'backend' || status === 'verified') {
      return <Badge variant="default" className="bg-green-600">Verified</Badge>;
    }
    if (status === 'completed') {
      return <Badge variant="default" className="bg-blue-600">Uploaded</Badge>;
    }
    if (status === 'uploading') {
      return <Badge variant="outline">Uploading</Badge>;
    }
    if (status === 'error' || status === 'failed') {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="outline">Processing</Badge>;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Document Upload Status</h3>
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Verifying...</span>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>{documents.length} Verified</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>{localUploadedFiles.length} Local</span>
            </Badge>
            {hasUploadedDocuments && (
              <Badge variant="default" className="flex items-center space-x-1 bg-green-600">
                <CheckCircle className="w-3 h-3" />
                <span>Ready</span>
              </Badge>
            )}
          </div>

          {/* Document List */}
          {allDocuments.length > 0 ? (
            <div className="space-y-2">
              {allDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(doc.status, doc.source)}
                    <div>
                      <div className="font-medium text-sm">{doc.name}</div>
                      <div className="text-xs text-gray-500">{doc.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(doc.status, doc.source)}
                    {doc.source === 'backend' && (
                      <Badge variant="outline" className="text-xs">Backend Verified</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No documents uploaded yet</div>
            </div>
          )}

          {/* Missing Documents */}
          {missingDocuments.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800">Missing Documents</span>
              </div>
              <ul className="text-sm text-orange-700 space-y-1">
                {missingDocuments.map((doc, index) => (
                  <li key={index}>• {doc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};