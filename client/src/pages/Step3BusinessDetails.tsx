import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, MapPin, Phone, Users, Calendar, FileText, DollarSign } from 'lucide-react';

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

interface Step3BusinessDetailsProps {
  formData: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function Step3BusinessDetails({ formData, onNext, onBack }: Step3BusinessDetailsProps) {
  const form = useForm<BusinessDetailsFormData>({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: {
      businessOperatingName: formData.businessOperatingName || '',
      businessLegalName: formData.businessLegalName || '',
      businessAddress: formData.businessAddress || '',
      businessCity: formData.businessCity || '',
      businessStateProvince: formData.businessStateProvince || '',
      businessPostalCode: formData.businessPostalCode || '',
      businessPhone: formData.businessPhone || '',
      employeeCount: formData.employeeCount || '',
      businessStartDate: formData.businessStartDate || '',
      businessStructure: formData.businessStructure || '',
      estimatedRevenue: formData.estimatedRevenue || '',
      businessWebsite: formData.businessWebsite || '',
      businessCountry: formData.businessCountry || '',
    }
  });

  // Determine if Canadian based on headquarters selection
  const isCanadian = formData.headquarters === "canada";

  // Regional labels and options
  const regionalLabels = {
    stateProvince: isCanadian ? "Province" : "State",
    postalCode: isCanadian ? "Postal Code" : "ZIP Code",
    postalCodePlaceholder: isCanadian ? "A1A 1A1" : "12345-6789"
  };

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
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Generate year options for business start date
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

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
    onNext(data);
  };

  // Check if all required fields are filled
  const watchedFields = form.watch();
  const requiredFields = [
    'businessOperatingName', 'businessLegalName', 'businessAddress', 'businessCity',
    'businessStateProvince', 'businessPostalCode', 'businessPhone', 'employeeCount',
    'businessStartDate', 'businessStructure', 'estimatedRevenue'
  ];
  const canContinue = requiredFields.every(field => watchedFields[field as keyof BusinessDetailsFormData]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Step 3: Business Details
          </CardTitle>
          <CardDescription>
            Please provide comprehensive information about your business including legal details, location, and structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Business Names Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessOperatingName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Business Operating Name *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ABC Marketing Solutions" {...field} />
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
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Business Legal Name *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ABC Marketing Solutions Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Business Address Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Business Address
                </h4>
                
                <FormField
                  control={form.control}
                  name="businessAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 123 Main Street, Suite 100" {...field} />
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
                          <Input placeholder="e.g., Toronto" {...field} />
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
                              <SelectValue placeholder={`Select ${regionalLabels.stateProvince}`} />
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

              {/* Business Contact Section */}
              <FormField
                control={form.control}
                name="businessPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Business Phone *
                    </FormLabel>
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

              {/* Business Structure Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employeeCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Employee Count *
                      </FormLabel>
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

                <FormField
                  control={form.control}
                  name="businessStructure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Business Structure *
                      </FormLabel>
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
              </div>

              {/* Business Start Date Section */}
              <FormField
                control={form.control}
                name="businessStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Business Start Date *
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm text-gray-600">Year</Label>
                        <Select onValueChange={(year) => {
                          const currentDate = field.value ? new Date(field.value) : new Date();
                          const month = currentDate.getMonth() + 1;
                          const newDate = new Date(parseInt(year), month - 1, 1);
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
                          const currentDate = field.value ? new Date(field.value) : new Date();
                          const year = currentDate.getFullYear();
                          const newDate = new Date(year, parseInt(month) - 1, 1);
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

              {/* Revenue Section */}
              <FormField
                control={form.control}
                name="estimatedRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      This Year's Estimated Revenue *
                    </FormLabel>
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

              {/* Optional Fields Section */}
              <div className="border-t pt-6 mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Optional Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="businessWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Website</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., www.yourcompany.com" {...field} />
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
                        <FormLabel>Business Country</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Canada" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={onBack}>
                  Back
                </Button>
                <Button type="submit" disabled={!canContinue}>
                  Continue to Step 4
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}