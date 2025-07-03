import React from 'react';
import { useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useFormData } from '@/context/FormDataContext';
import {
  formatPhoneNumber,
  formatPostalCode,
  formatSSN,
  getRegionalLabels,
  getStateProvinceOptions,
  getTitleOptions,
  isCanadianBusiness
} from '@/lib/regionalFormatting';

interface Step4Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step4ApplicantInfo({ onNext, onBack }: Step4Props) {
  const form = useFormContext();
  const { state } = useFormData();
  
  // Get business location from Step 1 FormDataContext to determine regional field definitions
  const businessLocation = state.step1FinancialProfile?.businessLocation || 'united-states';
  const isCanadian = isCanadianBusiness(businessLocation);
  
  console.log(`[STEP4] Business Location: ${businessLocation}, Is Canadian: ${isCanadian}`);
  
  const regionalLabels = getRegionalLabels(isCanadian);
  const stateProvinceOptions = getStateProvinceOptions(isCanadian);
  const titleOptions = getTitleOptions();

  // Check if partner information should be shown
  const showPartnerInfo = () => {
    const ownership = form.watch("percentageOwnership");
    return ownership && parseInt(ownership || "0") < 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applicant Information</CardTitle>
        <p className="text-sm text-gray-600">All fields are optional but may help with processing</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Applicant Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Applicant Email */}
          <FormField
            control={form.control}
            name="applicantEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Applicant Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title in Business - Dropdown */}
          <FormField
            control={form.control}
            name="titleInBusiness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title in Business</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your title" />
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

          {/* Percentage Ownership */}
          <FormField
            control={form.control}
            name="percentageOwnership"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Percentage Ownership</FormLabel>
                <FormControl>
                  <Input placeholder="Enter ownership percentage" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mobile Phone with Formatting */}
          <FormField
            control={form.control}
            name="mobilePhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Phone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter mobile phone" 
                    {...field}
                    onChange={(e) => field.onChange(formatPhoneNumber(e.target.value, isCanadian))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth - Calendar Picker */}
          <FormField
            control={form.control}
            name="applicantBirthdate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
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

          {/* SSN/SIN with Regional Formatting */}
          <FormField
            control={form.control}
            name="applicantSSN"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{regionalLabels.sin}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={`Enter ${regionalLabels.sin}`} 
                    {...field}
                    onChange={(e) => field.onChange(formatSSN(e.target.value || "", isCanadian))}
                    maxLength={11}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Applicant Address Section */}
        <div className="border-t pt-4 mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Applicant Address (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Street Address */}
            <FormField
              control={form.control}
              name="applicantStreetAddress"
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

            {/* City */}
            <FormField
              control={form.control}
              name="applicantCity"
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

            {/* State/Province */}
            <FormField
              control={form.control}
              name="applicantState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{regionalLabels.stateProvince}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            {/* Postal/ZIP Code */}
            <FormField
              control={form.control}
              name="applicantPostalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{regionalLabels.postalCode}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={regionalLabels.postalCodePlaceholder} 
                      {...field}
                      onChange={(e) => field.onChange(formatPostalCode(e.target.value, isCanadian))}
                      maxLength={isCanadian ? 7 : 10}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Conditional Partner Information */}
        {showPartnerInfo() && (
          <div className="border-t pt-4 mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Partner Information (Additional Owner)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Partner First Name */}
              <FormField
                control={form.control}
                name="partnerFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter partner's first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Partner Last Name */}
              <FormField
                control={form.control}
                name="partnerLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter partner's last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Partner Email */}
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

              {/* Partner Phone */}
              <FormField
                control={form.control}
                name="partnerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Phone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter partner's phone" 
                        {...field}
                        onChange={(e) => field.onChange(formatPhoneNumber(e.target.value, isCanadian))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Partner Ownership */}
              <FormField
                control={form.control}
                name="partnerOwnership"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Ownership %</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter partner's ownership percentage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Partner Title */}
              <FormField
                control={form.control}
                name="partnerTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Title</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select partner's title" />
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

              {/* Partner SSN/SIN */}
              <FormField
                control={form.control}
                name="partnerSSN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner {regionalLabels.sin}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={`Enter partner's ${regionalLabels.sin}`} 
                        {...field}
                        onChange={(e) => field.onChange(formatSSN(e.target.value || "", isCanadian))}
                        maxLength={11}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            type="button" 
            onClick={onNext}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}