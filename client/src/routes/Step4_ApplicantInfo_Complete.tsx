import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useFormDataContext } from "@/context/FormDataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPhoneNumber, formatPostalCode as formatPostalCodeHelper, formatSSN as formatSSNHelper, isCanadianBusiness, getStateProvinceOptions } from "@/lib/regionalFormatting";
import { normalizePhone, formatPhoneDisplay, isValidPhone, getCountryFromBusinessLocation } from "@/lib/phoneUtils";
import { extractUuid } from "@/lib/uuidUtils";
import { staffApi } from "@/api/staffApi";
import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { StepHeader } from "@/components/StepHeader";

// Unified Step 4 Schema - matches ApplicationForm interface
const step4Schema = z.object({
  // Primary Applicant Information
  applicantFirstName: z.string().optional(),
  applicantLastName: z.string().optional(),
  applicantEmail: z.string().email().optional().or(z.literal("")),
  applicantPhone: z.string().optional(),
  applicantAddress: z.string().optional(),
  applicantCity: z.string().optional(),
  applicantState: z.string().optional(),
  applicantZipCode: z.string().optional(),
  applicantDateOfBirth: z.string().optional(),
  applicantSSN: z.string().optional(),
  ownershipPercentage: z.number().min(0).max(100).optional(),
  
  // Partner Information (conditional)
  hasPartner: z.boolean().optional(),
  partnerFirstName: z.string().optional(),
  partnerLastName: z.string().optional(),
  partnerEmail: z.string().email().optional().or(z.literal("")),
  partnerPhone: z.string().optional(),
  partnerAddress: z.string().optional(),
  partnerCity: z.string().optional(),
  partnerState: z.string().optional(),
  partnerZipCode: z.string().optional(),
  partnerDateOfBirth: z.string().optional(),
  partnerSSN: z.string().optional(),
  partnerOwnershipPercentage: z.number().min(0).max(100).optional(),
});

type Step4FormData = z.infer<typeof step4Schema>;

