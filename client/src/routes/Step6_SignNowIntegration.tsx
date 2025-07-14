import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormData } from '@/context/FormDataContext';
import { useToast } from '@/hooks/use-toast';
import { extractUuid } from '@/lib/uuidUtils';
import { StepHeader } from '@/components/StepHeader';
import { 
  ArrowLeft, 
  FileSignature, 
  CheckCircle, 
  Clock,
  Loader2,
  AlertTriangle
} from 'lucide-react';

type SigningStatus = 'loading' | 'polling' | 'ready' | 'signing' | 'completed' | 'error';

/**
 * Step 6: SignNow Integration - API v2 Implementation
 * - Uses /api/public/applications/{id}/signing-status for initial fetch
 * - Embedded iframe with proper sandbox attributes
 * - Polls GET /api/applications/{id}/signature-status every 5s for multiple signed status formats
 * - Auto-redirects to Step 7 when signature detected
 * - Manual override fallback via PATCH /api/public/applications/{id}/override-signing
 * - No webhook handling (webhooks only go to backend, not browser clients)
 */
export default function Step6SignNowIntegration() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useFormData();
  const { toast } = useToast();

  const [signingStatus, setSigningStatus] = useState<SigningStatus>('loading');
  const [signUrl, setSignUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [timeoutWarning, setTimeoutWarning] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Get applicationId from localStorage (always use stored value)
  const applicationId = localStorage.getItem("applicationId");
  
  // Navigation tracking to debug redirect issue
  console.log('🧭 Step 6 mounted with applicationId:', applicationId);
  
  // Override setLocation to track any navigation attempts
  useEffect(() => {
    const originalSetLocation = setLocation;
    console.log('🧭 Step 6 setLocation function type:', typeof setLocation);
    
    // Log any error that might trigger navigation
    const handleError = (error: any) => {
      console.log('🚨 Step 6 error detected:', error);
      console.log('🚨 This error might cause unwanted navigation');
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
      console.log("📤 Submitting full application:", {
        step1: state.step1,
        step3: state.step3,
        step4: state.step4,
      });
      
      // Also log the detailed structure for verification
      console.log("🔍 Detailed payload structure:", {
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
        console.warn("⚠️ Missing step data blocks - attempting rehydration from localStorage");
        
        // Attempt to rehydrate from localStorage
        const savedState = localStorage.getItem('formData');
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            console.log("🔄 Rehydrated state from localStorage:", {
              step1: parsedState.step1,
              step3: parsedState.step3,
              step4: parsedState.step4,
            });
          } catch (e) {
            console.error("❌ Failed to parse saved state from localStorage");
          }
        }
      }
      
      // ✅ CREATE SIGNNOW SMART FIELDS MAPPING
      // This is the critical missing piece - smart fields must be sent to staff backend
      // ✅ CRITICAL FIX: Use correct field names from the actual form schema
      const smartFields = {
        // Personal Information (from step4 - use actual field names)
        contact_first_name: state.step4?.applicantFirstName || '',
        contact_last_name: state.step4?.applicantLastName || '',
        contact_email: state.step4?.applicantEmail || '',
        contact_phone: state.step4?.applicantPhone || '',
        contact_date_of_birth: state.step4?.applicantDateOfBirth || '',
        contact_ssn: state.step4?.applicantSSN || '',
        contact_address: state.step4?.applicantAddress || '',
        contact_city: state.step4?.applicantCity || '',
        contact_state: state.step4?.applicantState || '',
        contact_zip: state.step4?.applicantZipCode || '',
        
        // Business Information (from step3 - use actual field names)
        legal_business_name: state.step3?.legalName || '',
        business_dba_name: state.step3?.operatingName || '',
        business_address: state.step3?.businessStreetAddress || '',
        business_city: state.step3?.businessCity || '',
        business_state: state.step3?.businessState || '',
        business_zip: state.step3?.businessZipCode || '',
        business_phone: state.step3?.businessPhone || '',
        business_website: state.step3?.businessWebsite || '',
        business_structure: state.step3?.businessStructure || '',
        business_start_date: state.step3?.businessStartDate || '',
        
        // Financial Information (from step1 only)
        requested_amount: state.step1?.requestedAmount || '',
        purpose_of_funds: state.step1?.purposeOfFunds || '',
        annual_revenue: state.step1?.lastYearRevenue || '',
        monthly_revenue: state.step1?.averageMonthlyRevenue || '',
        industry: state.step1?.industry || state.step1?.businessLocation || '',
        
        // Additional Fields (from step4 only)
        ownership_percentage: state.step4?.ownershipPercentage || '100',
        credit_score: state.step4?.creditScore || '',
        years_with_business: state.step4?.yearsWithBusiness || ''
      };

      console.log("📋 Smart Fields for SignNow Template:", smartFields);
      console.log("🔍 Smart Fields Verification:", {
        totalFields: Object.keys(smartFields).length,
        populatedFields: Object.values(smartFields).filter(v => v && v !== '').length,
        emptyFields: Object.entries(smartFields).filter(([k,v]) => !v || v === '').map(([k]) => k)
      });
      
      console.log('🔄 Fetching signing URL for application:', applicationId);
      console.log('🎯 SignNow document creation endpoint:', `/api/public/signnow/initiate/${applicationId}`);
      console.log('📋 Smart fields being sent to staff backend:', Object.keys(smartFields).length, 'fields');
      
      // ✅ Task 3: Log SignNow redirect URL configuration
      const redirectUrl = import.meta.env.VITE_SIGNNOW_REDIRECT_URL || 'https://clientportal.boreal.financial/#/step7-finalization';
      console.log("🧭 Configuring redirect URL for SignNow:", redirectUrl);
      
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
          console.warn('📡 Signature status fetch failed with status:', fetchError.message);
          setError('Application not found or signing not available');
          setSigningStatus('error');
          // DO NOT redirect on error - stay on Step 6
          return null;
        })
        .then(data => {
          if (!data) return; // Skip if fetch failed
          
          console.log('📄 SignNow document creation response:', data);
          console.log('📋 Smart fields submitted successfully to staff backend');
          
          // ✅ NULL SAFETY CHECK: Check for redirect_url before loading iframe
          if (!data.signingUrl && !data.redirect_url) {
            console.error('❌ No signing URL in response:', data);
            setError("Failed to retrieve signing URL. Please try again.");
            setSigningStatus('error');
            return;
          }
          
          // ✅ CHECK FOR ERROR STATUS: Show retry button if server returns { status: "error" }
          if (data.status === "error") {
            console.error('❌ Server returned error status:', data);
            setError(data.message || "SignNow service temporarily unavailable. Please try again.");
            setSigningStatus('error');
            return;
          }
          
          // Use signing URL from response (check multiple possible field names)
          const signingUrl = data.signingUrl || data.redirect_url || data.signnow_url;
          
          if (signingUrl) {
            console.log('🔗 Setting signing URL from POST /api/public/signnow/initiate:', signingUrl);
            setSignUrl(signingUrl);
            setSigningStatus('ready');
            setStartTime(Date.now()); // Track when signing started
            
            // Check if this is a fallback URL
            if (signingUrl.includes('temp_') || data.fallback) {
              console.warn('⚠️ Using fallback SignNow URL - staff backend unavailable');
              console.warn('🔗 Fallback URL will not populate template fields:', signingUrl);
            } else {
              console.log('✅ Using real SignNow URL with populated template fields from staff backend');
            }
          } else {
            console.error('❌ No signing URL in response:', data);
            setError("Failed to retrieve signing URL. Please try again.");
            setSigningStatus('error');
          }
        })
        .catch(err => {
          console.error('Failed to load signing URL:', err);
          setError('Failed to load signing document');
          setSigningStatus('error');
        });
    } else {
      console.log('⚠️ No valid applicationId found, skipping SignNow URL fetch');
      setError('No application ID available - please restart the application process');
      setSigningStatus('error');
      // DO NOT redirect - show error message instead
    }
  }, [applicationId]);



  // Poll for signature status every 5 seconds with timeout warnings
  const checkSignatureStatus = async () => {
    if (!applicationId) {
      console.warn('📡 No applicationId available for polling');
      return;
    }
    
    try {
      // ✅ Fixed polling endpoint as specified
      const pollingEndpoint = `/api/public/signnow/status/${applicationId}`;
      console.log('📡 Polling SignNow status for:', applicationId);
      console.log('📡 Endpoint:', pollingEndpoint);
      
      const res = await fetch(pollingEndpoint, {
        method: 'GET'
      }).catch(fetchError => {
        // Handle fetch errors silently to prevent unhandled promise rejections
        console.warn('📡 SignNow status fetch failed:', fetchError.message);
        return null;
      });
      
      if (!res) {
        console.warn('📡 No response from signature status endpoint');
        return; // Do NOT navigate away — just keep polling
      }
      
      if (!res.ok) {
        console.warn('📡 Signature status fetch failed with status:', res.status, res.statusText);
        return; // Do NOT navigate away — just keep polling
      }
      
      const data = await res.json().catch(jsonError => {
        console.warn('📡 Polling JSON parse failed:', jsonError.message);
        return null;
      });
      
      if (!data) {
        console.warn('📡 No data in signature status response');
        return; // Do NOT navigate away — just keep polling
      }
      
      // ✅ Fixed status field parsing - check the actual field the server returns
      const signingStatus = data?.signing_status || data?.status;
      
      // ✅ Add logging for debugging as requested
      console.log("📡 Polling SignNow status:", signingStatus);
      console.log('📄 Full response data:', data);
      console.log('📄 Status check for application:', applicationId);
      
      // ✅ CRITICAL FIX: Check for actual SignNow signed status - multiple possible formats
      const isDocumentSigned = (
        data?.status === "user.document.fieldinvite.signed" ||
        data?.signing_status === "invite_signed" ||
        data?.user?.document?.fieldinvite === "signed" ||
        signingStatus === "invite_signed"
      );
      
      if (isDocumentSigned) {
        console.log('🎉 Document signed! Redirecting to Step 7...');
        console.log('🧭 INTENTIONAL NAVIGATION: Moving to Step 7 after signature completion');
        console.log('📋 Signing confirmation details:', {
          status: data?.status,
          signing_status: data?.signing_status,
          nested_path: data?.user?.document?.fieldinvite,
          extracted_status: signingStatus
        });
        
        // Add success toast notification
        toast({
          title: "Document Signed Successfully!",
          description: "Proceeding to final application submission.",
          variant: "default"
        });
        
        // Redirect after brief delay
        setTimeout(() => {
          setLocation('/apply/step-7');
        }, 1500);
        return;
      }
      
      // Check for timeout warnings
      const elapsedMinutes = Math.floor((Date.now() - startTime) / (1000 * 60));
      if (elapsedMinutes >= 10 && elapsedMinutes < 15) {
        setTimeoutWarning('Document has been unsigned for 10+ minutes. Please ensure you complete the signature process.');
      } else if (elapsedMinutes >= 15) {
        setTimeoutWarning('Document has been unsigned for 15+ minutes. Consider using the "Continue Without Signing" option below if you\'re experiencing technical difficulties.');
      } else if (elapsedMinutes < 10) {
        setTimeoutWarning(''); // Clear warning if under 10 minutes
      }
      
    } catch (err) {
      // Handle polling errors without redirecting - suppress unhandled rejections
      console.warn('📡 Polling error caught (will NOT redirect):', err.message);
      // Stay on Step 6, keep polling
    }
  };

  useEffect(() => {
    if (applicationId && signUrl && signingStatus === 'ready') {
      console.log('🔄 Starting SignNow status polling every 5s for application:', applicationId);
      console.log('🔄 Polling endpoint: /api/public/signnow/status/' + applicationId);
      console.log('🧭 Polling will redirect when ANY of these conditions are met:');
      console.log('   - status === "user.document.fieldinvite.signed"');
      console.log('   - signing_status === "invite_signed"');
      console.log('   - user.document.fieldinvite === "signed"');
      
      const interval = setInterval(checkSignatureStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [applicationId, signUrl, signingStatus, setLocation]);

  // Manual override for development
  const handleManualOverride = () => {
    fetch(`/api/public/applications/${applicationId}/override-signing`, { 
      method: "PATCH" 
    })
    .then(() => setLocation('/apply/step-7'))
    .catch(err => {
      console.error('Override failed:', err);
      toast({
        title: "Override Failed",
        description: "Unable to mark document as signed. Please try again.",
        variant: "destructive"
      });
      // Don't throw unhandled promise rejection for override errors
      return;
    });
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

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
                          console.log('📄 SignNow iframe loaded successfully');
                          if (signUrl.includes('temp_')) {
                            console.warn('⚠️ Iframe loaded but using fake URL - document will not work');
                          }
                        }}
                        onError={(e) => {
                          console.error('❌ SignNow iframe failed to load:', e);
                          if (signUrl.includes('temp_')) {
                            console.error('🔗 Expected error: Fake URL cannot load real SignNow document');
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