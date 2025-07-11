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
 * Per specification:
 * 1. Display loading UI while waiting for SignNow link
 * 2. Poll GET /applications/{id}/signing-status
 * 3. Once status is "ready", fetch GET /applications/{id}/signing-url  
 * 4. Open SignNow signing window
 * 5. Detect completion and auto-navigate to Step 7
 */
export default function Step6SignNowIntegration() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [signingStatus, setSigningStatus] = useState<SigningStatus>('loading');
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // C-5: Track retry attempts for auto-retry

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

    console.log('📡 Calling SignNow endpoint:', signNowUrl);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/applications/${applicationId}/signnow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
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
      } else {
        throw new Error('Invalid SignNow response structure');
      }
    } catch (err: any) {
      console.error('❌ SignNow fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create SignNow document');
      setSigningStatus('error');
    }
  };

  // Step 4: Handle Signing Status  
  // Preferred: Wait for backend webhook to process
  // Fallback: Poll periodically using GET /api/public/applications/:applicationId/signing-status
  const startPollingSigningStatus = () => {
    if (isPolling) return;
    
    setIsPolling(true);
    console.log('🔄 Step 4: Starting signing status polling...');
    
    const pollInterval = setInterval(async () => {
      try {
        // GET /api/public/applications/:applicationId/signing-status
        // Check: signingStatus === 'completed'
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
          console.log('📊 Step 4: Polling status result:', result.signingStatus);
          
          if (result.signingStatus === 'ready' && result.signUrl) {
            console.log('✅ Step 4: Document ready for signing');
            setSignUrl(result.signUrl);
            setSigningStatus('ready');
            clearInterval(pollInterval);
            setIsPolling(false);
          } else if (result.signingStatus === 'completed') {
            console.log('✅ Step 5: Signing completed - auto-redirecting to Step 7');
            setSigningStatus('completed');
            clearInterval(pollInterval);
            setIsPolling(false);
            
            // Step 5: Auto-Redirect to Step 7
            // Action: When signing is complete: navigate('/step7');
            setTimeout(() => {
              setLocation('/apply/step-7');
            }, 2000);
          } else if (result.signingStatus === 'error') {
            setError('Document signing failed. Please try again.');
            setSigningStatus('error');
            clearInterval(pollInterval);
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error('Step 4: Polling error:', error);
        setRetryCount(prev => prev + 1);
        
        // Stop polling after too many failures
        if (retryCount >= 10) {
          setError('Unable to check signing status. Please refresh the page.');
          setSigningStatus('error');
          clearInterval(pollInterval);
          setIsPolling(false);
        }
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
      if (signingStatus === 'polling') {
        setError('Signing document is taking longer than expected. Please refresh the page.');
        setSigningStatus('error');
      }
    }, 300000);
  };

  const handleOpenSigningUrl = () => {
    if (signUrl) {
      console.log('📝 Opening SignNow signing URL...');
      // Open signUrl in embedded iframe or new tab
      window.open(signUrl, '_blank', 'width=900,height=700');
      setSigningStatus('signing');
      
      // Start polling to detect completion
      startPollingSigningStatus();
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
                  Your documents have been prepared and are ready for electronic signature via SignNow.
                </p>
                <Button onClick={handleOpenSigningUrl} className="w-full bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open SignNow Signing Window
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  This will open SignNow in a new tab. Complete the signing process and we'll automatically detect completion.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 'signing':
        return (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Eye className="w-5 h-5" />
                Waiting for Signature Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-orange-700">Monitoring for signature completion...</span>
                </div>
                <p className="text-orange-600">
                  Complete the signing process in the SignNow window. We'll automatically proceed once signing is finished.
                </p>
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    You can continue signing in the other tab. We're monitoring the status and will automatically proceed.
                  </AlertDescription>
                </Alert>
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