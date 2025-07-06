import React from 'react';
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
import { ArrowRight, ArrowLeft, Save, Building, MapPin, Calendar } from '@/lib/icons';

const Step3Schema = z.object({
  // Business Information
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessAddress: z.string().min(5, "Please enter a complete business address"),
  businessCity: z.string().min(2, "City is required"),
  businessState: z.string().min(2, "State/Province is required"),
  businessZipCode: z.string().min(3, "ZIP/Postal code is required"),
  businessPhone: z.string().min(10, "Please enter a valid phone number"),
  businessEmail: z.string().email("Please enter a valid email address"),
  businessWebsite: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  
  // Business Legal Structure
  businessStructure: z.enum(['sole_proprietorship', 'partnership', 'llc', 'corporation', 's_corp', 'non_profit'], {
    required_error: "Please select your business structure"
  }),
  businessRegistrationDate: z.string().min(1, "Business registration date is required"),
  businessTaxId: z.string().min(9, "Tax ID must be at least 9 characters"),
  
  // Business Operations
  businessDescription: z.string().min(20, "Please provide a detailed business description (minimum 20 characters)"),
  numberOfEmployees: z.enum(['1', '2-10', '11-50', '51-100', '101-500', '500+'], {
    required_error: "Please select number of employees"
  }),
  
  // Banking Information
  primaryBankName: z.string().min(2, "Bank name is required"),
  bankingRelationshipLength: z.enum(['less_than_1_year', '1-2_years', '2-5_years', '5-10_years', 'more_than_10_years'], {
    required_error: "Please select banking relationship length"
  })
});

type Step3FormData = z.infer<typeof Step3Schema>;

export default function Step3BusinessDetails() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<Step3FormData>({
    resolver: zodResolver(Step3Schema),
    defaultValues: {
      businessName: state.step3BusinessDetails?.businessName || '',
      businessAddress: state.step3BusinessDetails?.businessAddress || '',
      businessCity: state.step3BusinessDetails?.businessCity || '',
      businessState: state.step3BusinessDetails?.businessState || '',
      businessZipCode: state.step3BusinessDetails?.businessZipCode || '',
      businessPhone: state.step3BusinessDetails?.businessPhone || '',
      businessEmail: state.step3BusinessDetails?.businessEmail || '',
      businessWebsite: state.step3BusinessDetails?.businessWebsite || '',
      businessStructure: state.step3BusinessDetails?.businessStructure || undefined,
      businessRegistrationDate: state.step3BusinessDetails?.businessRegistrationDate || '',
      businessTaxId: state.step3BusinessDetails?.businessTaxId || '',
      businessDescription: state.step3BusinessDetails?.businessDescription || '',
      numberOfEmployees: state.step3BusinessDetails?.numberOfEmployees || undefined,
      primaryBankName: state.step3BusinessDetails?.primaryBankName || '',
      bankingRelationshipLength: state.step3BusinessDetails?.bankingRelationshipLength || undefined
    }
  });

  const onSubmit = (data: Step3FormData) => {
    dispatch({
      type: 'UPDATE_STEP3',
      payload: {
        ...data,
        completed: true,
        completedAt: new Date().toISOString()
      }
    });
    
    saveToStorage();
    
    toast({
      title: "Business Details Saved",
      description: "Your business information has been saved successfully.",
    });
    
    setLocation('/apply/step-4');
  };

  const handlePrevious = () => {
    // Save current form data before navigating
    const currentData = form.getValues();
    dispatch({
      type: 'UPDATE_STEP3',
      payload: {
        ...currentData,
        completed: false,
        savedAt: new Date().toISOString()
      }
    });
    saveToStorage();
    setLocation('/apply/step-2');
  };



  const businessStructureOptions = [
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'llc', label: 'Limited Liability Company (LLC)' },
    { value: 'corporation', label: 'Corporation (C-Corp)' },
    { value: 's_corp', label: 'S Corporation' },
    { value: 'non_profit', label: 'Non-Profit Organization' }
  ];

  const employeeOptions = [
    { value: '1', label: 'Just me (1 employee)' },
    { value: '2-10', label: '2-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-100', label: '51-100 employees' },
    { value: '101-500', label: '101-500 employees' },
    { value: '500+', label: '500+ employees' }
  ];

  const bankingOptions = [
    { value: 'less_than_1_year', label: 'Less than 1 year' },
    { value: '1-2_years', label: '1-2 years' },
    { value: '2-5_years', label: '2-5 years' },
    { value: '5-10_years', label: '5-10 years' },
    { value: 'more_than_10_years', label: 'More than 10 years' }
  ];

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="max-w-6xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-white" style={{ background: 'linear-gradient(to right, #003D7A, #002B5C)' }}>
            <CardTitle className="text-2xl font-bold">Step 3: Business Details</CardTitle>
            <p style={{ color: '#B8D4F0' }}>Complete information about your business</p>
          </CardHeader>
          <CardContent className="p-8">

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Legal Business Name</FormLabel>
                        <FormControl>
                          <Input className="h-12" placeholder="Enter your legal business name" {...field} />
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
                              <SelectValue placeholder="Select business structure" />
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
                    name="businessRegistrationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Business Registration Date</FormLabel>
                        <FormControl>
                          <Input className="h-12" type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessTaxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Tax ID / EIN</FormLabel>
                        <FormControl>
                          <Input className="h-12" placeholder="XX-XXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Street Address</FormLabel>
                        <FormControl>
                          <Input className="h-12" placeholder="Enter your business address" {...field} />
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
                          <Input className="h-12" placeholder="ZIP or Postal Code" {...field} />
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
                    name="numberOfEmployees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Number of Employees</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select number of employees" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employeeOptions.map((option) => (
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
                    name="primaryBankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Primary Bank Name</FormLabel>
                        <FormControl>
                          <Input className="h-12" placeholder="Enter your primary bank name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
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
                    name="businessDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Describe Your Business</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a detailed description of your business, including products/services offered, target market, and key business activities..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankingRelationshipLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Banking Relationship Length</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select relationship length" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bankingOptions.map((option) => (
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

                <div className="flex justify-between pt-6">
                  <Button type="button" variant="outline" onClick={handlePrevious} className="w-full md:w-auto">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button type="submit" className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white">
                    Continue
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