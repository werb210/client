import React from 'react';
import { useLocation } from 'wouter';
import { useFormData } from '@/context/FormDataContext';
import { Step4ApplicantInfo } from '@/components/Step4ApplicantInfo';

/**
 * Route wrapper for new Step 4 Applicant Information component
 * Integrates with existing FormDataProvider and routing system
 */
export default function Step4ApplicantInfoRoute() {
  const [, setLocation] = useLocation();
  const { state } = useFormData();

  const handleNext = () => {
    setLocation('/apply/step-5');
  };

  const handleBack = () => {
    setLocation('/apply/step-3');
  };

  // Determine if Canadian based on business location
  const isCanadian = state.step1FinancialProfile?.businessLocation === 'Canada';

  return (
    <Step4ApplicantInfo
      onNext={handleNext}
      onBack={handleBack}
      isCanadian={isCanadian}
    />
  );
}