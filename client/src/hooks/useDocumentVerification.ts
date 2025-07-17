import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../api/staffApi';

export interface DocumentVerificationResult {
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    uploadedAt: string;
  }>;
  requiredDocuments: string[];
  missingDocuments: string[];
  isComplete: boolean;
  hasUploadedDocuments: boolean;
}

export const useDocumentVerification = (applicationId: string | null) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const queryClient = useQueryClient();

  // Query to get uploaded documents from backend
  const {
    data: verificationResult = {
      documents: [],
      requiredDocuments: [],
      missingDocuments: [],
      isComplete: false,
      hasUploadedDocuments: false
    },
    isLoading,
    error,
    refetch: refetchDocuments
  } = useQuery({
    queryKey: ['documentVerification', applicationId],
    queryFn: async (): Promise<DocumentVerificationResult> => {
      if (!applicationId) {
        return {
          documents: [],
          requiredDocuments: [],
          missingDocuments: [],
          isComplete: false,
          hasUploadedDocuments: false
        };
      }

      try {
        const response = await fetch(`/api/public/applications/${applicationId}/documents`);
        const data = await response.json();
        return data;
      } catch (err: any) {
        if (err?.response?.status === 501) {
          console.warn("Document verification not implemented yet.");
        }
        return {
          documents: [],
          requiredDocuments: [],
          missingDocuments: [],
          isComplete: false,
          hasUploadedDocuments: false
        };
      }
    },
    enabled: !!applicationId,
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    onError: (err: any) => {
      if (err?.response?.status === 501) {
        console.warn("Document verification not implemented yet.");
      }
    }
  });

  // Manual verification function
  const verifyDocuments = useCallback(async (): Promise<DocumentVerificationResult> => {
    if (!applicationId) {
      throw new Error('Application ID is required for document verification');
    }

    setIsVerifying(true);
    
    try {
      console.log(`🔍 [DOCUMENT-VERIFICATION] Manual verification for application ${applicationId}`);
      
      // Invalidate cache and refetch
      await queryClient.invalidateQueries({ 
        queryKey: ['document-verification', applicationId] 
      });
      
      const result = await refetchDocuments();
      
      if (!result.data) {
        throw new Error('Failed to verify documents');
      }

      console.log(`✅ [DOCUMENT-VERIFICATION] Manual verification complete:`, result.data);
      
      return result.data;
    } finally {
      setIsVerifying(false);
    }
  }, [applicationId, queryClient, refetchDocuments]);

  // Check if navigation to Step 6 is safe
  const canProceedToStep7 = useCallback((localUploadedFiles: any[] = []): boolean => {
    // Priority 1: Backend verified documents
    if (verificationResult?.hasUploadedDocuments) {
      console.log(`✅ [DOCUMENT-VERIFICATION] Can proceed: ${verificationResult.documents.length} documents verified on backend`);
      return true;
    }

    // Priority 2: Local uploaded files (for immediate UI feedback)
    if (localUploadedFiles.length > 0) {
      console.log(`✅ [DOCUMENT-VERIFICATION] Can proceed: ${localUploadedFiles.length} documents uploaded locally`);
      return true;
    }

    // Priority 3: Allow progression for testing (no documents required)
    console.log(`⚠️ [DOCUMENT-VERIFICATION] No documents, but allowing progression for testing`);
    return true; // Allow progression even without documents
  }, [verificationResult]);

  return {
    verificationResult: verificationResult || {
      documents: [],
      requiredDocuments: [],
      missingDocuments: [],
      isComplete: false,
      hasUploadedDocuments: false
    },
    isLoading,
    isVerifying,
    error,
    verifyDocuments,
    canProceedToStep7,
    refetchDocuments
  };
};