export default function Step4ApplicantInfoComplete() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useFormDataContext();
  const [isCanadian, setIsCanadian] = useState(false);
  const [applicantPhoneDisplay, setApplicantPhoneDisplay] = useState('');
  const [partnerPhoneDisplay, setPartnerPhoneDisplay] = useState('');

  // Detect region from Step 1 business location
  useEffect(() => {
    setIsCanadian(state.businessLocation === "CA");
  }, [state.businessLocation]);

  const countryCode = getCountryFromBusinessLocation(state.businessLocation);

  const form = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      applicantFirstName: state.applicantFirstName || "",
      applicantLastName: state.applicantLastName || "",
      applicantEmail: state.applicantEmail || "",
      applicantPhone: state.applicantPhone || "",
      applicantAddress: state.applicantAddress || "",
      applicantCity: state.applicantCity || "",
      applicantState: state.applicantState || "",
      applicantZipCode: state.applicantZipCode || "",
      applicantDateOfBirth: state.applicantDateOfBirth || "",
      applicantSSN: state.applicantSSN || "",
      ownershipPercentage: state.ownershipPercentage || 100,
      hasPartner: state.hasPartner || false,
      partnerFirstName: state.partnerFirstName || "",
      partnerLastName: state.partnerLastName || "",
      partnerEmail: state.partnerEmail || "",
      partnerPhone: state.partnerPhone || "",
      partnerAddress: state.partnerAddress || "",
      partnerCity: state.partnerCity || "",
      partnerState: state.partnerState || "",
      partnerZipCode: state.partnerZipCode || "",
      partnerDateOfBirth: state.partnerDateOfBirth || "",
      partnerSSN: state.partnerSSN || "",
      partnerOwnershipPercentage: state.partnerOwnershipPercentage || 0,
    },
  });

  // Initialize phone display states
  useEffect(() => {
    if (state.applicantPhone && !applicantPhoneDisplay) {
      setApplicantPhoneDisplay(formatPhoneDisplay(state.applicantPhone, countryCode));
    }
    if (state.partnerPhone && !partnerPhoneDisplay) {
      setPartnerPhoneDisplay(formatPhoneDisplay(state.partnerPhone, countryCode));
    }
  }, [state.applicantPhone, state.partnerPhone, applicantPhoneDisplay, partnerPhoneDisplay, countryCode]);

  const watchedValues = form.watch();
  const hasPartner = form.watch("hasPartner");
  const ownershipPercentage = form.watch("ownershipPercentage");

  // Auto-save with 2-second delay
  const debouncedSave = useDebouncedCallback((data: Step4FormData) => {
    dispatch({
      type: "UPDATE_FORM_DATA",
      payload: data,
    });
  }, 2000);

  useEffect(() => {
    debouncedSave(watchedValues);
  }, [watchedValues, debouncedSave]);

  // Auto-calculate partner ownership
  useEffect(() => {
    if (hasPartner && ownershipPercentage) {
      const partnerOwnership = 100 - ownershipPercentage;
      form.setValue("partnerOwnershipPercentage", partnerOwnership);
    }
  }, [ownershipPercentage, hasPartner, form]);

  const onSubmit = async (data: Step4FormData) => {
    // Convert percentage strings to numbers and phone numbers to E.164 format
    const processedData = {
      ...data,
      ownershipPercentage: typeof data.ownershipPercentage === "string" 
        ? parseFloat(data.ownershipPercentage) || 100 
        : data.ownershipPercentage || 100,
      partnerOwnershipPercentage: typeof data.partnerOwnershipPercentage === "string"
        ? parseFloat(data.partnerOwnershipPercentage) || 0
        : data.partnerOwnershipPercentage || 0,
      // Convert phone numbers to E.164 format for API submission
      applicantPhone: data.applicantPhone ? normalizePhone(data.applicantPhone, countryCode) || data.applicantPhone : '',
      partnerPhone: data.partnerPhone ? normalizePhone(data.partnerPhone, countryCode) || data.partnerPhone : '',
    };

    console.log('📞 Phone conversion results:');
    console.log(`   Applicant: ${data.applicantPhone} → ${processedData.applicantPhone}`);
    console.log(`   Partner: ${data.partnerPhone} → ${processedData.partnerPhone}`);

    // Save form data to context
    dispatch({
      type: "UPDATE_FORM_DATA",
      payload: processedData,
    });

    console.log('📤 Step 4: Creating real application via POST /api/public/applications...');
    try {
      // Format data as staff backend expects: {step1, step3, step4}
      const applicationData = {
        step1: {
          // Financial profile data from Steps 1 & 2
          fundingAmount: state.fundingAmount,
          lookingFor: state.lookingFor,
          equipmentValue: state.equipmentValue,
          businessLocation: state.businessLocation,
          salesHistory: state.salesHistory,
          lastYearRevenue: state.lastYearRevenue,
          averageMonthlyRevenue: state.averageMonthlyRevenue,
          accountsReceivableBalance: state.accountsReceivableBalance,
          fixedAssetsValue: state.fixedAssetsValue,
          purposeOfFunds: state.purposeOfFunds,
          selectedCategory: state.selectedCategory
        },
        step3: {
          // Business details from Step 3
          operatingName: state.operatingName,
          legalName: state.legalName,
          businessAddress: state.businessAddress,
          businessCity: state.businessCity,
          businessState: state.businessState,
          businessZip: state.businessZip,
          businessPhone: state.businessPhone,
          businessStructure: state.businessStructure,
          businessStartDate: state.businessStartDate,
          numberOfEmployees: state.numberOfEmployees,
          annualRevenue: state.annualRevenue
        },
        step4: processedData
      };
      
      // ✅ Log final POST payload exactly as specified
      console.log("📤 Submitting full application:", {
        step1: applicationData.step1,
        step3: applicationData.step3,
        step4: applicationData.step4,
      });
      
      console.log('📋 Application data structure:', {
        step1: Object.keys(applicationData.step1),
        step3: Object.keys(applicationData.step3), 
        step4: Object.keys(applicationData.step4)
      });
      console.log('📋 Full payload being sent:', JSON.stringify(applicationData, null, 2));
      
      // ✅ Confirm the POST URL and VITE_API_BASE_URL
      const postUrl = '/api/public/applications';
      console.log('🎯 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('🎯 Confirmed POST URL:', postUrl);
      console.log('🎯 Full POST endpoint:', `${window.location.origin}${postUrl}`);
      
      // API Call: POST /api/public/applications
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify(applicationData)
      });

      console.log('🔍 API Response Status:', response.status, response.ok ? 'OK' : 'FAILED');
      
      if (response.ok) {
        const result = await response.json();
        console.log('📋 Application created:', result);
        console.log('📋 Full API response data:', JSON.stringify(result, null, 2));
        
        const rawId = result.applicationId || result.id || result.uuid;
        console.log('🔑 Raw applicationId from response:', rawId);
        
        // FAILSAFE CHECK - User requested verification
        if (!result?.data?.applicationId && !result?.applicationId) {
          alert("❌ Application creation failed. Cannot continue.");
          console.error('❌ FAILSAFE TRIGGERED: No applicationId in response');
          return;
        }
        
        if (rawId) {
          const uuid = extractUuid(rawId); // strips app_prod_ prefix if needed
          console.log('✅ Application created successfully');
          console.log('🔑 Full applicationId from response:', rawId);
          console.log('🔑 Clean UUID extracted:', uuid);
          
          // Save to Context
          dispatch({ type: 'UPDATE_FORM_DATA', payload: { applicationId: uuid } });
          
          // Save to localStorage
          localStorage.setItem('applicationId', uuid);
          
          console.log('💾 Stored applicationId in context and localStorage:', uuid);
          console.log('✅ Step 4 API call SUCCESSFUL - Status 200');
        } else {
          console.error('❌ Failed to get applicationId from response:', result);
          alert("❌ Application creation failed. No ID returned. Cannot continue.");
          throw new Error('No applicationId returned from API');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API call FAILED - Status:', response.status);
        console.error('❌ Backend rejected Step 4 data:', errorText);
        console.error('❌ Request payload was:', JSON.stringify(applicationData, null, 2));
        throw new Error(`API returned ${response.status}: ${response.statusText}\nError: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Step 4 Failed: Error creating application:', error);
      console.error('❌ This means SignNow will not work - application must be created successfully');
      
      // Show user the actual error instead of generating fallback
      alert(`❌ Application creation failed: ${error.message}\n\nPlease check the form data and try again. SignNow requires a valid application ID.`);
      return; // Don't proceed to Step 5 if application creation fails
    }

    // Mark step as complete and proceed
    dispatch({
      type: "MARK_STEP_COMPLETE",
      payload: { step: 4 },
    });

    setLocation("/apply/step-5");
  };

  const handleBack = () => {
    setLocation("/apply/step-3");
  };

  // Regional formatting helpers
  const getStateOptions = () => getStateProvinceOptions(isCanadian);
  const getPostalLabel = () => isCanadian ? "Postal Code" : "ZIP Code";
  const getSSNLabel = () => isCanadian ? "SIN" : "SSN";
  const formatPostalCode = (value: string) => formatPostalCodeHelper(value, isCanadian);
  const formatSSN = (value: string) => formatSSNHelper(value, isCanadian);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <StepHeader 
        stepNumber={4}
        title="Applicant Information"
        description="Provide primary applicant details and ownership information"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Primary Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Primary Applicant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="applicantFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicantLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="applicantEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicantPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={isCanadian ? "+1 (XXX) XXX-XXXX" : "(XXX) XXX-XXXX"}
                          value={applicantPhoneDisplay || field.value || ''}
                          onChange={(e) => {
                            const input = e.target.value;
                            setApplicantPhoneDisplay(input);
                            field.onChange(input);
                          }}
                          onBlur={(e) => {
                            const input = e.target.value;
                            const normalized = normalizePhone(input, countryCode);
                            
                            if (normalized) {
                              field.onChange(normalized);
                              setApplicantPhoneDisplay(formatPhoneDisplay(normalized, countryCode));
                              console.log(`📞 Applicant phone normalized: ${input} → ${normalized}`);
                            } else if (input.trim()) {
                              console.warn(`❌ Invalid applicant phone: ${input}`);
                            }
                          }}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Fields */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="applicantAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="applicantCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicantState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isCanadian ? "Province" : "State"}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getStateOptions().map((option) => (
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
                    name="applicantZipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{getPostalLabel()}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-12"
                            onChange={(e) => {
                              const formatted = formatPostalCode(e.target.value);
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

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="applicantDateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicantSSN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getSSNLabel()}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-12"
                          onChange={(e) => {
                            const formatted = formatSSN(e.target.value);
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
                  name="ownershipPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ownership Percentage</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          className="h-12"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Partner Information Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Ownership Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="hasPartner"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>This business has multiple owners/partners</FormLabel>
                      <p className="text-sm text-gray-600">
                        Check if there are additional business owners beyond the primary applicant
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Partner Information (Conditional) */}
          {hasPartner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Partner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Partner Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="partnerFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner First Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partnerLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Partner Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="partnerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partnerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={isCanadian ? "+1 (XXX) XXX-XXXX" : "(XXX) XXX-XXXX"}
                            value={partnerPhoneDisplay || field.value || ''}
                            onChange={(e) => {
                              const input = e.target.value;
                              setPartnerPhoneDisplay(input);
                              field.onChange(input);
                            }}
                            onBlur={(e) => {
                              const input = e.target.value;
                              const normalized = normalizePhone(input, countryCode);
                              
                              if (normalized) {
                                field.onChange(normalized);
                                setPartnerPhoneDisplay(formatPhoneDisplay(normalized, countryCode));
                                console.log(`📞 Partner phone normalized: ${input} → ${normalized}`);
                              } else if (input.trim()) {
                                console.warn(`❌ Invalid partner phone: ${input}`);
                              }
                            }}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Partner Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="partnerDateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Date of Birth</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partnerSSN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner {getSSNLabel()}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-12"
                            onChange={(e) => {
                              const formatted = formatSSN(e.target.value);
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
                    name="partnerOwnershipPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Ownership %</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="100"
                            className="h-12"
                            readOnly
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="px-8 py-3"
            >
              ← Back
            </Button>
            <Button
              type="submit"
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white"
            >
              Continue to Documents →
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}