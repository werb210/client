/**
 * Hook for submitting applications with backend schema alignment
 */
import { useState } from 'react';
import { createApplication, type ApplicationPayload, type ApplicationResponse } from '@/services/applicationService';
import { useFormDataContext } from '@/context/FormDataContext';

// --- injected: ensureSubmissionSchema (keep API payload coherent) ---
function ensureSubmissionSchema(payload:any){
  const p = {...payload}
  const answers = p.answers ?? p.form ?? p
  // normalize amount & country fields (aliases)
  const amount = answers.amountRequested ?? answers.loanAmount ?? answers.amount
  if (amount != null) { answers.loanAmount = amount; answers.amountRequested = amount }
  if (answers.countryCode && !answers.country) answers.country = answers.countryCode
  // documents: keep key & status even when Step 5 disabled
  if (!Array.isArray(p.documents)) p.documents = []
  if (!p.documentStatus) p.documentStatus = 'pending'
  // trace passthrough if present
  if (p._trace && typeof p._trace === 'object') {
    p._trace.version = p._trace.version ?? 'v1.0'
  }
  p.answers = answers
  return p
}
// -------- end injected helper --------

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

      const payload: ApplicationPayload = ensureSubmissionSchema({
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
      });

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