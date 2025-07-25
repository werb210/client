/**
 * Uploaded Document List Component
 * Displays uploaded documents with preview and download functionality via S3
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { previewDocument, downloadDocument } from '@/utils/uploadDocument';

export interface DocumentItem {
  id: string;
  documentId: string;
  fileName: string;
  fileSize: number;
  documentType: string;
  storage_key?: string;
  uploadedAt: string;
  status: 'uploading' | 'completed' | 'error' | 'processing' | 'fallback';
  fallback?: boolean;
}

interface UploadedDocumentListProps {
  documents: DocumentItem[];
  onRemoveDocument?: (documentId: string) => void;
  showActions?: boolean;
}

export function UploadedDocumentList({ 
  documents, 
  onRemoveDocument,
  showActions = true 
}: UploadedDocumentListProps) {
  const { toast } = useToast();

  const handlePreview = async (doc: DocumentItem) => {
    try {
      console.log(`👁️ [PREVIEW] Opening preview for: ${doc.fileName} (ID: ${doc.documentId})`);
      await previewDocument(doc.documentId);
      
      toast({
        title: "Preview Opened",
        description: `${doc.fileName} opened in new tab`,
      });
    } catch (error) {
      console.error(`❌ [PREVIEW] Failed to preview ${doc.fileName}:`, error);
      toast({
        title: "Preview Failed",
        description: "Could not open document preview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (doc: DocumentItem) => {
    try {
      console.log(`💾 [DOWNLOAD] Downloading: ${doc.fileName} (ID: ${doc.documentId})`);
      await downloadDocument(doc.documentId, doc.fileName);
      
      toast({
        title: "Download Started",
        description: `${doc.fileName} download initiated`,
      });
    } catch (error) {
      console.error(`❌ [DOWNLOAD] Failed to download ${doc.fileName}:`, error);
      toast({
        title: "Download Failed", 
        description: "Could not download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = (doc: DocumentItem) => {
    if (onRemoveDocument) {
      console.log(`🗑️ [REMOVE] Removing document: ${doc.fileName} (ID: ${doc.documentId})`);
      onRemoveDocument(doc.documentId);
      
      toast({
        title: "Document Removed",
        description: `${doc.fileName} has been removed`,
      });
    }
  };

  const getStatusIcon = (status: string, fallback?: boolean) => {
    // Treat fallback as completed - no visual difference
    if (fallback || status === 'fallback') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'uploading':
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string, fallback?: boolean) => {
    // Treat fallback as completed - no visual difference
    if (fallback || status === 'fallback') {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'uploading':
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string, fallback?: boolean) => {
    // Treat fallback as completed - no visual difference
    if (fallback || status === 'fallback') {
      return 'Completed';
    }
    
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'uploading':
        return 'Uploading';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No documents uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Uploaded Documents ({documents.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3 flex-1">
              {getStatusIcon(doc.status, doc.fallback)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.fileName}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(doc.fileSize)}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {doc.documentType}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(doc.status, doc.fallback)}`}
                  >
                    {getStatusText(doc.status, doc.fallback)}
                  </Badge>
                  {doc.storage_key && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      S3 Stored
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {showActions && doc.status === 'completed' && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(doc)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                {onRemoveDocument && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(doc)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Total: {documents.length} document{documents.length !== 1 ? 's' : ''}
            </span>
            <span>
              With S3 storage: {documents.filter(d => d.storage_key).length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}