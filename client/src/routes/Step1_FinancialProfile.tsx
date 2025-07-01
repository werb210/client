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
import { ArrowRight } from 'lucide-react';
import { markApplicationStarted } from '@/lib/visitFlags';

const financialProfileSchema = z.object({
  fundingAmount: z.string().optional(),
  useOfFunds: z.string().optional(),
  businessLocation: z.string().optional(),
  industry: z.string().optional(),
  lookingFor: z.string().optional(),
  salesHistory: z.string().optional(),
  lastYearRevenue: z.string().optional(),
  monthlyRevenue: z.string().optional(),
  accountReceivable: z.string().optional(),
  fixedAssets: z.string().optional(),
});

type FinancialProfileFormData = z.infer<typeof financialProfileSchema>;

const useOfFundsOptions = [
  { value: 'business-expansion', label: 'Business Expansion' },
  { value: 'working-capital', label: 'Working Capital' },
  { value: 'equipment-finance', label: 'Equipment Finance' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'debt-consolidation', label: 'Debt Consolidation' },
  { value: 'other', label: 'Other' },
];

const businessLocationOptions = [
  { value: 'united-states', label: 'United States' },
  { value: 'canada', label: 'Canada' },
  { value: 'other', label: 'Other' },
];

const industryOptions = [
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'technology', label: 'Technology' },
  { value: 'construction', label: 'Construction' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'other', label: 'Other' },
];

const lookingForOptions = [
  { value: 'capital', label: 'Capital' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'both', label: 'Both Capital and Equipment' },
];

const salesHistoryOptions = [
  { value: 'less-than-6-months', label: 'Less than 6 months' },
  { value: '6-to-12-months', label: '6 to 12 months' },
  { value: '1-to-2-years', label: '1 to 2 years' },
  { value: '2-to-5-years', label: '2 to 5 years' },
  { value: 'more-than-5-years', label: 'More than 5 years' },
];

const lastYearRevenueOptions = [
  { value: 'under-100k', label: 'Under $100,000' },
  { value: '100k-to-250k', label: '$100,000 to $250,000' },
  { value: '250k-to-500k', label: '$250,000 to $500,000' },
  { value: '500k-to-1m', label: '$500,000 to $1,000,000' },
  { value: '1m-to-5m', label: '$1,000,000 to $5,000,000' },
  { value: 'over-5m', label: 'Over $5,000,000' },
];

const monthlyRevenueOptions = [
  { value: 'under-10k', label: 'Under $10,000' },
  { value: '10k-to-25k', label: '$10,000 to $25,000' },
  { value: '25k-to-50k', label: '$25,000 to $50,000' },
  { value: '50k-to-100k', label: '$50,000 to $100,000' },
  { value: '100k-to-250k', label: '$100,000 to $250,000' },
  { value: 'over-250k', label: 'Over $250,000' },
];

const accountReceivableOptions = [
  { value: 'less-than-100k', label: 'Less than $100,000' },
  { value: '100k-to-250k', label: '$100,000 to $250,000' },
  { value: '250k-to-500k', label: '$250,000 to $500,000' },
  { value: '500k-to-1m', label: '$500,000 to $1,000,000' },
  { value: 'over-1m', label: 'Over $1,000,000' },
  { value: 'no-account-receivable', label: 'No Account Receivable' },
];

const fixedAssetsOptions = [
  { value: 'less-than-25k', label: 'Less than $25,000' },
  { value: '25k-to-50k', label: '$25,000 to $50,000' },
  { value: '50k-to-100k', label: '$50,000 to $100,000' },
  { value: '100k-to-250k', label: '$100,000 to $250,000' },
  { value: '250k-to-500k', label: '$250,000 to $500,000' },
  { value: '500k-to-1m', label: '$500,000 to $1,000,000' },
  { value: 'more-than-1m', label: 'More than $1,000,000' },
  { value: 'no-fixed-assets', label: 'No Fixed Assets' },
];

export default function Step1FinancialProfile() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();

  const form = useForm<FinancialProfileFormData>({
    resolver: zodResolver(financialProfileSchema),
    defaultValues: {
      fundingAmount: state.step1FinancialProfile?.fundingAmount || '',
      useOfFunds: state.step1FinancialProfile?.useOfFunds || '',
      businessLocation: state.step1FinancialProfile?.businessLocation || '',
      industry: state.step1FinancialProfile?.industry || '',
      lookingFor: state.step1FinancialProfile?.lookingFor || '',
      salesHistory: state.step1FinancialProfile?.salesHistory || '',
      lastYearRevenue: state.step1FinancialProfile?.lastYearRevenue || '',
      monthlyRevenue: state.step1FinancialProfile?.monthlyRevenue || '',
      accountReceivable: state.step1FinancialProfile?.accountReceivable || '',
      fixedAssets: state.step1FinancialProfile?.fixedAssets || '',
    },
  });

  useEffect(() => {
    markApplicationStarted();
  }, []);

  const saveToStorage = () => {
    const currentData = form.getValues();
    const storageData = {
      ...state,
      step1FinancialProfile: currentData,
      currentStep: 1,
    };
    localStorage.setItem('borealFinancialFormData', JSON.stringify(storageData));
  };

  const onSubmit = (data: FinancialProfileFormData) => {
    // Update context with form data
    dispatch({ type: 'UPDATE_STEP1', payload: data });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
    
    // Save to storage
    saveToStorage();
    
    // Navigate to recommendations
    setLocation('/step2-recommendations');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
            <CardTitle className="text-2xl font-bold">Step 1: Financial Profile</CardTitle>
            <p className="text-teal-100">Tell us about your funding needs and business basics</p>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Row 1: Funding Amount & Use of Funds */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fundingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">How much funding are you looking for?</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter amount (e.g., $100,000)"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="useOfFunds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">How do you plan on using the funds?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select use of funds" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {useOfFundsOptions.map((option) => (
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
                </div>

                {/* Row 2: Business Location & Industry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Where is your business headquartered?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select business location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessLocationOptions.map((option) => (
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

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">What industry does your business operate in?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                </div>

                {/* Row 3: Looking For & Sales History */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="lookingFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Are you looking for:</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select what you're looking for" />
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

                  <FormField
                    control={form.control}
                    name="salesHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">How many months or years of sales history does the business have?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select sales history duration" />
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
                </div>

                {/* Row 4: Last Year Revenue & Monthly Revenue */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="lastYearRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">What was your business revenue in the last 12 months?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select last 12 months revenue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lastYearRevenueOptions.map((option) => (
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

                  <FormField
                    control={form.control}
                    name="monthlyRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Average monthly revenue (last 3 months)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select average monthly revenue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {monthlyRevenueOptions.map((option) => (
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
                </div>

                {/* Row 5: Account Receivable & Fixed Assets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="accountReceivable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Current Account Receivable balance</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select account receivable balance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accountReceivableOptions.map((option) => (
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

                  <FormField
                    control={form.control}
                    name="fixedAssets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Fixed assets value for loan security</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select fixed assets value" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fixedAssetsOptions.map((option) => (
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
                </div>

                <div className="flex justify-end pt-6">
                  <Button 
                    type="submit" 
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 h-auto"
                  >
                    Continue to Recommendations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}