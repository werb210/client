import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Step4Schema, type ApplicationForm } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { User, MapPin, Calendar as CalendarIcon, Phone, UserPlus, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { z } from 'zod';

type Step4FormData = z.infer<typeof Step4Schema>;

interface Step4Props {
  defaultValues?: Partial<ApplicationForm>;
  onSubmit: (data: Partial<ApplicationForm>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step4ApplicantDetails({ defaultValues, onSubmit, onNext, onPrevious }: Step4Props) {
  const form = useForm<Step4FormData>({
    resolver: zodResolver(Step4Schema),
    defaultValues: {
      title: defaultValues?.title || '',
      firstName: defaultValues?.firstName || '',
      lastName: defaultValues?.lastName || '',
      personalEmail: defaultValues?.personalEmail || '',
      personalPhone: defaultValues?.personalPhone || '',
      dateOfBirth: defaultValues?.dateOfBirth || '',
      socialSecurityNumber: defaultValues?.socialSecurityNumber || '',
      ownershipPercentage: defaultValues?.ownershipPercentage || '',
      creditScore: defaultValues?.creditScore || 'unknown',
      personalAnnualIncome: defaultValues?.personalAnnualIncome || '',
      applicantAddress: defaultValues?.applicantAddress || '',
      applicantCity: defaultValues?.applicantCity || '',
      applicantState: defaultValues?.applicantState || '',
      applicantPostalCode: defaultValues?.applicantPostalCode || '',
      yearsWithBusiness: defaultValues?.yearsWithBusiness || '',
      previousLoans: defaultValues?.previousLoans || 'no',
      bankruptcyHistory: defaultValues?.bankruptcyHistory || 'no',
    },
  });

  const watchOwnership = form.watch('ownershipPercentage');
  const hasPartner = watchOwnership && parseFloat(watchOwnership) < 100;

  const handleSubmit = (data: Step4FormData) => {
    onSubmit(data);
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Applicant Details</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Information about the primary applicant and any business partners
        </p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Primary Applicant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-teal-600" />
                Primary Applicant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="CEO, President, etc." />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="personalEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="john@email.com" />
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
                        <Input {...field} placeholder="(555) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="socialSecurityNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SSN / SIN</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="XXX-XX-XXXX" />
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
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title in Business</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CEO, Owner, President, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Applicant Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-600" />
                Applicant Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="applicantAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Main Street" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="applicantCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City" />
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
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="State or Province" />
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
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="12345 or A1B 2C3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Partner (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-teal-600" />
                Business Partner (Optional)
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                If you have a business partner with significant ownership, provide their details
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="partnerLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Smith" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="partnerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(555) 987-6543" />
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
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              <FormField
                control={form.control}
                name="partnerSinSsn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner SSN / SIN</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="XXX-XX-XXXX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button type="submit" size="lg" className="bg-teal-600 hover:bg-teal-700">
              Continue to Documents
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}