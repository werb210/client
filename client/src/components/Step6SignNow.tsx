import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileSignature, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface LocationState {
  signUrl?: string;
}

export const Step6SignNow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [signingComplete, setSigningComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract signUrl from navigation state
  const locationState = (location as any).state as LocationState | undefined;
  const signUrl = locationState?.signUrl;

  useEffect(() => {
    if (!signUrl) {
      setError('No signing URL provided. Please return to the previous step.');
      return;
    }

    // Listen for SignNow completion events
    const handleMessage = (event: MessageEvent) => {
      // SignNow posts completion messages to parent window
      if (event.origin.includes('signnow.com')) {
        if (event.data?.type === 'SIGNING_COMPLETE') {
          setSigningComplete(true);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [signUrl]);

  const handleIframeLoad = () => {
    setIsIframeLoaded(true);
  };

  const handleBackToDocuments = () => {
    navigate('/apply/step-5');
  };

  const handleOpenInNewTab = () => {
    if (signUrl) {
      window.open(signUrl, '_blank');
    }
  };

  const handleComplete = () => {
    // Navigate to completion/thank you page
    navigate('/application-complete');
  };

  // Safety check - redirect if no signUrl
  if (!signUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              Access Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              No signing URL available. Please return to the document upload step to generate your signing link.
            </p>
            <Button onClick={handleBackToDocuments} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
              <FileSignature className="w-8 h-8 mr-3 text-teal-600" />
              Review & Sign Documents
            </h1>
            <p className="text-gray-600">
              Please review and electronically sign your loan application documents
            </p>
          </div>

          {/* Completion alert */}
          {signingComplete && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Signing Complete!</strong> Your documents have been signed successfully. 
                You can now proceed to complete your application.
              </AlertDescription>
            </Alert>
          )}

          {/* Error alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Main signing interface */}
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  SignNow Document Portal
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenInNewTab}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToDocuments}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Documents
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Loading state */}
              {!isIframeLoaded && (
                <div className="h-[80vh] flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading signing interface...</p>
                  </div>
                </div>
              )}

              {/* SignNow iframe */}
              <iframe
                src={signUrl}
                className={`w-full h-[80vh] border-0 ${
                  isIframeLoaded ? 'block' : 'hidden'
                }`}
                onLoad={handleIframeLoad}
                allow="fullscreen; camera; microphone"
                title="SignNow Document Signing"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
              />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Signing Instructions
              </h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Review all documents carefully before signing</li>
                <li>• Use your mouse or touch device to create your electronic signature</li>
                <li>• Fill in any required fields (dates, initials, etc.)</li>
                <li>• Click "Finish" in SignNow when all documents are complete</li>
                <li>• You'll receive email confirmation once signing is complete</li>
              </ul>
            </CardContent>
          </Card>

          {/* Completion actions */}
          {signingComplete && (
            <div className="text-center mt-6">
              <Button
                size="lg"
                onClick={handleComplete}
                className="px-8"
              >
                Complete Application
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Support note */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>
              Having trouble with signing? Contact our support team at{' '}
              <a href="mailto:support@borealfinance.app" className="text-teal-600 hover:underline">
                support@borealfinance.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};