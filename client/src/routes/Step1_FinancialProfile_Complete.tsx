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

// Step 1 Schema - Business Basics and Funding Request
const step1Schema = z.object({
  // Basic Business Information
  headquarters: z.string().min(1, "Business headquarters is required"),
  headquartersState: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  
  // Funding Requirements
  lookingFor: z.enum(["capital", "equipment", "both"], {
    required_error: "Please select what you're looking for"
  }),
  fundingAmount: z.string().min(1, "Funding amount is required"),
  fundsPurpose: z.string().min(1, "Purpose of funds is required"),
  
  // Financial Qualification
  salesHistory: z.string().min(1, "Sales history is required"),
  revenueLastYear: z.string().min(1, "Revenue last year is required"),
  averageMonthlyRevenue: z.string().min(1, "Average monthly revenue is required"),
  accountsReceivableBalance: z.string().min(1, "Accounts receivable balance is required"),
  fixedAssetsValue: z.string().min(1, "Fixed assets value is required"),
});

type FinancialProfileFormData = z.infer<typeof step1Schema>;

const industryOptions = [
  { value: 'construction', label: 'Construction' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'transportation', label: 'Transportation & Logistics' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'technology', label: 'Technology' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'hospitality', label: 'Hospitality & Food Service' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'other', label: 'Other' },
];

const headquartersOptions = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'Other', label: 'Other' },
];

const lookingForOptions = [
  { value: 'capital', label: 'Working Capital' },
  { value: 'equipment', label: 'Equipment Financing' },
  { value: 'both', label: 'Both Capital & Equipment' },
];

const salesHistoryOptions = [
  { value: '<6mo', label: 'Less than 6 months' },
  { value: '6-12mo', label: '6 to 12 months' },
  { value: '1-2yr', label: '1 to 2 years' },
  { value: '2-5yr', label: '2 to 5 years' },
  { value: '5+yr', label: 'More than 5 years' },
];

const lastYearRevenueOptions = [
  { value: '<100k', label: 'Under $100,000' },
  { value: '100k-250k', label: '$100,000 to $250,000' },
  { value: '250k-500k', label: '$250,000 to $500,000' },
  { value: '500k-1m', label: '$500,000 to $1,000,000' },
  { value: '1m-5m', label: '$1,000,000 to $5,000,000' },
  { value: '5m+', label: 'Over $5,000,000' },
];

const averageMonthlyRevenueOptions = [
  { value: '10k-25k', label: '$10,000 to $25,000' },
  { value: '25k-50k', label: '$25,000 to $50,000' },
  { value: '50k-100k', label: '$50,000 to $100,000' },
  { value: '100k-250k', label: '$100,000 to $250,000' },
  { value: '250k+', label: 'Over $250,000' },
];

const accountsReceivableOptions = [
  { value: '<100k', label: 'Less than $100,000' },
  { value: '100k-250k', label: '$100,000 to $250,000' },
  { value: '250k-500k', label: '$250,000 to $500,000' },
  { value: '500k-1m', label: '$500,000 to $1,000,000' },
  { value: '1m+', label: 'Over $1,000,000' },
  { value: 'none', label: 'No Account Receivables' },
];

const fixedAssetsOptions = [
  { value: '<25k', label: 'Less than $25,000' },
  { value: '25k-50k', label: '$25,000 to $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k-250k', label: '$100,000 - $250,000' },
  { value: '250k-500k', label: '$250,000 - $500,000' },
  { value: '500k-1m', label: '$500,000 - $1,000,000' },
  { value: '1m+', label: 'More than $1,000,000' },
  { value: 'none', label: 'No fixed assets' },
];

const useOfFundsOptions = [
  { value: 'working-capital', label: 'Working Capital' },
  { value: 'equipment-purchase', label: 'Equipment Purchase' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'expansion', label: 'Business Expansion' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'debt-consolidation', label: 'Debt Consolidation' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'other', label: 'Other' },
];

const fundingAmountOptions = [
  { value: '25k-50k', label: '$25,000 to $50,000' },
  { value: '50k-100k', label: '$50,000 to $100,000' },
  { value: '100k-250k', label: '$100,000 to $250,000' },
  { value: '250k-500k', label: '$250,000 to $500,000' },
  { value: '500k-1m', label: '$500,000 to $1,000,000' },
  { value: '1m+', label: 'Over $1,000,000' },
];

export default function Step1FinancialProfile() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();

  const form = useForm<FinancialProfileFormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      headquarters: state.step1FinancialProfile?.headquarters || '',
      headquartersState: state.step1FinancialProfile?.headquartersState || '',
      industry: state.step1FinancialProfile?.industry || '',
      lookingFor: state.step1FinancialProfile?.lookingFor || 'capital',
      fundingAmount: state.step1FinancialProfile?.fundingAmount || '',
      fundsPurpose: state.step1FinancialProfile?.fundsPurpose || '',
      salesHistory: state.step1FinancialProfile?.salesHistory || '',
      revenueLastYear: state.step1FinancialProfile?.revenueLastYear || '',
      averageMonthlyRevenue: state.step1FinancialProfile?.averageMonthlyRevenue || '',
      accountsReceivableBalance: state.step1FinancialProfile?.accountsReceivableBalance || '',
      fixedAssetsValue: state.step1FinancialProfile?.fixedAssetsValue || '',
    },
  });

  useEffect(() => {
    markApplicationStarted();
  }, []);

  const onSubmit = (data: FinancialProfileFormData) => {
    dispatch({ type: 'UPDATE_STEP1', payload: data });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
    setLocation('/step2-recommendations');
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="max-w-6xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-white" style={{ background: 'linear-gradient(to right, #003D7A, #002B5C)' }}>
            <CardTitle className="text-2xl font-bold">Step 1: Business Basics & Funding Request</CardTitle>
            <p style={{ color: '#B8D4F0' }}>Provide essential information about your business and funding needs</p>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Question 1: Funding Amount */}
                  <FormField
                    control={form.control}
                    name="fundingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">How much funding are you seeking?</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select funding amount" />
                            </SelectTrigger>
                            <SelectContent>
                              {fundingAmountOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Question 2: What are you looking for? */}
                  <FormField
                    control={form.control}
                    name="lookingFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">What are you looking for?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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

                  {/* Question 3: Equipment Value - Conditional */}
                  {(form.watch('lookingFor') === 'equipment' || form.watch('lookingFor') === 'both') && (
                    <FormField
                      control={form.control}
                      name="equipmentValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Equipment Value</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter equipment value"
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="businessLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Business Location</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select business location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="united-states">United States</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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
                        <FormLabel className="text-base font-semibold">Industry</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select your industry" />
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

                  <FormField
                    control={form.control}
                    name="useOfFunds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Primary Use of Funds</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="salesHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">How many months or years of sales history does the business have?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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

                  <FormField
                    control={form.control}
                    name="lastYearRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">What was your business revenue in the last 12 months?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select revenue range" />
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
                    name="averageMonthlyRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Average monthly revenue (last 3 months)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select monthly revenue range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {averageMonthlyRevenueOptions.map((option) => (
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
                    name="accountsReceivable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Current Account Receivable balance</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select receivables range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accountsReceivableOptions.map((option) => (
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
                              <SelectValue placeholder="Select fixed assets range" />
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

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="text-white px-8 py-3 h-auto font-semibold"
                    style={{ 
                      background: '#FF8C00',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E67E00'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FF8C00'}
                  >
                    Continue to Recommendations
                    <ArrowRight className="w-4 h-4 ml-2" />
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