/**
 * Hook for final application submission
 */
import { useState } from 'react';
import { submitFinalApplication, type ApplicationResponse } from '@/services/applicationService';

export function useFinalSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFinal = async (applicationId: string): Promise<ApplicationResponse> => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🏁 [FINAL_SUBMIT_HOOK] Submitting final application:', applicationId);

      const result = await submitFinalApplication(applicationId);

      if (result.status === 'error') {
        setError(result.error || 'Submission failed');
      } else {
        console.log('✅ [FINAL_SUBMIT_HOOK] Final application submitted successfully');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ [FINAL_SUBMIT_HOOK] Error:', errorMessage);
      
      return {
        applicationId,
        status: 'error',
        error: errorMessage
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitFinal,
    isSubmitting,
    error,
    clearError: () => setError(null)
  };
}