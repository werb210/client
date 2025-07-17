import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFormData, FormDataAction } from '@/context/FormDataContext';
import { StepHeader } from '@/components/StepHeader';
import { z } from 'zod';

// Create a local schema that matches the component field names
const localStep4Schema = z.object({
  applicantFirstName: z.string().min(1, 'First name is required'),
  applicantLastName: z.string().min(1, 'Last name is required'),
  applicantEmail: z.string().email('Valid email is required'),
  applicantPhone: z.string().min(1, 'Phone is required'),
  applicantAddress: z.string().min(1, 'Address is required'),
  applicantCity: z.string().min(1, 'City is required'),
  applicantState: z.string().min(1, 'State is required'),
  applicantZipCode: z.string().min(1, 'ZIP code is required'),
  applicantDateOfBirth: z.string().min(1, 'Date of birth is required'),
  applicantSSN: z.string().optional(), // SSN is optional
  ownershipPercentage: z.number().min(1, 'Ownership percentage is required').max(100),
  hasPartner: z.boolean(),
  // Partner fields (conditional)
  partnerFirstName: z.string().optional(),
  partnerLastName: z.string().optional(),
  partnerEmail: z.string().email().optional().or(z.literal('')),
  partnerPhone: z.string().optional(),
  partnerAddress: z.string().optional(),
  partnerCity: z.string().optional(),
  partnerState: z.string().optional(),
  partnerZipCode: z.string().optional(),
  partnerDateOfBirth: z.string().optional(),
  partnerSSN: z.string().optional(),
  partnerOwnershipPercentage: z.number().optional(),
});
import { logger } from '@/lib/utils';

// Import all the form field components
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type Step4FormData = {
  applicantFirstName: string;
  applicantLastName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress: string;
  applicantCity: string;
  applicantState: string;
  applicantZipCode: string;
  applicantDateOfBirth: string;
  applicantSSN: string;
  ownershipPercentage: number;
  hasPartner: boolean;
  partnerFirstName?: string;
  partnerLastName?: string;
  partnerEmail?: string;
  partnerPhone?: string;
  partnerAddress?: string;
  partnerCity?: string;
  partnerState?: string;
  partnerZipCode?: string;
  partnerDateOfBirth?: string;
  partnerSSN?: string;
  partnerOwnershipPercentage?: number;
};

