import { useForm } from 'react-hook-form';
import { logger } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useFormData } from '@/context/FormDataContext';

import { useLocation } from 'wouter';

import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';

import { ApplicationFormSchema } from '../../../shared/schema';

import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import {
  formatPhoneNumber,
  formatPostalCode,
  getRegionalLabels,
  getStateProvinceOptions,
  isCanadianBusiness
} from '@/lib/regionalFormatting';
import {
  normalizePhone,
  formatPhoneDisplay,
  isValidPhone,
  getCountryFromBusinessLocation
} from '@/lib/phoneUtils';
import { StepHeader } from '@/components/StepHeader';


// Step 3 Schema - All fields required as requested
const step3Schema = z.object({
  operatingName: z.string().min(1, "Business Name (DBA) is required"),
  legalName: z.string().min(1, "Business Legal Name is required"),
  businessStreetAddress: z.string().min(1, "Business Address is required"),
  businessCity: z.string().min(1, "City is required"),
  businessState: z.string().min(1, "State/Province is required"),
  businessPostalCode: z.string().min(1, "Postal Code is required"),
  businessPhone: z.string().min(1, "Business Phone is required"),
  businessStartDate: z.string().min(1, "Business Start Date is required"),
  businessStructure: z.string().min(1, "Business Structure is required"),
  employeeCount: z.number().min(1, "Number of Employees is required"),
  estimatedYearlyRevenue: z.number().min(1, "Estimated Yearly Revenue is required"),
  businessWebsite: z.string().optional(),
});

type BusinessDetailsFormData = z.infer<typeof step3Schema>;

