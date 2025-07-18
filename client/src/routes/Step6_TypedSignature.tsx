import { useState } from 'react';
import { useLocation } from 'wouter';
import { useFormDataContext } from '@/context/FormDataContext';
import { StepHeader } from '@/components/StepHeader';
import TypedSignature from '@/components/TypedSignature';
import { toast } from '@/hooks/use-toast';

interface AuthorizationData {
  typedName: string;
  agreements: {
    creditCheck: boolean;
    dataSharing: boolean;
    termsAccepted: boolean;
    electronicSignature: boolean;
    accurateInformation: boolean;
  };
  timestamp: string;
  ipAddress?: string;
  userAgent: string;
}

export default function Step6_TypedSignature() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useFormDataContext();
  const [isLoading, setIsLoading] = useState(false);

  const applicantName = `${state.step4?.applicantFirstName || ''} ${state.step4?.applicantLastName || ''}`.trim();
  const businessName = state.step3?.operatingName || state.step3?.legalName || 'Your Business';

  const handleAuthorization = async (authData: AuthorizationData) => {
    setIsLoading(true);

    try {
      // Store authorization data in application state
      dispatch({
        type: 'UPDATE_STEP6_AUTHORIZATION',
        payload: {
          ...authData,
          ipAddress: await getClientIP(),
          stepCompleted: true
        }
      });

      console.log('🖊️ [STEP6] Electronic signature completed:', {
        signedName: authData.typedName,
        timestamp: authData.timestamp,
        agreementsCount: Object.values(authData.agreements).filter(Boolean).length
      });

      toast({
        title: "Application Authorized",
        description: `Thank you, ${authData.typedName}. Your electronic signature has been recorded.`,
      });

      // Navigate to final step
      setLocation('/apply/step-7');
    } catch (error) {
      console.error('❌ [STEP6] Authorization failed:', error);
      toast({
        title: "Authorization Error",
        description: "There was an issue recording your authorization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get client IP address for audit trail
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('/api/client-ip');
      const data = await response.json();
      return data.ip || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };

  if (!applicantName) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <StepHeader
            stepNumber={6}
            totalSteps={7}
            title="Application Authorization"
            description="Electronic signature required"
          />
          <div className="mt-8 p-6 border border-red-200 rounded-lg bg-red-50">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Missing Applicant Information</h3>
            <p className="text-red-700">
              Please complete Step 4 (Applicant Information) before proceeding with authorization.
            </p>
            <button
              onClick={() => setLocation('/apply/step-4')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Return to Step 4
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <StepHeader
          stepNumber={6}
          totalSteps={7}
          title="Application Authorization"
          description="Review terms and provide your electronic signature"
        />

        <div className="mt-8">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Ready for Authorization</h3>
            <p className="text-blue-800">
              <strong>Applicant:</strong> {applicantName}<br />
              <strong>Business:</strong> {businessName}<br />
              <strong>Application ID:</strong> {state.applicationId}
            </p>
          </div>

          <TypedSignature
            applicantName={applicantName}
            businessName={businessName}
            onAuthorize={handleAuthorization}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setLocation('/apply/step-5')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            ← Back to Documents
          </button>
          
          <div className="text-sm text-gray-500">
            Step 6 of 7 - Authorization required to proceed
          </div>
        </div>
      </div>
    </div>
  );
}