import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormData } from '@/context/FormDataContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Building, 
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';

// Step 3 Schema for combined business + applicant info
const step3Schema = z.object({
  // Business Details
  businessName: z.string().min(1, 'Business name is required'),
  businessAddress: z.string().min(1, 'Business address is required'),
  businessCity: z.string().min(1, 'City is required'),
  businessState: z.string().min(1, 'State is required'),
  businessZipCode: z.string().min(5, 'Valid zip code is required'),
  businessPhone: z.string().min(10, 'Valid phone number is required'),
  businessEmail: z.string().email('Valid email is required'),
  businessWebsite: z.string().optional(),
  businessStructure: z.string().min(1, 'Business structure is required'),
  businessStartDate: z.string().min(1, 'Start date is required'),
  businessTaxId: z.string().min(9, 'Valid Tax ID is required'),
  businessDescription: z.string().min(10, 'Business description is required'),
  numberOfEmployees: z.string().min(1, 'Number of employees is required'),
  
  // Applicant Details
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().min(1, 'Title is required'),
  personalEmail: z.string().email('Valid email is required'),
  personalPhone: z.string().min(10, 'Valid phone number is required'),
  ownershipPercentage: z.string().min(1, 'Ownership percentage is required'),
});

type Step3FormData = z.infer<typeof step3Schema>;

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const BUSINESS_STRUCTURES = [
  'Sole Proprietorship',
  'Partnership',
  'LLC',
  'Corporation',
  'S-Corporation',
  'Non-Profit',
  'Other'
];

const EMPLOYEE_COUNTS = [
  '1-5 employees',
  '6-10 employees',
  '11-25 employees',
  '26-50 employees',
  '51-100 employees',
  '100+ employees'
];

/**
 * Step 3: Combined Business Details + Applicant Information
 * Per specification: Collect full user data before Step 4 submission
 */
