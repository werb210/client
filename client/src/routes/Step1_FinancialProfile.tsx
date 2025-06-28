import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Save, ArrowRight } from 'lucide-react';

const financialProfileSchema = z.object({
  businessLocation: z.string().min(1, 'Please select your business location'),
  monthlyRevenue: z.string().min(1, 'Please select your monthly revenue range'),
  industry: z.string().min(1, 'Please select your industry'),
  businessAge: z.string().min(1, 'Please select your business age'),
  useOfFunds: z.string().min(10, 'Please provide at least 10 characters describing use of funds'),
});

type FinancialProfileFormData = z.infer<typeof financialProfileSchema>;

const provinces = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
];

const revenueRanges = [
  { value: '0-10k', label: '$0 - $10,000' },
  { value: '10k-25k', label: '$10,001 - $25,000' },
  { value: '25k-50k', label: '$25,001 - $50,000' },
  { value: '50k-100k', label: '$50,001 - $100,000' },
  { value: '100k-250k', label: '$100,001 - $250,000' },
  { value: '250k-500k', label: '$250,001 - $500,000' },
  { value: '500k-1m', label: '$500,001 - $1,000,000' },
  { value: '1m+', label: '$1,000,000+' },
];

const industries = [
  { value: 'retail', label: 'Retail' },
  { value: 'restaurant', label: 'Restaurant & Food Service' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'construction', label: 'Construction' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'technology', label: 'Technology' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'other', label: 'Other' },
];

const businessAges = [
  { value: '0-1', label: 'Less than 1 year' },
  { value: '1-2', label: '1-2 years' },
  { value: '2-5', label: '2-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
];

export default function Step1FinancialProfile() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FinancialProfileFormData>({
    resolver: zodResolver(financialProfileSchema),
    defaultValues: {
      businessLocation: state.step1FinancialProfile.businessLocation,
      monthlyRevenue: state.step1FinancialProfile.monthlyRevenue,
      industry: state.step1FinancialProfile.industry,
      businessAge: state.step1FinancialProfile.businessAge,
      useOfFunds: state.step1FinancialProfile.useOfFunds,
    },
  });

  const onSubmit = (data: FinancialProfileFormData) => {
    // Update context with form data
    dispatch({ type: 'UPDATE_STEP1', payload: data });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
    
    // Save to storage
    saveToStorage();
    
    toast({
      title: "Progress Saved",
      description: "Your financial profile has been saved. Proceeding to recommendations.",
    });

    // Navigate to Step 2
    setLocation('/step2-recommendations');
  };

  const handleSaveProgress = () => {
    const currentData = form.getValues();
    
    // Update context with current form data (even if incomplete)
    dispatch({ type: 'UPDATE_STEP1', payload: currentData });
    
    // Save to storage
    saveToStorage();
    
    toast({
      title: "Progress Saved",
      description: "Your current progress has been saved to local storage.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Profile</h1>
          <p className="text-gray-600 mt-2">
            Help us understand your business to recommend the best financing options
          </p>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Step 1 of 2</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Location */}
                <FormField
                  control={form.control}
                  name="businessLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Location (Province/State)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your province" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province.value} value={province.value}>
                              {province.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Monthly Revenue */}
                <FormField
                  control={form.control}
                  name="monthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Revenue</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your monthly revenue range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {revenueRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry.value} value={industry.value}>
                              {industry.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Business Age */}
                <FormField
                  control={form.control}
                  name="businessAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Age</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your business age" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {businessAges.map((age) => (
                            <SelectItem key={age.value} value={age.value}>
                              {age.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Use of Funds */}
                <FormField
                  control={form.control}
                  name="useOfFunds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Use of Funds</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe how you plan to use the funding (e.g., equipment purchase, inventory, expansion, working capital...)"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveProgress}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Progress
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Save and Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
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