import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormData } from '@/context/FormDataContext';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';
import { extractUuid } from '@/lib/uuidUtils';
import { StepHeader } from '@/components/StepHeader';
import SignNowIframe from '@/components/SignNowIframe';
import { 
  ArrowLeft, 
  ExternalLink, 
  FileSignature, 
  CheckCircle, 
  Clock,
  Loader2,
  AlertTriangle,
  Eye,
  XCircle
} from 'lucide-react';

type SigningStatus = 'loading' | 'polling' | 'ready' | 'signing' | 'complete' | 'completed' | 'error';

/**
 * Step 6: SignNow Integration
 * CLIENT APPLICATION (Frontend-Only) - Per specification:
 * 1. User completes Steps 1–5, uploads documents, application ID created
 * 2. User reaches Step 6: Electronic Signature
 * 3. Triggers call to: GET /api/applications/:applicationId/signnow
 * 4. Displays "Preparing your documents" loader
 * 5. Waits for signUrl from backend
 * 6. If received → shows "Open SignNow Signing Window" button
 * 7. If 404/501 → shows error fallback UI
 * 8. User clicks to open SignNow in new tab
 * 9. User signs document on SignNow site
 * 10. Client polls /api/applications/:applicationId/signnow until status = signed
 * 11. Once signed, Step 7 becomes available: Final review & submission
 * 
 * ✅ Client Responsibilities:
 * - Never stores SignNow credentials or template ID
 * - Only renders UI based on backend response
 * - Handles navigation and user feedback
 */
