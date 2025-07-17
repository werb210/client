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

  // NEW WORKFLOW: Store files locally for Step 7 submission
  const storeFileLocally = (file: File, fileId: string) => {
    // Update progress
    setUploadingFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, progress: 50 } : f)
    );

    // Convert file to base64 for local storage
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      
      // Store in localStorage for Step 7 submission
      const storedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
      const newFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        documentType: 'general',
        base64: base64,
        status: 'completed' as const
      };
      
      storedFiles.push(newFile);
      localStorage.setItem('uploadedFiles', JSON.stringify(storedFiles));
      
      // Update progress to completed
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'completed' } : f)
      );
      
      toast({
        title: "Document prepared",
        description: `${file.name} is ready for submission.`,
      });

      // Remove completed upload after 2 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
      }, 2000);
    };
    
    reader.onerror = () => {
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'error', 
          error: 'Failed to prepare file' 
        } : f)
      );
      
    };
    
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      // Validate file size (25MB limit)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 25MB size limit.`,
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

      // NEW WORKFLOW: Store file locally for Step 7 submission
      storeFileLocally(file, fileId);
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
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
              PDF, DOC, DOCX, JPG, PNG up to 25MB each
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
