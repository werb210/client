import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from "date-fns";
import { useComprehensiveForm } from '@/context/ComprehensiveFormContext';

const applicantInfoSchema = z.object({
  applicantName: z.string().min(1, "Applicant name is required"),
  applicantEmail: z.string().email("Valid email is required"),
  titleInBusiness: z.string().min(1, "Title in business is required"),
  percentageOwnership: z.string().min(1, "Ownership percentage is required"),
  mobilePhone: z.string().min(1, "Mobile phone is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  sinSsn: z.string().min(1, "SIN/SSN is required"),
  // Optional applicant address
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  postalCode: z.string().optional(),
  // Conditional partner information
  partnerName: z.string().optional(),
  partnerEmail: z.string().optional(),
  partnerPhone: z.string().optional(),
  partnerOwnership: z.string().optional(),
  partnerTitle: z.string().optional(),
  partnerSinSsn: z.string().optional(),
});

type ApplicantInfoFormData = z.infer<typeof applicantInfoSchema>;

interface Step4Props {
  onNext: () => void;
  onPrevious: () => void;
}

export function Step4ApplicantInfo({ onNext, onPrevious }: Step4Props) {
  const { state, updateFormData } = useComprehensiveForm();
  
  const form = useForm<ApplicantInfoFormData>({
    resolver: zodResolver(applicantInfoSchema),
    defaultValues: {
      applicantName: state.formData.applicantName || '',
      applicantEmail: state.formData.applicantEmail || '',
      titleInBusiness: state.formData.titleInBusiness || '',
      percentageOwnership: state.formData.percentageOwnership || '',
      mobilePhone: state.formData.mobilePhone || '',
      dateOfBirth: state.formData.dateOfBirth || '',
      sinSsn: state.formData.sinSsn || '',
      streetAddress: state.formData.streetAddress || '',
      city: state.formData.city || '',
      stateProvince: state.formData.stateProvince || '',
      postalCode: state.formData.postalCode || '',
      partnerName: state.formData.partnerName || '',
      partnerEmail: state.formData.partnerEmail || '',
      partnerPhone: state.formData.partnerPhone || '',
      partnerOwnership: state.formData.partnerOwnership || '',
      partnerTitle: state.formData.partnerTitle || '',
      partnerSinSsn: state.formData.partnerSinSsn || '',
    },
  });

  // Regional configuration
  const isCanadian = state.formData.headquarters === 'CA';
  const regionalLabels = {
    stateProvince: isCanadian ? "Province" : "State",
    postalCode: isCanadian ? "Postal Code" : "ZIP Code",
    postalCodePlaceholder: isCanadian ? "A1A 1A1" : "12345-6789",
    sinSsn: isCanadian ? "SIN" : "SSN"
  };

  // State/Province options (same as Step 3)
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

  // Title options
  const titleOptions = [
    { value: "owner_operator", label: "Owner/Operator" },
    { value: "president", label: "President" },
    { value: "partner_shareholder", label: "Partner/Shareholder" },
    { value: "executive", label: "Executive" },
    { value: "financial_officer", label: "Financial Officer" }
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

  // Format SIN/SSN
  const formatSinSsn = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (isCanadian) {
      // Format as XXX XXX XXX
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/);
      if (match) {
        return `${match[1]} ${match[2]} ${match[3]}`;
      }
    } else {
      // Format as XXX-XX-XXXX
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);
      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
    }
    return value;
  };

  // Check if partner information should be shown
  const ownershipPercentage = form.watch("percentageOwnership");
  const showPartnerInfo = ownershipPercentage && parseInt(ownershipPercentage || "0") < 100;

  const onSubmit = (data: ApplicantInfoFormData) => {
    updateFormData(data);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applicant Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Primary Applicant Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Primary Applicant</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="applicantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicant Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applicantEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicant Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="titleInBusiness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title in Business *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {titleOptions.map((option) => (
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
                name="percentageOwnership"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentage Ownership *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 75" 
                        min="1" 
                        max="100" 
                        {...field} 
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
                name="mobilePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Phone *</FormLabel>
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
              <FormField
                control={form.control}
                name="sinSsn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{regionalLabels.sinSsn} *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={isCanadian ? "123 456 789" : "123-45-6789"}
                        {...field}
                        onChange={(e) => {
                          const formatted = formatSinSsn(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
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
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString())}
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

          {/* Optional Applicant Address */}
          <div className="border-t pt-4 mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Applicant Address (Optional)
            </h4>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stateProvince"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{regionalLabels.stateProvince}</FormLabel>
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
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{regionalLabels.postalCode}</FormLabel>
                      <FormControl>
                        <Input placeholder={regionalLabels.postalCodePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Conditional Partner Information */}
          {showPartnerInfo && (
            <div className="border-t pt-4 mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">
                Partner Information (Additional Owner)
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="partnerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter partner's full name" {...field} />
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
                          <Input type="email" placeholder="Enter partner's email" {...field} />
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
                  <FormField
                    control={form.control}
                    name="partnerOwnership"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Ownership %</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 25" 
                            min="1" 
                            max="99" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partnerTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Title</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select title" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {titleOptions.map((option) => (
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

                <FormField
                  control={form.control}
                  name="partnerSinSsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner {regionalLabels.sinSsn}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isCanadian ? "123 456 789" : "123-45-6789"}
                          className="max-w-xs"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatSinSsn(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

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