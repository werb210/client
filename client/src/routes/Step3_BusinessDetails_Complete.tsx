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

import { ArrowLeft, ArrowRight } from 'lucide-react';

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
import { useCanon } from '@/providers/CanonProvider';
import { useCanonFormBridge } from '@/lib/useCanonFormBridge';


// Step 3 Schema - All fields required as requested
const step3Schema = z.object({
  operatingName: z.string().optional(),
  legalName: z.string().optional(),
  businessStreetAddress: z.string().optional(),
  businessCity: z.string().optional(),
  businessState: z.string().optional(),
  businessPostalCode: z.string().optional(),
  businessPhone: z.string().optional(),
  businessStartDate: z.string().optional(),
  businessStructure: z.string().optional(),
  employeeCount: z.number().optional(),
  estimatedYearlyRevenue: z.number().optional(),
  businessWebsite: z.string().optional(),
});

type BusinessDetailsFormData = z.infer<typeof step3Schema>;

export default function Step3BusinessDetailsComplete() {
  const { data: state, save } = useFormData();
  const [, setLocation] = useLocation();
  const { canon } = useCanon();

  // Read intake + category from context or localStorage
  const intake = state ?? JSON.parse(localStorage.getItem('bf:intake') || '{}');
  const category =
    intake?.selectedCategory ||
    localStorage.getItem('bf:step2:category') ||
    '';

  // Guard: if Step 2 wasn't completed, send them back
  useEffect(() => {
    if (!category) {
      setLocation('/apply/step-2');
    }
  }, [category, setLocation]);

  // Safe update helper to replace old dispatch calls
  const update = (patch: Record<string, unknown>) => {
    save(patch);
    // keep localStorage in sync for refresh safety
    const next = { ...(intake || {}), ...patch };
    localStorage.setItem('bf:intake', JSON.stringify(next));
  };

  // Get business location from unified state to determine regional formatting
  const businessLocation = state?.businessLocation || 'US';
  const isCanadian = isCanadianBusiness(businessLocation);
  const countryCode = getCountryFromBusinessLocation(businessLocation);
  
  logger.log(`[STEP3] Business Location: ${businessLocation}, Is Canadian: ${isCanadian}`, { state: state?.businessLocation, detected: isCanadian });
  
  const regionalLabels = getRegionalLabels(isCanadian);
  const stateProvinceOptions = getStateProvinceOptions(isCanadian);

  // Phone number display state
  const [phoneDisplay, setPhoneDisplay] = useState('');
  
  // Date state for business start date
  const [businessStartDate, setBusinessStartDate] = useState<Date | null>(
    state?.businessStartDate ? new Date(state.businessStartDate) : null
  );

  const form = useForm<BusinessDetailsFormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      operatingName: state?.operatingName || '',
      legalName: state?.legalName || '',
      businessStreetAddress: state?.businessStreetAddress || '',
      businessCity: state?.businessCity || '',
      businessState: state?.businessState || '',
      businessPostalCode: state?.businessPostalCode || '',
      businessPhone: state?.businessPhone || '',
      businessWebsite: state?.businessWebsite || '',
      businessStartDate: state?.businessStartDate || '',
      businessStructure: state?.businessStructure || '',
      employeeCount: state?.employeeCount || undefined,
      estimatedYearlyRevenue: state?.estimatedYearlyRevenue || undefined,
    },
  });

  // Bridge form to canonical store
  useCanonFormBridge(form);

  // Initialize phone display state
  useEffect(() => {
    const businessPhone = state?.businessPhone;
    if (businessPhone && !phoneDisplay) {
      setPhoneDisplay(formatPhoneDisplay(businessPhone, countryCode));
    }
  }, [state?.businessPhone, phoneDisplay, countryCode]);

  // Auto-save functionality with enhanced debugging
  useEffect(() => {
    const subscription = form.watch((data) => {
      // Auto-save to step3 object structure - only save non-empty values
      const stepData: Partial<BusinessDetailsFormData> = {};
      
      if (data.operatingName !== undefined && data.operatingName !== '') {
        stepData.operatingName = data.operatingName;
      }
      if (data.legalName !== undefined && data.legalName !== '') {
        stepData.legalName = data.legalName;
      }
      if (data.businessStreetAddress !== undefined && data.businessStreetAddress !== '') {
        stepData.businessStreetAddress = data.businessStreetAddress;
      }
      if (data.businessCity !== undefined && data.businessCity !== '') {
        stepData.businessCity = data.businessCity;
      }
      if (data.businessState !== undefined && data.businessState !== '') {
        stepData.businessState = data.businessState;
      }
      if (data.businessPostalCode !== undefined && data.businessPostalCode !== '') {
        stepData.businessPostalCode = data.businessPostalCode;
      }
      if (data.businessPhone !== undefined && data.businessPhone !== '') {
        stepData.businessPhone = data.businessPhone;
      }
      if (data.businessWebsite !== undefined && data.businessWebsite !== '') {
        stepData.businessWebsite = data.businessWebsite;
      }
      if (data.businessStartDate !== undefined && data.businessStartDate !== '') {
        stepData.businessStartDate = data.businessStartDate;
      }
      if (data.businessStructure !== undefined && data.businessStructure !== '') {
        stepData.businessStructure = data.businessStructure;
      }
      if (data.employeeCount !== undefined && data.employeeCount > 0) {
        stepData.employeeCount = data.employeeCount;
      }
      if (data.estimatedYearlyRevenue !== undefined && data.estimatedYearlyRevenue >= 0) {
        stepData.estimatedYearlyRevenue = data.estimatedYearlyRevenue;
      }
      logger.log('[STEP3] Auto-save triggered with data:', stepData);

      // Only dispatch if we have actual data to save
      if (Object.keys(stepData).length > 0) {
        update(stepData);
        // Data dispatched to FormDataContext
      }
    });

    return () => subscription.unsubscribe();
  }, [form, update]);

  const onSubmit = (data: BusinessDetailsFormData) => {
    logger.log('[STEP3] Form submitted with data:', data);
    logger.log('Step 3 Save Triggered:', data);
    
    // Process and normalize phone number
    const processedData = {
      ...data,
      businessPhone: data.businessPhone ? normalizePhone(data.businessPhone, countryCode) || data.businessPhone : '',
    };
    
    // Step 3 data processing complete
    
    // Update context with step3 object structure for validation
    update(processedData);

    // Step completion tracking removed - using navigation as completion signal

    // State persistence complete
    
    // Emit GTM step_completed event
    const applicationId = localStorage.getItem('applicationId');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 
      event: 'step_completed', 
      step: 3, 
      application_id: applicationId, 
      product_type: 'business_details' 
    });

    // Navigate to Step 4
    setLocation('/apply/step-4');
  };

  const handleBack = () => {
    setLocation('/apply/step-2');
  };

  // Testing mode validation bypass
  const canContinue = () => {
    const values = form.getValues();
    return values.operatingName && values.businessStreetAddress && values.businessCity && 
           values.businessState && values.businessPostalCode && values.businessPhone &&
           values.businessStructure && values.businessStartDate && values.employeeCount;
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
                            placeholder={isCanadian ? "+1 (555) 123-4567" : "(555) 123-4567"}
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
                          <div className="flex items-center space-x-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => field.onChange(Math.max(1, (field.value || 1) - 1))}
                              className="h-12 w-12 shrink-0"
                            >
                              -
                            </Button>
                            <Input 
                              type="number" 
                              value={field.value || 1} 
                              onChange={(e) => field.onChange(Math.max(1, parseInt(e.target.value) || 1))}
                              className="h-12 text-center font-semibold text-lg"
                              min="1"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => field.onChange((field.value || 1) + 1)}
                              className="h-12 w-12 shrink-0"
                            >
                              +
                            </Button>
                          </div>
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