import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  formatPhoneNumber,
  formatPostalCode,
  formatCurrency,
  getRegionalLabels,
  getStateProvinceOptions
} from '@/lib/regionalFormatting';

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
  isCanadian?: boolean;
}

export function Step3BusinessDetails({ onNext, onBack, isCanadian = false }: Step3Props) {
  const form = useFormContext();
  const regionalLabels = getRegionalLabels(isCanadian);
  const stateProvinceOptions = getStateProvinceOptions(isCanadian);

  // Validation for Step 3 - all fields required except website
  const canContinue = () => {
    const values = form.getValues();
    const requiredFields = [
      'operatingName', 'legalName', 'businessStreetAddress', 'businessCity',
      'businessState', 'businessPostalCode', 'businessPhone', 'businessStructure',
      'businessStartDate', 'employeeCount', 'estimatedYearlyRevenue'
    ];
    return requiredFields.every(field => values[field]?.trim?.() || values[field]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Details</CardTitle>
        <p className="text-sm text-gray-600">Complete information about your business</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Operating Name - Required */}
          <FormField
            control={form.control}
            name="operatingName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Operating Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter business operating name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Legal Name - Required */}
          <FormField
            control={form.control}
            name="legalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Legal Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter business legal name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Street Address - Required */}
          <FormField
            control={form.control}
            name="businessStreetAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter business street address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business City - Required */}
          <FormField
            control={form.control}
            name="businessCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter business city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business State/Province - Required Dropdown */}
          <FormField
            control={form.control}
            name="businessState"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business {regionalLabels.stateProvince}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select business ${regionalLabels.stateProvince.toLowerCase()}`} />
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

          {/* Business Postal/ZIP Code - Required with Formatting */}
          <FormField
            control={form.control}
            name="businessPostalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business {regionalLabels.postalCode}</FormLabel>
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

          {/* Business Phone - Required with Formatting */}
          <FormField
            control={form.control}
            name="businessPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Phone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter business phone" 
                    {...field}
                    onChange={(e) => field.onChange(formatPhoneNumber(e.target.value, isCanadian))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Website - Optional */}
          <FormField
            control={form.control}
            name="businessWebsite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Website (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter website URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Structure - Required Dropdown */}
          <FormField
            control={form.control}
            name="businessStructure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Structure</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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

          {/* Business Start Date - Required Year/Month Selectors */}
          <FormField
            control={form.control}
            name="businessStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Start Date</FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FormLabel className="text-sm text-gray-600">Year</FormLabel>
                    <Select 
                      onValueChange={(year) => {
                        const currentMonth = field.value ? new Date(field.value).getMonth() + 1 : 1;
                        const newDate = new Date(parseInt(year), currentMonth - 1, 1);
                        field.onChange(newDate.toISOString());
                      }}
                      value={field.value ? new Date(field.value).getFullYear().toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: new Date().getFullYear() - 1950 + 1 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FormLabel className="text-sm text-gray-600">Month</FormLabel>
                    <Select 
                      onValueChange={(month) => {
                        const currentYear = field.value ? new Date(field.value).getFullYear() : new Date().getFullYear();
                        const newDate = new Date(currentYear, parseInt(month) - 1, 1);
                        field.onChange(newDate.toISOString());
                      }}
                      value={field.value ? (new Date(field.value).getMonth() + 1).toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[
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
                        ].map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
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

          {/* Employee Count - Required Dropdown */}
          <FormField
            control={form.control}
            name="employeeCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Count</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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

          {/* This Year's Estimated Revenue - Required with Currency Formatting */}
          <FormField
            control={form.control}
            name="estimatedYearlyRevenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>This Year's Estimated Revenue</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter estimated revenue (e.g., 750,000)" 
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, '');
                      const formatted = formatCurrency(value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
            disabled={!canContinue()}
            className={`${!canContinue() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}