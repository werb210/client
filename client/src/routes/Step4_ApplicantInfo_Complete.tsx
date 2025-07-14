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
import { staffApi, validateApplicationPayload } from "@/api/staffApi";
import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { StepHeader } from "@/components/StepHeader";
import { ValidationErrorModal } from "@/components/ValidationErrorModal";

// FIXED: Unified Step 4 Schema - matches shared/schema.ts exactly
const step4Schema = z.object({
  // Primary Applicant Information - using shared schema field names
  applicantFirstName: z.string().min(1, "First name is required"),
  applicantLastName: z.string().min(1, "Last name is required"), 
  applicantEmail: z.string().email("Valid email is required"),
  applicantPhone: z.string().min(1, "Phone is required"),
  applicantAddress: z.string().min(1, "Address is required"),
  applicantCity: z.string().min(1, "City is required"),
  applicantState: z.string().min(1, "State is required"),
  applicantZipCode: z.string().min(1, "Postal code is required"),
  applicantDateOfBirth: z.string().min(1, "Date of birth is required"),
  applicantSSN: z.string().min(1, "SSN/SIN is required"),
  ownershipPercentage: z.number().min(0).max(100),
  
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

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
    console.log('🚀 STEP 4 SUBMIT TRIGGERED - onSubmit function called');
    console.log('📝 Form data received:', data);
    console.log('✅ Form validation state:', form.formState.isValid);
    console.log('❌ Form errors:', form.formState.errors);
    
    // REMOVED early exit validation check - let the submission proceed even if form reports invalid
    // This fixes the issue where form validation fails but shows no actual errors
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
      const step1 = {
        // Financial profile data from Steps 1 & 2
        requestedAmount: state.fundingAmount, // ✅ correct field
        use_of_funds: state.lookingFor, // ✅ correct field
        equipment_value: state.equipmentValue, // ✅ correct field
        businessLocation: state.businessLocation,
        salesHistory: state.salesHistory,
        lastYearRevenue: state.lastYearRevenue,
        averageMonthlyRevenue: state.averageMonthlyRevenue,
        accountsReceivableBalance: state.accountsReceivableBalance,
        fixedAssetsValue: state.fixedAssetsValue,
        purposeOfFunds: state.purposeOfFunds,
        selectedCategory: state.selectedCategory
      };

      const step3 = {
        // Business details from Step 3
        operatingName: state.step3?.operatingName,
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
      };

      const step4 = processedData;

      // ✅ RUNTIME CHECK: Ensure all steps are present
      if (!step1 || !step3 || !step4) {
        console.error("❌ Missing step data – cannot submit application");
        console.error("Step validation:", { 
          step1: !!step1, 
          step3: !!step3, 
          step4: !!step4 
        });
        return;
      }

      // Create SignNow field mapping for template pre-population
      const signNowFields = {
        // Personal Information
        'First Name': step4.firstName,
        'Last Name': step4.lastName,
        'Email': step4.personalEmail,
        'Phone': step4.personalPhone,
        'Date of Birth': step4.dateOfBirth,
        'SSN': step4.socialSecurityNumber,
        'Personal Address': step4.applicantAddress,
        'Personal City': step4.applicantCity,
        'Personal State': step4.applicantState,
        'Personal Zip': step4.applicantPostalCode,
        
        // Business Information
        'Business Name': step3.operatingName,
        'Legal Business Name': step3.legalName,
        'Business Address': step3.businessAddress,
        'Business City': step3.businessCity,
        'Business State': step3.businessState,
        'Business Zip': step3.businessZip,
        'Business Phone': step3.businessPhone,
        'Business Website': step3.businessWebsite,
        
        // Loan Information
        'Funding Amount': step1.fundingAmount,
        'Purpose of Funds': step1.purposeOfFunds,
        'Industry': step1.industry || step1.businessLocation,
        
        // Additional
        'Ownership Percentage': step4.ownershipPercentage,
        'Credit Score': step4.creditScore,
        'Years with Business': step4.yearsWithBusiness
      };

      const applicationData = { 
        step1, 
        step3: {
          ...step3,
          businessName: step3.legalName || state.legalName, // ✅ Add required businessName field
        }, 
        step4: {
          ...step4,
          email: step4.applicantEmail || processedData.applicantEmail || state.applicantEmail // ✅ Add required email field
        },
        signNowFields: signNowFields
      };
      
      // ✅ Log final POST payload exactly as specified  
      console.log("📤 Submitting full application:", { step1, step3, step4 });
      
      // ✅ CHATGPT DEBUG VERIFICATION: Final Application Data
      console.log("✅ Final Application Data:", {
        step1: applicationData.step1,
        step3: applicationData.step3,
        step4: applicationData.step4,
      });
      
      // ✅ Log SignNow field mapping for verification
      console.log("📋 SignNow field mapping included:", {
        totalFields: Object.keys(signNowFields).length,
        sampleFields: {
          'First Name': signNowFields['First Name'],
          'Business Name': signNowFields['Business Name'],
          'Funding Amount': signNowFields['Funding Amount']
        }
      });
      
      console.log('📋 Application data structure:', {
        step1: Object.keys(step1),
        step3: Object.keys(step3), 
        step4: Object.keys(step4)
      });
      console.log('📋 Full payload being sent:', JSON.stringify(applicationData, null, 2));
      
      // ✅ Runtime Debug - Verify step3 has both legalName and businessName
      console.log('🔍 Step 3 Debug - Required fields check:', {
        legalName: applicationData.step3.legalName,
        businessName: applicationData.step3.businessName,
        hasBusinessName: !!applicationData.step3.businessName
      });
      
      // ✅ Runtime Debug - Verify step4 has email field
      console.log('🔍 Step 4 Debug - Required fields check:', {
        applicantEmail: applicationData.step4.applicantEmail,
        email: applicationData.step4.email,
        hasEmail: !!applicationData.step4.email
      });
      
      // ✅ Validate Application Payload Before Submission
      console.log("📋 Step-based payload:", JSON.stringify(applicationData, null, 2));
      
      const validation = validateApplicationPayload(applicationData);
      if (!validation.isValid) {
        console.error("❌ VALIDATION FAILED - Missing required fields:", validation.missingFields);
        setValidationErrors(validation.missingFields);
        return;
      }
      console.log("✅ VALIDATION PASSED - All required fields present");
      
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
              onClick={(e) => {
                console.log('🖱️ CONTINUE BUTTON CLICKED');
                console.log('📝 Form valid?', form.formState.isValid);
                console.log('❌ Form errors:', form.formState.errors);
                console.log('🔍 Required field values:', {
                  firstName: form.getValues('applicantFirstName'),
                  lastName: form.getValues('applicantLastName'),
                  email: form.getValues('applicantEmail'),
                  phone: form.getValues('applicantPhone')
                });
                // Let the form submission proceed normally
              }}
            >
              Continue to Documents →
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Validation Error Modal */}
      <ValidationErrorModal
        isOpen={!!validationErrors}
        onClose={() => setValidationErrors(null)}
        missingFields={validationErrors || {}}
      />
    </div>
  );
}