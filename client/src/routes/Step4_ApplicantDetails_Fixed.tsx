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
import { step4Schema, type ApplicationForm } from '@shared/schema';
import { useDebounce } from 'use-debounce';

type Step4FormData = Pick<ApplicationForm,
  | 'title' | 'firstName' | 'lastName' | 'personalEmail' | 'personalPhone' | 'dateOfBirth'
  | 'socialSecurityNumber' | 'ownershipPercentage' | 'creditScore' | 'personalAnnualIncome'
  | 'applicantAddress' | 'applicantCity' | 'applicantState' | 'applicantPostalCode'
  | 'yearsWithBusiness' | 'previousLoans' | 'bankruptcyHistory'
  | 'partnerFirstName' | 'partnerLastName' | 'partnerEmail' | 'partnerPhone' | 'partnerDateOfBirth'
  | 'partnerSinSsn' | 'partnerOwnershipPercentage' | 'partnerCreditScore' | 'partnerPersonalAnnualIncome'
  | 'partnerAddress' | 'partnerCity' | 'partnerState' | 'partnerPostalCode'
>;

export default function Step4ApplicantDetails() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Initialize form with current state values
  const form = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema.partial()),
    defaultValues: {
      title: state.step4?.title || '',
      firstName: state.step4?.firstName || '',
      lastName: state.step4?.lastName || '',
      personalEmail: state.step4?.personalEmail || '',
      personalPhone: state.personalPhone || '',
      dateOfBirth: state.dateOfBirth || '',
      socialSecurityNumber: state.socialSecurityNumber || '',
      ownershipPercentage: state.ownershipPercentage || '100',
      creditScore: state.creditScore || 'unknown',
      personalAnnualIncome: state.personalAnnualIncome || '',
      applicantAddress: state.applicantAddress || '',
      applicantCity: state.applicantCity || '',
      applicantState: state.applicantState || '',
      applicantPostalCode: state.applicantPostalCode || '',
      yearsWithBusiness: state.yearsWithBusiness || 'less_than_1',
      previousLoans: state.previousLoans || 'no',
      bankruptcyHistory: state.bankruptcyHistory || 'no',
      partnerFirstName: state.partnerFirstName || '',
      partnerLastName: state.partnerLastName || '',
      partnerEmail: state.partnerEmail || '',
      partnerPhone: state.partnerPhone || '',
      partnerDateOfBirth: state.partnerDateOfBirth || '',
      partnerSinSsn: state.partnerSinSsn || '',
      partnerOwnershipPercentage: state.partnerOwnershipPercentage || '',
      partnerCreditScore: state.partnerCreditScore || 'unknown',
      partnerPersonalAnnualIncome: state.partnerPersonalAnnualIncome || '',
      partnerAddress: state.partnerAddress || '',
      partnerCity: state.partnerCity || '',
      partnerState: state.partnerState || '',
      partnerPostalCode: state.partnerPostalCode || '',
    },
  });

  // Watch form values for auto-save
  const formValues = form.watch();
  const [debouncedValues] = useDebounce(formValues, 2000);

  // Auto-save effect
  React.useEffect(() => {
    if (Object.keys(form.formState.dirtyFields).length > 0) {
      dispatch({
        type: 'UPDATE_STEP4',
        payload: {
          ...debouncedValues,
          completed: false,
        },
      });
      toast({
        title: "Progress saved",
        description: "Your information has been automatically saved.",
        duration: 2000,
      });
    }
  }, [debouncedValues, dispatch, form.formState.dirtyFields, toast]);

  // Determine if user is Canadian based on business location
  const isCanadian = state.businessLocation === 'Canada';

  // Ownership percentage to determine if partner section should show
  const ownershipValue = parseInt(form.watch('ownershipPercentage') || '100');
  const showPartnerSection = ownershipValue < 100;

  const onSubmit = (data: Step4FormData) => {
    console.log('Step 4 submit data:', data);

    // ✅ CHATGPT FIX: Use step-based structure for Step 4 data
    const step4 = {
      ...data,
      completed: true,
    };

    // Mark step as completed and save data using step-based structure
    dispatch({
      type: 'UPDATE_STEP4',
      payload: { step4 },
    });

    toast({
      title: "Step 4 completed",
      description: "Applicant information saved successfully.",
    });

    // Navigate to next step
    setLocation('/apply/step-5');
  };

  const handleBack = () => {
    setLocation('/apply/step-3');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Applicant Information
          </h1>
          <p className="text-slate-600">
            Provide personal and financial details for the primary applicant
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title/Position</FormLabel>
                      <FormControl>
                        <Input placeholder="CEO, Owner, Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personalEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
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
                      <FormLabel>Personal Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isCanadian ? "(123) 456-7890" : "(123) 456-7890"}
                          {...field} 
                        />
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
                      <FormLabel>Date of Birth</FormLabel>
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
                      <FormLabel>{isCanadian ? "Social Insurance Number (SIN)" : "Social Security Number (SSN)"}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isCanadian ? "123 456 789" : "123-45-6789"}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personalAnnualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Annual Income</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isCanadian ? "C$75,000" : "$75,000"}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Home Address Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Home Address
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="applicantAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="applicantCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Toronto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isCanadian ? "Province" : "State"}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${isCanadian ? "province" : "state"}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isCanadian ? (
                            <>
                              <SelectItem value="ON">Ontario</SelectItem>
                              <SelectItem value="QC">Quebec</SelectItem>
                              <SelectItem value="BC">British Columbia</SelectItem>
                              <SelectItem value="AB">Alberta</SelectItem>
                              <SelectItem value="MB">Manitoba</SelectItem>
                              <SelectItem value="SK">Saskatchewan</SelectItem>
                              <SelectItem value="NS">Nova Scotia</SelectItem>
                              <SelectItem value="NB">New Brunswick</SelectItem>
                              <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                              <SelectItem value="PE">Prince Edward Island</SelectItem>
                              <SelectItem value="YT">Yukon</SelectItem>
                              <SelectItem value="NT">Northwest Territories</SelectItem>
                              <SelectItem value="NU">Nunavut</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="AL">Alabama</SelectItem>
                              <SelectItem value="CA">California</SelectItem>
                              <SelectItem value="FL">Florida</SelectItem>
                              <SelectItem value="NY">New York</SelectItem>
                              <SelectItem value="TX">Texas</SelectItem>
                              {/* Add more US states as needed */}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantPostalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isCanadian ? "Postal Code" : "ZIP Code"}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isCanadian ? "A1A 1A1" : "12345"}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Financial & Business Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Financial & Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ownershipPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ownership Percentage</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Score Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select credit score range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent_750_plus">Excellent (750+)</SelectItem>
                          <SelectItem value="good_700_749">Good (700-749)</SelectItem>
                          <SelectItem value="fair_650_699">Fair (650-699)</SelectItem>
                          <SelectItem value="poor_600_649">Poor (600-649)</SelectItem>
                          <SelectItem value="very_poor_below_600">Very Poor (Below 600)</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearsWithBusiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years with Business</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select years with business" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                          <SelectItem value="1_to_2">1-2 years</SelectItem>
                          <SelectItem value="2_to_5">2-5 years</SelectItem>
                          <SelectItem value="5_to_10">5-10 years</SelectItem>
                          <SelectItem value="10_plus">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="previousLoans"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Business Loans</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
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
                      <FormLabel>Bankruptcy History</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
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

            {/* Partner Information (conditional) */}
            {showPartnerSection && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Partner Information
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Since ownership is less than 100%, please provide partner details
                  </p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="partnerFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jane@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Business Details
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    dispatch({
                      type: 'UPDATE_STEP4',
                      payload: {
                        ...form.getValues(),
                        completed: false,
                      },
                    });
                    toast({
                      title: "Progress saved",
                      description: "Your information has been saved.",
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Progress
                </Button>

                <Button
                  type="submit"
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  Continue to Documents
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}