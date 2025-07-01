import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useComprehensiveForm } from '@/context/ComprehensiveFormContext';

const businessDetailsSchema = z.object({
  businessOperatingName: z.string().min(1, "Business operating name is required"),
  businessLegalName: z.string().min(1, "Business legal name is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  businessCity: z.string().min(1, "Business city is required"),
  businessStateProvince: z.string().min(1, "State/Province is required"),
  businessPostalCode: z.string().min(1, "Postal code is required"),
  businessPhone: z.string().min(1, "Business phone is required"),
  employeeCount: z.string().min(1, "Employee count is required"),
  businessStartDate: z.string().min(1, "Business start date is required"),
  businessStructure: z.string().min(1, "Business structure is required"),
  estimatedRevenue: z.string().min(1, "Estimated revenue is required"),
  businessWebsite: z.string().optional(),
  businessCountry: z.string().optional(),
});

type BusinessDetailsFormData = z.infer<typeof businessDetailsSchema>;

interface Step3Props {
  onNext: () => void;
  onPrevious: () => void;
}

export function Step3BusinessDetails({ onNext, onPrevious }: Step3Props) {
  const { state, updateFormData } = useComprehensiveForm();
  
  const form = useForm<BusinessDetailsFormData>({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: {
      businessOperatingName: state.formData.businessOperatingName || '',
      businessLegalName: state.formData.businessLegalName || '',
      businessAddress: state.formData.businessAddress || '',
      businessCity: state.formData.businessCity || '',
      businessStateProvince: state.formData.businessStateProvince || '',
      businessPostalCode: state.formData.businessPostalCode || '',
      businessPhone: state.formData.businessPhone || '',
      employeeCount: state.formData.employeeCount || '',
      businessStartDate: state.formData.businessStartDate || '',
      businessStructure: state.formData.businessStructure || '',
      estimatedRevenue: state.formData.estimatedRevenue || '',
      businessWebsite: state.formData.businessWebsite || '',
      businessCountry: state.formData.businessCountry || '',
    },
  });

  // Regional configuration based on headquarters
  const isCanadian = state.formData.headquarters === 'CA';
  const regionalLabels = {
    stateProvince: isCanadian ? "Province" : "State",
    postalCode: isCanadian ? "Postal Code" : "ZIP Code",
    postalCodePlaceholder: isCanadian ? "A1A 1A1" : "12345-6789"
  };

  // State/Province options
  const stateProvinceOptions = isCanadian ? [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "NS", label: "Nova Scotia" },
    { value: "NT", label: "Northwest Territories" },
    { value: "NU", label: "Nunavut" },
    { value: "ON", label: "Ontario" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
    { value: "YT", label: "Yukon" }
  ] : [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "DC", label: "District of Columbia" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" },
    { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" },
    { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" },
    { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" },
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
    { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" },
    { value: "WY", label: "Wyoming" }
  ];

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  // Format currency
  const formatCurrency = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, '');
    const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formatted;
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  // Generate month options
  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  const onSubmit = (data: BusinessDetailsFormData) => {
    updateFormData(data);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="businessOperatingName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Operating Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter operating name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessLegalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Legal Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter legal name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Business Address */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="businessAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street address" {...field} />
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
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessStateProvince"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{regionalLabels.stateProvince} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${regionalLabels.stateProvince.toLowerCase()}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stateProvinceOptions.map((option) => (
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
                name="businessPostalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{regionalLabels.postalCode} *</FormLabel>
                    <FormControl>
                      <Input placeholder={regionalLabels.postalCodePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Business Phone */}
          <FormField
            control={form.control}
            name="businessPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Phone *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(555) 123-4567" 
                    {...field}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Employee Count */}
          <FormField
            control={form.control}
            name="employeeCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Count *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee count" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1_to_5">1-5 employees</SelectItem>
                    <SelectItem value="6_to_10">6-10 employees</SelectItem>
                    <SelectItem value="11_to_25">11-25 employees</SelectItem>
                    <SelectItem value="26_to_50">26-50 employees</SelectItem>
                    <SelectItem value="51_to_100">51-100 employees</SelectItem>
                    <SelectItem value="over_100">Over 100 employees</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Start Date */}
          <FormField
            control={form.control}
            name="businessStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Start Date *</FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-gray-600">Year</Label>
                    <Select onValueChange={(year) => {
                      const currentMonth = field.value ? new Date(field.value).getMonth() + 1 : 1;
                      const newDate = new Date(parseInt(year), currentMonth - 1, 1);
                      field.onChange(newDate.toISOString());
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Month</Label>
                    <Select onValueChange={(month) => {
                      const currentYear = field.value ? new Date(field.value).getFullYear() : new Date().getFullYear();
                      const newDate = new Date(currentYear, parseInt(month) - 1, 1);
                      field.onChange(newDate.toISOString());
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Structure */}
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
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estimated Revenue */}
          <FormField
            control={form.control}
            name="estimatedRevenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>This Year's Estimated Revenue *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter estimated revenue (e.g., 750,000)" 
                    {...field}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Optional Fields */}
          <div className="border-t pt-4 mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Optional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="businessWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Country (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button 
              type="button"
              variant="outline" 
              onClick={onPrevious}
              className="min-w-[120px]"
            >
              Previous
            </Button>
            <Button 
              type="submit"
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}