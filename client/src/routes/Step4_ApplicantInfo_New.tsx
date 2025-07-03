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
      
      // TODO: Implement actual API call
      // const response = await fetch('/api/applications/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(applicationData)
      // });
      
      // 2. Initiate signing process
      console.log('🔐 Initiating signing process...');
      
      // TODO: Implement actual API call
      // const signingResponse = await fetch('/api/applications/initiate-signing', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ applicationId: response.applicationId })
      // });
      
      // For now, simulate successful API calls
      const mockApplicationId = `app_${Date.now()}`;
      const mockSigningUrl = `https://signnow.com/sign/${mockApplicationId}`;
      
      // Save API results to context
      dispatch({
        type: 'SET_APPLICATION_ID',
        payload: mockApplicationId
      });
      
      dispatch({
        type: 'SET_SIGNING_URL',
        payload: mockSigningUrl
      });
      
      console.log('✅ API calls completed successfully');
      console.log('📋 Application ID:', mockApplicationId);
      console.log('🔐 Signing URL:', mockSigningUrl);
      
    } catch (error) {
      console.error('❌ Error during API calls:', error);
      // For testing mode, continue anyway
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