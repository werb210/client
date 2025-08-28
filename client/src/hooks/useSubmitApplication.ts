/**
 * Hook for submitting applications with backend schema alignment
 */
import { useState } from 'react';
import { createApplication, type ApplicationPayload, type ApplicationResponse } from '@/services/applicationService';
import { useFormDataContext } from '@/context/FormDataContext';

export function useSubmitApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, dispatch } = useFormDataContext();

  const submitApplication = async (
    requestedAmount: number,
    productId: string,
    country: 'CA' | 'US'
  ): Promise<ApplicationResponse> => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🚀 [SUBMIT_HOOK] Creating application with:', {
        requestedAmount,
        productId,
        country
      });

      const payload: ApplicationPayload = {
        requested_amount: requestedAmount,
        product_id: productId,
        country: country,
        step1: state.step1,
        step3: state.step3,
        step4: state.step4,
        uploadedDocuments: state.step5DocumentUpload?.uploadedFiles || []
      };

      const result = await createApplication(payload);

      if (result.status === 'submitted') {
        // Store application ID in context
        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: {
            applicationId: result.applicationId
          }
        });

        // Store in localStorage as backup
        localStorage.setItem('applicationId', result.applicationId);
        
        console.log('✅ [SUBMIT_HOOK] Application created:', result.applicationId);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ [SUBMIT_HOOK] Error:', errorMessage);
      
      return {
        applicationId: '',
        status: 'error',
        error: errorMessage
      };
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