import React from 'react';
import { useFormData } from '@/context/FormDataContext';
import { Step2ProductionSimple } from '@/components/Step2ProductionSimple';

/**
 * Step 2 Route Component - Production Simple Mode
 * Uses simplified Step2ProductionSimple component for direct cache access
 */
export default function Step2ProductionSimpleRoute() {
  const { state, dispatch, continue: handleContinue, goBack } = useFormData();

  const handleProductSelect = (product: string) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'selectedProduct',
      value: product
    });
  };

  return (
    <Step2ProductionSimple
      formData={state}
      selectedProduct={state.selectedProduct || ''}
      onProductSelect={handleProductSelect}
      onContinue={handleContinue}
      onPrevious={goBack}
    />
  );
}