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
import { Applications } from '@/lib/api';
import { useState } from 'react';

const financialInfoSchema = z.object({
  annualRevenue: z.string().optional(),
  monthlyExpenses: z.string().optional(),
  numberOfEmployees: z.string().optional(),
  totalAssets: z.string().optional(),
  totalLiabilities: z.string().optional(),
});

type FinancialInfoFormData = z.infer<typeof financialInfoSchema>;

export default function Step4FinancialInfo() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

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
    setLocation('/step5-document-upload');
  };

  const handleContinueToSign = async () => {
    const currentData = form.getValues();
    
    // Update context with current form data
    dispatch({ type: 'UPDATE_STEP4', payload: currentData });
    saveToStorage();

    setIsCreatingDraft(true);
    
    try {
      // Gather all form data from all steps
      const allFormValues = {
        step1FinancialProfile: state.step1FinancialProfile,
        step3BusinessDetails: state.step3BusinessDetails,
        step4FinancialInfo: currentData,
        submittedAt: new Date().toISOString()
      };

      const draftRes = await Applications.createDraft(allFormValues);
      const { applicationId, signUrl } = await draftRes.json();

      // Store draft ID in context for later steps
      dispatch({ 
        type: 'SET_APPLICATION_ID', 
        payload: applicationId 
      });

      // Redirect user to SignNow
      window.location.href = signUrl;
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to start signature. Please try again.",
        variant: "destructive",
      });
      setIsCreatingDraft(false);
    }
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
    <div className="min-h-screen py-8" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="max-w-6xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-white" style={{ background: 'linear-gradient(to right, #003D7A, #002B5C)' }}>
            <CardTitle className="text-2xl font-bold">Step 4: Financial Information</CardTitle>
            <p style={{ color: '#B8D4F0' }}>Provide your business financial details for loan assessment</p>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="annualRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Annual Revenue</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {getCurrencySymbol()}
                            </span>
                            <Input
                              placeholder="1,000,000"
                              className="h-12 pl-16"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e.target.value, field.onChange)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyExpenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Monthly Operating Expenses</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {getCurrencySymbol()}
                            </span>
                            <Input
                              placeholder="50,000"
                              className="h-12 pl-16"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e.target.value, field.onChange)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalAssets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Total Assets</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {getCurrencySymbol()}
                            </span>
                            <Input
                              placeholder="500,000"
                              className="h-12 pl-16"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e.target.value, field.onChange)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalLiabilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Total Liabilities</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {getCurrencySymbol()}
                            </span>
                            <Input
                              placeholder="200,000"
                              className="h-12 pl-16"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e.target.value, field.onChange)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberOfEmployees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Number of Employees</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12"
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
                </div>

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
                    variant="outline"
                    className="flex-1"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleContinueToSign}
                    disabled={isCreatingDraft}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isCreatingDraft ? 'Creating Draft...' : 'Review & Sign'}
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