export default function Step3BusinessDetailsComplete() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();

  // Get business location from unified state to determine regional formatting
  const businessLocation = state.step1?.businessLocation || 'US';
  const isCanadian = isCanadianBusiness(businessLocation);
  const countryCode = getCountryFromBusinessLocation(businessLocation);
  
  logger.log(`[STEP3] Business Location: ${businessLocation}, Is Canadian: ${isCanadian}`, { state: state.step1?.businessLocation, detected: isCanadian });
  
  const regionalLabels = getRegionalLabels(isCanadian);
  const stateProvinceOptions = getStateProvinceOptions(isCanadian);

  // Phone number display state
  const [phoneDisplay, setPhoneDisplay] = useState('');
  
  // Date state for business start date
  const [businessStartDate, setBusinessStartDate] = useState<Date | null>(
    state.step3?.businessStartDate ? new Date(state.step3.businessStartDate) : null
  );

  const form = useForm<BusinessDetailsFormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      operatingName: state.step3?.operatingName || '',
      legalName: state.step3?.legalName || '',
      businessStreetAddress: state.step3?.businessStreetAddress || '',
      businessCity: state.step3?.businessCity || '',
      businessState: state.step3?.businessState || '',
      businessPostalCode: state.step3?.businessPostalCode || '',
      businessPhone: state.step3?.businessPhone || '',
      businessWebsite: state.step3?.businessWebsite || '',
      businessStartDate: state.step3?.businessStartDate || '',
      businessStructure: state.step3?.businessStructure || '',
      employeeCount: state.step3?.employeeCount || 1,
      estimatedYearlyRevenue: state.step3?.estimatedYearlyRevenue || 0,
    },
  });

  // Initialize phone display state
  useEffect(() => {
    const businessPhone = state.step3?.businessPhone;
    if (businessPhone && !phoneDisplay) {
      setPhoneDisplay(formatPhoneDisplay(businessPhone, countryCode));
    }
  }, [state.step3?.businessPhone, phoneDisplay, countryCode]);

  // Auto-save functionality
  useEffect(() => {
    const subscription = form.watch((data) => {
      // Auto-save to step3 object structure
      const stepData: Partial<BusinessDetailsFormData> = {};
      
      if (data.operatingName !== undefined) stepData.operatingName = data.operatingName;
      if (data.legalName !== undefined) stepData.legalName = data.legalName;
      if (data.businessStreetAddress !== undefined) stepData.businessStreetAddress = data.businessStreetAddress;
      if (data.businessCity !== undefined) stepData.businessCity = data.businessCity;
      if (data.businessState !== undefined) stepData.businessState = data.businessState;
      if (data.businessPostalCode !== undefined) stepData.businessPostalCode = data.businessPostalCode;
      if (data.businessPhone !== undefined) stepData.businessPhone = data.businessPhone;
      if (data.businessWebsite !== undefined) stepData.businessWebsite = data.businessWebsite;
      if (data.businessStartDate !== undefined) stepData.businessStartDate = data.businessStartDate;
      if (data.businessStructure !== undefined) stepData.businessStructure = data.businessStructure;
      if (data.employeeCount !== undefined) stepData.employeeCount = data.employeeCount;
      if (data.estimatedYearlyRevenue !== undefined) stepData.estimatedYearlyRevenue = data.estimatedYearlyRevenue;

      logger.log('[STEP3] Auto-save triggered with data:', stepData);

      dispatch({
        type: 'UPDATE_STEP3',
        payload: stepData
      });
    });

    return () => subscription.unsubscribe();
  }, [form, dispatch]);

  const onSubmit = (data: BusinessDetailsFormData) => {
    logger.log('[STEP3] Form submitted with data:', data);
    logger.log('Step 3 Save Triggered:', data);
    
    // Update context with step3 object structure for validation
    dispatch({
      type: 'UPDATE_STEP3',
      payload: data
    });

    dispatch({
      type: 'MARK_STEP_COMPLETE',
      payload: 3
    });

    logger.log('[STEP3] Data saved to step3 object for validation');
    logger.log('[STEP3] Payload structure - step3 block should be present:', { step3: data });
    
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
      <StepHeader 
        stepNumber={3}
        title="Business Details"
        description="Your business address, ownership, and contact information"
      />

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
                            autoCapitalize="words"
                            onChange={(e) => {
                              const capitalizedValue = e.target.value
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ');
                              field.onChange(capitalizedValue);
                            }}
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
                            autoCapitalize="words"
                            onChange={(e) => {
                              const capitalizedValue = e.target.value
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ');
                              field.onChange(capitalizedValue);
                            }}
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
                            autoCapitalize="words"
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
                            autoCapitalize="words"
                            onChange={(e) => {
                              const capitalizedValue = e.target.value
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ');
                              field.onChange(capitalizedValue);
                            }}
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
                            placeholder={isCanadian ? "+1 (XXX) XXX-XXXX" : "(XXX) XXX-XXXX"}
                            value={phoneDisplay || field.value || ''}
                            onChange={(e) => {
                              const input = e.target.value;
                              const formatted = formatPhoneDisplay(input, countryCode);
                              setPhoneDisplay(formatted);
                              
                              // Store raw input for form state
                              field.onChange(input);
                            }}
                            onBlur={(e) => {
                              const input = e.target.value;
                              const normalized = normalizePhone(input, countryCode);
                              
                              if (normalized) {
                                // Store normalized phone number
                                field.onChange(normalized);
                                setPhoneDisplay(formatPhoneDisplay(normalized, countryCode));
                                logger.log(`📞 Phone normalized: ${input} → ${normalized}`);
                              } else if (input.trim()) {
                                // Show validation error for invalid phone
                                logger.warn(`❌ Invalid phone number: ${input}`);
                              }
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
                            autoCapitalize="none"
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
                          <DatePicker
                            selected={businessStartDate}
                            onChange={(date) => {
                              setBusinessStartDate(date);
                              field.onChange(date ? date.toISOString().split('T')[0] : '');
                            }}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="YYYY-MM-DD"
                            maxDate={new Date()}
                            minDate={new Date("1900-01-01")}
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            className="border border-input bg-background px-3 py-2 text-sm ring-offset-background rounded-md h-12 w-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                            min="1"
                            placeholder="Enter number of employees"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                        <FormLabel className="text-base font-semibold">Estimated Yearly Revenue *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="$0"
                            value={field.value ? `$${field.value.toLocaleString()}` : ''}
                            onChange={(e) => {
                              // Remove all non-digits
                              const numericValue = e.target.value.replace(/[^0-9]/g, '');
                              // Convert to number and update field
                              field.onChange(numericValue ? parseInt(numericValue) : 0);
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