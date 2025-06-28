import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, Save, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const businessDetailsSchema = z.object({
  businessStructure: z.string().min(1, 'Please select your business structure'),
  incorporationDate: z.date({
    required_error: "Please select your incorporation date",
  }),
  businessAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province/State is required'),
    postalCode: z.string().min(1, 'Postal/ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  taxId: z.string().min(1, 'Business number/EIN is required').regex(
    /^[\d\-\s]+$/,
    'Please enter a valid business number or EIN (numbers, spaces, and dashes only)'
  ),
});

type BusinessDetailsFormData = z.infer<typeof businessDetailsSchema>;

const businessStructures = [
  { value: 'sole-proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'Limited Liability Company (LLC)' },
  { value: 'non-profit', label: 'Non-Profit Organization' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'other', label: 'Other' },
];

const countries = [
  { value: 'CA', label: 'Canada' },
  { value: 'US', label: 'United States' },
];

const canadianProvinces = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
];

const usStates = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  // Add more states as needed
];

export default function Step3BusinessDetails() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<BusinessDetailsFormData>({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: {
      businessStructure: state.step3BusinessDetails?.businessStructure || '',
      incorporationDate: state.step3BusinessDetails?.incorporationDate 
        ? new Date(state.step3BusinessDetails.incorporationDate) 
        : undefined,
      businessAddress: {
        street: state.step3BusinessDetails?.businessAddress?.street || '',
        city: state.step3BusinessDetails?.businessAddress?.city || '',
        province: state.step3BusinessDetails?.businessAddress?.province || '',
        postalCode: state.step3BusinessDetails?.businessAddress?.postalCode || '',
        country: state.step3BusinessDetails?.businessAddress?.country || 'CA',
      },
      taxId: state.step3BusinessDetails?.taxId || '',
    },
  });

  const selectedCountry = form.watch('businessAddress.country');
  const getProvinceOptions = () => {
    return selectedCountry === 'US' ? usStates : canadianProvinces;
  };

  const getTaxIdLabel = () => {
    return selectedCountry === 'US' ? 'EIN (Employer Identification Number)' : 'Business Number';
  };

  const onSubmit = (data: BusinessDetailsFormData) => {
    // Update context with form data
    dispatch({ 
      type: 'UPDATE_STEP3', 
      payload: {
        ...data,
        incorporationDate: data.incorporationDate.toISOString(),
      }
    });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 4 });
    
    // Save to storage
    saveToStorage();
    
    toast({
      title: "Business Details Saved",
      description: "Your business information has been saved. Proceeding to next step.",
    });

    // Navigate to Step 4
    setLocation('/step4-additional-details');
  };

  const handleSaveProgress = () => {
    const currentData = form.getValues();
    
    // Update context with current form data (even if incomplete)
    dispatch({ 
      type: 'UPDATE_STEP3', 
      payload: {
        ...currentData,
        incorporationDate: currentData.incorporationDate?.toISOString(),
      }
    });
    
    // Save to storage
    saveToStorage();
    
    toast({
      title: "Progress Saved",
      description: "Your current progress has been saved.",
    });
  };

  const handleBack = () => {
    setLocation('/recommendations');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Details</h1>
          <p className="text-gray-600 mt-2">
            Please provide your business registration and address information
          </p>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Step 3 of 4</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Registration Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Structure */}
                <FormField
                  control={form.control}
                  name="businessStructure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Structure</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your business structure" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {businessStructures.map((structure) => (
                            <SelectItem key={structure.value} value={structure.value}>
                              {structure.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Incorporation Date */}
                <FormField
                  control={form.control}
                  name="incorporationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Incorporation/Registration Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
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

                {/* Country */}
                <FormField
                  control={form.control}
                  name="businessAddress.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Street Address */}
                <FormField
                  control={form.control}
                  name="businessAddress.street"
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

                {/* City and Province/State Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="businessAddress.city"
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
                    name="businessAddress.province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {selectedCountry === 'US' ? 'State' : 'Province'}
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${selectedCountry === 'US' ? 'state' : 'province'}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getProvinceOptions().map((option) => (
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

                {/* Postal Code */}
                <FormField
                  control={form.control}
                  name="businessAddress.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedCountry === 'US' ? 'ZIP Code' : 'Postal Code'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={selectedCountry === 'US' ? '12345' : 'A1A 1A1'} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tax ID */}
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getTaxIdLabel()}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={selectedCountry === 'US' ? '12-3456789' : '123456789'} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Next Step
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