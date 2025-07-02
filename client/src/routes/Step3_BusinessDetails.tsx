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
import { ArrowRight, ArrowLeft, Save, Building, MapPin, Calendar } from 'lucide-react';

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

  const handleSaveAndContinueLater = () => {
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
    
    toast({
      title: "Progress Saved",
      description: "Your business details have been saved. You can continue later.",
    });
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                <Building className="w-6 h-6 text-blue-600" />
                Business Details
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Please provide detailed information about your business
              </p>
            </div>
            <Button variant="outline" onClick={handleSaveAndContinueLater}>
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Business Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your legal business name" {...field} />
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
                    <FormLabel>Business Structure *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Business Registration Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Tax ID / EIN *</FormLabel>
                    <FormControl>
                      <Input placeholder="XX-XXXXXXX" {...field} />
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
                    <FormLabel>Number of Employees *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
            </CardContent>
          </Card>

          {/* Business Address Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Business Address
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="businessAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your business address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="businessCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
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
                    <FormLabel>State/Province *</FormLabel>
                    <FormControl>
                      <Input placeholder="State or Province" {...field} />
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
                    <FormLabel>ZIP/Postal Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="ZIP or Postal Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="businessPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
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
                    <FormLabel>Business Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="business@example.com" {...field} />
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
                    <FormLabel>Business Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.yourcompany.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Description Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Description</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="businessDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe Your Business *</FormLabel>
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
            </CardContent>
          </Card>

          {/* Banking Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Banking Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="primaryBankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Bank Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your primary bank name" {...field} />
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
                    <FormLabel>Banking Relationship Length *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button type="submit">
                  Next: Applicant Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}