export function Step4ApplicantInfoLocal() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useFormData();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Step4FormData>({
    resolver: zodResolver(localStep4Schema),
    defaultValues: {
      applicantFirstName: state.step4?.applicantFirstName || '',
      applicantLastName: state.step4?.applicantLastName || '',
      applicantEmail: state.step4?.applicantEmail || '',
      applicantPhone: state.step4?.applicantPhone || '',
      applicantAddress: state.step4?.applicantAddress || '',
      applicantCity: state.step4?.applicantCity || '',
      applicantState: state.step4?.applicantState || '',
      applicantZipCode: state.step4?.applicantZipCode || '',
      applicantDateOfBirth: state.step4?.applicantDateOfBirth || '',
      applicantSSN: state.step4?.applicantSSN || '',
      ownershipPercentage: state.step4?.ownershipPercentage || 100,
      hasPartner: state.step4?.hasPartner || false,
      partnerFirstName: state.step4?.partnerFirstName || '',
      partnerLastName: state.step4?.partnerLastName || '',
      partnerEmail: state.step4?.partnerEmail || '',
      partnerPhone: state.step4?.partnerPhone || '',
      partnerAddress: state.step4?.partnerAddress || '',
      partnerCity: state.step4?.partnerCity || '',
      partnerState: state.step4?.partnerState || '',
      partnerZipCode: state.step4?.partnerZipCode || '',
      partnerDateOfBirth: state.step4?.partnerDateOfBirth || '',
      partnerSSN: state.step4?.partnerSSN || '',
      partnerOwnershipPercentage: state.step4?.partnerOwnershipPercentage || 0,
    },
  });

  const hasPartner = form.watch('hasPartner');
  const ownershipPercentage = form.watch('ownershipPercentage');

  // Auto-calculate partner ownership
  useEffect(() => {
    if (hasPartner && ownershipPercentage) {
      const partnerOwnership = 100 - ownershipPercentage;
      form.setValue("partnerOwnershipPercentage", partnerOwnership);
    }
  }, [ownershipPercentage, hasPartner, form]);

  const onSubmit = async (data: Step4FormData) => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    
    try {
      logger.log('📤 Step 4: Saving application data locally for final submission...');
      
      // Format data as expected for Step 7 submission: {step1, step3, step4}
      const step1 = {
        requestedAmount: state.step1?.requestedAmount || state.step1?.fundingAmount,
        use_of_funds: state.step1?.use_of_funds || state.step1?.lookingFor,
        equipment_value: state.step1?.equipment_value || state.step1?.equipmentValue,
        businessLocation: state.step1?.businessLocation,
        salesHistory: state.step1?.salesHistory,
        lastYearRevenue: state.step1?.lastYearRevenue,
        averageMonthlyRevenue: state.step1?.averageMonthlyRevenue,
        accountsReceivableBalance: state.step1?.accountsReceivableBalance,
        fixedAssetsValue: state.step1?.fixedAssetsValue,
        purposeOfFunds: state.step1?.purposeOfFunds,
        selectedCategory: state.step2?.selectedCategory
      };

      const step3 = {
        operatingName: state.step3?.operatingName,
        legalName: state.step3?.legalName,
        businessAddress: state.step3?.businessAddress,
        businessCity: state.step3?.businessCity,
        businessState: state.step3?.businessState,
        businessZip: state.step3?.businessZip,
        businessPhone: state.step3?.businessPhone,
        businessStructure: state.step3?.businessStructure,
        businessStartDate: state.step3?.businessStartDate,
        numberOfEmployees: state.step3?.numberOfEmployees,
        annualRevenue: state.step3?.annualRevenue
      };

      const step4 = data;

      const applicationData = {
        step1,
        step3,
        step4
      };

      // Store data in context for final Step 7 submission
      dispatch({
        type: 'SET_APPLICATION_DATA',
        payload: applicationData
      });
      
      console.log("✅ Application data saved locally for Step 7 submission");

      // Generate temporary local ID for document organization
      const tempApplicationId = crypto.randomUUID();
      localStorage.setItem('tempApplicationId', tempApplicationId);
      
      toast({
        title: "Information Saved",
        description: "Your information has been saved. Continue to document upload.",
      });

      // Mark step as complete and navigate to Step 5
      dispatch({
        type: "MARK_STEP_COMPLETE",
        payload: 4,
      });

      setLocation("/apply/step-5");
      
    } catch (error) {
      logger.error('❌ Step 4: Data saving failed:', error);
      toast({
        title: "Save Failed",
        description: "Could not save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setLocation("/apply/step-3");
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <StepHeader 
        stepNumber={4}
        title="Applicant Information"
        description="Provide primary applicant details and ownership information"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Primary Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Primary Applicant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="applicantFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state or province" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantZipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter postal code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantDateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantSSN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SSN/SIN (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SSN or SIN" {...field} />
                      </FormControl>
                      <FormDescription>
                        Social Security Number (US) or Social Insurance Number (Canada)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownershipPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ownership Percentage *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="100" 
                          placeholder="Enter ownership percentage"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        What percentage of the business do you own?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownershipPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ownership Percentage *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="100" 
                          placeholder="Enter ownership percentage"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Partner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Partner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="hasPartner"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Does this business have a partner/co-owner?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {hasPartner && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="partnerFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter partner first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter partner last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter partner email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Enter partner phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter partner address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter partner city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter partner state or province" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerZipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter partner postal code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerDateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerSSN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner SSN/SIN (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter partner SSN or SIN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerOwnershipPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Ownership Percentage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="99" 
                            placeholder="Auto-calculated"
                            {...field}
                            value={field.value || 0}
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Continue to Documents"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}