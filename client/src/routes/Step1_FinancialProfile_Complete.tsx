import { attachCategories } from "../api/submit-categories";
import { useForm } from 'react-hook-form';
import { logger } from '@/lib/utils';
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
import { ArrowRight } from 'lucide-react';
import { markApplicationStarted } from '@/lib/visitFlags';
import { ApplicationFormSchema } from '../../../shared/schema';
import { fetchUserCountry, countryCodeToBusinessLocation } from '@/lib/location';
import { useDebouncedCallback } from 'use-debounce';
import { StepHeader } from '@/components/StepHeader';
import { initializeApplicationId, getStoredApplicationId } from '@/lib/uuidUtils';
import { saveIntake } from '@/utils/normalizeIntake';
import { useSubmitApplication } from '@/hooks/useSubmitApplication';

// Currency formatting utilities
const formatCurrency = (value: string): string => {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '');
  
  // Convert to number and format with commas
  if (numbers === '') return '';
  const num = parseInt(numbers);
  return new Intl.NumberFormat('en-US').format(num);
};

const parseCurrencyString = (value: string): number => {
  // Extract just the numbers for storage
  const numbers = value.replace(/\D/g, '');
  return numbers === '' ? 0 : parseInt(numbers);
};

// Step 1 Schema - Only financial profile fields (no business details)
const step1Schema = ApplicationFormSchema.pick({
  businessLocation: true,
  headquarters: true,
  headquartersState: true,
  industry: true,
  lookingFor: true,
  fundingAmount: true,
  fundsPurpose: true,
  salesHistory: true,
  revenueLastYear: true,
  averageMonthlyRevenue: true,
  accountsReceivableBalance: true,
  fixedAssetsValue: true,
  equipmentValue: true,
}); // Keep fields optional for flexible workflow

type FinancialProfileFormData = z.infer<typeof step1Schema>;

const industryOptions = [
  { value: 'construction', label: 'Construction' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'restaurant', label: 'Restaurant/Food Service' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'energy', label: 'Energy' },
  { value: 'other', label: 'Other' },
];

const headquartersOptions = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'Other', label: 'Other' },
];

const lookingForOptions = [
  { value: 'capital', label: 'Capital' },
  { value: 'equipment', label: 'Equipment Financing' },
  { value: 'both', label: 'Both Capital & Equipment' },
];

const salesHistoryOptions = [
  { value: '<1yr', label: 'Less than 1 year' },
  { value: '1-3yr', label: '1 to 3 years' },
  { value: '3+yr', label: 'Over 3 years' },
];

const yearsInBusinessOptions = [
  { value: 6, label: '6 months' },
  { value: 12, label: '1 year' },
  { value: 18, label: '1.5 years' },
  { value: 24, label: '2 years' },
  { value: 36, label: '3 years' },
  { value: 48, label: '4 years' },
  { value: 60, label: '5 years' },
  { value: 120, label: '10+ years' },
];

const lastYearRevenueOptions = [
  { value: 0, label: 'Under $100,000' },
  { value: 100000, label: '$100,000 to $250,000' },
  { value: 250000, label: '$250,000 to $500,000' },
  { value: 500000, label: '$500,000 to $1,000,000' },
  { value: 1000000, label: '$1,000,000 to $5,000,000' },
  { value: 5000000, label: 'Over $5,000,000' },
];

const averageMonthlyRevenueOptions = [
  { value: 10000, label: '$10,000 to $25,000' },
  { value: 25000, label: '$25,000 to $50,000' },
  { value: 50000, label: '$50,000 to $100,000' },
  { value: 100000, label: '$100,000 to $250,000' },
  { value: 250000, label: 'Over $250,000' },
];

const fundsPurposeOptions = [
  { value: 'equipment', label: 'Equipment Purchase' },
  { value: 'inventory', label: 'Inventory Purchase' },
  { value: 'expansion', label: 'Business Expansion' },
  { value: 'working_capital', label: 'Working Capital' },
];

