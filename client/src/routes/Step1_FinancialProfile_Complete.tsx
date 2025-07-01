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

// Complete Step 1 Schema based on official ApplicationFormSchema
const step1Schema = z.object({
  headquarters: z.enum(['US', 'CA']),
  headquartersState: z.string().optional(),
  industry: z.string(),
  lookingFor: z.enum(['capital', 'equipment', 'both']),
  fundingAmount: z.number().positive(),
  fundsPurpose: z.string(),
  salesHistory: z.enum(['<1yr', '1-2yr', '2+yr']),
  revenueLastYear: z.number().nonnegative(),
  averageMonthlyRevenue: z.number().nonnegative(),
  accountsReceivableBalance: z.number().nonnegative(),
  fixedAssetsValue: z.number().nonnegative(),
});

type FinancialProfileFormData = z.infer<typeof step1Schema>;

const headquartersOptions = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
];

const usStatesOptions = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const lookingForOptions = [
  { value: 'capital', label: 'Capital (Working Capital/General Business)' },
  { value: 'equipment', label: 'Equipment Financing' },
  { value: 'both', label: 'Both Capital and Equipment' },
];

const industryOptions = [
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'technology', label: 'Technology' },
  { value: 'construction', label: 'Construction' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'other', label: 'Other' },
];

const salesHistoryOptions = [
  { value: '<1yr', label: 'Less than 1 year' },
  { value: '1-2yr', label: '1-2 years' },
  { value: '2+yr', label: '2+ years' },
];

export default function Step1FinancialProfile() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();

  const form = useForm<FinancialProfileFormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      headquarters: (state.step1FinancialProfile?.headquarters as 'US' | 'CA') || undefined,
      headquartersState: state.step1FinancialProfile?.headquartersState || '',
      industry: state.step1FinancialProfile?.industry || '',
      lookingFor: (state.step1FinancialProfile?.lookingFor as 'capital' | 'equipment' | 'both') || undefined,
      fundingAmount: state.step1FinancialProfile?.fundingAmount || 0,
      fundsPurpose: state.step1FinancialProfile?.fundsPurpose || '',
      salesHistory: (state.step1FinancialProfile?.salesHistory as '<1yr' | '1-2yr' | '2+yr') || undefined,
      revenueLastYear: state.step1FinancialProfile?.revenueLastYear || 0,
      averageMonthlyRevenue: state.step1FinancialProfile?.averageMonthlyRevenue || 0,
      accountsReceivableBalance: state.step1FinancialProfile?.accountsReceivableBalance || 0,
      fixedAssetsValue: state.step1FinancialProfile?.fixedAssetsValue || 0,
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
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
            <CardTitle className="text-2xl font-bold">Step 1: Financial Profile</CardTitle>
            <p className="text-teal-100">Tell us about your funding needs and business basics (11 questions)</p>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Row 1: Business Headquarters & State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="headquarters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Business Headquarters</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select country" />
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

                  <FormField
                    control={form.control}
                    name="headquartersState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">State/Province (if US)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select state (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {usStatesOptions.map((option) => (
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

                {/* Row 2: Industry & Looking For */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Industry</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="lookingFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Looking For</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select financing type" />
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
                </div>

                {/* Row 3: Funding Amount & Purpose */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fundingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Funding Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fundsPurpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Purpose of Funds</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Working capital, equipment purchase"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 4: Sales History & Last Year Revenue */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="salesHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Sales History</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="revenueLastYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Revenue Last Year ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="500000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 5: Monthly Revenue & Accounts Receivable */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="averageMonthlyRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Average Monthly Revenue ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountsReceivableBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Accounts Receivable Balance ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="25000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 6: Fixed Assets Value (Single Field Centered) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fixedAssetsValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Fixed Assets Value ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div></div> {/* Empty div for grid balance */}
                </div>

                <div className="flex justify-end pt-6">
                  <Button 
                    type="submit" 
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
                  >
                    Next: Product Recommendations
                    <ArrowRight className="w-4 h-4" />
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