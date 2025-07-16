import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useFormData } from '@/context/FormDataContext';
import { Form } from '@/components/ui/form';
import { Step3BusinessDetails } from '@/components/Step3BusinessDetails';

// Step 3 Schema - Business Details (Testing mode - all optional)
const step3Schema = z.object({
  operatingName: z.string().optional(),
  legalName: z.string().optional(),
  businessStreetAddress: z.string().optional(),
  businessCity: z.string().optional(),
  businessState: z.string().optional(),
  businessPostalCode: z.string().optional(),
  businessPhone: z.string().optional(),
  businessStructure: z.string().optional(),
  businessStartDate: z.string().optional(),
  employeeCount: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number({ invalid_type_error: "Must be a number" }).int().min(1, "At least 1 employee is required").optional()
  ),
  estimatedYearlyRevenue: z.string().optional(),
  businessWebsite: z.string().optional(),
});

type Step3FormData = z.infer<typeof step3Schema>;

/**
 * Route wrapper for new Step 3 Business Details component
 * Integrates with existing FormDataProvider and routing system
 */
export default function Step3BusinessDetailsRoute() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useFormData();

  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      operatingName: state.step3BusinessDetails?.operatingName || '',
      legalName: state.step3BusinessDetails?.legalName || '',
      businessStreetAddress: state.step3BusinessDetails?.businessAddress || '',
      businessCity: state.step3BusinessDetails?.businessCity || '',
      businessState: state.step3BusinessDetails?.businessState || '',
      businessPostalCode: state.step3BusinessDetails?.businessZipCode || '',
      businessPhone: state.step3BusinessDetails?.businessPhone || '',
      businessStructure: state.step3BusinessDetails?.businessStructure || '',
      businessStartDate: state.step3BusinessDetails?.businessRegistrationDate || '',
      employeeCount: state.step3BusinessDetails?.numberOfEmployees || 0,
      estimatedYearlyRevenue: state.step3BusinessDetails?.estimatedYearlyRevenue || '',
      businessWebsite: state.step3BusinessDetails?.businessWebsite || '',
    },
  });

  const handleNext = () => {
    const formData = form.getValues();
    dispatch({ 
      type: 'UPDATE_STEP3', 
      payload: {
        ...formData,
        // Map form fields to expected state structure
        businessAddress: formData.businessStreetAddress,
        businessZipCode: formData.businessPostalCode,
        businessRegistrationDate: formData.businessStartDate,
        numberOfEmployees: formData.employeeCount,
      } as any
    });
    setLocation('/apply/step-4');
  };

  const handleBack = () => {
    setLocation('/apply/step-2');
  };

  return (
    <Form {...form}>
      <Step3BusinessDetails
        onNext={handleNext}
        onBack={handleBack}
      />
    </Form>
  );
}