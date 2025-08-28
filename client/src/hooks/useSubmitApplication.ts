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
    fundsPurpose: string,
    businessLocation: 'CA' | 'US',
    industry: string
  ): Promise<ApplicationResponse> => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🚀 [SUBMIT_HOOK] Creating application with:', {
        requestedAmount,
        fundsPurpose,
        businessLocation,
        industry
      });

      const payload: ApplicationPayload = {
        step1: {
          requestedAmount: requestedAmount,
          fundingAmount: requestedAmount,
          use_of_funds: fundsPurpose,
          businessLocation: businessLocation,
          industry: industry
        },
        metadata: {
          source: 'client-portal',
          testSubmission: true,
          requestedAmount: requestedAmount
        }
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