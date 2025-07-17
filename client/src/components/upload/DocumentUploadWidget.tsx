import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  documentId?: string;
}

interface DocumentUploadWidgetProps {
  applicationId: string;
  documentType: string;
  category: string;
  onUploadSuccess?: (file: File, documentId: string) => void;
  onUploadError?: (file: File, error: string) => void;
  disabled?: boolean;
  maxFiles?: number;
  className?: string;
}

export function DocumentUploadWidget({
  applicationId,
  documentType,
  category,
  onUploadSuccess,
  onUploadError,
  disabled = false,
  maxFiles = 10,
  className
}: DocumentUploadWidgetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File, fileId: string) => {
    const isDev = import.meta.env.MODE === 'development';
    
    try {
      // Update progress to show upload started
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 10 } : f)
      );

      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      // Use the correct endpoint as specified
      const endpoint = `/api/public/applications/${applicationId}/documents`;
      
      if (isDev) {
        console.log('📤 [DocumentUploadWidget] Uploading:', {
          fileName: file.name,
          documentType,
          applicationId,
          endpoint
        });
      }

      // Update progress to show network request started
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 30 } : f)
      );

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      // Update progress to show response received
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 70 } : f)
      );

      if (isDev) {
        console.log('📥 [DocumentUploadWidget] Response:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });
      }

      // Check for actual success: response.ok === true && response.json().success === true
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Upload failed - invalid response from server');
      }

      // Update progress to completion
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          progress: 100, 
          status: 'completed',
          documentId: result.documentId 
        } : f)
      );

      if (isDev && result.documentId) {
        console.log('✅ [DocumentUploadWidget] Success - Document ID:', result.documentId);
      }

      // Success toast
      toast({
        title: "Upload successful",
        description: `${file.name} uploaded successfully`,
        variant: "default"
      });

      // Call success callback
      onUploadSuccess?.(file, result.documentId);

      // Remove completed upload after 3 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Update file status to error
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'error',
          error: errorMessage
        } : f)
      );

      // Show red toast for network issues or file too large
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('network')) {
        toast({
          title: "Upload failed",
          description: "Upload failed. Network issue or file too large. Try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive"
        });
      }

      // Call error callback
      onUploadError?.(file, errorMessage);

      if (isDev) {
        console.error('❌ [DocumentUploadWidget] Upload failed:', errorMessage);
      }
    }
  }, [applicationId, documentType, onUploadSuccess, onUploadError, toast]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || isUploading) return;

    // Validate file size (5MB limit as per test requirements)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 5MB size limit.`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Check max files limit
    const currentFileCount = uploadingFiles.filter(f => f.status !== 'error').length;
    const filesToUpload = validFiles.slice(0, maxFiles - currentFileCount);

    if (filesToUpload.length < validFiles.length) {
      toast({
        title: "Too many files",
        description: `Only uploading first ${filesToUpload.length} files (limit: ${maxFiles})`,
        variant: "default"
      });
    }

    setIsUploading(true);

    // Add files to uploading state
    const newUploadingFiles = filesToUpload.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files sequentially to avoid overwhelming the server
    for (const uploadingFile of newUploadingFiles) {
      await uploadFile(uploadingFile.file, uploadingFile.id);
    }

    setIsUploading(false);
  }, [disabled, isUploading, uploadingFiles, maxFiles, uploadFile, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: true,
    disabled: disabled || isUploading
  });

  const removeFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryUpload = (fileId: string) => {
    const file = uploadingFiles.find(f => f.id === fileId);
    if (file && file.status === 'error') {
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'uploading', 
          progress: 0, 
          error: undefined 
        } : f)
      );
      uploadFile(file.file, fileId);
    }
  };

  const hasErrors = uploadingFiles.some(f => f.status === 'error');

  return (
    <div className={className}>
      <Card className={cn(
        "transition-all duration-200",
        isDragActive && "border-blue-500 bg-blue-50",
        hasErrors && "border-red-500 bg-red-50",
        (disabled || isUploading) && "opacity-60 cursor-not-allowed"
      )}>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
              hasErrors && "border-red-300 bg-red-50",
              (disabled || isUploading) && "cursor-not-allowed pointer-events-none"
            )}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              {isUploading ? (
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              ) : (
                <Upload className={cn(
                  "h-12 w-12",
                  hasErrors ? "text-red-500" : "text-gray-400"
                )} />
              )}
              
              <div>
                <p className="text-lg font-medium">
                  {isUploading 
                    ? "Uploading files..." 
                    : isDragActive 
                      ? "Drop files here" 
                      : "Drag & drop files or click to browse"
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF, DOC, DOCX, JPG, PNG files up to 5MB
                </p>
                {category && (
                  <Badge variant="outline" className="mt-2">
                    {category}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadingFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-sm">Upload Progress</h4>
              
              {uploadingFiles.map((uploadingFile) => (
                <div key={uploadingFile.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {uploadingFile.status === 'uploading' && (
                      <Progress value={uploadingFile.progress} className="mt-2 h-2" />
                    )}
                    
                    {uploadingFile.status === 'error' && uploadingFile.error && (
                      <p className="text-xs text-red-600 mt-1">{uploadingFile.error}</p>
                    )}

                    {uploadingFile.status === 'completed' && uploadingFile.documentId && 
                     import.meta.env.MODE === 'development' && (
                      <p className="text-xs text-green-600 mt-1">
                        Document ID: {uploadingFile.documentId}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {uploadingFile.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    )}
                    
                    {uploadingFile.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryUpload(uploadingFile.id)}
                          className="text-xs"
                        >
                          Retry
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadingFile.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentUploadWidget;