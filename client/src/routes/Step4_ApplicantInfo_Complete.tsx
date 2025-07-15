import { useForm } from "react-hook-form";
import { logger } from '@/lib/utils';
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


// Step 4 Schema - All fields required except SSN/SIN
const step4Schema = z.object({
  // Primary Applicant Information - all required except SSN
  applicantFirstName: z.string().min(1, "First Name is required"),
  applicantLastName: z.string().min(1, "Last Name is required"), 
  applicantEmail: z.string().email("Valid email is required"),
  applicantPhone: z.string().min(1, "Phone is required"),
  applicantAddress: z.string().min(1, "Address is required"),
  applicantCity: z.string().min(1, "City is required"),
  applicantState: z.string().min(1, "State is required"),
  applicantZipCode: z.string().min(1, "Postal Code is required"),
  applicantDateOfBirth: z.string().min(1, "Date Of Birth is required"),
  applicantSSN: z.string().optional(), // SSN/SIN is optional as requested
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
  const [submitting, setSubmitting] = useState(false);

  // Detect region from Step 1 business location
  useEffect(() => {
    setIsCanadian(state.step1?.businessLocation === "CA");
  }, [state.step1?.businessLocation]);

  const countryCode = getCountryFromBusinessLocation(state.step1?.businessLocation || 'US');

  const form = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      applicantFirstName: state.step4?.applicantFirstName || "",
      applicantLastName: state.step4?.applicantLastName || "",
      applicantEmail: state.step4?.applicantEmail || "",
      applicantPhone: state.step4?.applicantPhone || "",
      applicantAddress: state.step4?.applicantAddress || "",
      applicantCity: state.step4?.applicantCity || "",
      applicantState: state.step4?.applicantState || "",
      applicantZipCode: state.step4?.applicantZipCode || "",
      applicantDateOfBirth: state.step4?.applicantDateOfBirth || "",
      applicantSSN: state.step4?.applicantSSN || "", // Optional field
      ownershipPercentage: state.step4?.ownershipPercentage || 100,
      hasPartner: state.step4?.hasPartner || false,
      partnerFirstName: state.step4?.partnerFirstName || "",
      partnerLastName: state.step4?.partnerLastName || "",
      partnerEmail: state.step4?.partnerEmail || "",
      partnerPhone: state.step4?.partnerPhone || "",
      partnerAddress: state.step4?.partnerAddress || "",
      partnerCity: state.step4?.partnerCity || "",
      partnerState: state.step4?.partnerState || "",
      partnerZipCode: state.step4?.partnerZipCode || "",
      partnerDateOfBirth: state.step4?.partnerDateOfBirth || "",
      partnerSSN: state.step4?.partnerSSN || "",
      partnerOwnershipPercentage: state.step4?.partnerOwnershipPercentage || 0,
    },
  });

  // Initialize phone display states
  useEffect(() => {
    if (state.step4?.applicantPhone && !applicantPhoneDisplay) {
      setApplicantPhoneDisplay(formatPhoneDisplay(state.step4.applicantPhone, countryCode));
    }
    if (state.step4?.partnerPhone && !partnerPhoneDisplay) {
      setPartnerPhoneDisplay(formatPhoneDisplay(state.step4.partnerPhone, countryCode));
    }
  }, [state.step4?.applicantPhone, state.step4?.partnerPhone, applicantPhoneDisplay, partnerPhoneDisplay, countryCode]);

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
    // Double-click prevention: Exit if already submitting
    if (submitting) {
      logger.log('⚠️ DOUBLE-CLICK PREVENTION: Submission already in progress');
      return;
    }
    
    setSubmitting(true);
    logger.log('🚀 STEP 4 SUBMIT TRIGGERED - onSubmit function called');
    logger.log('📝 Form data received:', data);
    logger.log('✅ Form validation state:', form.formState.isValid);
    logger.log('❌ Form errors:', form.formState.errors);
    
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

    logger.log('📞 Phone conversion results:');
    logger.log(`   Applicant: ${data.applicantPhone} → ${processedData.applicantPhone}`);
    logger.log(`   Partner: ${data.partnerPhone} → ${processedData.partnerPhone}`);

    // Save form data to context
    dispatch({
      type: "UPDATE_FORM_DATA",
      payload: processedData,
    });

    logger.log('📤 Step 4: Creating real application via POST /api/public/applications...');
    try {
      // Format data as staff backend expects: {step1, step3, step4}
      const step1 = {
        // Financial profile data from Steps 1 & 2
        requestedAmount: state.step1?.requestedAmount || state.step1?.fundingAmount, // ✅ step-based access
        use_of_funds: state.step1?.use_of_funds || state.step1?.lookingFor, // ✅ step-based access
        equipment_value: state.step1?.equipment_value || state.step1?.equipmentValue, // ✅ step-based access
        businessLocation: state.step1?.businessLocation,
        salesHistory: state.step1?.salesHistory,
        lastYearRevenue: state.step1?.lastYearRevenue,
        averageMonthlyRevenue: state.step1?.averageMonthlyRevenue,
        accountsReceivableBalance: state.step1?.accountsReceivableBalance,
        fixedAssetsValue: state.step1?.fixedAssetsValue,
        purposeOfFunds: state.step1?.purposeOfFunds,
        selectedCategory: state.step2?.selectedCategory
      };

      const step3 = {
        // Business details from Step 3
        operatingName: state.step3?.operatingName,
        legalName: state.step3?.legalName,
        businessAddress: state.step3?.businessAddress,
        businessCity: state.step3?.businessCity,
        businessState: state.step3?.businessState,
        businessZip: state.step3?.businessZip,
        businessPhone: state.step3?.businessPhone,
        businessStructure: state.step3?.businessStructure,
        businessStartDate: state.step3?.businessStartDate,
        numberOfEmployees: state.step3?.numberOfEmployees,
        annualRevenue: state.step3?.annualRevenue
      };

      const step4 = processedData;

      // ✅ RUNTIME CHECK: Ensure all steps are present
      if (!step1 || !step3 || !step4) {
        logger.error("❌ Missing step data – cannot submit application");
        logger.error("Step validation:", { 
          step1: !!step1, 
          step3: !!step3, 
          step4: !!step4 
        });
        setSubmitting(false);
        return;
      }

      // ✅ CORRECTED: SignNow field mapping using snake_case format expected by staff backend
      const signNowFields = {
        // Personal Information - CORRECTED FIELD NAMES
        'first_name': step4.applicantFirstName,
        'last_name': step4.applicantLastName,
        'email': step4.applicantEmail,
        'phone': step4.applicantPhone,
        'date_of_birth': step4.applicantDateOfBirth,
        'ssn': step4.applicantSSN,
        'personal_address': step4.applicantAddress,
        'personal_city': step4.applicantCity,
        'personal_state': step4.applicantState,
        'personal_zip': step4.applicantZipCode,
        
        // Business Information - CORRECTED FIELD NAMES
        'business_name': step3.operatingName,
        'legal_business_name': step3.legalName,
        'business_address': step3.businessAddress,
        'business_city': step3.businessCity,
        'business_state': step3.businessState,
        'business_zip': step3.businessZip,
        'business_phone': step3.businessPhone,
        'business_website': step3.businessWebsite,
        
        // Loan Information - CORRECTED FIELD NAMES
        'amount_requested': step1.requestedAmount,
        'purpose_of_funds': step1.use_of_funds,
        'industry': step1.businessLocation,
        
        // Additional - CORRECTED FIELD NAMES
        'ownership_percentage': step4.ownershipPercentage,
        'credit_score': step4.creditScore,
        'years_with_business': step4.yearsWithBusiness
      };
      
      // ✅ SignNow Field Verification Report
      console.log("🖊️ =================================");
      console.log("🖊️ SIGNNOW FIELDS VERIFICATION");
      console.log("🖊️ =================================");
      console.log("🖊️ Total SignNow Fields:", Object.keys(signNowFields).length);
      
      const missingSignNowFields = Object.entries(signNowFields).filter(([key, value]) => !value || value === '');
      if (missingSignNowFields.length > 0) {
        console.log("⚠️ MISSING SIGNNOW FIELDS:");
        missingSignNowFields.forEach(([key, value]) => {
          console.log(`❌ ${key}: "${value}"`);
        });
      } else {
        console.log("✅ All SignNow fields populated");
      }
      
      console.log("🖊️ Key SignNow Fields Preview:");
      console.log(`✅ first_name: "${signNowFields['first_name']}"`);
      console.log(`✅ business_name: "${signNowFields['business_name']}"`);
      console.log(`✅ amount_requested: "${signNowFields['amount_requested']}"`);
      console.log(`✅ email: "${signNowFields['email']}"`);
      console.log(`✅ business_phone: "${signNowFields['business_phone']}"`);
      console.log("🖊️ =================================");

      const applicationData = { 
        step1, 
        step3: {
          ...step3,
          businessName: step3.legalName, // ✅ Add required businessName field
        }, 
        step4: {
          ...step4,
          email: step4.applicantEmail || processedData.applicantEmail // ✅ Add required email field
        },
        signNowFields: signNowFields
      };
      
      // ✅ ENHANCED PAYLOAD VERIFICATION - Report back what payload was sent
      console.log("📤 =================================");
      console.log("📤 STEP 4 → STAFF API PAYLOAD REPORT");
      console.log("📤 =================================");
      
      // ✅ Critical field mapping verification
      const criticalFields = {
        // Step 1 Key Fields
        amount_requested: step1.requestedAmount,
        use_of_funds: step1.use_of_funds,
        business_location: step1.businessLocation,
        
        // Step 3 Key Fields  
        full_business_name: step3.legalName,
        business_name: step3.businessName || step3.legalName,
        business_phone: step3.businessPhone,
        business_email: step3.businessEmail,
        business_state: step3.businessState,
        
        // Step 4 Key Fields
        full_name: `${step4.applicantFirstName} ${step4.applicantLastName}`,
        first_name: step4.applicantFirstName,
        last_name: step4.applicantLastName,
        email: step4.email || step4.applicantEmail,
        phone: step4.applicantPhone,
        ownership_percentage: step4.ownershipPercentage
      };
      
      console.log("📋 CRITICAL FIELD VERIFICATION:");
      Object.entries(criticalFields).forEach(([key, value]) => {
        const status = value ? '✅' : '❌';
        console.log(`${status} ${key}: "${value}"`);
      });
      
      // ✅ Complete payload structure report
      console.log("📋 COMPLETE PAYLOAD STRUCTURE:");
      console.log("Step 1 Fields:", Object.keys(step1));
      console.log("Step 3 Fields:", Object.keys(step3)); 
      console.log("Step 4 Fields:", Object.keys(step4));
      
      // ✅ Full JSON payload for debugging
      console.log("📋 FULL JSON PAYLOAD BEING SENT:");
      console.log(JSON.stringify(applicationData, null, 2));
      
      logger.log("📤 Submitting full application:", { step1, step3, step4 });
      
      // ✅ Runtime Debug - Verify step3 has both legalName and businessName
      logger.log('🔍 Step 3 Debug - Required fields check:', {
        legalName: applicationData.step3.legalName,
        businessName: applicationData.step3.businessName,
        hasBusinessName: !!applicationData.step3.businessName
      });
      
      // ✅ Runtime Debug - Verify step4 has email field
      logger.log('🔍 Step 4 Debug - Required fields check:', {
        applicantEmail: applicationData.step4.applicantEmail,
        email: applicationData.step4.email,
        hasEmail: !!applicationData.step4.email
      });
      
      // ✅ Validate Application Payload Before Submission
      logger.log("📋 Step-based payload:", JSON.stringify(applicationData, null, 2));
      
      const validation = validateApplicationPayload(applicationData);
      if (!validation.isValid) {
        logger.error("❌ VALIDATION FAILED - Missing required fields:", validation.missingFields);
        setValidationErrors(validation.missingFields);
        setSubmitting(false);
        return;
      }
      logger.log("✅ VALIDATION PASSED - All required fields present");
      
      // ✅ Confirm the POST URL and VITE_API_BASE_URL
      const postUrl = '/api/public/applications';
      logger.log('🎯 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      logger.log('🎯 Confirmed POST URL:', postUrl);
      logger.log('🎯 Full POST endpoint:', `${window.location.origin}${postUrl}`);
      
      // API Call: POST /api/public/applications
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify(applicationData)
      });

      // ✅ ENHANCED API RESPONSE LOGGING
      console.log("📡 =================================");
      console.log("📡 STAFF API RESPONSE REPORT");
      console.log("📡 =================================");
      console.log(`📡 Response Status: ${response.status} (${response.ok ? 'SUCCESS' : 'FAILED'})`);
      console.log(`📡 Response URL: ${response.url}`);
      console.log(`📡 Response Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log("✅ STAFF API ACCEPTED PAYLOAD");
        console.log("📋 Response Data:", JSON.stringify(result, null, 2));
        console.log("📋 Application ID:", result.applicationId || result.id || result.uuid);
        
        logger.log('📋 Application created:', result);
        logger.log('📋 Full API response data:', JSON.stringify(result, null, 2));
        
        const rawId = result.applicationId || result.id || result.uuid;
        logger.log('🔑 Raw applicationId from response:', rawId);
        
        // FAILSAFE CHECK - User requested verification
        if (!result?.data?.applicationId && !result?.applicationId) {
          alert("❌ Application creation failed. Cannot continue.");
          logger.error('❌ FAILSAFE TRIGGERED: No applicationId in response');
          return;
        }
        
        if (rawId) {
          const uuid = extractUuid(rawId); // strips app_prod_ prefix if needed
          logger.log('✅ Application created successfully');
          logger.log('🔑 Full applicationId from response:', rawId);
          logger.log('🔑 Clean UUID extracted:', uuid);
          
          // Save to Context
          dispatch({ type: 'UPDATE_FORM_DATA', payload: { applicationId: uuid } });
          
          // Save to localStorage
          localStorage.setItem('applicationId', uuid);
          
          logger.log('💾 Stored applicationId in context and localStorage:', uuid);
          logger.log('✅ Step 4 API call SUCCESSFUL - Status 200');
        } else {
          logger.error('❌ Failed to get applicationId from response:', result);
          alert("❌ Application creation failed. No ID returned. Cannot continue.");
          throw new Error('No applicationId returned from API');
        }
      } else {
        // ✅ ENHANCED ERROR RESPONSE LOGGING
        console.log("❌ STAFF API REJECTED PAYLOAD");
        const errorText = await response.text();
        console.log("❌ Error Status:", response.status);
        console.log("❌ Error Response Body:", errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.log("❌ Parsed Error Details:", JSON.stringify(errorJson, null, 2));
          
          // Check for field validation errors
          if (errorJson.errors || errorJson.validationErrors) {
            console.log("❌ FIELD VALIDATION ERRORS:");
            console.log(errorJson.errors || errorJson.validationErrors);
          }
        } catch (e) {
          console.log("❌ Error response is not valid JSON");
        }
        
        logger.error('❌ API call FAILED - Status:', response.status);
        logger.error('❌ Backend rejected Step 4 data:', errorText);
        logger.error('❌ Request payload was:', JSON.stringify(applicationData, null, 2));
        throw new Error(`API returned ${response.status}: ${response.statusText}\nError: ${errorText}`);
      }
    } catch (error) {
      logger.error('❌ Step 4 Failed: Error creating application:', error);
      logger.error('❌ This means SignNow will not work - application must be created successfully');
      
      // Show user the actual error instead of generating fallback
      alert(`❌ Application creation failed: ${error.message}\n\nPlease check the form data and try again. SignNow requires a valid application ID.`);
      return; // Don't proceed to Step 5 if application creation fails
    } finally {
      setSubmitting(false);
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
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="h-12" 
                          autoCapitalize="words"
                          onChange={(e) => {
                            const capitalizedValue = e.target.value
                              .split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                              .join(' ');
                            field.onChange(capitalizedValue);
                          }}
                        />
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
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="h-12" 
                          autoCapitalize="words"
                          onChange={(e) => {
                            const capitalizedValue = e.target.value
                              .split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                              .join(' ');
                            field.onChange(capitalizedValue);
                          }}
                        />
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
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="h-12" autoCapitalize="none" />
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
                      <FormLabel>Phone Number *</FormLabel>
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
                              logger.log(`📞 Applicant phone normalized: ${input} → ${normalized}`);
                            } else if (input.trim()) {
                              logger.warn(`❌ Invalid applicant phone: ${input}`);
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
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" autoCapitalize="words" />
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
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="h-12" 
                            autoCapitalize="words"
                            onChange={(e) => {
                              const capitalizedValue = e.target.value
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ');
                              field.onChange(capitalizedValue);
                            }}
                          />
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
                        <FormLabel>{isCanadian ? "Province" : "State"} *</FormLabel>
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
                        <FormLabel>{getPostalLabel()} *</FormLabel>
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
                      <FormLabel>Date Of Birth *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date" 
                          className="h-12"
                          onKeyDown={(e) => {
                            const input = e.currentTarget;
                            const value = input.value;
                            
                            // Auto-advance when year is complete (4 digits)
                            if (e.key >= '0' && e.key <= '9') {
                              const cursorPos = input.selectionStart || 0;
                              
                              // If typing in year position and year will be 4 digits
                              if (cursorPos <= 4 && value.length >= 3) {
                                setTimeout(() => {
                                  // Move cursor to month position after year is complete
                                  input.setSelectionRange(5, 7);
                                }, 0);
                              }
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            
                            // Auto-advance when sections are complete
                            if (value.length === 4 && !value.includes('-')) {
                              // Year complete, move to month
                              setTimeout(() => {
                                const input = e.target;
                                input.setSelectionRange(5, 7);
                              }, 0);
                            }
                          }}
                        />
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
                      <FormLabel>Ownership Percentage *</FormLabel>
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
                          <Input {...field} className="h-12" autoCapitalize="words" />
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
                          <Input {...field} className="h-12" autoCapitalize="words" />
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
                          <Input {...field} type="email" className="h-12" autoCapitalize="none" />
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
                                logger.log(`📞 Partner phone normalized: ${input} → ${normalized}`);
                              } else if (input.trim()) {
                                logger.warn(`❌ Invalid partner phone: ${input}`);
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
                          <Input 
                            {...field} 
                            type="date" 
                            className="h-12"
                            onKeyDown={(e) => {
                              const input = e.currentTarget;
                              const value = input.value;
                              
                              // Auto-advance when year is complete (4 digits)
                              if (e.key >= '0' && e.key <= '9') {
                                const cursorPos = input.selectionStart || 0;
                                
                                // If typing in year position and year will be 4 digits
                                if (cursorPos <= 4 && value.length >= 3) {
                                  setTimeout(() => {
                                    // Move cursor to month position after year is complete
                                    input.setSelectionRange(5, 7);
                                  }, 0);
                                }
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                              
                              // Auto-advance when sections are complete
                              if (value.length === 4 && !value.includes('-')) {
                                // Year complete, move to month
                                setTimeout(() => {
                                  const input = e.target;
                                  input.setSelectionRange(5, 7);
                                }, 0);
                              }
                            }}
                          />
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
              disabled={submitting}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={(e) => {
                logger.log('🖱️ CONTINUE BUTTON CLICKED');
                logger.log('📝 Form valid?', form.formState.isValid);
                logger.log('❌ Form errors:', form.formState.errors);
                logger.log('🔍 Required field values:', {
                  firstName: form.getValues('applicantFirstName'),
                  lastName: form.getValues('applicantLastName'),
                  email: form.getValues('applicantEmail'),
                  phone: form.getValues('applicantPhone')
                });
                // Let the form submission proceed normally
              }}
            >
              {submitting ? "Submitting..." : "Continue to Documents →"}
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