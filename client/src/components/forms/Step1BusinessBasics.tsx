import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema, type ApplicationForm } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building2, DollarSign, TrendingUp } from 'lucide-react';

interface Step1Props {
  defaultValues?: Partial<ApplicationForm>;
  onSubmit: (data: Partial<ApplicationForm>) => void;
  onNext: () => void;
}

export function Step1BusinessBasics({ defaultValues, onSubmit, onNext }: Step1Props) {
  const form = useForm<ApplicationForm>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });

  const handleSubmit = (data: Partial<ApplicationForm>) => {
    onSubmit(data);
    onNext();
  };

  return (
    <div className="container-modern py-modern-2xl space-y-modern-2xl">
      <div className="text-center">
        <h1 className="heading-modern-h1 text-modern-primary">Business Basics</h1>
        <p className="body-modern-large text-modern-secondary mt-modern-sm">
          Tell us about your business and funding needs
        </p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-modern-2xl">
          {/* Business Location */}
          <Card className="card-modern">
            <CardHeader className="p-modern-xl">
              <CardTitle className="heading-modern-h3 flex items-center gap-modern-md">
                <Building2 className="h-5 w-5 text-brand-blue-600" />
                Business Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-modern-xl space-y-modern-lg">
              <FormField
                control={form.control}
                name="headquarters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Headquarters</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your headquarters location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="headquartersState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., California, Ontario" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Technology, Manufacturing, Retail" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Funding Requirements */}
          <Card className="card-modern">
            <CardHeader className="p-modern-xl">
              <CardTitle className="heading-modern-h3 flex items-center gap-modern-md">
                <DollarSign className="h-5 w-5 text-brand-blue-600" />
                Funding Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-modern-xl space-y-modern-lg">
              <FormField
                control={form.control}
                name="lookingFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="body-modern-small font-medium text-modern-primary">What are you looking for?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="form-modern-input">
                          <SelectValue placeholder="Select funding type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="capital">Working Capital</SelectItem>
                        <SelectItem value="equipment">Equipment Financing</SelectItem>
                        <SelectItem value="both">Both Capital & Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="body-modern-small text-error-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fundingAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="body-modern-small font-medium text-modern-primary">Funding Amount Needed</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="e.g., 100000"
                        className="form-modern-input"
                      />
                    </FormControl>
                    <FormMessage className="body-modern-small text-error-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fundsPurpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Funds</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe how you plan to use the funding..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                Business Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="salesHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How long have you been generating sales?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sales history" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="<1yr">Less than 1 year</SelectItem>
                        <SelectItem value="1-2yr">1-2 years</SelectItem>
                        <SelectItem value="2+yr">More than 2 years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="revenueLastYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue Last Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="averageMonthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Monthly Revenue</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accountsReceivableBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accounts Receivable Balance</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fixedAssetsValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fixed Assets Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="bg-teal-600 hover:bg-teal-700">
              Continue to Products
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}