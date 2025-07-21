/**
 * Document Preview Component - S3 Integration
 * Migrated from local filesystem to S3 pre-signed URLs
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { getS3DocumentUrl } from '../lib/s3Upload';

interface DocumentPreviewProps {
  applicationId: string;
  documentId: string;
  fileName: string;
  fileSize?: number;
  documentType: string;
  uploadedAt?: string;
  className?: string;
}

export function DocumentPreview({
  applicationId,
  documentId,
  fileName,
  fileSize,
  documentType,
  uploadedAt,
  className
}: DocumentPreviewProps) {
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingDownload, setIsLoadingDownload] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUploadDate = (dateString?: string) => {
    if (!dateString) return 'Recently uploaded';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Recently uploaded';
    }
  };

  const handlePreview = async () => {
    setIsLoadingPreview(true);
    setPreviewError(null);

    try {
      console.log('📖 [S3] Requesting preview URL for document:', documentId);

      const result = await getS3DocumentUrl(applicationId, documentId, 'view');

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Failed to get preview URL');
      }

      console.log('✅ [S3] Preview URL received, opening in new tab');

      // Open in new tab for preview
      window.open(result.url, '_blank');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Preview failed';
      console.error('❌ [S3] Preview failed:', errorMessage);
      
      setPreviewError(errorMessage);
      
      toast({
        title: "Preview unavailable",
        description: "Document preview temporarily unavailable. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownload = async () => {
    setIsLoadingDownload(true);

    try {
      console.log('📥 [S3] Requesting download URL for document:', documentId);

      const result = await getS3DocumentUrl(applicationId, documentId, 'download');

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Failed to get download URL');
      }

      console.log('✅ [S3] Download URL received, starting download');

      // Create temporary anchor for download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: `${fileName} download started`,
        variant: "default"
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      console.error('❌ [S3] Download failed:', errorMessage);
      
      toast({
        title: "Download unavailable",
        description: "Document download temporarily unavailable. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDownload(false);
    }
  };

  const getFileIcon = () => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Card className={`border-l-4 border-l-green-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getFileIcon()}
            {fileName}
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            ✅ Uploaded
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* File metadata */}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Size:</span> {formatFileSize(fileSize)}
            </div>
            <div>
              <span className="font-medium">Type:</span> {documentType}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Uploaded:</span> {formatUploadDate(uploadedAt)}
            </div>
          </div>

          {/* Error state */}
          {previewError && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              <span>Preview temporarily unavailable</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={isLoadingPreview}
              className="flex-1"
            >
              {isLoadingPreview ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Eye className="h-4 w-4 mr-1" />
              )}
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isLoadingDownload}
              className="flex-1"
            >
              {isLoadingDownload ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Download
            </Button>
          </div>

          {/* S3 status indicator */}
          <div className="text-xs text-gray-500 text-center">
            Stored securely in cloud storage
          </div>
        </div>
      </CardContent>
    </Card>
  );
}