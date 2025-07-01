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

const financialProfileSchema = z.object({
  fundingAmount: z.string().optional(),
  useOfFunds: z.string().optional(),
  businessLocation: z.string().optional(),
  industry: z.string().optional(),
  salesHistory: z.string().optional(),
  lastYearRevenue: z.string().optional(),
});

type FinancialProfileFormData = z.infer<typeof financialProfileSchema>;

export default function Step1FinancialProfileSimple() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();

  const form = useForm<FinancialProfileFormData>({
    resolver: zodResolver(financialProfileSchema),
    defaultValues: {
      fundingAmount: state.step1FinancialProfile?.fundingAmount || '',
      useOfFunds: state.step1FinancialProfile?.useOfFunds || '',
      businessLocation: state.step1FinancialProfile?.businessLocation || '',
      industry: state.step1FinancialProfile?.industry || '',
      salesHistory: state.step1FinancialProfile?.salesHistory || '',
      lastYearRevenue: state.step1FinancialProfile?.lastYearRevenue || '',
    },
  });

  const onSubmit = (data: FinancialProfileFormData) => {
    dispatch({ type: 'UPDATE_STEP1', payload: data });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
    setLocation('/step2-recommendations');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
                        <FormLabel className="text-base font-semibold">Use of Funds</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select use of funds" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="working-capital">Working Capital</SelectItem>
                            <SelectItem value="equipment-finance">Equipment Finance</SelectItem>
                            <SelectItem value="business-expansion">Business Expansion</SelectItem>
                            <SelectItem value="inventory">Inventory</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 3: Sales History & Last Year Revenue */}
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
                              <SelectValue placeholder="Select sales history" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="6-months">6 months</SelectItem>
                            <SelectItem value="1-year">1 year</SelectItem>
                            <SelectItem value="2-years">2 years</SelectItem>
                            <SelectItem value="3-plus-years">3+ years</SelectItem>
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
                        <FormLabel className="text-base font-semibold">Last Year Revenue</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select revenue range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="under-100k">Under $100K</SelectItem>
                            <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                            <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                            <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                            <SelectItem value="over-5m">Over $5M</SelectItem>
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