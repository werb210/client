import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, Save, User, Home, Calendar } from 'lucide-react';

const Step4Schema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  title: z.string().min(2, "Title/Position is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  socialSecurityNumber: z.string().min(9, "Social Security Number is required"),
  
  // Contact Information
  personalEmail: z.string().email("Please enter a valid email address"),
  personalPhone: z.string().min(10, "Please enter a valid phone number"),
  
  // Home Address
  homeAddress: z.string().min(5, "Please enter a complete home address"),
  homeCity: z.string().min(2, "City is required"),
  homeState: z.string().min(2, "State/Province is required"),
  homeZipCode: z.string().min(3, "ZIP/Postal code is required"),
  
  // Financial Information
  personalIncome: z.string().min(1, "Personal annual income is required"),
  creditScore: z.enum(['excellent_750_plus', 'good_700_749', 'fair_650_699', 'poor_600_649', 'very_poor_below_600', 'unknown'], {
    required_error: "Please select your credit score range"
  }),
  
  // Business Ownership
  ownershipPercentage: z.string().min(1, "Ownership percentage is required"),
  yearsWithBusiness: z.enum(['less_than_1', '1_to_2', '2_to_5', '5_to_10', '10_plus'], {
    required_error: "Please select years with business"
  }),
  
  // Previous Financing
  previousLoans: z.enum(['yes', 'no'], {
    required_error: "Please indicate if you have previous business loans"
  }),
  bankruptcyHistory: z.enum(['yes', 'no'], {
    required_error: "Please indicate if you have bankruptcy history"
  })
});

type Step4FormData = z.infer<typeof Step4Schema>;

export default function Step4ApplicantDetails() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<Step4FormData>({
    resolver: zodResolver(Step4Schema),
    defaultValues: {
      firstName: state.firstName || '',
      lastName: state.lastName || '',
      title: state.title || '',
      dateOfBirth: state.dateOfBirth || '',
      socialSecurityNumber: state.socialSecurityNumber || '',
      personalEmail: state.personalEmail || '',
      personalPhone: state.personalPhone || '',
      homeAddress: state.applicantAddress || '',
      homeCity: state.applicantCity || '',
      homeState: state.applicantState || '',
      homeZipCode: state.applicantPostalCode || '',
      personalIncome: state.personalAnnualIncome || '',
      creditScore: state.creditScore || undefined,
      ownershipPercentage: state.ownershipPercentage || '',
      yearsWithBusiness: state.yearsWithBusiness || undefined,
      previousLoans: state.previousLoans || undefined,
      bankruptcyHistory: state.bankruptcyHistory || undefined
    }
  });

  const onSubmit = (data: Step4FormData) => {
    dispatch({
      type: 'UPDATE_STEP4',
      payload: {
        // Map form fields to unified schema fields
        firstName: data.firstName,
        lastName: data.lastName,
        title: data.title,
        dateOfBirth: data.dateOfBirth,
        socialSecurityNumber: data.socialSecurityNumber,
        personalEmail: data.personalEmail,
        personalPhone: data.personalPhone,
        applicantAddress: data.homeAddress,
        applicantCity: data.homeCity,
        applicantState: data.homeState,
        applicantPostalCode: data.homeZipCode,
        personalAnnualIncome: data.personalIncome,
        creditScore: data.creditScore,
        ownershipPercentage: data.ownershipPercentage,
        yearsWithBusiness: data.yearsWithBusiness,
        previousLoans: data.previousLoans,
        bankruptcyHistory: data.bankruptcyHistory,
        completed: true
      }
    });
    
    saveToStorage();
    
    toast({
      title: "Applicant Details Saved",
      description: "Your personal information has been saved successfully.",
    });
    
    setLocation('/apply/step-5');
  };

  const handlePrevious = () => {
    // Save current form data before navigating
    const currentData = form.getValues();
    dispatch({
      type: 'UPDATE_STEP4',
      payload: {
        ...currentData,
        completed: false,
        savedAt: new Date().toISOString()
      }
    });
    saveToStorage();
    setLocation('/apply/step-3');
  };



  const creditScoreOptions = [
    { value: 'excellent_750_plus', label: 'Excellent (750+)' },
    { value: 'good_700_749', label: 'Good (700-749)' },
    { value: 'fair_650_699', label: 'Fair (650-699)' },
    { value: 'poor_600_649', label: 'Poor (600-649)' },
    { value: 'very_poor_below_600', label: 'Very Poor (<600)' },
    { value: 'unknown', label: 'Unknown / Prefer not to say' }
  ];

  const yearsWithBusinessOptions = [
    { value: 'less_than_1', label: 'Less than 1 year' },
    { value: '1_to_2', label: '1-2 years' },
    { value: '2_to_5', label: '2-5 years' },
    { value: '5_to_10', label: '5-10 years' },
    { value: '10_plus', label: '10+ years' }
  ];

  const personalIncomeOptions = [
    { value: 'under_50k', label: 'Under $50,000' },
    { value: '50k_to_75k', label: '$50,000 - $75,000' },
    { value: '75k_to_100k', label: '$75,000 - $100,000' },
    { value: '100k_to_150k', label: '$100,000 - $150,000' },
    { value: '150k_to_250k', label: '$150,000 - $250,000' },
    { value: 'over_250k', label: 'Over $250,000' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              Applicant Details
            </CardTitle>
            <p className="text-gray-600 mt-1">
              Please provide your personal information as the primary applicant
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title/Position *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CEO, Owner, President" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialSecurityNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Security Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="XXX-XX-XXXX" {...field} />
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
                name="personalEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personalPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Home Address Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                Home Address
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="homeAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your home address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="homeCity"
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
                name="homeState"
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
                name="homeZipCode"
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

          {/* Financial Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="personalIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Annual Income *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select income range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {personalIncomeOptions.map((option) => (
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
                name="creditScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Score Range *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select credit score range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {creditScoreOptions.map((option) => (
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

          {/* Business Ownership Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Ownership</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ownershipPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ownership Percentage *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 100%" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearsWithBusiness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years with Business *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select years with business" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {yearsWithBusinessOptions.map((option) => (
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

          {/* Financial History Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial History</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="previousLoans"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Business Loans *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Have you had previous business loans?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankruptcyHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bankruptcy History *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any bankruptcy history?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
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
                  Next: Document Upload
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