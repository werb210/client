import { useState, useCallback } from 'react';
import { logger } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';

import { Progress } from '@/components/ui/progress';

import { Card, CardContent } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';

import Upload from 'lucide-react/dist/esm/icons/upload';
import File from 'lucide-react/dist/esm/icons/file';
import X from 'lucide-react/dist/esm/icons/x';
import Check from 'lucide-react/dist/esm/icons/check';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';

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
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export function DocumentUpload({ applicationId, onDocumentsChange, className }: DocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, fileId }: { file: File; fileId: string }) => {
      // Update progress
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 50 } : f)
      );

      // Upload actual file using public endpoint (no Authorization required)
      const result = await api.uploadDocumentPublic(applicationId.toString(), file, 'general').catch(error => {
        logger.error('[DOCUMENT_UPLOAD] Upload failed:', error);
        throw error;
      });
      return { ...result, fileId };
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
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'error', 
          error: error.message 
        } : f)
      );
      
      // Handle network and server errors gracefully
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast({
          title: "Connection Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      // Validate file size (10MB limit as required by staff backend)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB size limit.`,
          variant: "destructive",
        });
        return;
      }

      const fileId = crypto.randomUUID();
      
      // Add to uploading files
      setUploadingFiles(prev => [...prev, {
        id: fileId,
        file,
        progress: 0,
        status: 'uploading',
      }]);

      // Start upload
      uploadMutation.mutate({ file, fileId });
    });
  }, [applicationId, toast, uploadMutation]);

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

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
            <Upload className="text-gray-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-600 font-medium">
              {isDragActive ? 'Drop files here' : 'Drop files here or click to upload'}
            </p>
            <p className="text-sm text-gray-500">
              PDF, DOC, DOCX, JPG, PNG, TIFF up to 10MB each
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadingFiles.map((uploadingFile) => (
            <Card key={uploadingFile.id} className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <File className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {uploadingFile.file.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {uploadingFile.status === 'completed' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUploadingFile(uploadingFile.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {uploadingFile.status === 'uploading' && (
                  <Progress value={uploadingFile.progress} className="h-2" />
                )}
                
                {uploadingFile.status === 'error' && uploadingFile.error && (
                  <p className="text-sm text-red-600 mt-1">{uploadingFile.error}</p>
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
