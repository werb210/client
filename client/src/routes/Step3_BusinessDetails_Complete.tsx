import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ApplicationFormSchema } from '../../../shared/schema';
import {
  formatPhoneNumber,
  formatPostalCode,
  getRegionalLabels,
  getStateProvinceOptions,
  isCanadianBusiness
} from '@/lib/regionalFormatting';

// Step 3 Schema - Use unified schema fields for business details
const step3Schema = ApplicationFormSchema.pick({
  operatingName: true,
  legalName: true,
  businessStreetAddress: true,
  businessCity: true,
  businessState: true,
  businessPostalCode: true,
  businessPhone: true,
  businessStartDate: true,
  businessStructure: true,
  employeeCount: true,
  estimatedYearlyRevenue: true,
}).partial().extend({
  // Make businessWebsite explicitly optional
  businessWebsite: z.string().optional(),
}); // Testing mode - made all optional

type BusinessDetailsFormData = z.infer<typeof step3Schema>;

export default function Step3BusinessDetailsComplete() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();

  // Get business location from unified state to determine regional formatting
  const businessLocation = state.businessLocation || 'US';
  const isCanadian = isCanadianBusiness(businessLocation);
  
  console.log(`[STEP3] Business Location: ${businessLocation}, Is Canadian: ${isCanadian}`, { state: state.businessLocation, detected: isCanadian });
  
  const regionalLabels = getRegionalLabels(isCanadian);
  const stateProvinceOptions = getStateProvinceOptions(isCanadian);

  const form = useForm<BusinessDetailsFormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      operatingName: state.operatingName || '',
      legalName: state.legalName || '',
      businessStreetAddress: state.businessStreetAddress || '',
      businessCity: state.businessCity || '',
      businessState: state.businessState || '',
      businessPostalCode: state.businessPostalCode || '',
      businessPhone: state.businessPhone || '',
      businessWebsite: state.businessWebsite || '',
      businessStartDate: state.businessStartDate || '',
      businessStructure: state.businessStructure || undefined,
      employeeCount: state.employeeCount || undefined,
      estimatedYearlyRevenue: state.estimatedYearlyRevenue || undefined,
    },
  });

  // Auto-save functionality
  useEffect(() => {
    const subscription = form.watch((data) => {
      // Convert form data to unified schema format
      const updatedData: Partial<typeof state> = {};
      
      if (data.operatingName !== undefined) updatedData.operatingName = data.operatingName;
      if (data.legalName !== undefined) updatedData.legalName = data.legalName;
      if (data.businessStreetAddress !== undefined) updatedData.businessStreetAddress = data.businessStreetAddress;
      if (data.businessCity !== undefined) updatedData.businessCity = data.businessCity;
      if (data.businessState !== undefined) updatedData.businessState = data.businessState;
      if (data.businessPostalCode !== undefined) updatedData.businessPostalCode = data.businessPostalCode;
      if (data.businessPhone !== undefined) updatedData.businessPhone = data.businessPhone;
      if (data.businessWebsite !== undefined) updatedData.businessWebsite = data.businessWebsite;
      if (data.businessStartDate !== undefined) updatedData.businessStartDate = data.businessStartDate;
      if (data.businessStructure !== undefined) updatedData.businessStructure = data.businessStructure;
      if (data.employeeCount !== undefined) updatedData.employeeCount = data.employeeCount;
      if (data.estimatedYearlyRevenue !== undefined) updatedData.estimatedYearlyRevenue = data.estimatedYearlyRevenue;

      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: updatedData
      });
    });

    return () => subscription.unsubscribe();
  }, [form, dispatch]);

  const onSubmit = (data: BusinessDetailsFormData) => {
    console.log('[STEP3] Form submitted with data:', data);
    
    // Update context with unified field names
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        ...data,
        completed: true
      }
    });

    dispatch({
      type: 'MARK_STEP_COMPLETE',
      payload: { step: 3 }
    });

    // Navigate to Step 4
    setLocation('/apply/step-4');
  };

  const handleBack = () => {
    setLocation('/apply/step-2');
  };

  // Testing mode validation bypass
  const canContinue = () => {
    return true; // Testing mode - allow progression without full validation
    // TODO: For production, restore validation:
    // const values = form.getValues();
    // return values.businessName && values.businessAddress && values.businessCity && 
    //        values.businessState && values.businessZipCode && values.businessPhone &&
    //        values.businessStructure && values.businessStartDate && values.employeeCount;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="w-3/6 h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full"></div>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Step 3: Business Details
          </h1>
          <p className="text-gray-600 mt-2">
            Your business address, ownership, and contact information
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>

          <Card>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Name (DBA) */}
                  <FormField
                    control={form.control}
                    name="operatingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Business Name (DBA) *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your business operating name"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business Legal Name */}
                  <FormField
                    control={form.control}
                    name="legalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Business Legal Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your legal entity name"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business Structure */}
                  <FormField
                    control={form.control}
                    name="businessStructure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Business Structure *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select business structure" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="llc">LLC</SelectItem>
                            <SelectItem value="corporation">Corporation</SelectItem>
                            <SelectItem value="s_corp">S Corporation</SelectItem>
                            <SelectItem value="non_profit">Non-Profit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business Address */}
                  <FormField
                    control={form.control}
                    name="businessStreetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Business Address *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter business street address"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business City */}
                  <FormField
                    control={form.control}
                    name="businessCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">City *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter city"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business State/Province */}
                  <FormField
                    control={form.control}
                    name="businessState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          {regionalLabels.stateProvince} *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder={`Select ${regionalLabels.stateProvince.toLowerCase()}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stateProvinceOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business ZIP/Postal Code */}
                  <FormField
                    control={form.control}
                    name="businessPostalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          {regionalLabels.postalCode} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`Enter ${regionalLabels.postalCode.toLowerCase()}`}
                            {...field}
                            onChange={(e) => {
                              const formatted = formatPostalCode(e.target.value, isCanadian);
                              field.onChange(formatted);
                            }}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business Phone */}
                  <FormField
                    control={form.control}
                    name="businessPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Business Phone *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(XXX) XXX-XXXX"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business Website */}
                  <FormField
                    control={form.control}
                    name="businessWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Business Website</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://www.example.com"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business Start Date */}
                  <FormField
                    control={form.control}
                    name="businessStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Business Start Date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Employee Count */}
                  <FormField
                    control={form.control}
                    name="employeeCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Number of Employees *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter number of employees"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Estimated Yearly Revenue */}
                  <FormField
                    control={form.control}
                    name="estimatedYearlyRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Estimated Yearly Revenue</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="$0"
                            value={field.value ? `$${field.value.toLocaleString()}` : ''}
                            onChange={(e) => {
                              // Remove all non-digits
                              const numericValue = e.target.value.replace(/[^0-9]/g, '');
                              // Convert to number and update field
                              field.onChange(numericValue ? parseInt(numericValue) : undefined);
                            }}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <Button
                type="submit"
                disabled={!canContinue()}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}