export default function Step6SignNowIntegration() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [signingStatus, setSigningStatus] = useState<SigningStatus>('loading');
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Auto-save signing progress with 2-second delay
  const debouncedSave = useDebouncedCallback((status: SigningStatus, url: string | null) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        signingStatus: status,
        signUrl: url,
        step6Progress: {
          status,
          url,
          timestamp: new Date().toISOString()
        }
      }
    });
    console.log('💾 Step 6 - Auto-saved signing progress:', status);
  }, 2000);

  // Trigger autosave when signing status or URL changes
  useEffect(() => {
    debouncedSave(signingStatus, signUrl);
  }, [signingStatus, signUrl, debouncedSave]);

  // Enhanced recovery logic for applicationId - as specified by user
  useEffect(() => {
    if (!state.applicationId) {
      const storedId = localStorage.getItem("applicationId");
      if (storedId) {
        const uuid = extractUuid(storedId); // Strip any prefixes
        dispatch({
          type: "UPDATE_FORM_DATA",
          payload: { applicationId: uuid },
        });
        console.log("💾 Step 6: Recovered applicationId from localStorage:", uuid);
      } else {
        console.error("❌ No application ID found in context or storage.");
        setError('No application ID found. Please complete Step 4 first.');
        setSigningStatus('error');
      }
    }
  }, [state.applicationId, dispatch]);

  // Use clean UUID from context or localStorage
  const applicationId = localStorage.getItem("applicationId"); // Always pull from storage

  useEffect(() => {
    console.log("🧭 Step 6 mounted. Application ID:", applicationId);
    console.log('🔍 Step 6 loaded. FormData ID:', state.applicationId);
    console.log('🔍 LocalStorage ID:', localStorage.getItem("applicationId"));
    console.log('🔍 Final applicationId:', applicationId);
    
    console.log("🧪 Checking trigger conditions...", {
      applicationId,
      signingStatus,
    });

    if (!applicationId) {
      console.warn("⛔ No application ID. Aborting.");
      setError('No application ID found. Please complete Step 4 first.');
      setSigningStatus('error');
      console.error('❌ No application ID available in Step 6');
      return;
    }

    if (signingStatus === 'success') {
      console.info("✅ Already signed. Skipping.");
      return;
    }
    
    console.log('✅ Step 6 applicationId verified:', applicationId);
    console.log('🔍 This should be identical to Step 4 applicationId');

    // Check if we already have signingUrl from Step 4 POST /applications/initiate-signing
    const existingSigningUrl = (state as any).step6?.signingUrl;
    if (existingSigningUrl) {
      console.log('✅ Step 6: Received signingUrl from Step 4:', existingSigningUrl);
      setSignUrl(existingSigningUrl);
      setSigningStatus('ready');
      return;
    }

    // Create SignNow document using correct API endpoint
    console.log("🚀 Triggering createSignNowDocument()");
    createSignNowDocument();
  }, [applicationId]);

  const createSignNowDocument = async () => {
    console.log('🚀 Triggered createSignNowDocument()');
    
    if (!applicationId) return;
    
    setSigningStatus('loading');
    setError(null);
    
    console.log('🌍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('🆔 Application ID:', applicationId);

    const signNowUrl = `${import.meta.env.VITE_API_BASE_URL}/applications/${applicationId}/signnow`;

    console.log('📡 Calling SignNow endpoint (GET):', signNowUrl);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/applications/${applicationId}/signnow`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include'
      });

      console.log('📬 SignNow response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SignNow error body:', errorText);
        throw new Error(`SignNow request failed: ${response.status}`);
      }

      const json = await response.json();
      console.log('✅ SignNow response JSON:', json);

      if (json.success && json.data?.signingUrl) {
        setSignUrl(json.data.signingUrl);
        setSigningStatus('ready');
        // Start automatic polling for completion
        startAutomaticPolling();
      } else {
        throw new Error('Invalid SignNow response structure');
      }
    } catch (err: any) {
      console.error('❌ SignNow fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create SignNow document');
      setSigningStatus('error');
    }
  };

  // Automatic polling for signing completion detection
  const startAutomaticPolling = () => {
    if (isPolling) return;
    
    setIsPolling(true);
    console.log('🔄 Starting automatic signing status polling...');
    
    const interval = setInterval(async () => {
      try {
        const pollingUrl = `${import.meta.env.VITE_API_BASE_URL}/public/applications/${applicationId}/signing-status`;
        console.log("🔍 Polling URL:", pollingUrl);
        
        const response = await fetch(pollingUrl, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
          },
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📊 Polling status result:', result);
          
          // Check for completion using the specified format
          if (result?.data?.canAdvance || result?.data?.signed || result.signingStatus === 'completed') {
            console.log('✅ Signing completed - auto-redirecting to Step 7');
            setSigningStatus('completed');
            
            // Clear the polling interval
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
            setIsPolling(false);
            
            // Auto-redirect to Step 7
            setTimeout(() => {
              setLocation('/apply/step-7');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        setRetryCount(prev => prev + 1);
        
        // Stop polling after too many failures
        if (retryCount >= 10) {
          setError('Unable to check signing status. Please refresh the page.');
          setSigningStatus('error');
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          setIsPolling(false);
        }
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);

    // Cleanup polling after 10 minutes
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPollingInterval(null);
      }
      setIsPolling(false);
      if (signingStatus !== 'completed') {
        setError('Signing document is taking longer than expected. Please refresh the page.');
        setSigningStatus('error');
      }
    }, 600000);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleIframeLoad = () => {
    console.log('📝 SignNow iframe loaded successfully');
    setSigningStatus('signing');
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
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-gray-600">Polling GET /applications/{applicationId}/signing-status</span>
                </div>
                <p className="text-sm text-gray-500">
                  Waiting for status: "ready". This usually takes 1-3 minutes.
                </p>
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Your documents are being prepared in the background. We'll automatically proceed when ready.
                  </AlertDescription>
                </Alert>
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
                  Your documents have been prepared and are ready for electronic signature. Complete the signing process below.
                </p>
                {signUrl ? (
                  <div className="w-full">
                    <SignNowIframe signingUrl={signUrl} />
                  </div>
                ) : (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <Clock className="h-4 w-4" />
                    <AlertDescription className="text-yellow-700">
                      Still preparing your documents. Please wait...
                      <br />
                      <span className="text-xs">Application ID: {applicationId || 'Not available'}</span>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'signing':
        return (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <FileSignature className="w-5 h-5" />
                Complete Your Signature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-orange-700">Monitoring for signature completion...</span>
                </div>
                <p className="text-orange-600">
                  Complete the signing process in the embedded SignNow window below. We'll automatically proceed once signing is finished.
                </p>
                {signUrl ? (
                  <div className="w-full">
                    <SignNowIframe signingUrl={signUrl} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <Clock className="h-4 w-4" />
                      <AlertDescription className="text-yellow-700">
                        Still preparing your documents. Please wait...
                        <br />
                        <span className="text-xs">Application ID: {applicationId || 'Not available'}</span>
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={createSignNowDocument} 
                      variant="outline" 
                      className="w-full"
                    >
                      Retry Document Preparation
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
                <XCircle className="w-5 h-5" />
                SignNow Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-red-700">
                  {error || 'There was an issue with the signing process. Please try again.'}
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setLocation('/apply/step-5')} variant="outline">
                    Go Back
                  </Button>
                  <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                    Try Again
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <StepHeader 
          stepNumber={6}
          title="Electronic Signature"
          description="Sign your application documents electronically using SignNow. This secure process ensures your application is legally binding and ready for processing."
        />

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {renderStatusSection()}
        </div>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-2xl mx-auto mt-8">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Application ID: {applicationId || 'Not set'}</div>
                  <div>Signing Status: {signingStatus}</div>
                  <div>Sign URL: {signUrl ? 'Available' : 'Not available'}</div>
                  <div>Is Polling: {isPolling ? 'Yes' : 'No'}</div>
                  <div>Retry Count: {retryCount}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}