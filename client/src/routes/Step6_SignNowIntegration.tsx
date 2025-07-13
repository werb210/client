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
 * Step 6: SignNow Integration - Proper API v2 Implementation
 * Uses /api/public/applications/{id}/signing-status for both initial fetch and 3-second polling
 * Embedded iframe with proper sandbox attributes
 * Auto-advancement when canAdvance/signed detected
 * Manual override fallback via PATCH /api/public/applications/{id}/override-signing
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

  // Get applicationId from localStorage (always use stored value)
  const applicationId = localStorage.getItem("applicationId");

  // Load real signing URL on mount
  useEffect(() => {
    if (applicationId) {
      fetch(`/api/public/applications/${applicationId}/signing-status`)
        .then(res => res.json())
        .then(data => {
          if (data.data?.signingUrl) {
            setSignUrl(data.data.signingUrl);
            setSigningStatus('ready');
          }
        })
        .catch(err => {
          console.error('Failed to load signing URL:', err);
          setError('Failed to load signing document');
          setSigningStatus('error');
        });
    }
  }, [applicationId]);



  // Poll for status every 3 seconds
  useEffect(() => {
    if (applicationId && signUrl) {
      const interval = setInterval(() => {
        fetch(`/api/public/applications/${applicationId}/signing-status`)
          .then(res => res.json())
          .then(data => {
            if (data.data?.canAdvance || data.data?.signed) {
              setLocation('/apply/step-7');
            }
          })
          .catch(err => console.error('Polling error:', err));
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [applicationId, signUrl, setLocation]);

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
                    <iframe
                      src={signUrl}
                      width="100%"
                      height="700px"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      allow="camera; microphone; fullscreen"
                      style={{ border: 'none', borderRadius: '8px' }}
                      title="SignNow Document Signing"
                    />
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleManualOverride}
                        variant="outline" 
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        I've Signed the Document – Continue
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
                <Button 
                  onClick={handleManualOverride}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Continue Without Signing
                </Button>
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