import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormData } from '@/context/FormDataContext';
import { useToast } from '@/hooks/use-toast';
import { extractUuid } from '@/lib/uuidUtils';
import { StepHeader } from '@/components/StepHeader';
import { RuntimeAlertPanel } from '@/components/RuntimeAlertPanel';
import { logger } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import FileSignature from 'lucide-react/dist/esm/icons/file-signature';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';

type SigningStatus = 'loading' | 'polling' | 'ready' | 'signing' | 'completed' | 'error';

/**
 * Step 6: SignNow Integration - API v2 Implementation
 * - Uses /api/public/applications/{id}/signing-status for initial fetch
 * - Embedded iframe with proper sandbox attributes
 * - Polls GET /api/public/signnow/status/{id} every 5s for signed status confirmation
 * - Auto-redirects to Step 7 when signature detected
 * - Manual override fallback via PATCH /api/public/applications/{id}/override-signing
 * - No webhook handling (webhooks only go to backend, not browser clients)
 */
export default function Step6SignNowIntegration() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useFormData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [signingStatus, setSigningStatus] = useState<SigningStatus>('loading');
  const [signUrl, setSignUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [timeoutWarning, setTimeoutWarning] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const retryCountRef = useRef(0);

  // Get applicationId from localStorage (always use stored value)
  const applicationId = localStorage.getItem("applicationId");
  
  // Navigation tracking to debug redirect issue
  logger.log('🧭 Step 6 mounted with applicationId:', applicationId);
  
  // Override setLocation to track any navigation attempts
  useEffect(() => {
    const originalSetLocation = setLocation;
    logger.log('🧭 Step 6 setLocation function type:', typeof setLocation);
    
    // Log any error that might trigger navigation
    const handleError = (error: any) => {
      logger.log('🚨 Step 6 error detected:', error);
      logger.log('🚨 This error might cause unwanted navigation');
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  // Load real signing URL on mount (only if we have a valid applicationId)
  useEffect(() => {
    if (applicationId && applicationId !== 'null' && applicationId.length > 10) {
      // ✅ A. Log the final POST payload exactly as specified
      logger.log("📤 Submitting full application:", {
        step1: state.step1,
        step3: state.step3,
        step4: state.step4,
      });
      
      // Also log the detailed structure for verification
      logger.log("🔍 Detailed payload structure:", {
        step1: {
          available: !!state.step1,
          fields: state.step1 ? Object.keys(state.step1) : [],
          sample: state.step1 ? { 
            requestedAmount: state.step1.requestedAmount || state.step1.fundingAmount,
            useOfFunds: state.step1.useOfFunds || state.step1.purposeOfFunds 
          } : null
        },
        step3: {
          available: !!state.step3,
          fields: state.step3 ? Object.keys(state.step3) : [],
          sample: state.step3 ? {
            businessName: state.step3.businessName || state.step3.operatingName,
            businessType: state.step3.businessType || state.step3.businessStructure
          } : null
        },
        step4: {
          available: !!state.step4,
          fields: state.step4 ? Object.keys(state.step4) : [],
          sample: state.step4 ? {
            firstName: state.step4.firstName,
            lastName: state.step4.lastName,
            email: state.step4.personalEmail
          } : null
        }
      });
      
      // Check for undefined blocks and rehydrate if needed
      if (!state.step1 || !state.step3 || !state.step4) {
        logger.warn("⚠️ Missing step data blocks - attempting rehydration from localStorage");
        
        // Attempt to rehydrate from localStorage
        const savedState = localStorage.getItem('formData');
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            logger.log("🔄 Rehydrated state from localStorage:", {
              step1: parsedState.step1,
              step3: parsedState.step3,
              step4: parsedState.step4,
            });
          } catch (e) {
            logger.error("❌ Failed to parse saved state from localStorage");
          }
        }
      }
      
      // ✅ CREATE SIGNNOW SMART FIELDS MAPPING
      // This is the critical missing piece - smart fields must be sent to staff backend
      // ✅ CRITICAL FIX: Use correct SignNow template field names
      const smartFields = {
        // Personal Information (using SignNow template field names)
        first_name: state.step4?.applicantFirstName || '',
        last_name: state.step4?.applicantLastName || '',
        email: state.step4?.applicantEmail || '',
        phone: state.step4?.applicantPhone || '',
        date_of_birth: state.step4?.applicantDateOfBirth || '',
        ssn: state.step4?.applicantSSN || '',
        address: state.step4?.applicantAddress || '',
        city: state.step4?.applicantCity || '',
        state: state.step4?.applicantState || '',
        zip: state.step4?.applicantZipCode || '',
        
        // Business Information (using SignNow template field names)
        legal_business_name: state.step3?.legalName || '',
        business_name: state.step3?.operatingName || '',
        business_address: state.step3?.businessAddress || state.step3?.businessStreetAddress || '',
        business_city: state.step3?.businessCity || '',
        business_state: state.step3?.businessState || '',
        business_zip: state.step3?.businessZip || state.step3?.businessZipCode || '',
        business_phone: state.step3?.businessPhone || '',
        business_website: state.step3?.businessWebsite || '',
        business_structure: state.step3?.businessStructure || '',
        business_start_date: state.step3?.businessStartDate || '',
        
        // Financial Information (using SignNow template field names)
        amount_requested: state.step1?.requestedAmount || '',
        purpose_of_funds: state.step1?.use_of_funds || state.step1?.purposeOfFunds || '',
        annual_revenue: state.step1?.lastYearRevenue || '',
        monthly_revenue: state.step1?.averageMonthlyRevenue || '',
        industry: state.step1?.industry || state.step1?.businessLocation || '',
        
        // Additional Fields (using SignNow template field names)
        ownership_percentage: state.step4?.ownershipPercentage || '100',
        credit_score: state.step4?.creditScore || '',
        years_with_business: state.step4?.yearsWithBusiness || ''
      };

      // ✅ Task 2: Smart Field Prefill Test - Required Field Validation
      const requiredFields = ['first_name', 'business_name', 'amount_requested'];
      const formData = {
        first_name: state.step4?.applicantFirstName,
        business_name: state.step3?.operatingName || state.step3?.legalName,
        amount_requested: state.step1?.requestedAmount
      };
      
      // ✅ BYPASS VALIDATION when proceeding without documents
      const bypassedDocuments = state.bypassedDocuments;
      
      // ✅ CRITICAL DEBUG: Log exact field values being checked
      console.log("🔍 =================================");
      console.log("🔍 STEP 6 SIGNNOW FIELD DEBUGGING");
      console.log("🔍 =================================");
      console.log("🔍 State data available:");
      console.log("   step1:", !!state.step1 ? Object.keys(state.step1) : "MISSING");
      console.log("   step3:", !!state.step3 ? Object.keys(state.step3) : "MISSING");
      console.log("   step4:", !!state.step4 ? Object.keys(state.step4) : "MISSING");
      
      console.log("🔍 Smart fields mapping check:");
      console.log("   contact_first_name:", `"${smartFields.contact_first_name}" (from step4.applicantFirstName)`);
      console.log("   business_dba_name:", `"${smartFields.business_dba_name}" (from step3.operatingName)`);
      console.log("   requested_amount:", `"${smartFields.requested_amount}" (from step1.requestedAmount)`);
      
      console.log("📋 Prefill validation check:", {
        bypassedDocuments,
        requiredFields,
        formData,
        hasAllRequiredFields: requiredFields.every(field => formData[field])
      });
      
      const missing = requiredFields.filter(field => !formData[field]);
      if (missing.length > 0 && !bypassedDocuments) {
        const missingFieldsMessage = `❌ Missing fields: ${missing.join(', ')}. Please go back and complete all required information.`;
        console.log("❌ PREFILL VALIDATION FAILED:", missingFieldsMessage);
        console.log("⚠️ If you used 'Proceed without Documents', this validation should be bypassed");
        alert(missingFieldsMessage);
        setError('Required fields missing for SignNow prefill');
        setSigningStatus('error');
        return;
      }
      
      if (bypassedDocuments) {
        console.log("✅ BYPASSED: Proceeding without documents - skipping prefill validation");
      }
      
      console.log("✅ Required fields validation passed:", formData);
      
      // ✅ Task 2: Enhanced Smart Field Pre-Fill Debugging
      const prefillData = {
        templateId: 'e7ba8b894c644999a7b38037ea66f4cc9cc524f5',
        smartFields,
        redirectUrl: 'https://clientportal.boreal.financial/#/step7-finalization',
        applicationId
      };
      
      console.log("🔍 Prefill Test Payload", JSON.stringify(prefillData, null, 2));
      console.log("Prefill Payload", prefillData);
      
      logger.log("📋 Smart Fields for SignNow Template:", smartFields);
      logger.log("🔍 Smart Fields Verification:", {
        totalFields: Object.keys(smartFields).length,
        populatedFields: Object.values(smartFields).filter(v => v && v !== '').length,
        emptyFields: Object.entries(smartFields).filter(([k,v]) => !v || v === '').map(([k]) => k)
      });
      
      // ✅ Log individual field values for debugging
      console.log("📋 Individual Smart Field Values:");
      Object.entries(smartFields).forEach(([key, value]) => {
        console.log(`  ${key}: "${value}"`);
      });
      
      logger.log('🔄 Fetching signing URL for application:', applicationId);
      logger.log('🎯 SignNow document creation endpoint:', `/api/public/signnow/initiate/${applicationId}`);
      logger.log('📋 Smart fields being sent to staff backend:', Object.keys(smartFields).length, 'fields');
      
      // ✅ Task 3: Log SignNow redirect URL configuration
      const redirectUrl = import.meta.env.VITE_SIGNNOW_REDIRECT_URL || 'https://clientportal.boreal.financial/#/step7-finalization';
      logger.log("🧭 Configuring redirect URL for SignNow:", redirectUrl);
      
      // ✅ SEND SMART FIELDS TO STAFF BACKEND FOR TEMPLATE POPULATION
      // Use the correct endpoint: POST /api/public/signnow/initiate/:applicationId
      fetch(`/api/public/signnow/initiate/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: 'e7ba8b894c644999a7b38037ea66f4cc9cc524f5',
          smartFields,
          redirectUrl: 'https://clientportal.boreal.financial/#/step7-finalization'
        })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .catch(fetchError => {
          logger.warn('📡 Signature status fetch failed with status:', fetchError.message);
          setError('Application not found or signing not available');
          setSigningStatus('error');
          // DO NOT redirect on error - stay on Step 6
          return null;
        })
        .then(data => {
          if (!data) return; // Skip if fetch failed
          
          logger.log('📄 SignNow document creation response:', data);
          logger.log('📋 Smart fields submitted successfully to staff backend');
          
          // ✅ NULL SAFETY CHECK: Check for redirect_url before loading iframe
          if (!data.signingUrl && !data.redirect_url) {
            logger.error('❌ No signing URL in response:', data);
            setError("Failed to retrieve signing URL. Please try again.");
            setSigningStatus('error');
            return;
          }
          
          // ✅ CHECK FOR ERROR STATUS: Show retry button if server returns { status: "error" }
          if (data.status === "error") {
            logger.error('❌ Server returned error status:', data);
            setError(data.message || "SignNow service temporarily unavailable. Please try again.");
            setSigningStatus('error');
            return;
          }
          
          // Use signing URL from response (check multiple possible field names)
          const signingUrl = data.signingUrl || data.redirect_url || data.signnow_url;
          
          if (signingUrl) {
            // ✅ Task 2: Debug log for signing URL
            console.log("SignNow URL:", signingUrl);
            logger.log('🔗 Setting signing URL from POST /api/public/signnow/initiate:', signingUrl);
            setSignUrl(signingUrl);
            setSigningStatus('ready');
            setStartTime(Date.now()); // Track when signing started
            
            // Check if this is a fallback URL
            if (signingUrl.includes('temp_') || data.fallback) {
              logger.warn('⚠️ Using fallback SignNow URL - staff backend unavailable');
              logger.warn('🔗 Fallback URL will not populate template fields:', signingUrl);
            } else {
              logger.log('✅ Using real SignNow URL with populated template fields from staff backend');
            }
          } else {
            logger.error('❌ No signing URL in response:', data);
            setError("Failed to retrieve signing URL. Please try again.");
            setSigningStatus('error');
          }
        })
        .catch(err => {
          logger.error('Failed to load signing URL:', err);
          setError('Failed to load signing document');
          setSigningStatus('error');
        });
    } else {
      logger.log('⚠️ No valid applicationId found, skipping SignNow URL fetch');
      setError('No application ID available - please restart the application process');
      setSigningStatus('error');
      // DO NOT redirect - show error message instead
    }
  }, [applicationId]);



  // Legacy polling function - now replaced by React Query above

  // React Query for SignNow status polling with improved redirect logic
  const { data: signingData, error: signingError } = useQuery({
    queryKey: ['signnowStatus', applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error('No application ID');
      
      const response = await fetch(`/api/public/signnow/status/${applicationId}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    refetchInterval: (data, query) => {
      const currentStatus = data?.status || data?.signing_status;
      console.log(`📡 Polling attempt ${retryCountRef.current + 1}/10 - Current status: ${currentStatus}`);
      
      // ✅ USER REQUIREMENT: Only stop polling when status === "signed" (not invite_sent)
      if (currentStatus === 'signed') {
        console.log("🛑 Stopping polling - Document signed!");
        return false;
      }
      
      // Continue polling for invite_sent - do NOT stop here
      if (currentStatus === 'invite_sent') {
        console.log("⏳ Document is invite_sent - continuing to poll until signed...");
      }
      
      // ✅ USER REQUIREMENT: Stop after 10 failures max
      if (currentStatus === 'failed' || retryCountRef.current >= 10) {
        console.log(`🛑 Stopping polling - Status: ${currentStatus}, Retries: ${retryCountRef.current}/10`);
        setTimeoutWarning('SignNow service not responding after 10 attempts. You can continue without signing.');
        return false;
      }
      
      retryCountRef.current++;
      return 9000; // ✅ USER REQUIREMENT: Poll every 9 seconds
    },
    enabled: !!applicationId && signingStatus === 'ready',
    retry: false,
    onError: (error: any) => {
      logger.warn("Polling error:", error.message);
      retryCountRef.current++;
      
      if (retryCountRef.current >= 10) {
        logger.warn('⏰ Max retries reached (10/10) - stopping polling');
        setTimeoutWarning('SignNow service is not responding after 10 attempts. You can continue without signing.');
        queryClient.cancelQueries(['signnowStatus']);
      }
    },
    onSuccess: (data) => {
      const currentStatus = data?.status || data?.signing_status;
      console.log("📊 Polling response received:", data);
      
      // ✅ IMPROVED: Only redirect when status === "signed"
      if (currentStatus === 'signed') {
        console.log('🎉 Document signed! Redirecting to Step 7...');
        logger.log('🎉 Document signed! Redirecting to Step 7...');
        
        toast({
          title: "Document Signed Successfully!",
          description: "Proceeding to final application submission.",
          variant: "default"
        });
        
        // Immediate redirect for signed status using router.push pattern
        setLocation('/apply/step-7');
      } else if (currentStatus === 'invite_sent') {
        console.log("📤 Document is invite_sent - waiting for signature completion...");
      } else {
        console.log("⏳ Still waiting for signature. Current status:", currentStatus);
      }
    }
  });

  // ✅ IMPROVED: Iframe unload fallback detection
  useEffect(() => {
    const handleIframeUnload = () => {
      console.log("🔄 Iframe unloaded - checking signing status...");
      
      // Check current signing status when iframe unloads
      if (applicationId) {
        fetch(`/api/public/signnow/status/${applicationId}`)
          .then(response => response.json())
          .then(data => {
            const currentStatus = data?.status || data?.signing_status;
            console.log("📋 Status check after iframe unload:", currentStatus);
            
            if (currentStatus === 'signed') {
              console.log("🎉 Document signed during iframe session! Auto-advancing...");
              toast({
                title: "Document Signed Successfully!",
                description: "Proceeding to final application submission.",
                variant: "default"
              });
              setLocation('/apply/step-7');
            }
          })
          .catch(error => {
            console.warn("Failed to check signing status after iframe unload:", error);
          });
      }
    };

    // Add event listener for iframe unload detection
    window.addEventListener('beforeunload', handleIframeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleIframeUnload);
      queryClient.cancelQueries(['signnowStatus']);
    };
  }, [queryClient, applicationId, setLocation, toast]);

  // Manual override for development
  const handleManualOverride = async () => {
    try {
      // ✅ USER REQUIREMENT: Send Step 6 status to staff when continuing without signing
      console.log("📤 Sending manual continue status to staff backend...");
      
      const overridePayload = {
        status: 'manual_continue',
        reason: 'User selected continue without signing',
        timestamp: new Date().toISOString(),
        pollingAttempts: retryCountRef.current,
        applicationId: applicationId
      };
      
      console.log("📋 Manual Continue Payload:", JSON.stringify(overridePayload, null, 2));
      
      const response = await fetch(`/api/public/applications/${applicationId}/override-signing`, { 
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(overridePayload)
      });
      
      if (response.ok) {
        console.log("✅ Manual continue status sent to staff successfully");
        logger.log("✅ Manual override status transmitted to staff backend");
      } else {
        console.log(`⚠️ Manual continue status transmission failed: ${response.status}`);
        logger.warn(`Manual override endpoint returned: ${response.status}`);
      }
      
      // ✅ USER REQUIREMENT: Proceed to Step 7 with visual confirmation
      toast({
        title: "Continuing Without Signature",
        description: "Status has been recorded. Proceeding to final submission.",
        variant: "default"
      });
      
      setLocation('/apply/step-7');
      
    } catch (err: any) {
      logger.error('Override failed:', err);
      console.log("❌ Manual continue failed:", err.message);
      toast({
        title: "Override Failed",
        description: "Unable to record status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStatusSection = () => {
    switch (signingStatus) {
      case 'loading':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                Initializing SignNow Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Setting up your signing session...
              </p>
            </CardContent>
          </Card>
        );

      case 'polling':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Preparing Documents for Signing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-gray-600">Fetching signing status...</span>
                </div>
                <p className="text-sm text-gray-500">
                  Connecting to SignNow service. This usually takes 1-3 minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 'ready':
        return (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <FileSignature className="w-5 h-5" />
                Documents Ready for Signing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-blue-700">
                  Your documents have been prepared and are ready for electronic signature.
                </p>
                {signUrl ? (
                  <div className="w-full space-y-4">
                    {signUrl.includes('temp_') && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                        <p className="text-sm text-amber-800">
                          ⚠️ <strong>Development Mode:</strong> Using fallback SignNow URL because staff backend is unavailable.
                          The document may not load properly in the iframe.
                        </p>
                      </div>
                    )}
                    
                    {/* Timeout Warning Display */}
                    {timeoutWarning && (
                      <Alert className="border-amber-200 bg-amber-50">
                        <Clock className="h-4 w-4" />
                        <AlertDescription className="text-amber-800">
                          <strong>Signing Timeout Notice:</strong> {timeoutWarning}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        src={signUrl}
                        width="100%"
                        height="700px"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        allow="camera; microphone; fullscreen"
                        style={{ border: 'none', borderRadius: '8px' }}
                        title="SignNow Document Signing"
                        onLoad={() => {
                          logger.log('📄 SignNow iframe loaded successfully');
                          if (signUrl.includes('temp_')) {
                            logger.warn('⚠️ Iframe loaded but using fake URL - document will not work');
                          }
                        }}
                        onError={(e) => {
                          logger.error('❌ SignNow iframe failed to load:', e);
                          if (signUrl.includes('temp_')) {
                            logger.error('🔗 Expected error: Fake URL cannot load real SignNow document');
                          }
                        }}
                      />
                    </div>
                    
                    <div className="text-center text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      Signing URL: {signUrl}
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleManualOverride}
                        variant="outline" 
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        {signUrl.includes('temp_') ? 'Continue Without Signing (Dev Mode)' : "I've Signed the Document – Continue"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-700">
                        🚨 Signing temporarily unavailable.
                        <br />
                        Please check back later or contact support.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={handleManualOverride}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Continue Without Signing
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'completed':
        return (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Signature Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-green-700">
                  Your documents have been successfully signed. Redirecting to final review...
                </p>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-green-600">Redirecting to Step 7...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'error':
        return (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                Signing Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-red-700">{error}</p>
                
                {/* ✅ RETRY BUTTON: Show retry button for server errors */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setError('');
                      setSigningStatus('loading');
                      // Trigger re-fetch of signing URL
                      window.location.reload();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Loader2 className="w-4 h-4 mr-2" />
                    Retry Signing
                  </Button>
                  
                  <Button 
                    onClick={handleManualOverride}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    Continue Without Signing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <RuntimeAlertPanel currentStep={6} />
      <div className="container mx-auto px-4 py-8">
        <StepHeader 
          currentStep={6} 
          totalSteps={7} 
          title="Electronic Signature"
          description="Complete the signing process for your application"
        />

        <div className="flex justify-between items-center mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation('/apply/step-5')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Document Upload
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {renderStatusSection()}
          
          {applicationId && (
            <div className="mt-4 text-center text-xs text-gray-500">
              Application ID: {applicationId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}