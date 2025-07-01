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

// Comprehensive Step 1 Schema matching FormDataContext interface
const step1Schema = z.object({
  businessLocation: z.string().min(1, "Business location is required"),
  industry: z.string().min(1, "Industry is required"),
  lookingFor: z.string().min(1, "Please specify what you're looking for"),
  fundingAmount: z.string().min(1, "Funding amount is required"),
  useOfFunds: z.string().min(1, "Use of funds is required"),
  salesHistory: z.string().min(1, "Sales history is required"),
  lastYearRevenue: z.string().min(1, "Last year revenue is required"),
  averageMonthlyRevenue: z.string().min(1, "Average monthly revenue is required"),
  accountsReceivable: z.string().optional(),
  fixedAssets: z.string().optional(),
  equipmentValue: z.string().optional(),
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

const lookingForOptions = [
  { value: 'capital', label: 'Working Capital' },
  { value: 'equipment', label: 'Equipment Financing' },
  { value: 'both', label: 'Both Capital & Equipment' },
];

const salesHistoryOptions = [
  { value: '<1yr', label: 'Less than 1 year' },
  { value: '1-2yr', label: '1-2 years' },
  { value: '2+yr', label: '2+ years' },
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

export default function Step1FinancialProfile() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();

  const form = useForm<FinancialProfileFormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      businessLocation: state.step1FinancialProfile?.businessLocation || '',
      industry: state.step1FinancialProfile?.industry || '',
      lookingFor: state.step1FinancialProfile?.lookingFor || '',
      fundingAmount: state.step1FinancialProfile?.fundingAmount || '',
      useOfFunds: state.step1FinancialProfile?.useOfFunds || '',
      salesHistory: state.step1FinancialProfile?.salesHistory || '',
      lastYearRevenue: state.step1FinancialProfile?.lastYearRevenue || '',
      averageMonthlyRevenue: state.step1FinancialProfile?.averageMonthlyRevenue || '',
      accountsReceivable: state.step1FinancialProfile?.accountsReceivable || '',
      fixedAssets: state.step1FinancialProfile?.fixedAssets || '',
      equipmentValue: state.step1FinancialProfile?.equipmentValue || '',
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
            <CardTitle className="text-2xl font-bold">Step 1: Comprehensive Financial Profile</CardTitle>
            <p className="text-teal-100">Provide detailed information about your business and funding needs</p>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Section 1: Business Basics */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                </div>

                {/* Section 2: Funding Needs */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Funding Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <FormField
                      control={form.control}
                      name="fundingAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Funding Amount</FormLabel>
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
                          <FormLabel className="text-base font-semibold">How long has your business been generating sales?</FormLabel>
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
                  </div>
                </div>

                {/* Section 3: Financial Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Financial Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="lastYearRevenue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Last Year Revenue</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter last year's revenue"
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
                      name="averageMonthlyRevenue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Average Monthly Revenue</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter average monthly revenue"
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
                      name="accountsReceivable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Accounts Receivable Balance</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter accounts receivable balance (optional)"
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
                      name="fixedAssets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Fixed Assets Value</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter total fixed assets value (optional)"
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
                      name="equipmentValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Equipment Value</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter equipment value (optional)"
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 h-auto"
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