export default function Step3ApplicantInfoCombined() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get existing data
  const businessInfo = state.step3BusinessDetails;

  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      // Business Details defaults
      businessName: businessInfo?.businessName || '',
      businessAddress: businessInfo?.businessAddress || '',
      businessCity: businessInfo?.businessCity || '',
      businessState: businessInfo?.businessState || '',
      businessZipCode: businessInfo?.businessZipCode || '',
      businessPhone: businessInfo?.businessPhone || '',
      businessEmail: businessInfo?.businessEmail || '',
      businessWebsite: businessInfo?.businessWebsite || '',
      businessStructure: businessInfo?.businessStructure || '',
      businessStartDate: businessInfo?.businessStartDate || '',
      businessTaxId: businessInfo?.businessTaxId || '',
      businessDescription: businessInfo?.businessDescription || '',
      numberOfEmployees: businessInfo?.numberOfEmployees || '',
      
      // Applicant Details defaults - using placeholder since this is combined step
      firstName: '',
      lastName: '',
      title: '',
      personalEmail: '',
      personalPhone: '',
      ownershipPercentage: '',
    },
  });

  const onSubmit = (data: Step3FormData) => {
    // console.log('📋 Step 3: Submitting combined business + applicant data:', data);
    
    // Split the data into business and applicant sections
    const businessData = {
      businessName: data.businessName,
      businessAddress: data.businessAddress,
      businessCity: data.businessCity,
      businessState: data.businessState,
      businessZipCode: data.businessZipCode,
      businessPhone: data.businessPhone,
      businessEmail: data.businessEmail,
      businessWebsite: data.businessWebsite,
      businessStructure: data.businessStructure,
      businessStartDate: data.businessStartDate,
      businessTaxId: data.businessTaxId,
      businessDescription: data.businessDescription,
      numberOfEmployees: data.numberOfEmployees,
      completed: true
    };

    const applicantData = {
      firstName: data.firstName,
      lastName: data.lastName,
      title: data.title,
      personalEmail: data.personalEmail,
      personalPhone: data.personalPhone,
      ownershipPercentage: data.ownershipPercentage,
      completed: true
    };

    // Update business details
    dispatch({
      type: 'UPDATE_STEP3',
      payload: businessData
    });

    // Store applicant data in step4 section for consistency with API
    dispatch({
      type: 'UPDATE_STEP4',
      payload: applicantData
    });

    saveToStorage();
    
    toast({
      title: "Step 3 Complete",
      description: "Business and applicant information saved successfully.",
    });

    // Navigate to Step 4 (Data Submission)
    setLocation('/apply/step-4');
  };

  const handleBack = () => {
    setLocation('/apply/step-2');
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600" />
            Step 3: Business & Applicant Information
          </CardTitle>
          <p className="text-gray-600 mt-1">
            Complete your business details and personal information
          </p>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  {...form.register('businessName')}
                  placeholder="Enter business name"
                />
                {form.formState.errors.businessName && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessName.message}</p>
                )}
              </div>

              {/* Business Structure */}
              <div className="space-y-2">
                <Label htmlFor="businessStructure">Business Structure *</Label>
                <Select
                  value={form.watch('businessStructure')}
                  onValueChange={(value) => form.setValue('businessStructure', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select structure" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_STRUCTURES.map((structure) => (
                      <SelectItem key={structure} value={structure}>
                        {structure}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.businessStructure && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessStructure.message}</p>
                )}
              </div>

              {/* Business Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="businessAddress">Business Address *</Label>
                <Input
                  id="businessAddress"
                  {...form.register('businessAddress')}
                  placeholder="Enter business address"
                />
                {form.formState.errors.businessAddress && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessAddress.message}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="businessCity">City *</Label>
                <Input
                  id="businessCity"
                  {...form.register('businessCity')}
                  placeholder="Enter city"
                />
                {form.formState.errors.businessCity && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessCity.message}</p>
                )}
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="businessState">State *</Label>
                <Select
                  value={form.watch('businessState')}
                  onValueChange={(value) => form.setValue('businessState', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.businessState && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessState.message}</p>
                )}
              </div>

              {/* Zip Code */}
              <div className="space-y-2">
                <Label htmlFor="businessZipCode">Zip Code *</Label>
                <Input
                  id="businessZipCode"
                  {...form.register('businessZipCode')}
                  placeholder="12345"
                  maxLength={10}
                />
                {form.formState.errors.businessZipCode && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessZipCode.message}</p>
                )}
              </div>

              {/* Business Phone */}
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone *</Label>
                <Input
                  id="businessPhone"
                  {...form.register('businessPhone')}
                  placeholder="(555) 123-4567"
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    form.setValue('businessPhone', formatted);
                  }}
                />
                {form.formState.errors.businessPhone && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessPhone.message}</p>
                )}
              </div>

              {/* Business Email */}
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email *</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  {...form.register('businessEmail')}
                  placeholder="business@company.com"
                />
                {form.formState.errors.businessEmail && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessEmail.message}</p>
                )}
              </div>

              {/* Business Website */}
              <div className="space-y-2">
                <Label htmlFor="businessWebsite">Business Website</Label>
                <Input
                  id="businessWebsite"
                  {...form.register('businessWebsite')}
                  placeholder="https://company.com"
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="businessStartDate">Business Start Date *</Label>
                <Input
                  id="businessStartDate"
                  type="date"
                  {...form.register('businessStartDate')}
                />
                {form.formState.errors.businessStartDate && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessStartDate.message}</p>
                )}
              </div>

              {/* Tax ID */}
              <div className="space-y-2">
                <Label htmlFor="businessTaxId">Tax ID (EIN/SSN) *</Label>
                <Input
                  id="businessTaxId"
                  {...form.register('businessTaxId')}
                  placeholder="12-3456789"
                />
                {form.formState.errors.businessTaxId && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessTaxId.message}</p>
                )}
              </div>

              {/* Number of Employees */}
              <div className="space-y-2">
                <Label htmlFor="numberOfEmployees">Number of Employees *</Label>
                <Select
                  value={form.watch('numberOfEmployees')}
                  onValueChange={(value) => form.setValue('numberOfEmployees', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_COUNTS.map((count) => (
                      <SelectItem key={count} value={count}>
                        {count}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.numberOfEmployees && (
                  <p className="text-sm text-red-600">{form.formState.errors.numberOfEmployees.message}</p>
                )}
              </div>

              {/* Business Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="businessDescription">Business Description *</Label>
                <Textarea
                  id="businessDescription"
                  {...form.register('businessDescription')}
                  placeholder="Describe your business activities..."
                  rows={3}
                />
                {form.formState.errors.businessDescription && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessDescription.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applicant Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Primary Applicant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...form.register('firstName')}
                  placeholder="Enter first name"
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...form.register('lastName')}
                  placeholder="Enter last name"
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title/Position *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="e.g., CEO, Owner, Manager"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Ownership Percentage */}
              <div className="space-y-2">
                <Label htmlFor="ownershipPercentage">Ownership Percentage *</Label>
                <Input
                  id="ownershipPercentage"
                  {...form.register('ownershipPercentage')}
                  placeholder="e.g., 100%"
                />
                {form.formState.errors.ownershipPercentage && (
                  <p className="text-sm text-red-600">{form.formState.errors.ownershipPercentage.message}</p>
                )}
              </div>

              {/* Personal Email */}
              <div className="space-y-2">
                <Label htmlFor="personalEmail">Personal Email *</Label>
                <Input
                  id="personalEmail"
                  type="email"
                  {...form.register('personalEmail')}
                  placeholder="personal@email.com"
                />
                {form.formState.errors.personalEmail && (
                  <p className="text-sm text-red-600">{form.formState.errors.personalEmail.message}</p>
                )}
              </div>

              {/* Personal Phone */}
              <div className="space-y-2">
                <Label htmlFor="personalPhone">Personal Phone *</Label>
                <Input
                  id="personalPhone"
                  {...form.register('personalPhone')}
                  placeholder="(555) 123-4567"
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    form.setValue('personalPhone', formatted);
                  }}
                />
                {form.formState.errors.personalPhone && (
                  <p className="text-sm text-red-600">{form.formState.errors.personalPhone.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <Button 
                type="submit"
                className="flex items-center gap-2"
              >
                Continue to Submission
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}