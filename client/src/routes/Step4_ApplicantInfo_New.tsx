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
      firstName: state.step4ApplicantInfo?.firstName || '',
      lastName: state.step4ApplicantInfo?.lastName || '',
      email: state.step4ApplicantInfo?.email || '',
      phone: state.step4ApplicantInfo?.phone || '',
      streetAddress: state.step4ApplicantInfo?.streetAddress || '',
      city: state.step4ApplicantInfo?.city || '',
      state: state.step4ApplicantInfo?.state || '',
      postalCode: state.step4ApplicantInfo?.postalCode || '',
      dateOfBirth: state.step4ApplicantInfo?.dateOfBirth || '',
      socialSecurityNumber: state.step4ApplicantInfo?.socialSecurityNumber || '',
      ownershipPercentage: state.step4ApplicantInfo?.ownershipPercentage || '',
      creditScore: state.step4ApplicantInfo?.creditScore || '',
      personalNetWorth: state.step4ApplicantInfo?.personalNetWorth || '',
      personalAnnualIncome: state.step4ApplicantInfo?.personalAnnualIncome || '',
      partnerFirstName: state.step4ApplicantInfo?.partnerFirstName || '',
      partnerLastName: state.step4ApplicantInfo?.partnerLastName || '',
      partnerEmail: state.step4ApplicantInfo?.partnerEmail || '',
      partnerPhone: state.step4ApplicantInfo?.partnerPhone || '',
      partnerOwnershipPercentage: state.step4ApplicantInfo?.partnerOwnershipPercentage || '',
    },
  });

  const handleNext = () => {
    const formData = form.getValues();
    dispatch({ 
      type: 'UPDATE_STEP4', 
      payload: formData as any
    });
    setLocation('/apply/step-5');
  };

  const handleBack = () => {
    setLocation('/apply/step-3');
  };

  // Determine if Canadian based on business location
  const isCanadian = state.step1FinancialProfile?.businessLocation === 'Canada';

  return (
    <Form {...form}>
      <Step4ApplicantInfo
        onNext={handleNext}
        onBack={handleBack}
        isCanadian={isCanadian}
      />
    </Form>
  );
}