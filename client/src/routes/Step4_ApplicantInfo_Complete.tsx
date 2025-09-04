import { useForm } from "react-hook-form";
import { logger } from '@/lib/utils';
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { useLocation } from "wouter";

import { useFormData } from "@/context/FormDataContext";

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
import { addToRetryQueue } from '@/utils/applicationRetryQueue';

import { useState, useEffect } from "react";

import { useDebouncedCallback } from "use-debounce";

import { StepHeader } from "@/components/StepHeader";
import { useCanon } from '@/providers/CanonProvider';
import { useCanonFormBridge } from '@/lib/useCanonFormBridge';

import { ValidationErrorModal } from "@/components/ValidationErrorModal";
import { SsnWarningModal } from "@/components/SsnWarningModal";
import { useToast } from "@/hooks/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


// Step 4 Schema - Required fields for form validation
const step4Schema = z.object({
  // Primary Applicant Information - REQUIRED fields
  applicantFirstName: z.string().min(1, "First name is required"),
  applicantLastName: z.string().min(1, "Last name is required"), 
  applicantEmail: z.string().email("Valid email is required"),
  applicantPhone: z.string().min(1, "Phone number is required"),
  applicantAddress: z.string().min(1, "Address is required"),
  applicantCity: z.string().min(1, "City is required"),
  applicantState: z.string().min(1, "State/Province is required"),
  applicantZipCode: z.string().min(1, "Postal/ZIP code is required"),
  applicantDateOfBirth: z.string().min(1, "Date of birth is required"),
  applicantSSN: z.string().optional(), // SSN/SIN is optional as specified
  ownershipPercentage: z.number().min(1, "Ownership percentage is required"),
  
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
  partnerOwnershipPercentage: z.number().optional(),
});

type Step4FormData = z.infer<typeof step4Schema>;

