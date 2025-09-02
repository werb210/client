/**
 * Hook for submitting applications with business criteria and CSRF handling
 */
import { useState } from 'react';
import { submitApplication as submitApp, type ApplicationState, type BusinessProfile, type DocumentInfo } from '@/lib/submitApplication';

export function useSubmitApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitApplication = async (
    state: ApplicationState, 
    profile: BusinessProfile, 
    documents: DocumentInfo[]
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🚀 [SUBMIT_HOOK] Submitting application with:', {
        state,
        profile,
        documents: documents.length
      });

      const result = await submitApp(state, profile, documents);
      
      console.log('✅ [SUBMIT_HOOK] Application submitted:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ [SUBMIT_HOOK] Error:', errorMessage);
      throw err; // Re-throw for caller to handle
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitApplication,
    isSubmitting,
    error,
    clearError: () => setError(null)
  };
}