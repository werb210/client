import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step3Schema, type ApplicationForm } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Building, MapPin, Calendar as CalendarIcon, Phone, Users, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Step3Props {
  defaultValues?: Partial<ApplicationForm>;
  onSubmit: (data: Partial<ApplicationForm>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step3BusinessDetails({ defaultValues, onSubmit, onNext, onPrevious }: Step3Props) {
  const form = useForm<ApplicationForm>({
    resolver: zodResolver(step3Schema),
    defaultValues,
  });

  const handleSubmit = (data: Partial<ApplicationForm>) => {
    onSubmit(data);
    onNext();
  };

  const businessStructureOptions = [
    'Sole Proprietorship',
    'Partnership',
    'Limited Liability Company (LLC)',
    'Corporation (C-Corp)',
    'S Corporation',
    'Non-Profit Organization',
    'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Details</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Provide detailed information about your business structure and operations
        </p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Business Names */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-teal-600" />
                Business Names
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="operatingName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating Name (DBA)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="The name you use to do business" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Business Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Official registered business name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-600" />
                Business Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="businessStreetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Business Street" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="businessCity"
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
                  name="businessState"
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
                  name="businessPostalCode"
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

              <FormField
                control={form.control}
                name="businessCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="United States, Canada, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact & Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-teal-600" />
                Contact & Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="businessPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(555) 123-4567" />
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
                    <FormLabel>Business Website (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://www.yourbusiness.com" />
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
                    <FormLabel>Number of Employees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Including yourself"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Structure & History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-teal-600" />
                Business Structure & History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="businessStructure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Structure</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business structure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessStructureOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
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
                name="businessStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Business Start Date</FormLabel>
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
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
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

              <FormField
                control={form.control}
                name="estimatedYearlyRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Yearly Revenue (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Annual revenue estimate"
                      />
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
              Continue to Applicant Details
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}