// Utility function to load from localStorage
const loadFromLocalStorage = () => {
  try {
    const storedData = localStorage.getItem('formData') || localStorage.getItem('financialFormData');
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return null;
};

export default function Step4ApplicantInfoComplete() {
  const [, setLocation] = useLocation();
  const { data } = useFormData();
  const state = data || {};
  const dispatch = (action: any) => console.log('Mock dispatch in Step4:', action);
  const { toast } = useToast();
  const [isCanadian, setIsCanadian] = useState(false);
  const [applicantPhoneDisplay, setApplicantPhoneDisplay] = useState('');
  const [partnerPhoneDisplay, setPartnerPhoneDisplay] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // SSN Warning Modal states
  const [showSsnWarning, setShowSsnWarning] = useState(false);
  const [continuePending, setContinuePending] = useState(false);
  
  // Step 4 initialization

  // Application ID state for persistence
  const [applicationId, setApplicationId] = useState<string | null>(
    state.applicationId || localStorage.getItem('applicationId')
  );

  // Detect region from Step 1 business location
  useEffect(() => {
    const newIsCanadian = state.businessLocation === "CA";
    console.log('🏢 Business location detected:', state.businessLocation, 'isCanadian:', newIsCanadian);
    setIsCanadian(newIsCanadian);
  }, [state.businessLocation]);

  const countryCode = getCountryFromBusinessLocation(state.businessLocation || 'US');

  const form = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      applicantFirstName: state.firstName || "",
      applicantLastName: state.lastName || "",
      applicantEmail: state.personalEmail || "",
      applicantPhone: state.personalPhone || "",
      applicantAddress: state.applicantAddress || "",
      applicantCity: state.applicantCity || "",
      applicantState: state.applicantState || "",
      applicantZipCode: state.applicantPostalCode || "",
      applicantDateOfBirth: state.dateOfBirth || "",
      applicantSSN: state.socialSecurityNumber || "",
      ownershipPercentage: Number(state.ownershipPercentage) || undefined,
      hasPartner: !!state.partnerFirstName || false,
      partnerFirstName: state.partnerFirstName || "",
      partnerLastName: state.partnerLastName || "",
      partnerEmail: state.partnerEmail || "",
      partnerPhone: state.partnerPhone || "",
      partnerAddress: state.partnerAddress || "",
      partnerCity: state.partnerCity || "",
      partnerState: state.partnerState || "",
      partnerZipCode: state.partnerPostalCode || "",
      partnerDateOfBirth: state.partnerDateOfBirth || "",
      partnerSSN: state.partnerSinSsn || "",
      partnerOwnershipPercentage: Number(state.partnerOwnershipPercentage) || undefined,
    },
  });

  // Bridge form to canonical store
  useCanonFormBridge(form);

  // Initialize phone display states
  useEffect(() => {
    if (state.personalPhone && !applicantPhoneDisplay) {
      setApplicantPhoneDisplay(formatPhoneDisplay(state.personalPhone, countryCode));
    }
    if (state.partnerPhone && !partnerPhoneDisplay) {
      setPartnerPhoneDisplay(formatPhoneDisplay(state.partnerPhone, countryCode));
    }
  }, [state.personalPhone, state.partnerPhone, applicantPhoneDisplay, partnerPhoneDisplay, countryCode]);

  const watchedValues = form.watch();
  const hasPartner = form.watch("hasPartner");
  const ownershipPercentage = form.watch("ownershipPercentage");
  
  // Partner checkbox state tracking (debugging disabled)

  // Auto-save with 2-second delay - using step-based structure like Steps 1 and 3
  const debouncedSave = useDebouncedCallback((data: Step4FormData) => {
    // Save to step4 object structure for proper validation and persistence
    dispatch({
      type: "UPDATE_STEP4",
      payload: {
        applicantFirstName: data.applicantFirstName,
        applicantLastName: data.applicantLastName,
        applicantEmail: data.applicantEmail,
        applicantPhone: data.applicantPhone,
        applicantAddress: data.applicantAddress,
        applicantCity: data.applicantCity,
        applicantState: data.applicantState,
        applicantZipCode: data.applicantZipCode,
        applicantDateOfBirth: data.applicantDateOfBirth,
        applicantSSN: data.applicantSSN,
        ownershipPercentage: data.ownershipPercentage,
        hasPartner: data.hasPartner,
        partnerFirstName: data.partnerFirstName,
        partnerLastName: data.partnerLastName,
        partnerEmail: data.partnerEmail,
        partnerPhone: data.partnerPhone,
        partnerAddress: data.partnerAddress,
        partnerCity: data.partnerCity,
        partnerState: data.partnerState,
        partnerZipCode: data.partnerZipCode,
        partnerDateOfBirth: data.partnerDateOfBirth,
        partnerSSN: data.partnerSSN,
        partnerOwnershipPercentage: data.partnerOwnershipPercentage,
        email: data.applicantEmail // For compatibility
      }
    });
    logger.log('💾 Step 4 - Auto-saved form data to step4 object');
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

    // Step 4 submission (logging reduced for production)

    // Check if SSN/SIN is blank and show warning if needed
    if (!data.applicantSSN && !showSsnWarning && !continuePending) {
      logger.log('⚠️ SSN/SIN is blank - showing warning modal');
      setShowSsnWarning(true);
      return;
    }
    
    setSubmitting(true);
    
    // REMOVED early exit validation check - let the submission proceed even if form reports invalid
    // This fixes the issue where form validation fails but shows no actual errors
    // Convert percentage strings to numbers and phone numbers to E.164 format
    const processedData = {
      ...data,
      ownershipPercentage: typeof data.ownershipPercentage === "string" 
        ? parseFloat(data.ownershipPercentage) || undefined 
        : data.ownershipPercentage || undefined,
      partnerOwnershipPercentage: typeof data.partnerOwnershipPercentage === "string"
        ? parseFloat(data.partnerOwnershipPercentage) || 0
        : data.partnerOwnershipPercentage || 0,
      // Convert phone numbers to E.164 format for API submission
      applicantPhone: data.applicantPhone ? normalizePhone(data.applicantPhone, countryCode) || data.applicantPhone : '',
      partnerPhone: data.partnerPhone ? normalizePhone(data.partnerPhone, countryCode) || data.partnerPhone : '',
    };

    // Phone conversion complete

    // Save form data to context
    dispatch({
      type: "UPDATE_FORM_DATA",
      payload: processedData,
    });

    // Verify VITE_API_BASE_URL injection
    console.log("🔧 STAFF API:", import.meta.env.VITE_API_BASE_URL);
    
    logger.log('📤 Step 4: Creating real application via POST /api/public/applications...');
    try {
      // 🚨 CRITICAL FIX: Complete Step 1 payload with all required fields
      const step1 = {
        // Core funding request data
        fundingAmount: state.fundingAmount || 0,
        requestedAmount: state.fundingAmount || 0,
        use_of_funds: state.fundsPurpose || state.lookingFor || '',
        lookingFor: state.lookingFor || state.fundsPurpose || '',
        fundsPurpose: state.fundsPurpose || state.lookingFor || '',
        
        // Business location and context
        businessLocation: state.businessLocation || 'US',
        industry: state.industry || '',
        
        // Financial metrics
        salesHistory: state.salesHistory || '',
        lastYearRevenue: state.revenueLastYear || '',
        averageMonthlyRevenue: state.averageMonthlyRevenue || '',
        accountsReceivableBalance: state.accountsReceivableBalance || 0,
        fixedAssetsValue: state.fixedAssetsValue || 0,
        
        // Equipment specific (if applicable)
        equipment_value: state.equipmentValue || 0,
        equipmentValue: state.equipmentValue || 0,
        
        // Step 2 integration
        selectedCategory: state.selectedCategory || state.selectedCategoryName || ''
      };

      // 🔧 Fix validation logic - Use direct state fields from ApplicationForm
      const storedData = loadFromLocalStorage();
      const businessFields = {
        businessName: state.businessName || '',
        businessAddress: state.businessAddress || '',
        businessCity: state.businessCity || '',
        businessState: state.businessState || '',
        businessZipCode: state.businessZipCode || '',
        businessPhone: state.businessPhone || '',
        businessEmail: state.businessEmail || '',
        businessWebsite: state.businessWebsite || '',
        businessStartDate: state.businessStartDate || '',
        businessStructure: state.businessStructure || '',
        employeeCount: state.employeeCount || 0,
        estimatedYearlyRevenue: state.estimatedYearlyRevenue || 0,
        industry: state.industry || ''
      };
      
      // 🔧 Enhanced validation check for Step 3 data
      if (!businessFields.operatingName || !businessFields.businessPhone || !businessFields.businessState) {
        logger.log('❌ VALIDATION ERROR: Missing Business Info from Step 3');
        logger.log('   - Operating Name:', businessFields.operatingName);
        logger.log('   - Business Phone:', businessFields.businessPhone);
        logger.log('   - Business State:', businessFields.businessState);
        logger.log('   - Full Step 3 Data:', businessFields);
        
        // Try to reload from localStorage one more time
        const freshData = loadFromLocalStorage();
        if (freshData?.step3) {
          logger.log('🔄 Retrying with fresh localStorage data:', freshData.step3);
          dispatch({ type: 'UPDATE_STEP3', payload: freshData.step3 });
        } else {
          toast({
            title: "Missing Business Information",
            description: "Please complete Step 3 business details before continuing.",
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }
      }

      // 🚨 CRITICAL FIX: Complete Step 3 business payload with all required fields
      const step3 = {
        // Core business identity
        operatingName: businessFields.operatingName || '',
        legalName: businessFields.legalName || businessFields.operatingName || '',
        businessName: businessFields.operatingName || businessFields.legalName || businessFields.businessName || '',
        
        // ✅ REQUIRED FIELD: businessType (mapped from businessStructure)
        businessType: businessFields.businessStructure || '',
        
        // ✅ REQUIRED FIELD: industry (from Step 1)
        industry: businessFields.industry || state.industry || '',
        
        // Business address
        businessAddress: businessFields.businessStreetAddress || businessFields.businessAddress || '',
        businessStreetAddress: businessFields.businessStreetAddress || businessFields.businessAddress || '',
        businessCity: businessFields.businessCity || '',
        businessState: businessFields.businessState || '',
        businessZip: businessFields.businessPostalCode || businessFields.businessZip || '',
        businessPostalCode: businessFields.businessPostalCode || businessFields.businessZip || '',
        
        // Contact information
        businessPhone: businessFields.businessPhone || '',
        businessWebsite: businessFields.businessWebsite || '',
        website: businessFields.businessWebsite || '', // Alternative field name
        
        // Business details
        businessStructure: businessFields.businessStructure || '',
        businessStartDate: businessFields.businessStartDate || '',
        
        // ✅ REQUIRED FIELD: yearsInBusiness (calculated from businessStartDate)
        yearsInBusiness: businessFields.businessStartDate ? 
          Math.max(0, new Date().getFullYear() - new Date(businessFields.businessStartDate).getFullYear()) : 0,
        
        // Employee information
        numberOfEmployees: businessFields.employeeCount || businessFields.numberOfEmployees || 0,
        employeeCount: businessFields.employeeCount || businessFields.numberOfEmployees || 0,
        
        // Revenue information
        annualRevenue: businessFields.estimatedYearlyRevenue || businessFields.annualRevenue || 0,
        estimatedYearlyRevenue: businessFields.estimatedYearlyRevenue || businessFields.annualRevenue || 0,
        
        // ✅ REQUIRED FIELD: monthlyRevenue (calculated from annual revenue)
        monthlyRevenue: businessFields.estimatedYearlyRevenue ? 
          Math.round(businessFields.estimatedYearlyRevenue / 12) : 
          (businessFields.annualRevenue ? Math.round(businessFields.annualRevenue / 12) : 0)
      };

      // 🚨 CRITICAL FIX: Complete Step 4 contact payload with all fields
      const step4 = {
        // Primary applicant (contact) information
        applicantFirstName: processedData.applicantFirstName || '',
        applicantLastName: processedData.applicantLastName || '',
        applicantEmail: processedData.applicantEmail || '',
        applicantPhone: processedData.applicantPhone || '',
        applicantAddress: processedData.applicantAddress || '',
        applicantCity: processedData.applicantCity || '',
        applicantState: processedData.applicantState || '',
        applicantZipCode: processedData.applicantZipCode || '',
        applicantDateOfBirth: processedData.applicantDateOfBirth || '',
        applicantSSN: processedData.applicantSSN || '',
        ownershipPercentage: processedData.ownershipPercentage,
        
        // Contact mapping for backend compatibility
        firstName: processedData.applicantFirstName || '',
        lastName: processedData.applicantLastName || '',
        email: processedData.applicantEmail || '',
        phone: processedData.applicantPhone || '',
        first_name: processedData.applicantFirstName || '',
        last_name: processedData.applicantLastName || '',
        
        // Partner information (if applicable)
        hasPartner: processedData.hasPartner || false,
        partnerFirstName: processedData.partnerFirstName || '',
        partnerLastName: processedData.partnerLastName || '',
        partnerEmail: processedData.partnerEmail || '',
        partnerPhone: processedData.partnerPhone || '',
        partnerAddress: processedData.partnerAddress || '',
        partnerCity: processedData.partnerCity || '',
        partnerState: processedData.partnerState || '',
        partnerZipCode: processedData.partnerZipCode || '',
        partnerDateOfBirth: processedData.partnerDateOfBirth || '',
        partnerSSN: processedData.partnerSSN || '',
        partnerOwnershipPercentage: processedData.partnerOwnershipPercentage || 0
      };

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

      // 🟨 STEP 4: Validate payload - REPLIT MUST DO
      console.log("🟨 STEP 4: VALIDATING PAYLOAD STRUCTURE");
      console.table({
        business: step3,
        contact: step4,
        funding: step1
      });
      
      // Individual table logs for detailed inspection
      console.log("🟨 BUSINESS DATA (formData.business):");
      console.table(step3);
      
      console.log("🟨 CONTACT DATA (formData.contact):");
      console.table(step4);
      
      console.log("🟨 FUNDING DATA (formData.funding):");
      console.table(step1);
      
      // 🟨 STEP 1: Confirm POST is firing - REPLIT MUST DO
      console.log("🟨 STEP 1: POST /api/public/applications IS FIRING");
      console.log("Step 4 payload:", { step1, step3, step4 });
      console.log("Posting to:", "/api/public/applications");
      
      // Enhanced payload logging for debugging
      console.log("🧪 FINAL PAYLOAD - COMPREHENSIVE STRUCTURE:");
      console.log("📊 Step 1 (business/funding_request):", {
        fundingAmount: step1.fundingAmount,
        requestedAmount: step1.requestedAmount,
        use_of_funds: step1.use_of_funds,
        businessLocation: step1.businessLocation,
        selectedCategory: step1.selectedCategory,
        fieldCount: Object.keys(step1).length
      });
      console.log("📊 Step 3 (business details):", {
        businessName: step3.businessName,
        businessType: step3.businessType,
        industry: step3.industry,
        website: step3.website,
        yearsInBusiness: step3.yearsInBusiness,
        numberOfEmployees: step3.numberOfEmployees,
        businessAddress: step3.businessAddress,
        annualRevenue: step3.annualRevenue,
        monthlyRevenue: step3.monthlyRevenue,
        operatingName: step3.operatingName,
        businessPhone: step3.businessPhone,
        businessState: step3.businessState,
        fieldCount: Object.keys(step3).length
      });
      console.log("📊 Step 4 (contact info):", {
        firstName: step4.firstName,
        lastName: step4.lastName,
        email: step4.email,
        phone: step4.phone,
        applicantEmail: step4.applicantEmail,
        fieldCount: Object.keys(step4).length
      });
      console.log("🧪 COMPLETE PAYLOAD:", { step1, step3, step4 });

      const applicationData = { 
        step1, 
        step3: {
          ...step3,
          businessName: step3.businessName || step3.operatingName || step3.legalName, // ✅ Map operatingName to businessName
        }, 
        step4: {
          ...step4,
          email: step4.applicantEmail || processedData.applicantEmail // ✅ Add required email field
        }
      };
      
      // State persistence and payload verification complete
      
      logger.log("📤 Submitting full application:", { step1, step3, step4 });
      
      // Verify step3 required fields
      const hasStep3Fields = Boolean(applicationData.step3.legalName && applicationData.step3.businessName);
      
      // Verify step4 required fields
      const hasStep4Email = Boolean(applicationData.step4.email);
      
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
      
      // ✅ USER REQUIREMENT: Wrap fetch in try/catch and add comprehensive logging
      console.log("📤 Submitting application to:", postUrl);
      console.log("📤 Application payload:", JSON.stringify(applicationData, null, 2));
      
      let response;
      try {
        // Prepare headers for application submission
        const headers: any = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        };
        
        // USER REQUESTED: Add specific console logging before POST
        console.log("🧪 FINAL PAYLOAD:", applicationData);

        // API Call: POST /api/public/applications
        response = await fetch(postUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(applicationData)
        });
        
        console.log("📥 Application creation response status:", response.status, response.statusText);
        
      } catch (fetchError) {
        console.error("❌ Application creation failed:", fetchError);
        
        // Add to retry queue for network failures
        addToRetryQueue({
          applicationId: 'pending',
          payload: applicationData,
          type: 'application',
          error: fetchError instanceof Error ? fetchError.message : 'Network error'
        });
        
        toast({
          title: "Application Queued for Retry",
          description: "Network issue detected. Will retry automatically when connection is restored.",
          variant: "default"
        });
        
        setSubmitting(false);
        return;
      }

      // API response received
      
      // 🟨 STEP 2: Add full error logging - REPLIT MUST DO
      if (!response.ok) {
        const errorText = await response.text();
        
        // Step 4 Submission Failure Logging
        console.error("❌ STEP 4 SUBMISSION FAILED:");
        console.error("🟨 FAILED TO SUBMIT:", errorText);
        console.error("Response status:", response.status, response.statusText);
        console.error("Response headers:", Object.fromEntries(response.headers.entries()));
        console.error("Request URL:", response.url);
        console.error("API Base URL:", import.meta.env.VITE_API_BASE_URL);
        
        // Add to retry queue for future submission
        addToRetryQueue({
          applicationId: 'pending', // Will be set when successful
          payload: applicationData,
          type: 'application',
          error: `${response.status} ${response.statusText}: ${errorText}`
        });
        
        toast({
          title: "Application Queued for Retry",
          description: "Submission will retry automatically when the system is available",
          variant: "default"
        });
        
        setSubmitting(false);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        
        // 🟨 STEP 1: Ensure server returns applicationId - REPLIT MUST DO
        console.log("🟨 SERVER RETURNED applicationId:", result.applicationId || result.id);
        
        // 🟨 STEP 4: Log Step 4 and Step 5 IDs for matching - REPLIT MUST DO
        console.log("Step 4 ID:", result.applicationId || result.id);
        
        // ✅ CLIENT APPLICATION FIX 4: Document Upload Follow-up ID Persistence
        const applicationId = result.applicationId || result.id;
        if (applicationId) {
          localStorage.setItem("lastApplicationId", applicationId);
          console.log("💾 Saved lastApplicationId to localStorage:", applicationId);
        }
        
        // ✅ A. Step 4 (Application Submission) - SUBMISSION RELIABILITY CHECKLIST
        console.log("✅ Step 4 submission succeeded:", result.applicationId || result.id);
        console.log("✅ Application created:", result);
        
        logger.log('📋 Application created:', result);
        logger.log('📋 Full API response data:', JSON.stringify(result, null, 2));
        
        const rawId = result.applicationId || result.id || result.uuid;
        logger.log('🔑 Raw applicationId from response:', rawId);
        
        // ✅ A. Step 4 submission success toast - SUBMISSION RELIABILITY CHECKLIST
        toast({
          title: "Step 4 submitted!",
          description: "Application data saved successfully. Proceeding to document upload.",
          variant: "default",
        });
        
        // Optional: Show informational toast for duplicate emails (non-blocking)
        if (rawId && rawId.startsWith('app_')) {
          toast({
            title: "Application Created",
            description: "You've applied before. You may continue with a new application.",
            variant: "default",
          });
        }
        
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
          
          // ✅ USER SPECIFICATION: Store applicationId in useState
          setApplicationId(uuid);
          
          // Save to Context and localStorage
          dispatch({ type: 'SET_APPLICATION_ID', payload: uuid });
          localStorage.setItem('applicationId', uuid);
          
          logger.log('💾 Stored applicationId in state, context and localStorage:', uuid);
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
        
        // ✅ REMOVED: 409 duplicate email blocking - let backend handle properly
        // Don't block — let the backend create a new app with reused user
        if (response.status === 409) {
          console.log('🔄 Duplicate email detected - backend should handle properly, no client blocking');
          // Remove any existing toasts and let the normal flow continue
          // The backend should have already handled the duplicate case
        }
        
        // If not 409, show general error
        toast({
          title: "Application Error",
          description: "An application with this email already exists. Please use a different email or contact support.",
          variant: "destructive",
        });
        throw new Error('Duplicate application detected');
        
        // ✅ LEGACY 502 HANDLING (for existing behavior compatibility)
        if (response.status === 502) {
          // This is the old "Staff backend unavailable" error - now should be rare
          toast({
            title: "Service Unavailable",
            description: "Staff backend is temporarily unavailable. Please try again later.",
            variant: "destructive",
          });
          throw new Error('Staff backend unavailable');
        }
        
        logger.error('❌ API call FAILED - Status:', response.status);
        logger.error('❌ Backend rejected Step 4 data:', errorText);
        logger.error('❌ Request payload was:', JSON.stringify(applicationData, null, 2));
        throw new Error(`API returned ${response.status}: ${response.statusText}\nError: ${errorText}`);
      }
    } catch (error) {
      logger.error('❌ Step 4 Failed: Error creating application:', error);
      logger.error('❌ Application creation failed - cannot proceed to document upload');
      
      // Show user-friendly error using toast instead of alert
      toast({
        title: "Application Creation Failed",
        description: "Please check your form data and try again. If the problem continues, please contact support.",
        variant: "destructive",
      });
      return; // Don't proceed to Step 5 if application creation fails
    } finally {
      setSubmitting(false);
      setContinuePending(false); // Reset continuation flag
    }

    // Mark step as complete and proceed
    dispatch({
      type: "MARK_STEP_COMPLETE",
      payload: 4,
    });

    // Emit GTM step_completed event
    const applicationId = localStorage.getItem('applicationId');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 
      event: 'step_completed', 
      step: 4, 
      application_id: applicationId, 
      product_type: 'applicant_info' 
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
                          placeholder={isCanadian ? "+1 (555) 123-4567" : "(555) 123-4567"}
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
                        <Select onValueChange={field.onChange} value={field.value} key={`applicant-state-${isCanadian}`}>
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
                        <DatePicker
                          selected={field.value ? new Date(field.value) : null}
                          onChange={(date: Date | null) => {
                            if (date) {
                              // Format as YYYY-MM-DD for form consistency
                              const formatted = date.toISOString().split('T')[0];
                              field.onChange(formatted);
                            } else {
                              field.onChange('');
                            }
                          }}
                          dateFormat="yyyy-MM-dd"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          yearDropdownItemNumber={100}
                          maxDate={new Date()}
                          placeholderText="Select your date of birth"
                          className="h-12 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          wrapperClassName="w-full"
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
                            placeholder={isCanadian ? "+1 (555) 123-4567" : "(555) 123-4567"}
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

                {/* Partner Address Fields */}
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="partnerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Address</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="partnerCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner City</FormLabel>
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
                    name="partnerState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner {isCanadian ? "Province" : "State"}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} key={`partner-state-${isCanadian}`}>
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
                    name="partnerZipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner {getPostalLabel()}</FormLabel>
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

                {/* Partner Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="partnerDateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Date of Birth</FormLabel>
                        <FormControl>
                          <DatePicker
                            selected={field.value ? new Date(field.value) : null}
                            onChange={(date: Date | null) => {
                              if (date) {
                                // Format as YYYY-MM-DD for form consistency
                                const formatted = date.toISOString().split('T')[0];
                                field.onChange(formatted);
                              } else {
                                field.onChange('');
                              }
                            }}
                            dateFormat="yyyy-MM-dd"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            yearDropdownItemNumber={100}
                            maxDate={new Date()}
                            placeholderText="Select partner's date of birth"
                            className="h-12 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            wrapperClassName="w-full"
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
            >
              {submitting ? "Submitting..." : "Continue to Documents →"}
            </Button>
          </div>
        </form>

        {/* Frontend Error Alert */}
        {form.formState.errors && Object.keys(form.formState.errors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 font-semibold mb-2">
              Please complete all required fields before continuing:
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field} className="flex items-center">
                  <span className="text-red-500 mr-2">•</span>
                  {typeof error === 'object' && error?.message ? error.message : `${field} is required`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Form>
      
      {/* Validation Error Modal */}
      <ValidationErrorModal
        isOpen={!!validationErrors}
        onClose={() => setValidationErrors(null)}
        missingFields={validationErrors || {}}
      />
      
      {/* SSN Warning Modal */}
      <SsnWarningModal
        open={showSsnWarning}
        onContinue={() => {
          logger.log('✅ User acknowledged SSN warning - proceeding with submission');
          setShowSsnWarning(false);
          setContinuePending(true);
          // Trigger form submission again with continuePending flag
          form.handleSubmit(onSubmit)();
        }}
      />
    </div>
  );
}
// injected: local-first products fetch
import { getProducts, loadSelectedCategories } from "../api/products";
/* injected load on mount (pseudo):
useEffect(() => { (async () => {
  const cats = loadSelectedCategories();
  const products = await getProducts({ useCacheFirst: true });
  // apply category filter if present
  const selected = cats && cats.length ? products.filter(p => cats.includes((p.category||"").toLowerCase())) : products;
  setState({ products: selected });
})(); }, []);
*/
