import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step4Schema, type ApplicationForm } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { User, MapPin, Calendar as CalendarIcon, Phone, UserPlus, Percent, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useFormDataContext } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/components/AutoSaveIndicator';
import { useDebounce } from 'use-debounce';
import { useState, useEffect } from 'react';

type Step4FormData = z.infer<typeof step4Schema>;

export default function Step4ApplicantInfo() {
  const { state, dispatch } = useFormDataContext();
  const [, setLocation] = useLocation();
  
  const form = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      title: state.title || '',
      firstName: state.firstName || '',
      lastName: state.lastName || '',
      personalEmail: state.personalEmail || '',
      personalPhone: state.personalPhone || '',
      dateOfBirth: state.dateOfBirth || '',
      socialSecurityNumber: state.socialSecurityNumber || '',
      ownershipPercentage: state.ownershipPercentage || '',
      creditScore: state.creditScore || 'unknown',
      personalAnnualIncome: state.personalAnnualIncome || '',
      applicantAddress: state.applicantAddress || '',
      applicantCity: state.applicantCity || '',
      applicantState: state.applicantState || '',
      applicantPostalCode: state.applicantPostalCode || '',
      yearsWithBusiness: state.yearsWithBusiness || '',
      previousLoans: state.previousLoans || 'no',
      bankruptcyHistory: state.bankruptcyHistory || 'no',
      // Partner fields
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

  // Auto-save functionality with 2-second delay
  const [debouncedFormData] = useDebounce(form.watch(), 2000);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { status: autoSaveStatus, lastSaveTime } = useAutoSave({
    key: 'borealFinancialApplicationAutoSave_step4',
    data: { ...state, ...debouncedFormData, currentStep: 4 },
    interval: 30000, // 30 seconds
    delay: 2000, // 2 seconds after changes
    maxAge: 72, // 72 hours
    securitySteps: [5, 6] // Don't auto-restore to signature/submission steps
  });

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => setHasUnsavedChanges(true));
    return () => subscription.unsubscribe();
  }, [form]);

  const watchOwnership = form.watch('ownershipPercentage');
  const hasPartner = watchOwnership && parseFloat(watchOwnership) < 100;

  // Check if business location is Canadian (from Step 1)
  const isCanadian = state.businessLocation === 'Canada';

  const onSubmit = (data: Step4FormData) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: data,
    });
    
    dispatch({
      type: 'MARK_STEP_COMPLETE',
      payload: 4
    });
    setLocation('/apply/step-5');
  };

  const handleBack = () => {
    setLocation('/apply/step-3');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-teal-600 to-orange-500 text-white p-6 rounded-lg mb-8">
          <h1 className="text-3xl font-bold">Applicant Information</h1>
          <p className="text-white/90 mt-2">
            Personal details for the primary applicant and any business partners
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Primary Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-700">
                  <User className="h-5 w-5" />
                  Primary Applicant Information
                </div>
                <AutoSaveIndicator status={autoSaveStatus} lastSaveTime={lastSaveTime} />
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
                      <Input {...field} placeholder="CEO, President, Owner, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownershipPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ownership Percentage</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="50"
                        onChange={(e) => field.onChange(e.target.value)}
                      />
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
                      <Input {...field} placeholder="John" />
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
                      <Input {...field} placeholder="Smith" />
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
                      <Input {...field} type="email" placeholder="john@personal.com" />
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
                      <Input {...field} type="tel" placeholder={isCanadian ? "(416) 555-0123" : "(555) 123-4567"} />
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
                      <Input {...field} type="date" />
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
                    <FormLabel>{isCanadian ? 'Social Insurance Number (SIN)' : 'Social Security Number (SSN)'}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={isCanadian ? "123 456 789" : "123-45-6789"} 
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
                        <SelectItem value="unknown">Unknown / Prefer not to say</SelectItem>
                        <SelectItem value="excellent_750_plus">Excellent (750+)</SelectItem>
                        <SelectItem value="good_700_749">Good (700-749)</SelectItem>
                        <SelectItem value="fair_650_699">Fair (650-699)</SelectItem>
                        <SelectItem value="poor_600_649">Poor (600-649)</SelectItem>
                        <SelectItem value="very_poor_below_600">Very Poor (Below 600)</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input {...field} placeholder="75000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-700">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="applicantAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main Street" />
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
                      <Input {...field} placeholder="Toronto" />
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
                    <FormLabel>{isCanadian ? 'Province' : 'State'}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={isCanadian ? "Ontario" : "California"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applicantPostalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isCanadian ? 'Postal Code' : 'ZIP Code'}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={isCanadian ? "M5V 3A8" : "90210"} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Relationship */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-700">
                <Percent className="h-5 w-5" />
                Business Relationship
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="yearsWithBusiness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years with Business</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" placeholder="5" />
                    </FormControl>
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

          {/* Partner Information (Conditional) */}
          {hasPartner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-700">
                  <UserPlus className="h-5 w-5" />
                  Business Partner Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="partnerFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Jane" />
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
                        <Input {...field} placeholder="Doe" />
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
                        <Input {...field} type="email" placeholder="jane@business.com" />
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
                        <Input {...field} type="tel" placeholder={isCanadian ? "(416) 555-0124" : "(555) 123-4568"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="partnerOwnershipPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Ownership %</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min="0" 
                          max="100" 
                          placeholder="25"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="partnerCreditScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Credit Score</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unknown">Unknown / Prefer not to say</SelectItem>
                          <SelectItem value="excellent_750_plus">Excellent (750+)</SelectItem>
                          <SelectItem value="good_700_749">Good (700-749)</SelectItem>
                          <SelectItem value="fair_650_699">Fair (650-699)</SelectItem>
                          <SelectItem value="poor_600_649">Poor (600-649)</SelectItem>
                          <SelectItem value="very_poor_below_600">Very Poor (Below 600)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="text-sm text-gray-500">
              {hasUnsavedChanges ? 'Saving...' : 'All changes saved'}
            </div>

            <Button
              type="submit"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}