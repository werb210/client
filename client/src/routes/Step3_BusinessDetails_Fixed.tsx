import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useFormData } from '@/context/FormDataContext';
import { Step3Schema } from '@shared/schema';
import type { z } from 'zod';

type Step3FormData = z.infer<typeof Step3Schema>;

const businessStructureOptions = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 's_corp', label: 'S Corporation' },
  { value: 'non_profit', label: 'Non-Profit' },
];

const employeeCountOptions = [
  { value: '1', label: '1 employee' },
  { value: '2-5', label: '2-5 employees' },
  { value: '6-10', label: '6-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-100', label: '51-100 employees' },
  { value: '100+', label: '100+ employees' },
];

// Currency formatting helpers
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const parseCurrency = (value: string): number => {
  const numericValue = value.replace(/[^0-9]/g, '');
  return numericValue ? parseInt(numericValue, 10) : 0;
};

export default function Step3BusinessDetails() {
  const { state, dispatch } = useFormData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Step3FormData>({
    resolver: zodResolver(Step3Schema),
    defaultValues: {
      businessName: state.businessName || '',
      businessAddress: state.businessAddress || '',
      businessCity: state.businessCity || '',
      businessState: state.businessState || '',
      businessZipCode: state.businessZipCode || '',
      businessPhone: state.businessPhone || '',
      businessEmail: state.businessEmail || '',
      businessWebsite: state.businessWebsite || '',
      businessStartDate: state.businessStartDate || '',
      businessStructure: state.businessStructure || undefined,
      employeeCount: state.employeeCount || '',
      estimatedYearlyRevenue: state.estimatedYearlyRevenue || undefined,
    },
  });

  const handlePrevious = () => {
    // Save current form data before navigating
    const currentData = form.getValues();
    dispatch({ type: 'UPDATE_STEP3', payload: currentData });
    // Navigate to previous step - this will be handled by the parent component
    window.history.back();
  };

  const onSubmit = async (data: Step3FormData) => {
    setIsSubmitting(true);
    try {
      // Update form data with Step 3 data
      dispatch({ type: 'UPDATE_STEP3', payload: data });
      dispatch({ type: 'MARK_STEP_COMPLETE', payload: 3 });
      
      // Navigate to next step - this will be handled by the parent component
      window.location.href = '/apply/step-4';
    } catch (error) {
      console.error('Error submitting Step 3:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="w-3/6 h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full"></div>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Step 3: Business Details
          </h1>
          <p className="text-gray-600 mt-2">
            Your business address, ownership, and contact information
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Business Information Section */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b pb-2">
                    Business Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Business Name</FormLabel>
                          <FormControl>
                            <Input className="h-12" placeholder="Your Business Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessStructure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Business Structure</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select structure" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {businessStructureOptions.map((option) => (
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
                      name="businessAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Business Address</FormLabel>
                          <FormControl>
                            <Input className="h-12" placeholder="123 Main Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">City</FormLabel>
                          <FormControl>
                            <Input className="h-12" placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">State/Province</FormLabel>
                          <FormControl>
                            <Input className="h-12" placeholder="State or Province" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessZipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">ZIP/Postal Code</FormLabel>
                          <FormControl>
                            <Input className="h-12" placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Business Phone</FormLabel>
                          <FormControl>
                            <Input className="h-12" placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Business Email</FormLabel>
                          <FormControl>
                            <Input className="h-12" type="email" placeholder="business@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessWebsite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Business Website (Optional)</FormLabel>
                          <FormControl>
                            <Input className="h-12" placeholder="https://www.yourcompany.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Business Start Date</FormLabel>
                          <FormControl>
                            <Input className="h-12" type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Number of Employees</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select employee count" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employeeCountOptions.map((option) => (
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
                      name="estimatedYearlyRevenue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Estimated Yearly Revenue
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="h-12"
                              type="text"
                              placeholder="$150,000"
                              {...field}
                              value={field.value ? formatCurrency(field.value) : ''}
                              onChange={(e) => {
                                const numericValue = parseCurrency(e.target.value);
                                field.onChange(numericValue);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button type="button" variant="outline" onClick={handlePrevious} className="w-full md:w-auto">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isSubmitting ? 'Saving...' : 'Continue'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
    </div>
  );
}