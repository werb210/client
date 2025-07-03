import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { ApplicationForm, FinalizeResponse, DocStatus } from '@/types/ApplicationForm';

/**
 * React Query hooks for Steps 3-6 workflow
 * Handles application updates, document uploads, and SignNow finalization
 */

// Update application data (Steps 3 & 4 incremental saves)
export const usePatchApplication = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: Partial<ApplicationForm>) =>
      apiFetch(`/api/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      // Invalidate application queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
    }
  });
};

// Upload documents (Step 5)
export const useUploadDocument = (applicationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { files: File[]; category: string }) => {
      const form = new FormData();
      
      // Add files using the exact structure specified
      payload.files.forEach((file) => form.append('files', file));
      form.append('category', payload.category);
      
      const response = await fetch(`/api/upload/${applicationId}`, {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate document queries
      queryClient.invalidateQueries({ queryKey: ['documents', applicationId] });
    }
  });
};

// Finalize application and get SignNow URL (Step 5 → Step 6)
export const useFinalizeApplication = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<FinalizeResponse, Error, void>({
    mutationFn: async () => {
      const response = await apiFetch(`/api/applications/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to finalize application: ${response.statusText}`);
      }
      
      return await response.json() as FinalizeResponse;
    },
    onSuccess: (data) => {
      // Update application status optimistically
      queryClient.setQueryData(['applications', id], (old: any) => ({
        ...old,
        status: data.status,
        signUrl: data.signUrl
      }));
    }
  });
};

// Get document upload status for Step 5 validation
export const useDocumentStatus = (applicationId: string) => {
  return useMutation({
    mutationFn: () =>
      apiFetch(`/api/applications/${applicationId}/documents`),
  });
};

// Auto-save hook for incremental form updates
export const useAutoSaveApplication = (applicationId: string) => {
  const patchMutation = usePatchApplication(applicationId);
  
  const autoSave = (formData: Partial<ApplicationForm>, delay: number = 2000) => {
    // Debounced auto-save to prevent excessive API calls
    setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        patchMutation.mutate(formData);
      }
    }, delay);
  };
  
  return {
    autoSave,
    isSaving: patchMutation.isPending,
    saveError: patchMutation.error,
    lastSaved: patchMutation.isSuccess
  };
};

// Document categories helper
export const getRequiredDocuments = (businessType?: string, loanType?: string) => {
  // Base required documents for all applications
  const baseDocuments = [
    { category: 'bank_statements', label: 'Bank Statements (Last 3 months)', required: true },
    { category: 'tax_returns', label: 'Business Tax Returns (Last 2 years)', required: true },
    { category: 'financial_statements', label: 'Financial Statements', required: true },
    { category: 'business_license', label: 'Business License', required: true },
    { category: 'voided_check', label: 'Voided Business Check', required: true }
  ];
  
  // Additional documents based on business structure
  if (businessType === 'corporation' || businessType === 'llc') {
    baseDocuments.push({
      category: 'articles_of_incorporation',
      label: 'Articles of Incorporation/Organization',
      required: true
    });
  }
  
  return baseDocuments;
};