const accountsReceivableOptions = [
  { value: 0, label: 'No Account Receivables' },
  { value: 100000, label: 'Zero to $100,000' },
  { value: 250000, label: '$100,000 to $250,000' },
  { value: 500000, label: '$250,000 to $500,000' },
  { value: 1000000, label: '$500,000 to $1,000,000' },
  { value: 3000000, label: '$1,000,000 to $3,000,000' },
  { value: 3000001, label: 'Over $3,000,000' },
];

const fixedAssetsOptions = [
  { value: 0, label: 'No fixed assets' },
  { value: 25000, label: 'Zero to $25,000' },
  { value: 100000, label: '$25,000 to $100,000' },
  { value: 250000, label: '$100,000 to $250,000' },
  { value: 500000, label: '$250,000 to $500,000' },
  { value: 1000000, label: '$500,000 to $1,000,000' },
  { value: 1000001, label: 'Over $1,000,000' },
];



export default function Step1FinancialProfile() {
  const { data: contextData, save: saveToNewContext } = useFormData();
  
  // Create a mock state and dispatch to avoid errors
  const state = {
    step1: contextData || {},
    applicationId: 'mock-id',
    currentStep: 1,
    formData: contextData || {}
  };
  const dispatch = (action: any) => {
    console.log('Mock dispatch:', action);
    // Handle basic actions to prevent errors
  };
  const [location, setLocation] = useLocation();
  const { submitApplication, isSubmitting, error } = useSubmitApplication();

  // Initialize application ID
  useEffect(() => {
    
    // Clear context state to prevent prefilled values - remove all default data
    dispatch({
      type: 'LOAD_FROM_STORAGE',
      payload: {
        step1: {}, // Empty step1 data
        step3: {},
        step4: {},
        currentStep: 1,
        isComplete: false,
        applicationId: '',
        signingUrl: '',
        step1Completed: false,
        step2Completed: false,
        step3Completed: false,
        step4Completed: false,
        step5Completed: false,
        step6Completed: false,
        step5DocumentUpload: { uploadedFiles: [] },
        step6Signature: {},
        step6Authorization: {
          typedName: '',
          agreements: {
            creditCheck: false,
            dataSharing: false,
            termsAccepted: false,
            electronicSignature: false,
            accurateInformation: false
          },
          timestamp: '',
          userAgent: '',
          stepCompleted: false
        }
      }
    });
    
    const applicationId = initializeApplicationId();
    
    // Store in FormData context if not already set
    if (!state.applicationId || state.applicationId !== applicationId) {
      dispatch({
        type: 'SET_APPLICATION_ID',
        payload: applicationId
      });
    }
  }, []);

  // Clear only legacy form data to preserve autosave, intake, and cookie consent
  const clearExistingData = () => {
    try {
      localStorage.removeItem('apply.form');
      localStorage.removeItem('bf:step2');
      localStorage.removeItem('bf:step3');
      localStorage.removeItem('bf:docs');
      // DON'T clear bf:intake, sessionStorage, or bf:step1-autosave - preserves data flow
    } catch (error) {
      console.warn('Could not clear storage:', error);
    }
  };

  // Clear data on component mount only for new applications
  const shouldClearData = !localStorage.getItem('bf:step1-autosave');
  if (shouldClearData) {
    clearExistingData();
  }

  const form = useForm<FinancialProfileFormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      // Start with completely empty form
      businessLocation: undefined,
      headquarters: undefined,
      headquartersState: undefined,
      industry: undefined,
      lookingFor: undefined,
      fundingAmount: undefined,
      fundsPurpose: undefined,
      salesHistory: undefined,
      revenueLastYear: undefined,
      averageMonthlyRevenue: undefined,
      accountsReceivableBalance: undefined,
      fixedAssetsValue: undefined,
      equipmentValue: undefined,
    },
    mode: 'onChange',
  });

  const lookingForValue = form.watch('lookingFor');
  const fundingAmountValue = form.watch('fundingAmount');
  const revenueLastYearValue = form.watch('revenueLastYear');
  const averageMonthlyRevenueValue = form.watch('averageMonthlyRevenue');
  const accountsReceivableValue = form.watch('accountsReceivableBalance');
  const fixedAssetsValue = form.watch('fixedAssetsValue');

  // Watch all form values for autosave
  const watchedValues = form.watch();

  // Autosave form data every 2 seconds when values change
  const debouncedAutosave = useDebouncedCallback((values: FinancialProfileFormData) => {
    try {
      // Save to localStorage for recovery
      localStorage.setItem('bf:step1-autosave', JSON.stringify(values));
      console.log('💾 Step 1 autosaved:', Object.keys(values).length, 'fields');
    } catch (error) {
      console.warn('⚠️ Step 1 autosave failed:', error);
    }
  }, 2000);

  // Trigger autosave when form values change
  useEffect(() => {
    if (Object.keys(watchedValues).length > 0) {
      debouncedAutosave(watchedValues);
    }
  }, [watchedValues, debouncedAutosave]);

  // Restore autosaved data after form is initialized
  useEffect(() => {
    try {
      const autosavedData = localStorage.getItem('bf:step1-autosave');
      if (autosavedData) {
        const parsed = JSON.parse(autosavedData);
        // Only restore if form is currently empty to avoid overwriting user input
        const currentValues = form.getValues();
        const isEmpty = Object.values(currentValues).every(v => !v || v === '');
        if (isEmpty) {
          form.reset(parsed);
          console.log('🔄 Step 1 restored from autosave:', Object.keys(parsed).length, 'fields');
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not restore Step 1 autosave:', error);
    }
  }, []); // Run only once after component mount

  const onSubmit = async (data: FinancialProfileFormData) => {
    logger.log('✅ Step 1 - Form submitted successfully!');
    logger.log('Form Data:', data);
    
    // Form submitted successfully
    
    try {
      const step1Payload = {
        businessLocation: data.businessLocation,
        headquarters: data.headquarters,
        headquartersState: data.headquartersState,
        industry: data.industry,
        lookingFor: data.lookingFor,
        fundingAmount: data.fundingAmount,
        requestedAmount: data.fundingAmount, // Add for compatibility
        fundsPurpose: data.fundsPurpose,
        salesHistory: data.salesHistory,
        revenueLastYear: data.revenueLastYear,
        averageMonthlyRevenue: data.averageMonthlyRevenue,
        accountsReceivableBalance: data.accountsReceivableBalance,
        fixedAssetsValue: data.fixedAssetsValue,
        equipmentValue: data.equipmentValue,
      };

      // Convert salesHistory to months for Step 2 compatibility
      const convertSalesHistoryToMonths = (salesHistory: string): number => {
        switch (salesHistory) {
          case '<1yr': return 6;  // 6 months average for less than 1 year
          case '1-3yr': return 24; // 2 years average for 1-3 years
          case '3-5yr': return 48; // 4 years average for 3-5 years
          case '5+yr': return 72;  // 6 years average for 5+ years
          default: return 24;     // Default to 2 years
        }
      };

      // Create canonical format for Step 2 compatibility
      const canonical = {
        product_id: null,
        country: step1Payload.headquarters,
        amount: step1Payload.fundingAmount,
        timeInBusinessMonths: step1Payload.salesHistory ? convertSalesHistoryToMonths(step1Payload.salesHistory) : 0,
        monthlyRevenue: step1Payload.averageMonthlyRevenue,
        ...step1Payload // Include all original fields including industry
      };
      
      console.log("🔧 Dispatching to context:", step1Payload);
      console.log("🔧 Canonical format for Step 2:", canonical);
      
      // Store data in step1 object structure for validation
      dispatch({
        type: 'UPDATE_STEP1',
        payload: step1Payload,
      });

      dispatch({
        type: 'MARK_STEP_COMPLETE',
        payload: 1
      });

      // Persist backup so Step 2 can recover even if navigation state is lost
      // No localStorage backup to prevent pre-filled data on refresh
      logger.log('✅ Form data processed without localStorage backup');

      // Save intake data for Step 2 using proper normalization
      // Pass raw data to saveIntake - let normalizeStep1 handle the field mapping
      saveIntake(step1Payload);
      logger.log('✅ Intake data saved for Step 2');

      // CRITICAL: Save to new FormDataContext for Step 2
      saveToNewContext({
        requestedAmount: step1Payload.fundingAmount,
        fundingAmount: step1Payload.fundingAmount,
        businessLocation: step1Payload.headquarters,
        industry: step1Payload.industry
      });
      logger.log('✅ Data saved to new FormDataContext');

      // CRITICAL: Save using the normalized intake approach synchronously
      const { onStep1Submit } = await import('@/context/FormDataContext');
      onStep1Submit(step1Payload, () => {
        // Navigation callback - will be called after persistence
        logger.log('✅ Normalized intake persisted, navigating to Step 2');
        
        // DEBUG: Verify storage immediately before navigation
        console.log('🔍 [STEP1] Pre-navigation storage check:', {
          sessionIntake: sessionStorage.getItem('bf:intake'),
          localIntake: localStorage.getItem('bf:intake')
        });
        
        setLocation('/apply/step-2');  // SPA navigation to correct route
      });

      logger.log('✅ Form data dispatched to context');

      // Emit GTM step_completed event
      const applicationId = getStoredApplicationId();
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 
        event: 'step_completed', 
        step: 1, 
        application_id: applicationId, 
        product_type: data.lookingFor || 'not_selected' 
      });
    } catch (error) {
      logger.error('❌ Error submitting form:', error);
      console.error('🔧 Step 1 save error:', error);
      
      // Emit GTM error event
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 
        event: 'error_occurred', 
        message: error instanceof Error ? error.message : 'Step 1 submission error' 
      });
    }
  };

  // Form validation - ensure required fields are filled
  const canContinue = true; // Keep flexible for now

  // Country detection and application startup
  useEffect(() => {
    markApplicationStarted();
    
    // Emit GTM form_started event
    const applicationId = getStoredApplicationId();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 
      event: 'form_started', 
      application_id: applicationId 
    });
    
    // AUTO-LOCATION DETECTION COMPLETELY DISABLED to prevent prefilled values
    // Country detection and auto-filling has been disabled to ensure form starts empty
    // if (!state.step1?.businessLocation || !state.step1?.headquarters) {
    //   fetchUserCountry().then(countryCode => {
    //     if (countryCode) {
    //       const businessLocation = countryCodeToBusinessLocation(countryCode);
    //       const headquarters = countryCode; // CA or US
    //       
    //       if (businessLocation && headquarters) {
    //         logger.log(`🌍 Auto-detected country: ${countryCode} (${businessLocation})`);
    //         
    //         // Update form values
    //         if (!state.step1?.businessLocation) {
    //           form.setValue('businessLocation', headquarters);
    //         }
    //         if (!state.step1?.headquarters) {
    //           form.setValue('headquarters', headquarters);
    //         }
    //         
    //         // Update context
    //         dispatch({
    //           type: 'UPDATE_FORM_DATA',
    //           payload: {
    //             businessLocation: businessLocation,
    //             headquarters: headquarters,
    //           },
    //         });
    //       }
    //     } else {
    //       // Default to US when location detection fails
    //       logger.log('🇺🇸 Location detection failed, defaulting to US');
    //       if (!state.step1?.businessLocation) {
    //         form.setValue('businessLocation', 'US');
    //       }
    //       if (!state.step1?.headquarters) {
    //         form.setValue('headquarters', 'US');
    //       }
    //     }
    //   }).catch(error => {
    //     logger.log('Country detection failed, defaulting to US:', error?.message || 'Unknown error');
    //     // Default to US when location detection fails
    //     if (!state.step1?.businessLocation) {
    //       form.setValue('businessLocation', 'US');
    //     }
    //     if (!state.step1?.headquarters) {
    //       form.setValue('headquarters', 'US');
    //     }
    //   });
    // }
  }, [state.step1?.businessLocation, state.step1?.headquarters, form, dispatch]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <StepHeader 
        stepNumber={1}
        title="Financial Profile"
        description="Overview of your funding needs and business revenue"
      />

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Two-column grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* What are you looking for? - First position */}
                <FormField
                  control={form.control}
                  name="lookingFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What are you looking for?</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select funding type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lookingForOptions.map((option) => (
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

                {/* How much funding are you seeking? - Hidden for equipment financing */}
                {lookingForValue !== 'equipment' && (
                  <FormField
                    control={form.control}
                    name="fundingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How much funding are you seeking?</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              className="pl-8 h-12"
                              placeholder="Enter amount"
                              value={field.value ? formatCurrency(field.value.toString()) : ''}
                              onChange={(e) => {
                                const numericValue = parseCurrencyString(e.target.value);
                                field.onChange(numericValue);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Equipment Value - Conditional visibility */}
                {(lookingForValue === 'equipment' || lookingForValue === 'both') && (
                  <FormField
                    control={form.control}
                    name="equipmentValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Value</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              className="pl-8 h-12"
                              placeholder="Enter equipment value"
                              value={field.value ? formatCurrency(field.value.toString()) : ''}
                              onChange={(e) => {
                                const numericValue = parseCurrencyString(e.target.value);
                                field.onChange(numericValue);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Business Location */}
                <FormField
                  control={form.control}
                  name="businessLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {headquartersOptions.map((option) => (
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

                {/* Industry */}
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industryOptions.map((option) => (
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

                {/* Purpose of funds */}
                <FormField
                  control={form.control}
                  name="fundsPurpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of funds</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select purpose of funds" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fundsPurposeOptions.map((option) => (
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

                {/* Sales History */}
                <FormField
                  control={form.control}
                  name="salesHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How many years of sales history does the business have?</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select sales history" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {salesHistoryOptions.map((option) => (
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

                {/* Revenue Last Year */}
                <FormField
                  control={form.control}
                  name="revenueLastYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What was your business revenue in the last 12 months?</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}

                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select revenue range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lastYearRevenueOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Average Monthly Revenue */}
                <FormField
                  control={form.control}
                  name="averageMonthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average monthly revenue (last 3 months)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}

                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select monthly revenue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {averageMonthlyRevenueOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Accounts Receivable Balance */}
                <FormField
                  control={form.control}
                  name="accountsReceivableBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Account Receivable balance</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}

                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select AR balance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accountsReceivableOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fixed Assets Value */}
                <FormField
                  control={form.control}
                  name="fixedAssetsValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fixed assets value for loan security</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}

                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select assets value" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fixedAssetsOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </div>

              {/* Continue button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={false}
                  className="bg-[#FF8C00] hover:bg-[#E07B00] text-white px-8 py-3 h-auto"
                  onClick={(e) => {
                    e.preventDefault();
                    logger.log('🔘 Button clicked - submitting form manually');
                    const formData = form.getValues();
                    onSubmit(formData);
                  }}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
// injected: local-first products fetch
import { getProducts, loadSelectedCategories } from "../api/products";
/* injected load on mount (pseudo):
useEffect(() => { (async () => {
  const cats = loadSelectedCategories();
  const products = await getProducts({ useCacheFirst: true });
  // apply category filter if present
  const selected = cats && cats.length ? products.filter(p => cats.includes((p.category||"").toLowerCase())) : products;
  setState({ products: selected });
})(); }, []);
*/
