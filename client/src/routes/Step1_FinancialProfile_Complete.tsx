import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormDataContext } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { markApplicationStarted } from '@/lib/visitFlags';
import { ApplicationFormSchema } from '../../../shared/schema';
import { fetchUserCountry, countryCodeToBusinessLocation } from '@/lib/location';
import { useDebouncedCallback } from 'use-debounce';
import { StepHeader } from '@/components/StepHeader';

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

// Step 1 Schema - Use unified schema fields
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
}).partial(); // Keep fields optional for flexible workflow

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
  const { state, dispatch } = useFormDataContext();
  const [location, setLocation] = useLocation();

  const form = useForm<FinancialProfileFormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      businessLocation: state.step1?.businessLocation || 'US',
      headquarters: state.step1?.headquarters || 'US',
      headquartersState: state.step1?.headquartersState || '',
      industry: state.step1?.industry || '',
      lookingFor: state.step1?.lookingFor || 'capital',
      fundingAmount: state.step1?.fundingAmount || 0,
      fundsPurpose: state.step1?.fundsPurpose || 'working_capital',
      salesHistory: state.step1?.salesHistory || '<1yr',
      revenueLastYear: state.step1?.revenueLastYear || 0,
      averageMonthlyRevenue: state.step1?.averageMonthlyRevenue || 0,
      accountsReceivableBalance: state.step1?.accountsReceivableBalance || 0,
      fixedAssetsValue: state.step1?.fixedAssetsValue || 0,
      equipmentValue: state.step1?.equipmentValue || 0,
    },
  });

  const lookingForValue = form.watch('lookingFor');
  const fundingAmountValue = form.watch('fundingAmount');
  const revenueLastYearValue = form.watch('revenueLastYear');
  const averageMonthlyRevenueValue = form.watch('averageMonthlyRevenue');
  const accountsReceivableValue = form.watch('accountsReceivableBalance');
  const fixedAssetsValue = form.watch('fixedAssetsValue');

  // Watch all form values for autosave
  const watchedValues = form.watch();

  // Auto-save with 2-second delay
  const debouncedSave = useDebouncedCallback((data: FinancialProfileFormData) => {
    // Store data in step1 object structure for validation
    dispatch({
      type: 'UPDATE_STEP1',
      payload: {
        businessLocation: data.businessLocation || 'US',
        headquarters: data.headquarters || 'US',
        headquartersState: data.headquartersState || '',
        industry: data.industry || 'other',
        lookingFor: data.lookingFor || 'capital',
        fundingAmount: data.fundingAmount || 0,
        fundsPurpose: data.fundsPurpose || 'working_capital',
        salesHistory: data.salesHistory || '<1yr',
        revenueLastYear: data.revenueLastYear || 0,
        averageMonthlyRevenue: data.averageMonthlyRevenue || 0,
        accountsReceivableBalance: data.accountsReceivableBalance || 0,
        fixedAssetsValue: data.fixedAssetsValue || 0,
        equipmentValue: data.equipmentValue || 0,
      },
    });
    console.log('💾 Step 1 - Auto-saved form data to step1 object');
  }, 2000);

  // Trigger autosave when form values change
  useEffect(() => {
    debouncedSave(watchedValues);
  }, [watchedValues, debouncedSave]);

  const onSubmit = (data: FinancialProfileFormData) => {
    console.log('✅ Step 1 - Form submitted successfully!');
    console.log('Form Data:', data);
    
    try {
      // Store data in step1 object structure for validation
      dispatch({
        type: 'UPDATE_STEP1',
        payload: {
          businessLocation: data.businessLocation || 'US',
          headquarters: data.headquarters || 'US',
          headquartersState: data.headquartersState || '',
          industry: data.industry || 'other',
          lookingFor: data.lookingFor || 'capital',
          fundingAmount: data.fundingAmount || 50000,
          fundsPurpose: data.fundsPurpose || 'working_capital',
          salesHistory: data.salesHistory || '<1yr',
          revenueLastYear: data.revenueLastYear || 0,
          averageMonthlyRevenue: data.averageMonthlyRevenue || 0,
          accountsReceivableBalance: data.accountsReceivableBalance || 0,
          fixedAssetsValue: data.fixedAssetsValue || 0,
          equipmentValue: data.equipmentValue || 0,
        },
      });

      console.log('✅ Form data dispatched to context');

      // Auto-save functionality with 2-second delay
      setTimeout(() => {
        console.log('Auto-saving Step 1 data to localStorage');
        localStorage.setItem('step1FormData', JSON.stringify(data));
      }, 2000);

      // Navigate to Step 2
      console.log('✅ Navigating to Step 2...');
      setLocation('/apply/step-2');
    } catch (error) {
      console.error('❌ Error submitting form:', error);
    }
  };

  // Form validation - ensure required fields are filled
  const canContinue = true; // Keep flexible for now

  // Country detection and application startup
  useEffect(() => {
    markApplicationStarted();
    
    // Auto-detect user's country if not already set
    if (!state.step1?.businessLocation || !state.step1?.headquarters) {
      fetchUserCountry().then(countryCode => {
        if (countryCode) {
          const businessLocation = countryCodeToBusinessLocation(countryCode);
          const headquarters = countryCode; // CA or US
          
          if (businessLocation && headquarters) {
            console.log(`🌍 Auto-detected country: ${countryCode} (${businessLocation})`);
            
            // Update form values
            if (!state.step1?.businessLocation) {
              form.setValue('businessLocation', headquarters);
            }
            if (!state.step1?.headquarters) {
              form.setValue('headquarters', headquarters);
            }
            
            // Update context
            dispatch({
              type: 'UPDATE_FORM_DATA',
              payload: {
                businessLocation: businessLocation,
                headquarters: headquarters,
              },
            });
          }
        } else {
          // Default to US when location detection fails
          console.log('🇺🇸 Location detection failed, defaulting to US');
          if (!state.step1?.businessLocation) {
            form.setValue('businessLocation', 'US');
          }
          if (!state.step1?.headquarters) {
            form.setValue('headquarters', 'US');
          }
        }
      }).catch(error => {
        console.log('Country detection failed, defaulting to US:', error?.message || 'Unknown error');
        // Default to US when location detection fails
        if (!state.step1?.businessLocation) {
          form.setValue('businessLocation', 'US');
        }
        if (!state.step1?.headquarters) {
          form.setValue('headquarters', 'US');
        }
      });
    }
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        defaultValue={field.value?.toString()}
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
                        defaultValue={field.value?.toString()}
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
                        defaultValue={field.value?.toString()}
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
                        defaultValue={field.value?.toString()}
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
                    console.log('🔘 Button clicked - submitting form manually');
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