import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, Save, DollarSign } from 'lucide-react';

const financialInfoSchema = z.object({
  annualRevenue: z.string()
    .min(1, 'Annual revenue is required')
    .refine((val) => {
      const num = parseFloat(val.replace(/[^0-9.-]+/g, ''));
      return !isNaN(num) && num >= 0;
    }, 'Please enter a valid revenue amount'),
  monthlyExpenses: z.string()
    .min(1, 'Monthly expenses are required')
    .refine((val) => {
      const num = parseFloat(val.replace(/[^0-9.-]+/g, ''));
      return !isNaN(num) && num >= 0;
    }, 'Please enter a valid expense amount'),
  numberOfEmployees: z.string()
    .min(1, 'Number of employees is required')
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    }, 'Please enter a valid number of employees'),
  totalAssets: z.string()
    .min(1, 'Total assets amount is required')
    .refine((val) => {
      const num = parseFloat(val.replace(/[^0-9.-]+/g, ''));
      return !isNaN(num) && num >= 0;
    }, 'Please enter a valid assets amount'),
  totalLiabilities: z.string()
    .min(1, 'Total liabilities amount is required')
    .refine((val) => {
      const num = parseFloat(val.replace(/[^0-9.-]+/g, ''));
      return !isNaN(num) && num >= 0;
    }, 'Please enter a valid liabilities amount'),
});

type FinancialInfoFormData = z.infer<typeof financialInfoSchema>;

export default function Step4FinancialInfo() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get currency symbol based on country from previous step
  const getCurrencySymbol = () => {
    const country = state.step3BusinessDetails?.businessAddress?.country;
    return country === 'US' ? '$' : 'CAD $';
  };

  const formatCurrency = (value: string): string => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Parse as number and format with commas
    const num = parseFloat(numericValue);
    if (isNaN(num)) return '';
    
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const form = useForm<FinancialInfoFormData>({
    resolver: zodResolver(financialInfoSchema),
    defaultValues: {
      annualRevenue: state.step4FinancialInfo?.annualRevenue || '',
      monthlyExpenses: state.step4FinancialInfo?.monthlyExpenses || '',
      numberOfEmployees: state.step4FinancialInfo?.numberOfEmployees || '',
      totalAssets: state.step4FinancialInfo?.totalAssets || '',
      totalLiabilities: state.step4FinancialInfo?.totalLiabilities || '',
    },
  });

  const handleCurrencyChange = (value: string, onChange: (value: string) => void) => {
    const formatted = formatCurrency(value);
    onChange(formatted);
  };

  const onSubmit = (data: FinancialInfoFormData) => {
    // Update context with form data
    dispatch({ type: 'UPDATE_STEP4', payload: data });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 5 });
    
    // Save to storage
    saveToStorage();
    
    toast({
      title: "Financial Information Saved",
      description: "Your financial details have been saved. Proceeding to next step.",
    });

    // Navigate to Step 5 (documents or final step)
    setLocation('/step5-documents');
  };

  const handleSaveProgress = () => {
    const currentData = form.getValues();
    
    // Update context with current form data (even if incomplete)
    dispatch({ type: 'UPDATE_STEP4', payload: currentData });
    
    // Save to storage
    saveToStorage();
    
    toast({
      title: "Progress Saved",
      description: "Your current progress has been saved.",
    });
  };

  const handleBack = () => {
    setLocation('/step3-business-details');
  };

  // Calculate net worth for display
  const calculateNetWorth = () => {
    const assets = parseFloat(form.watch('totalAssets')?.replace(/[^0-9.-]+/g, '') || '0');
    const liabilities = parseFloat(form.watch('totalLiabilities')?.replace(/[^0-9.-]+/g, '') || '0');
    const netWorth = assets - liabilities;
    
    if (!isNaN(netWorth) && (assets > 0 || liabilities > 0)) {
      return netWorth.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Information</h1>
          <p className="text-gray-600 mt-2">
            Please provide your business financial details for loan assessment
          </p>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Step 4 of 5</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full w-4/5"></div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Details ({getCurrencySymbol()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Annual Revenue */}
                <FormField
                  control={form.control}
                  name="annualRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Revenue</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {getCurrencySymbol()}
                          </span>
                          <Input
                            placeholder="1,000,000"
                            className="pl-16"
                            value={field.value}
                            onChange={(e) => handleCurrencyChange(e.target.value, field.onChange)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Monthly Expenses */}
                <FormField
                  control={form.control}
                  name="monthlyExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Operating Expenses</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {getCurrencySymbol()}
                          </span>
                          <Input
                            placeholder="50,000"
                            className="pl-16"
                            value={field.value}
                            onChange={(e) => handleCurrencyChange(e.target.value, field.onChange)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Number of Employees */}
                <FormField
                  control={form.control}
                  name="numberOfEmployees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Employees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="25"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Assets and Liabilities Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Assets & Liabilities</h3>
                  
                  {/* Total Assets */}
                  <FormField
                    control={form.control}
                    name="totalAssets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Assets</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {getCurrencySymbol()}
                            </span>
                            <Input
                              placeholder="500,000"
                              className="pl-16"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e.target.value, field.onChange)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Total Liabilities */}
                  <FormField
                    control={form.control}
                    name="totalLiabilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Liabilities</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {getCurrencySymbol()}
                            </span>
                            <Input
                              placeholder="200,000"
                              className="pl-16"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e.target.value, field.onChange)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Net Worth Calculation */}
                  {calculateNetWorth() && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-900">Calculated Net Worth:</span>
                        <span className="text-lg font-bold text-blue-900">
                          {getCurrencySymbol()}{calculateNetWorth()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
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
                    Next Step
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