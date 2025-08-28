import { useState, useCallback } from 'react';
import { logger } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';

import { Progress } from '@/components/ui/progress';

import { Card, CardContent } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';

import { Upload, File, X, Check, AlertCircle, RefreshCw, Eye, Download, FileText, Image } from 'lucide-react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as api from '@/lib/api';



interface DocumentUploadProps {
  applicationId: number;
  onDocumentsChange: (documents: any[]) => void;
  className?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'validating';
  error?: string;
  retryCount?: number;
  preview?: string;
  validationErrors?: string[];
}

export function DocumentUpload({ applicationId, onDocumentsChange, className }: DocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, fileId }: { file: File; fileId: string }) => {
      // Update progress with timeout
      const timeoutId = setTimeout(() => {
        setUploadingFiles(prev => 
          prev.map(f => f.id === fileId ? { 
            ...f, 
            status: 'error',
            error: 'Upload timeout - please try again'
          } : f)
        );
        throw new Error('Upload timeout');
      }, 30000); // 30 second timeout

      try {
        // Progressive progress updates
        setUploadingFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, progress: 20 } : f)
        );

        // Upload actual file using document upload endpoint
        const result = await api.uploadDocument(applicationId.toString(), file, 'financials');
        
        clearTimeout(timeoutId);
        
        // Final progress update
        setUploadingFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, progress: 90 } : f)
        );
        
        return { ...result, fileId };
      } catch (error: any) {
        clearTimeout(timeoutId);
        logger.error('[DOCUMENT_UPLOAD] Upload failed:', error);
        throw error;
      }
    },
    onSuccess: (data, { fileId }) => {
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'completed' } : f)
      );
      
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/documents`] });
      
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });

      // Remove completed upload after 2 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
      }, 2000);
    },
    onError: (error, { fileId }) => {
      const currentFile = uploadingFiles.find(f => f.id === fileId);
      const retryCount = (currentFile?.retryCount || 0) + 1;
      const canRetry = retryCount < 3;
      
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'error', 
          error: error.message,
          retryCount
        } : f)
      );
      
      // Enhanced error handling with user-friendly messages
      let title = "Upload failed";
      let description = error.message;
      let showRetry = false;
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        title = "Connection Error";
        description = "Please check your internet connection and try again.";
        showRetry = canRetry;
      } else if (error.message.includes('413') || error.message.includes('too large')) {
        title = "File Too Large";
        description = "This file exceeds the maximum size limit. Please use a smaller file.";
      } else if (error.message.includes('415') || error.message.includes('unsupported')) {
        title = "File Type Not Supported";
        description = "This file type is not supported. Please use PDF, DOC, DOCX, JPG, PNG, or TIFF.";
      } else if (error.message.includes('400')) {
        title = "Invalid File";
        description = "The file appears to be corrupted or invalid. Please try a different file.";
      } else if (error.message.includes('401') || error.message.includes('403')) {
        title = "Authentication Error";
        description = "Please refresh the page and try again.";
      } else if (error.message.includes('500')) {
        title = "Server Error";
        description = "Our servers are experiencing issues. Please try again in a few moments.";
        showRetry = canRetry;
      } else {
        showRetry = canRetry;
      }
      
      toast({
        title,
        description: showRetry ? `${description} ${canRetry ? `(${3 - retryCount} retries left)` : ''}` : description,
        variant: "destructive",
      });
    },
  });

  // Enhanced file validation
  const validateFile = async (file: File): Promise<{ isValid: boolean; errors: string[]; preview?: string }> => {
    const errors: string[] = [];
    let preview: string | undefined;

    // File size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      errors.push(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds 10MB limit`);
    }

    // File name validation
    if (file.name.length > 255) {
      errors.push('File name is too long (max 255 characters)');
    }

    if (!/^[\w\-. ]+$/.test(file.name)) {
      errors.push('File name contains invalid characters');
    }

    // File type validation
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/tiff'
    ];

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported`);
    }

    // Content validation for images
    if (file.type.startsWith('image/')) {
      try {
        preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image'));
          reader.readAsDataURL(file);
        });

        // Validate image dimensions
        await new Promise<void>((resolve, reject) => {
          const img = new (window as any).Image();
          img.onload = () => {
            if (img.width < 100 || img.height < 100) {
              errors.push('Image resolution too low (minimum 100x100px)');
            }
            if (img.width > 10000 || img.height > 10000) {
              errors.push('Image resolution too high (maximum 10000x10000px)');
            }
            resolve(undefined);
          };
          img.onerror = () => reject(new Error('Invalid image file'));
          img.src = preview!;
        });
      } catch (error) {
        errors.push('Invalid or corrupted image file');
      }
    }

    // PDF validation
    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check PDF header
        const header = String.fromCharCode.apply(null, Array.from(uint8Array.slice(0, 5)) as any);
        if (header !== '%PDF-') {
          errors.push('Invalid PDF file format');
        }
      } catch (error) {
        errors.push('Failed to validate PDF file');
      }
    }

    return { isValid: errors.length === 0, errors, preview };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Check for duplicate files
    const existingFiles = uploadingFiles.map(f => f.file.name);
    const duplicates = acceptedFiles.filter(file => existingFiles.includes(file.name));
    
    if (duplicates.length > 0) {
      toast({
        title: "Duplicate files detected",
        description: `Files already uploading: ${duplicates.map(f => f.name).join(', ')}`,
        variant: "destructive",
      });
    }

    const newFiles = acceptedFiles.filter(file => !existingFiles.includes(file.name));

    for (const file of newFiles) {
      const fileId = crypto.randomUUID();
      
      // Add to uploading files with validation status
      setUploadingFiles(prev => [...prev, {
        id: fileId,
        file,
        progress: 0,
        status: 'validating',
        retryCount: 0
      }]);

      // Validate file
      const validation = await validateFile(file);
      
      if (!validation.isValid) {
        setUploadingFiles(prev => 
          prev.map(f => f.id === fileId ? { 
            ...f, 
            status: 'error', 
            validationErrors: validation.errors,
            error: `Validation failed: ${validation.errors.join(', ')}`
          } : f)
        );
        
        toast({
          title: "File validation failed",
          description: `${file.name}: ${validation.errors[0]}`,
          variant: "destructive",
        });
        continue;
      }

      // Update with preview and start upload
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'uploading',
          preview: validation.preview
        } : f)
      );

      // Start upload
      uploadMutation.mutate({ file, fileId });
    }
  }, [applicationId, toast, uploadMutation, uploadingFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif'],
    },
    multiple: true,
  });

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryUpload = (fileId: string) => {
    const file = uploadingFiles.find(f => f.id === fileId);
    if (!file) return;
    
    setUploadingFiles(prev => 
      prev.map(f => f.id === fileId ? { 
        ...f, 
        status: 'uploading',
        progress: 0,
        error: undefined
      } : f)
    );
    
    uploadMutation.mutate({ file: file.file, fileId });
  };

  const previewFile = (file: UploadingFile) => {
    if (file.preview) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>File Preview - ${file.file.name}</title></head>
            <body style="margin:0; background:#000; display:flex; align-items:center; justify-content:center;">
              <img src="${file.preview}" style="max-width:100%; max-height:100vh; object-fit:contain;" />
            </body>
          </html>
        `);
      }
    } else {
      toast({
        title: "Preview not available",
        description: "This file type cannot be previewed.",
      });
    }
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`group border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-teal-400 bg-teal-50 shadow-lg scale-[1.02]'
            : 'border-gray-300 hover:border-teal-300 hover:bg-teal-50/30 hover:shadow-md'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className={`w-16 h-16 rounded-xl mx-auto flex items-center justify-center transition-all duration-200 ${
            isDragActive 
              ? 'bg-teal-100 text-teal-600 scale-110' 
              : 'bg-gray-100 text-gray-400 group-hover:bg-teal-100 group-hover:text-teal-500'
          }`}>
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className={`text-lg font-medium transition-colors ${
              isDragActive ? 'text-teal-700' : 'text-gray-700 group-hover:text-teal-600'
            }`}>
              {isDragActive ? 'Drop files here!' : 'Drop files here or click to upload'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Support for PDF, DOC, DOCX, JPG, PNG, TIFF
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum 10MB per file • Multiple files supported
            </p>
          </div>
          
          {/* Upload tips */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-2 text-xs text-gray-600">
              <AlertCircle className="w-4 h-4 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium mb-1">Upload Tips:</p>
                <ul className="space-y-1">
                  <li>• Files are automatically validated for quality and format</li>
                  <li>• Images should be clear and readable (min 100x100px)</li>
                  <li>• PDFs must be valid and not corrupted</li>
                  <li>• Duplicate file names will be detected</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadingFiles.map((uploadingFile) => (
            <Card key={uploadingFile.id} className="p-4 transition-all hover:shadow-md">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {/* File type icon */}
                    {uploadingFile.file.type.startsWith('image/') ? (
                      <Image className="w-4 h-4 text-blue-500" />
                    ) : uploadingFile.file.type === 'application/pdf' ? (
                      <FileText className="w-4 h-4 text-red-500" />
                    ) : (
                      <File className="w-4 h-4 text-gray-500" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-700 truncate block">
                        {uploadingFile.file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(uploadingFile.file.size / 1024)}KB
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {uploadingFile.status === 'validating' && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Validating
                      </Badge>
                    )}
                    
                    {uploadingFile.status === 'uploading' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        {uploadingFile.progress}%
                      </Badge>
                    )}
                    
                    {uploadingFile.status === 'completed' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <div className="flex items-center space-x-1">
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Failed
                        </Badge>
                        {(uploadingFile.retryCount || 0) < 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryUpload(uploadingFile.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {/* Preview button for images */}
                    {uploadingFile.preview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => previewFile(uploadingFile)}
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUploadingFile(uploadingFile.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Progress bar with smooth animation */}
                {uploadingFile.status === 'uploading' && (
                  <div className="space-y-1">
                    <Progress value={uploadingFile.progress} className="h-2 transition-all duration-300" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Uploading...</span>
                      <span>{uploadingFile.progress}%</span>
                    </div>
                  </div>
                )}
                
                {/* Validation progress */}
                {uploadingFile.status === 'validating' && (
                  <div className="space-y-1">
                    <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full animate-pulse" style={{width: '60%'}} />
                    </div>
                    <span className="text-xs text-yellow-600">Validating file...</span>
                  </div>
                )}
                
                {/* Enhanced error display */}
                {uploadingFile.status === 'error' && (
                  <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                    <div className="text-sm text-red-800 font-medium mb-1">
                      {uploadingFile.error}
                    </div>
                    {uploadingFile.validationErrors && (
                      <ul className="text-xs text-red-600 space-y-1">
                        {uploadingFile.validationErrors.map((err, idx) => (
                          <li key={idx}>• {err}</li>
                        ))}
                      </ul>
                    )}
                    {(uploadingFile.retryCount || 0) >= 3 && (
                      <div className="text-xs text-red-500 mt-1 font-medium">
                        Maximum retry attempts reached. Please try a different file.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Offline Indicator */}
      {!navigator.onLine && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              Working offline - Documents will be uploaded when connection is restored
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
