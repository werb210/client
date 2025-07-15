import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Step3BusinessDetails } from '@/components/Step3BusinessDetails';
// Removed Step4ApplicantInfo - component cleaned up during duplicate system removal
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';

// Complete form schema for Steps 3-4
const applicationFormSchema = z.object({
  // Step 3: Business Details (Required)
  operatingName: z.string().min(1, "Operating name is required"),
  legalName: z.string().min(1, "Legal name is required"),
  businessStreetAddress: z.string().min(1, "Street address is required"),
  businessCity: z.string().min(1, "City is required"),
  businessState: z.string().min(1, "State/Province is required"),
  businessPostalCode: z.string().min(1, "Postal/ZIP code is required"),
  businessPhone: z.string().min(1, "Phone number is required"),
  businessWebsite: z.string().optional(),
  businessStructure: z.string().min(1, "Business structure is required"),
  businessStartDate: z.string().min(1, "Start date is required"),
  employeeCount: z.string().min(1, "Employee count is required"),
  estimatedYearlyRevenue: z.string().min(1, "Estimated revenue is required"),

  // Step 4: Applicant Information (Optional)
  applicantName: z.string().optional(),
  applicantEmail: z.string().email().optional().or(z.literal("")),
  titleInBusiness: z.string().optional(),
  percentageOwnership: z.string().optional(),
  mobilePhone: z.string().optional(),
  applicantBirthdate: z.string().optional(),
  applicantSSN: z.string().optional(),
  applicantStreetAddress: z.string().optional(),
  applicantCity: z.string().optional(),
  applicantState: z.string().optional(),
  applicantPostalCode: z.string().optional(),

  // Conditional Partner Information
  partnerName: z.string().optional(),
  partnerEmail: z.string().email().optional().or(z.literal("")),
  partnerPhone: z.string().optional(),
  partnerOwnership: z.string().optional(),
  partnerTitle: z.string().optional(),
  partnerSSN: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

export default function Steps34Test() {
  const [currentStep, setCurrentStep] = useState(3);
  const [isCanadian, setIsCanadian] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      operatingName: "",
      legalName: "",
      businessStreetAddress: "",
      businessCity: "",
      businessState: "",
      businessPostalCode: "",
      businessPhone: "",
      businessWebsite: "",
      businessStructure: "",
      businessStartDate: "",
      employeeCount: "",
      estimatedYearlyRevenue: "",
      applicantName: "",
      applicantEmail: "",
      titleInBusiness: "",
      percentageOwnership: "",
      mobilePhone: "",
      applicantBirthdate: "",
      applicantSSN: "",
      applicantStreetAddress: "",
      applicantCity: "",
      applicantState: "",
      applicantPostalCode: "",
      partnerName: "",
      partnerEmail: "",
      partnerPhone: "",
      partnerOwnership: "",
      partnerTitle: "",
      partnerSSN: "",
    },
  });

  const handleNext = () => {
    if (currentStep === 3) {
      // Validate Step 3 required fields
      const values = form.getValues();
      const requiredFields = [
        'operatingName', 'legalName', 'businessStreetAddress', 'businessCity',
        'businessState', 'businessPostalCode', 'businessPhone', 'businessStructure',
        'businessStartDate', 'employeeCount', 'estimatedYearlyRevenue'
      ];
      
      const isValid = requiredFields.every(field => values[field as keyof ApplicationFormData]?.toString().trim());
      
      if (isValid) {
        setCompletedSteps(prev => [...prev.filter(s => s !== 3), 3]);
        setCurrentStep(4);
      } else {
        alert('Please complete all required fields in Step 3');
      }
    } else if (currentStep === 4) {
      setCompletedSteps(prev => [...prev.filter(s => s !== 4), 4]);
      alert('Steps 3-4 completed successfully!');
    }
  };

  const handleBack = () => {
    if (currentStep === 4) {
      setCurrentStep(3);
    }
  };

  const onSubmit = (data: ApplicationFormData) => {
    // console.log('Form submitted:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Steps 3-4 Form Fields Test</h1>
          <p className="text-lg text-gray-600">
            Complete business details and applicant information with regional formatting
          </p>
        </div>

        {/* Region Toggle */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center space-x-4">
            <span className="text-sm font-medium">Region:</span>
            <Button
              variant={!isCanadian ? "default" : "outline"}
              size="sm"
              onClick={() => setIsCanadian(false)}
            >
              United States
            </Button>
            <Button
              variant={isCanadian ? "default" : "outline"}
              size="sm"
              onClick={() => setIsCanadian(true)}
            >
              Canada
            </Button>
          </div>
        </div>

        {/* Step Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-center space-x-8">
            {[3, 4].map((step) => (
              <div key={step} className="flex items-center space-x-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${currentStep === step 
                    ? 'bg-blue-600 text-white' 
                    : completedSteps.includes(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-700'
                  }
                `}>
                  {completedSteps.includes(step) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  currentStep === step ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  Step {step}: {step === 3 ? 'Business Details' : 'Applicant Info'}
                </span>
                {completedSteps.includes(step) && (
                  <Badge variant="secondary" className="text-xs">
                    Completed
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {currentStep === 3 && (
                <Step3BusinessDetails
                  onNext={handleNext}
                  onBack={handleBack}
                  isCanadian={isCanadian}
                />
              )}
              {currentStep === 4 && (
                <div className="text-center p-8">
                  <p className="text-gray-500">Step 4 component removed during duplicate system cleanup</p>
                  <p className="text-sm text-gray-400 mt-2">Use Step4_ApplicantInfo_Complete.tsx for production</p>
                  <div className="mt-4 space-x-4">
                    <Button variant="outline" onClick={handleBack}>Previous</Button>
                    <Button onClick={handleNext}>Next</Button>
                  </div>
                </div>
              )}
            </form>
          </FormProvider>
        </div>

        {/* Data Preview */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Form Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(form.watch(), null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}