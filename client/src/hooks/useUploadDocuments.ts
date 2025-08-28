/**
 * Hook for document uploads with progress tracking
 */
import { useState, useCallback } from 'react';
import { uploadDocument, type DocumentUploadResponse } from '@/services/applicationService';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export function useUploadDocuments() {
  const [uploads, setUploads] = useState<Record<string, UploadProgress>>({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(async (
    applicationId: string,
    file: File,
    documentType: string
  ): Promise<DocumentUploadResponse> => {
    const fileKey = `${file.name}-${Date.now()}`;
    
    // Initialize upload progress
    setUploads(prev => ({
      ...prev,
      [fileKey]: {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }
    }));

    setIsUploading(true);

    try {
      console.log('📤 [UPLOAD_HOOK] Starting upload:', {
        applicationId,
        fileName: file.name,
        documentType,
        size: file.size
      });

      // Simulate progress for better UX
      setUploads(prev => ({
        ...prev,
        [fileKey]: { ...prev[fileKey], progress: 25 }
      }));

      const result = await uploadDocument(applicationId, file, documentType);

      // Complete progress
      setUploads(prev => ({
        ...prev,
        [fileKey]: {
          ...prev[fileKey],
          progress: 100,
          status: 'completed'
        }
      }));

      console.log('✅ [UPLOAD_HOOK] Upload completed:', result.documentId);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploads(prev => ({
        ...prev,
        [fileKey]: {
          ...prev[fileKey],
          status: 'error',
          error: errorMessage
        }
      }));

      console.error('❌ [UPLOAD_HOOK] Upload failed:', errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (
    applicationId: string,
    files: Array<{ file: File; documentType: string }>
  ): Promise<DocumentUploadResponse[]> => {
    console.log(`📤 [UPLOAD_HOOK] Uploading ${files.length} files...`);
    
    const results = [];
    for (const { file, documentType } of files) {
      try {
        const result = await uploadFile(applicationId, file, documentType);
        results.push(result);
      } catch (error) {
        console.warn(`⚠️ [UPLOAD_HOOK] Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }
    
    console.log(`✅ [UPLOAD_HOOK] Completed ${results.length}/${files.length} uploads`);
    return results;
  }, [uploadFile]);

  const clearUploads = useCallback(() => {
    setUploads({});
  }, []);

  const getUploadProgress = useCallback((fileName: string) => {
    return Object.values(uploads).find(upload => upload.fileName === fileName);
  }, [uploads]);

  return {
    uploadFile,
    uploadMultipleFiles,
    uploads,
    isUploading,
    clearUploads,
    getUploadProgress,
    completedUploads: Object.values(uploads).filter(u => u.status === 'completed').length,
    failedUploads: Object.values(uploads).filter(u => u.status === 'error').length,
    totalUploads: Object.keys(uploads).length
  };
}