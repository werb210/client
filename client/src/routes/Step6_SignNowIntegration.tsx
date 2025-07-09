import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormData } from '@/context/FormDataContext';
import { useToast } from '@/hooks/use-toast';
import { staffApi } from '../api/staffApi';
import { useDebouncedCallback } from 'use-debounce';
import { 
  ArrowLeft, 
  ExternalLink, 
  FileSignature, 
  CheckCircle, 
  Clock,
  Loader2,
  AlertTriangle,
  Eye
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

  // C-4: Single source of truth for applicationId - always use useApplicationId() pattern
  const applicationId = state.applicationId || localStorage.getItem('appId');

  useEffect(() => {
    console.log('🔍 Step 6: Checking application ID...');
    console.log('   - From context:', state.applicationId);
    console.log('   - From localStorage:', localStorage.getItem('appId'));
    console.log('   - Final applicationId:', applicationId);
    
    if (!applicationId) {
      setError('No application ID found. Please complete Step 4 first.');
      setSigningStatus('error');
      console.error('❌ C-4 FAILED: No application ID available in Step 6');
      return;
    }
    
    console.log('✅ C-4 SUCCESS: Application ID found:', applicationId);

    // Check if we already have signingUrl from Step 4 POST /applications/initiate-signing
    const existingSigningUrl = (state as any).step6?.signingUrl;
    if (existingSigningUrl) {
      console.log('✅ Step 6: Received signingUrl from Step 4:', existingSigningUrl);
      setSignUrl(existingSigningUrl);
      setSigningStatus('ready');
      return;
    }

    // Fallback: Start polling for signing status if no URL provided
    console.log('🔄 Step 6: No signingUrl from Step 4, starting polling...');
    startSigningStatusPolling();
  }, [applicationId]);

  const startSigningStatusPolling = async () => {
    if (!applicationId || isPolling) return;
    
    setIsPolling(true);
    setSigningStatus('polling');
    console.log('🔄 Step 6: Polling GET /applications/{id}/signing-status...');
    
    const maxAttempts = 60; // 10 minutes with 10-second intervals
    let attempts = 0;
    
    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setIsPolling(false);
        setSigningStatus('error');
        setError('Signing preparation timeout - documents taking longer than expected');
        toast({
          title: "Preparation Timeout",
          description: "Document preparation is taking longer than expected. Please contact support.",
          variant: "destructive",
        });
        return;
      }
      
      attempts++;
      console.log(`🔍 Polling attempt ${attempts}/${maxAttempts}: GET /api/public/applications/${applicationId}/signing-status`);
      
      try {
        // C-5: Polling endpoint uses the ID - should return 200/202, never 404
        const statusResult = await staffApi.checkSigningStatus(applicationId);
        console.log(`✅ C-5 SUCCESS: API call successful for ID ${applicationId}`);
        
        if (statusResult.status === 'ready') {
          console.log('✅ Status "ready" received, fetching signing URL...');
          await fetchSigningUrl();
          
        } else if (statusResult.status === 'completed') {
          console.log('✅ Signing already completed, proceeding to Step 7...');
          handleSigningComplete();
          
        } else if (statusResult.status === 'error') {
          setSigningStatus('error');
          setIsPolling(false);
          setError(statusResult.error || 'Document preparation failed');
          
          toast({
            title: "Document Preparation Error",
            description: statusResult.error || "Failed to prepare documents for signing",
            variant: "destructive",
          });
          
        } else {
          // Continue polling - status is still 'pending'
          console.log(`⏳ Status: ${statusResult.status}, continuing to poll...`);
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        }
        
      } catch (error) {
        console.error('❌ Failed to check signing status:', error);
        setRetryCount(prev => prev + 1);
        
        // After too many retries, show bypass option
        if (retryCount >= 5) {
          setSigningStatus('error');
          setIsPolling(false);
          setError('SignNow service is currently unavailable. You may proceed to the next step.');
          
          toast({
            title: "SignNow Service Unavailable",
            description: "You can continue without signing at this time. Documents can be signed later.",
            variant: "destructive",
          });
        } else {
          // Continue polling with backoff
          setTimeout(checkStatus, 15000);
        }
      }
    };
    
    // Start first check immediately
    checkStatus();
  };

  const fetchSigningUrl = async () => {
    if (!applicationId) return;

    try {
      console.log(`🔗 Fetching GET /applications/${applicationId}/signing-url...`);
      
      // Note: This endpoint doesn't exist in current staffApi, so we'll use the signing-status response
      // In a real implementation, this would be a separate endpoint
      const statusResult = await staffApi.checkSigningStatus(applicationId);
      
      if (statusResult.signUrl) {
        setSignUrl(statusResult.signUrl);
        setSigningStatus('ready');
        setIsPolling(false);
        
        toast({
          title: "Documents Ready for Signing",
          description: "Your documents are prepared. Click to open SignNow.",
        });
        
        console.log('✅ SignNow URL received:', statusResult.signUrl);
        
      } else {
        throw new Error('No signing URL in response');
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch signing URL:', error);
      setSigningStatus('error');
      setIsPolling(false);
      setError('Failed to fetch signing URL');
    }
  };

  const handleOpenSignNow = () => {
    if (!signUrl) return;

    console.log('🖊️ Redirecting to SignNow for signing:', signUrl);
    setSigningStatus('signing');
    
    // Store application state before redirect
    dispatch({
      type: 'UPDATE_STEP6_SIGNATURE',
      payload: {
        signedAt: new Date().toISOString()
      }
    });
    
    toast({
      title: "Redirecting to SignNow",
      description: "You will be redirected to complete the signing process.",
    });

    // Direct redirect to SignNow (not new tab)
    setTimeout(() => {
      window.location.href = signUrl;
    }, 1500); // Brief delay to show the toast
  };

  const startCompletionPolling = async () => {
    if (!applicationId) return;
    
    console.log('🔄 Starting completion polling...');
    
    const maxAttempts = 60; // 10 minutes with 10-second intervals
    let attempts = 0;
    
    const checkCompletion = async () => {
      if (attempts >= maxAttempts) {
        console.log('⏱️ Completion polling timeout');
        toast({
          title: "Waiting for Signature",
          description: "Still waiting for signature completion. Click 'Check Status' to verify.",
          variant: "default",
        });
        return;
      }
      
      attempts++;
      console.log(`🔍 Completion check ${attempts}/${maxAttempts}`);
      
      try {
        const statusResult = await staffApi.checkSigningStatus(applicationId);
        
        if (statusResult.status === 'completed') {
          console.log('✅ Signing completed detected!');
          handleSigningComplete();
          return;
        }
        
        // Continue polling
        setTimeout(checkCompletion, 10000);
        
      } catch (error) {
        console.error('❌ Failed to check completion:', error);
        setTimeout(checkCompletion, 15000);
      }
    };
    
    // Start checking after 30 seconds (give user time to sign)
    setTimeout(checkCompletion, 30000);
  };

  const handleSigningComplete = () => {
    setSigningStatus('complete');
    
    // Update form state
    dispatch({
      type: 'UPDATE_STEP6_SIGNATURE',
      payload: {
        signedAt: new Date().toISOString()
      }
    });
    
    saveToStorage();
    
    toast({
      title: "Signature Complete!",
      description: "Proceeding to final review and terms acceptance...",
    });
    
    // Auto-navigate to Step 7 after 2 seconds
    setTimeout(() => {
      setLocation('/apply/step-7');
    }, 2000);
  };

  const handleManualStatusCheck = async () => {
    if (!applicationId) return;
    
    try {
      const statusResult = await staffApi.checkSigningStatus(applicationId);
      
      if (statusResult.status === 'completed') {
        handleSigningComplete();
      } else {
        toast({
          title: "Status Check",
          description: `Current status: ${statusResult.status}`,
        });
      }
      
    } catch (error) {
      toast({
        title: "Status Check Failed",
        description: "Failed to check signing status",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setLocation('/apply/step-4');
  };

  const handleManualContinue = () => {
    setLocation('/apply/step-7');
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
                <Button onClick={handleOpenSignNow} className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open SignNow Signing Window
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  This will open SignNow in a new tab. Complete the signing process and return here.
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
                <p className="text-orange-700">
                  SignNow has been opened in a new tab. Please complete the signing process and return here.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleManualStatusCheck} variant="outline" className="flex-1">
                    <Loader2 className="w-4 h-4 mr-2" />
                    Check Status
                  </Button>
                  <Button onClick={handleOpenSignNow} variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Reopen SignNow
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  We're automatically checking for completion in the background.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 'complete':
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
                  Excellent! Your documents have been signed successfully. Proceeding to final review...
                </p>
                <Button onClick={handleManualContinue} className="w-full">
                  Continue to Final Review
                </Button>
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
                SignNow Integration Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-red-700">
                  {error || 'An error occurred during the signing process'}
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => { setSigningStatus('loading'); startSigningStatusPolling(); }} variant="outline">
                    Retry Polling
                  </Button>
                  <Button onClick={() => { setSigningStatus('loading'); startSigningStatusPolling(); }} variant="secondary">
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                <FileSignature className="w-6 h-6 text-blue-600" />
                Step 6: Electronic Signature
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Sign your loan documents via SignNow integration
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Signature Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Application ID:</span>
              <p className="font-mono">{applicationId || 'Not available'}</p>
            </div>
            <div>
              <span className="text-gray-500">Document Status:</span>
              <p className="font-medium">{signingStatus}</p>
            </div>
            <div>
              <span className="text-gray-500">Signing Platform:</span>
              <p className="font-medium">SignNow Electronic Signature</p>
            </div>
            <div>
              <span className="text-gray-500">Process:</span>
              <p className="font-medium">New Tab/Window</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Section */}
      {renderStatusSection()}

      {/* API Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integration Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Step 1:</strong> Poll GET /applications/{applicationId}/signing-status</p>
            <p><strong>Step 2:</strong> When status = "ready", fetch GET /applications/{applicationId}/signing-url</p>
            <p><strong>Step 3:</strong> Open SignNow in new tab</p>
            <p><strong>Step 4:</strong> Poll for completion detection</p>
            <p><strong>Step 5:</strong> Auto-navigate to Step 7 on completion</p>
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
            
            {signingStatus === 'completed' && (
              <Button 
                onClick={handleManualContinue}
                className="flex items-center gap-2"
              >
                Continue to Final Review
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}