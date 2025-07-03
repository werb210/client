import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  getRegionalLabels,
  getStateProvinceOptions,
  formatPhoneNumber,
  formatPostalCode,
  formatSSN,
  isCanadianBusiness
} from '@/lib/regionalFormatting';

// Test schema
const testSchema = z.object({
  step1FinancialProfile: z.object({
    businessLocation: z.string(),
  }),
  businessPhone: z.string().optional(),
  businessPostalCode: z.string().optional(),
  businessState: z.string().optional(),
  businessStructure: z.string().optional(),
  personalPhone: z.string().optional(),
  personalPostalCode: z.string().optional(),
  personalState: z.string().optional(),
  socialSecurityNumber: z.string().optional(),
});

export default function RegionalFieldsTest() {
  const [businessLocation, setBusinessLocation] = useState('united-states');
  
  const form = useForm({
    resolver: zodResolver(testSchema),
    defaultValues: {
      step1FinancialProfile: {
        businessLocation: 'united-states'
      },
      businessPhone: '',
      businessPostalCode: '',
      businessState: '',
      businessStructure: '',
      personalPhone: '',
      personalPostalCode: '',
      personalState: '',
      socialSecurityNumber: '',
    },
  });

  const isCanadian = isCanadianBusiness(businessLocation);
  const regionalLabels = getRegionalLabels(isCanadian);
  const stateProvinceOptions = getStateProvinceOptions(isCanadian);

  const handleLocationChange = (value: string) => {
    setBusinessLocation(value);
    form.setValue('step1FinancialProfile.businessLocation', value);
    // Clear regional fields when location changes
    form.setValue('businessState', '');
    form.setValue('personalState', '');
    form.setValue('businessStructure', '');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Regional Field Definitions Test</CardTitle>
            <p className="text-sm text-gray-600">
              All fields dynamically adapt based on "Business Location" from Step 1
            </p>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <div className="space-y-6">
                {/* Business Location Selector */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Step 1: Business Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="step1FinancialProfile.businessLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Business Location</FormLabel>
                          <Select onValueChange={handleLocationChange} value={businessLocation}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select business location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="united-states">United States</SelectItem>
                              <SelectItem value="canada">Canada</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Regional Field Examples */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Business Fields */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Step 3: Business Details</CardTitle>
                      <p className="text-sm text-gray-600">Fields adapt to {regionalLabels.country}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Business Phone */}
                      <FormField
                        control={form.control}
                        name="businessPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Phone</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={`Enter business phone ${regionalLabels.phoneExample}`} 
                                {...field}
                                onChange={(e) => field.onChange(formatPhoneNumber(e.target.value, isCanadian))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Business Postal Code */}
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

                      {/* Business State/Province */}
                      <FormField
                        control={form.control}
                        name="businessState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business {regionalLabels.stateProvince}</FormLabel>
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

                      {/* Business Structure */}
                      <FormField
                        control={form.control}
                        name="businessStructure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Structure ({regionalLabels.country})</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select business structure" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {regionalLabels.businessStructures.map((structure) => (
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
                    </CardContent>
                  </Card>

                  {/* Personal/Applicant Fields */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Step 4: Applicant Information</CardTitle>
                      <p className="text-sm text-gray-600">Personal fields for {regionalLabels.country}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Personal Phone */}
                      <FormField
                        control={form.control}
                        name="personalPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personal Phone</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={`Enter personal phone ${regionalLabels.phoneExample}`} 
                                {...field}
                                onChange={(e) => field.onChange(formatPhoneNumber(e.target.value, isCanadian))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Personal Postal Code */}
                      <FormField
                        control={form.control}
                        name="personalPostalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personal {regionalLabels.postalCode}</FormLabel>
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

                      {/* Personal State/Province */}
                      <FormField
                        control={form.control}
                        name="personalState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personal {regionalLabels.stateProvince}</FormLabel>
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

                      {/* SSN/SIN */}
                      <FormField
                        control={form.control}
                        name="socialSecurityNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{regionalLabels.sin}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={isCanadian ? "Enter SIN (XXX XXX XXX)" : "Enter SSN (XXX-XX-XXXX)"} 
                                {...field}
                                onChange={(e) => field.onChange(formatSSN(e.target.value, isCanadian))}
                                maxLength={isCanadian ? 11 : 11}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Regional Configuration Display */}
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Current Regional Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Country:</strong> {regionalLabels.country}</p>
                        <p><strong>Currency:</strong> {regionalLabels.currency} ({regionalLabels.currencySymbol})</p>
                        <p><strong>Phone Format:</strong> {regionalLabels.phoneFormat}</p>
                        <p><strong>Postal Code Format:</strong> {regionalLabels.postalCodePlaceholder}</p>
                      </div>
                      <div>
                        <p><strong>{regionalLabels.stateProvince} Options:</strong> {stateProvinceOptions.length} options</p>
                        <p><strong>Business Structures:</strong> {regionalLabels.businessStructures.length} types</p>
                        <p><strong>Tax ID Format:</strong> {regionalLabels.industryTerms.taxIdFormat}</p>
                        <p><strong>Personal ID:</strong> {regionalLabels.sin}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Test Actions */}
                <div className="flex justify-center space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => handleLocationChange('united-states')}
                    className={businessLocation === 'united-states' ? 'bg-blue-100' : ''}
                  >
                    Test US Configuration
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => handleLocationChange('canada')}
                    className={businessLocation === 'canada' ? 'bg-blue-100' : ''}
                  >
                    Test Canadian Configuration
                  </Button>
                </div>
              </div>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}