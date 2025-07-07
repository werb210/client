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

// Currency formatting utilities
const formatCurrency = (value: string): string => {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '');
  
  // If empty, return empty string
  if (!numbers) return '';
  
  // Convert to number and format with commas
  const number = parseInt(numbers, 10);
  return `$${number.toLocaleString()}`;
};

const parseCurrency = (value: string): string => {
  // Extract just the numbers for storage
  return value.replace(/\D/g, '');
};

// Type guard for lookingFor field
const isValidLookingFor = (value: string | undefined): value is "capital" | "equipment" | "both" => {
  return value === "capital" || value === "equipment" || value === "both";
};

// Step 1 Schema - Business Basics and Funding Request
const step1Schema = z.object({
  // Basic Business Information
  headquarters: z.enum(["US", "CA"]).optional(), // Testing mode - made optional
  headquartersState: z.string().optional(), // Testing mode - made optional
  industry: z.string().optional(), // Testing mode - made optional
  
  // Funding Requirements
  lookingFor: z.enum(["capital", "equipment", "both"]).optional(), // Testing mode - made optional
  fundingAmount: z.string().optional(), // Testing mode - made optional
  fundsPurpose: z.string().optional(), // Testing mode - made optional
  
  // Financial Qualification
  salesHistory: z.enum(["<1yr", "1-2yr", "2+yr"]).optional(), // Testing mode - made optional
  revenueLastYear: z.string().optional(), // Testing mode - made optional
  averageMonthlyRevenue: z.string().optional(), // Testing mode - made optional
  accountsReceivableBalance: z.string().optional(), // Testing mode - made optional
  fixedAssetsValue: z.string().optional(), // Testing mode - made optional
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
  { value: 'capital', label: 'Capital' },
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
      headquarters: state.step1FinancialProfile?.headquarters || 'US',
      headquartersState: state.step1FinancialProfile?.headquartersState || '',
      industry: state.step1FinancialProfile?.industry || '',
      lookingFor: isValidLookingFor(state.step1FinancialProfile?.lookingFor) ? state.step1FinancialProfile.lookingFor : undefined,
      fundingAmount: state.step1FinancialProfile?.fundingAmount?.toString() || '0',
      fundsPurpose: state.step1FinancialProfile?.fundsPurpose || '',
      salesHistory: state.step1FinancialProfile?.salesHistory || undefined,
      revenueLastYear: state.step1FinancialProfile?.revenueLastYear?.toString() || '0',
      averageMonthlyRevenue: state.step1FinancialProfile?.averageMonthlyRevenue?.toString() || '0',
      accountsReceivableBalance: state.step1FinancialProfile?.accountsReceivableBalance?.toString() || '0',
      fixedAssetsValue: state.step1FinancialProfile?.fixedAssetsValue?.toString() || '0',
    },
  });

  useEffect(() => {
    markApplicationStarted();
  }, []);

  const onSubmit = (data: FinancialProfileFormData) => {
    // Convert string values back to numbers for context storage
    const formattedData = {
      ...data,
      fundingAmount: parseInt(data.fundingAmount || '0', 10),
      revenueLastYear: parseInt(data.revenueLastYear || '0', 10),
      averageMonthlyRevenue: parseInt(data.averageMonthlyRevenue || '0', 10),
      accountsReceivableBalance: parseInt(data.accountsReceivableBalance || '0', 10),
      fixedAssetsValue: parseInt(data.fixedAssetsValue || '0', 10),
    };
    
    dispatch({ type: 'UPDATE_STEP1', payload: formattedData });
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
                  {/* Question 1: What are you looking for? - MOVED TO FIRST */}
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

                  {/* Question 2: Funding Amount - HIDDEN for Equipment Financing */}
                  {form.watch('lookingFor') !== 'equipment' && (
                    <FormField
                      control={form.control}
                      name="fundingAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">How much funding are you seeking?</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter amount (e.g., $100,000)"
                              value={field.value ? formatCurrency(field.value) : ''}
                              onChange={(e) => {
                                const rawValue = parseCurrency(e.target.value);
                                field.onChange(rawValue);
                              }}
                              className="h-12"
                              data-cy="fundingAmount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Question 3: Equipment Value - Conditional */}
                  {(form.watch('lookingFor') === 'equipment' || form.watch('lookingFor') === 'both') && (
                    <FormField
                      control={form.control}
                      name="fixedAssetsValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Equipment Value</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter equipment value (e.g., $50,000)"
                              value={field.value ? formatCurrency(field.value) : ''}
                              onChange={(e) => {
                                const rawValue = parseCurrency(e.target.value);
                                field.onChange(rawValue);
                              }}
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
                    name="headquarters"
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
                    name="fundsPurpose"
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
                    name="revenueLastYear"
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
                    name="accountsReceivableBalance"
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
                    name="fixedAssetsValue"
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
                    data-cy="next"
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