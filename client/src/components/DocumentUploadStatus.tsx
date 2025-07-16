import React from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import type { DocumentVerificationResult } from '../hooks/useDocumentVerification';

interface DocumentUploadStatusProps {
  verificationResult: DocumentVerificationResult;
  localUploadedFiles: any[];
  isLoading: boolean;
  onRetryUpload?: (documentType: string) => void;
  onRefreshStatus?: () => void;
}

export const DocumentUploadStatus: React.FC<DocumentUploadStatusProps> = ({
  verificationResult,
  localUploadedFiles,
  isLoading,
  onRetryUpload,
  onRefreshStatus
}) => {
  const { documents, requiredDocuments, missingDocuments, hasUploadedDocuments } = verificationResult;
  
  // Create comprehensive status for each required document type
  const getDocumentStatus = (requiredType: string) => {
    // Check if this type is uploaded in backend
    const backendDoc = documents.find(doc => 
      doc.documentType === requiredType || 
      doc.documentType.toLowerCase().replace(/\s+/g, '_') === requiredType.toLowerCase().replace(/\s+/g, '_')
    );
    
    if (backendDoc) {
      return {
        type: requiredType,
        status: 'verified' as const,
        document: backendDoc,
        source: 'backend' as const
      };
    }

    // Check if this type is uploaded locally
    const localDoc = localUploadedFiles.find(local => 
      local.category === requiredType ||
      local.documentType === requiredType ||
      local.category?.toLowerCase().replace(/\s+/g, '_') === requiredType.toLowerCase().replace(/\s+/g, '_')
    );
    
    if (localDoc) {
      return {
        type: requiredType,
        status: 'uploaded' as const,
        document: localDoc,
        source: 'local' as const
      };
    }

    // Missing document
    return {
      type: requiredType,
      status: 'missing' as const,
      document: null,
      source: null
    };
  };

  const documentStatuses = requiredDocuments.map(getDocumentStatus);
  
  // Additional uploaded documents not in requirements
  const additionalDocuments = [
    ...documents.filter(doc => !requiredDocuments.some(req => 
      req.toLowerCase().replace(/\s+/g, '_') === doc.documentType.toLowerCase().replace(/\s+/g, '_')
    )),
    ...localUploadedFiles.filter(local => 
      !requiredDocuments.some(req => 
        req === local.category || 
        req === local.documentType ||
        req.toLowerCase().replace(/\s+/g, '_') === (local.category || local.documentType)?.toLowerCase().replace(/\s+/g, '_')
      ) &&
      !documents.some(backend => backend.fileName === local.name)
    )
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
            <div className="flex items-center space-x-2">
              {isLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Verifying...</span>
                </div>
              )}
              {onRefreshStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshStatus}
                  disabled={isLoading}
                  className="text-xs h-6"
                >
                  Refresh
                </Button>
              )}
            </div>
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

          {/* Required Documents Status */}
          {requiredDocuments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Required Documents</h4>
              {documentStatuses.map((docStatus, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {docStatus.status === 'verified' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {docStatus.status === 'uploaded' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                    {docStatus.status === 'missing' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    <div>
                      <div className="font-medium text-sm">{docStatus.type}</div>
                      {docStatus.document && (
                        <div className="text-xs text-gray-500">
                          {docStatus.document.fileName || docStatus.document.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {docStatus.status === 'verified' && (
                      <Badge variant="default" className="bg-green-600">✅ Verified</Badge>
                    )}
                    {docStatus.status === 'uploaded' && (
                      <Badge variant="default" className="bg-blue-600">Uploaded</Badge>
                    )}
                    {docStatus.status === 'missing' && (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                    {docStatus.source === 'backend' && (
                      <Badge variant="outline" className="text-xs">Backend</Badge>
                    )}
                    {docStatus.status === 'missing' && onRetryUpload && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRetryUpload(docStatus.type)}
                        className="text-xs h-6"
                      >
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Additional Documents */}
          {additionalDocuments.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-medium text-sm text-gray-700">Additional Documents</h4>
              {additionalDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">{doc.fileName || doc.name}</div>
                      <div className="text-xs text-gray-500">{doc.documentType || doc.category}</div>
                    </div>
                  </div>
                  <Badge variant="outline">Extra</Badge>
                </div>
              ))}
            </div>
          )}

          {/* No Documents Message */}
          {requiredDocuments.length === 0 && additionalDocuments.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No document requirements found</div>
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