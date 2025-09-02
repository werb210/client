/**
 * Hook for submitting applications with business criteria and CSRF handling
 */
import { useState } from 'react';
import { submitApplication as submitApp } from '@/lib/submitApplication';

export function useSubmitApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitApplication = async (payload: {
    product_id: string;
    country: "CA"|"US";
    amount: number;
    years_in_business: number;
    monthly_revenue: number;
    business_legal_name: string;
    industry: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    documents: { type: string; url?: string }[];
  }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🚀 [SUBMIT_HOOK] Submitting application with:', payload);

      const result = await submitApp(payload);
      
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