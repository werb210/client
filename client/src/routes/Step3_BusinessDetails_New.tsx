import React from 'react';
import { useLocation } from 'wouter';
import { useFormData } from '@/context/FormDataContext';
import { Step3BusinessDetails } from '@/components/Step3BusinessDetails';

/**
 * Route wrapper for new Step 3 Business Details component
 * Integrates with existing FormDataProvider and routing system
 */
export default function Step3BusinessDetailsRoute() {
  const [, setLocation] = useLocation();
  const { state } = useFormData();

  const handleNext = () => {
    setLocation('/apply/step-4');
  };

  const handleBack = () => {
    setLocation('/apply/step-2');
  };

  // Determine if Canadian based on business location
  const isCanadian = state.step1FinancialProfile?.businessLocation === 'Canada';

  return (
    <Step3BusinessDetails
      onNext={handleNext}
      onBack={handleBack}
      isCanadian={isCanadian}
    />
  );
}