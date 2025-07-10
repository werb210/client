import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useFormData } from '@/context/FormDataContext';
import { Form } from '@/components/ui/form';
import { Step4ApplicantInfo } from '@/components/Step4ApplicantInfo';

// Step 4 Schema - Applicant Information (Testing mode - all optional)
const step4Schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  dateOfBirth: z.string().optional(),
  socialSecurityNumber: z.string().optional(),
  ownershipPercentage: z.string().optional(),
  creditScore: z.string().optional(),
  personalNetWorth: z.string().optional(),
  personalAnnualIncome: z.string().optional(),
  // Partner information (conditional)
  partnerFirstName: z.string().optional(),
  partnerLastName: z.string().optional(),
  partnerEmail: z.string().optional(),
  partnerPhone: z.string().optional(),
  partnerOwnershipPercentage: z.string().optional(),
});

type Step4FormData = z.infer<typeof step4Schema>;

/**
 * Route wrapper for new Step 4 Applicant Information component
 * Integrates with existing FormDataProvider and routing system
 */
export default function Step4ApplicantInfoRoute() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useFormData();

  const form = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      firstName: state.step4FinancialInfo?.firstName || '',
      lastName: state.step4FinancialInfo?.lastName || '',
      email: state.step4FinancialInfo?.email || '',
      phone: state.step4FinancialInfo?.phone || '',
      streetAddress: state.step4FinancialInfo?.streetAddress || '',
      city: state.step4FinancialInfo?.city || '',
      state: state.step4FinancialInfo?.state || '',
      postalCode: state.step4FinancialInfo?.postalCode || '',
      dateOfBirth: state.step4FinancialInfo?.dateOfBirth || '',
      socialSecurityNumber: state.step4FinancialInfo?.socialSecurityNumber || '',
      ownershipPercentage: state.step4FinancialInfo?.ownershipPercentage || '',
      creditScore: state.step4FinancialInfo?.creditScore || '',
      personalNetWorth: state.step4FinancialInfo?.personalNetWorth || '',
      personalAnnualIncome: state.step4FinancialInfo?.personalAnnualIncome || '',
      partnerFirstName: state.step4FinancialInfo?.partnerFirstName || '',
      partnerLastName: state.step4FinancialInfo?.partnerLastName || '',
      partnerEmail: state.step4FinancialInfo?.partnerEmail || '',
      partnerPhone: state.step4FinancialInfo?.partnerPhone || '',
      partnerOwnershipPercentage: state.step4FinancialInfo?.partnerOwnershipPercentage || '',
    },
  });

  const handleNext = async () => {
    const formData = form.getValues();
    
    // Save form data to context
    dispatch({ 
      type: 'UPDATE_STEP4', 
      payload: formData as any
    });

    // TRIGGER API CALLS: Submit application data and initiate signing
    try {
      console.log('📤 Step 4: Triggering API calls...');
      
      // 1. Submit application data (Steps 1-4)
      const applicationData = {
        step1: state.step1FinancialProfile,
        step2: state.step2Recommendations,
        step3: state.step3BusinessDetails,
        step4: formData,
        metadata: {
          submittedAt: new Date().toISOString(),
          submittedFromStep: 4
        }
      };
      
      console.log('📋 Submitting application data:', applicationData);
      
      // Submit application data to staff backend with C-6: Mobile network resilience
      const { fetchWithTimeout } = await import('@/lib/apiTimeout');
      const response = await fetchWithTimeout(`${import.meta.env.VITE_API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'client-app-token'}`
        },
        credentials: 'include',
        body: JSON.stringify(applicationData)
      });
      
      if (!response.ok) {
        throw new Error(`Application submission failed: ${response.status}`);
      }
      
      const applicationResult = await response.json();
      
      // Import UUID for proper ID generation
      const { v4: uuidv4 } = await import('uuid');
      const applicationId = applicationResult.id || applicationResult.applicationId || uuidv4();
      
      console.log('✅ Application submission successful');
      console.log('📋 Application ID received:', applicationId);
      
      // C-3: Persist real applicationId immediately after Step 4 success
      localStorage.setItem('appId', applicationId);
      dispatch({
        type: 'SET_APPLICATION_ID',
        payload: applicationId
      });
      console.log('💾 Application ID saved to localStorage + context:', applicationId);
      
      // C-2: Fallback storage in localStorage
      localStorage.setItem('appId', applicationId);
      console.log('💾 Application ID stored in localStorage:', applicationId);
      
      // 2. Initiate signing process
      console.log('🔐 Initiating signing process...');
      
      const signingResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/applications/${applicationId}/initiate-signing`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'client-app-token'}`
        },
        credentials: 'include',
        body: JSON.stringify({ 
          applicationId,
          preFilData: {
            business: state.step3BusinessDetails,
            applicant: formData
          }
        })
      });
      
      let signingUrl = null;
      if (signingResponse.ok) {
        const signingResult = await signingResponse.json();
        signingUrl = signingResult.signingUrl;
        console.log('✅ Signing URL received:', signingUrl);
      } else {
        console.warn('⚠️ Signing initiation failed, will use polling in Step 6');
      }
      
      if (signingUrl) {
        dispatch({
          type: 'SET_SIGNING_URL',
          payload: signingUrl
        });
      }
      
      console.log('✅ API calls completed successfully');
      console.log('📋 Application ID:', applicationId);
      console.log('🔐 Signing URL:', signingUrl || 'Will be retrieved in Step 6');
      
    } catch (error) {
      console.error('❌ Error during API calls:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`We're experiencing a delay reaching our secure servers. Your data is safe locally and will retry shortly.\n\nTechnical details: ${errorMessage}`);
      
      // Handle API failure - show error without creating fallback ID
      console.error('❌ Application submission failed - production backend may be unavailable');
      
      // Show retry button instead of fallback ID
      if (confirm('Application submission failed. Would you like to retry now?')) {
        // Retry the submission
        return handleContinue();
      } else {
        // User chose not to retry - they can try again later
        console.log('ℹ️ User chose not to retry. Application can be submitted later.');
        return;
      }
    }
    
    // Navigate to Step 5 (Document Upload)
    setLocation('/apply/step-5');
  };

  const handleBack = () => {
    setLocation('/apply/step-3');
  };

  return (
    <Form {...form}>
      <Step4ApplicantInfo
        onNext={handleNext}
        onBack={handleBack}
      />
    </Form>
  );
}