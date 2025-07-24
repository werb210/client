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

  // Try multiple field name patterns and locations
  const applicantName = (
    // First try step4 with new field names
    `${state.step4?.applicantFirstName || ''} ${state.step4?.applicantLastName || ''}`.trim() ||
    // Then try step4 with legacy field names
    `${state.step4?.firstName || ''} ${state.step4?.lastName || ''}`.trim() ||
    // Then try root level with new field names
    `${(state as any).applicantFirstName || ''} ${(state as any).applicantLastName || ''}`.trim() ||
    // Finally try root level with legacy field names
    `${(state as any).firstName || ''} ${(state as any).lastName || ''}`.trim()
  );
  
  const businessName = state.step3?.operatingName || state.step3?.legalName || (state as any).operatingName || (state as any).legalName || 'Your Business';

  // Debug logging to check what's in state
  console.log('🔍 [STEP6] Debug state check:', {
    'state.step4': state.step4,
    'step4.applicantFirstName': state.step4?.applicantFirstName,
    'step4.applicantLastName': state.step4?.applicantLastName,
    'step4.firstName': state.step4?.firstName,
    'step4.lastName': state.step4?.lastName,
    'root.applicantFirstName': (state as any).applicantFirstName,
    'root.applicantLastName': (state as any).applicantLastName,
    'root.firstName': (state as any).firstName,
    'root.lastName': (state as any).lastName,
    'applicantName': applicantName,
    'businessName': businessName
  });

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

      // Check document upload status before finalization
      const documentCheckPassed = await validateDocumentUploads();
      if (!documentCheckPassed) {
        toast({
          title: "Documents Required",
          description: "Please upload all required documents before finalizing your application.",
          variant: "destructive"
        });
        setLocation('/apply/step-5');
        return;
      }

      // Submit the final application
      await submitFinalApplication();

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

  const validateDocumentUploads = async (): Promise<boolean> => {
    const applicationId = state.applicationId || localStorage.getItem('applicationId');
    
    if (!applicationId) {
      console.warn('⚠️ [STEP6] No application ID found for document validation');
      return false;
    }

    try {
      console.log('📋 [STEP6] Validating document uploads via staff backend S3...');
      
      const response = await fetch(`/api/public/applications/${applicationId}/documents`);
      
      if (response.status === 404) {
        console.warn('⚠️ [STEP6] Application not found in staff backend');
        
        // Only allow fallback in development mode with local evidence
        if (import.meta.env.DEV) {
          const localUploadedFiles = state.step5DocumentUpload?.uploadedFiles || [];
          if (localUploadedFiles.length > 0) {
            console.log('🔧 [STEP6] Development mode: allowing finalization with local upload evidence');
            return true;
          }
        }
        
        toast({
          title: "Application Not Found",
          description: "We're having trouble verifying your documents. Please wait a moment or try re-uploading.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!response.ok) {
        console.error('❌ [STEP6] Staff backend error:', response.status, response.statusText);
        toast({
          title: "Document Verification Error",
          description: "We're having trouble verifying your documents. Please wait a moment or try re-uploading.",
          variant: "destructive"
        });
        return false;
      }

      const documentData = await response.json();
      const uploadedDocuments = documentData.documents || [];
      
      // Enhanced dev mode logging for document validation
      if (import.meta.env.DEV) {
        console.log('🔧 [STEP6] Development mode: Enhanced document validation logging');
        console.log('📄 [STEP6] Staff backend document validation result:', {
          applicationId,
          documentsFound: uploadedDocuments.length,
          responseStatus: response.status,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          documents: uploadedDocuments.map((doc: any) => ({
            id: doc.id || doc.documentId,
            type: doc.documentType || doc.type,
            name: doc.fileName || doc.name,
            status: doc.status,
            uploadConfirmed: doc.uploadConfirmed,
            createdAt: doc.createdAt,
            s3Key: doc.s3Key || doc.storageKey
          }))
        });
      } else {
        console.log('📄 [STEP6] Staff backend document validation result:', {
          documentsFound: uploadedDocuments.length,
          documents: uploadedDocuments.map((doc: any) => ({
            type: doc.documentType || doc.type,
            name: doc.fileName || doc.name,
            status: doc.status,
            uploadConfirmed: doc.uploadConfirmed
          }))
        });
      }

      // Strict validation: must have at least 1 document from staff backend
      if (uploadedDocuments.length === 0) {
        console.warn('⚠️ [STEP6] No documents found in staff backend - blocking finalization');
        toast({
          title: "Documents Required",
          description: "Please upload all required documents before finalizing your application.",
          variant: "destructive"
        });
        return false;
      }

      // Check if all documents are properly confirmed (not just uploaded)
      const confirmedDocuments = uploadedDocuments.filter((doc: any) => 
        doc.status === 'confirmed' || doc.status === 'processed' || doc.uploadConfirmed === true
      );
      
      if (confirmedDocuments.length < uploadedDocuments.length) {
        console.log('⚠️ [STEP6] Some documents not yet confirmed - blocking finalization');
        const unconfirmedCount = uploadedDocuments.length - confirmedDocuments.length;
        toast({
          title: "Documents Processing",
          description: `${unconfirmedCount} document${unconfirmedCount > 1 ? 's' : ''} still processing. Please wait a moment and try again.`,
          variant: "destructive"
        });
        return false;
      }
      
      console.log('✅ [STEP6] All documents validated and confirmed via staff backend - finalization allowed');
      return true;
      
    } catch (error) {
      console.error('❌ [STEP6] Document validation network error:', error);
      toast({
        title: "Network Error",
        description: "We're having trouble verifying your documents. Please wait a moment or try re-uploading.",
        variant: "destructive"
      });
      return false;
    }
  };

  const resubmitApplicationData = async (applicationId: string) => {
    console.log('🔄 [STEP6] Resubmitting application form_data via PATCH...');

    const formDataPayload = {
      step1: state.step1,
      step3: state.step3,
      step4: state.step4,
      step6: state.step6Authorization
    };

    console.log('📋 [STEP6] Form data resubmission payload:', JSON.stringify(formDataPayload, null, 2));

    try {
      const response = await fetch(`/api/public/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify(formDataPayload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ [STEP6] Form data resubmission failed:', errorData);
        throw new Error(`Form data resubmission failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ [STEP6] Form data resubmitted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [STEP6] Form data resubmission error:', error);
      throw error;
    }
  };

  const submitFinalApplication = async (retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      const applicationId = state.applicationId || localStorage.getItem('applicationId');
      
      if (!applicationId) {
        throw new Error('Application ID not found');
      }

      // Prepare the final application data
      const finalApplicationData = {
        step1: state.step1,
        step3: state.step3,
        step4: state.step4,
        step6: state.step6Authorization,
        applicationId
      };

      console.log(`📤 [STEP6] Submitting final application (attempt ${retryCount + 1}):`, finalApplicationData);

      const response = await fetch(`/api/public/applications/${applicationId}/finalize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify(finalApplicationData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [STEP6] Finalization API error:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          attempt: retryCount + 1
        });
        
        // Check if this is a form_data empty error - need to resubmit form data
        if (response.status === 400 && errorText.includes('form_data')) {
          console.log('🔄 [STEP6] Empty form_data detected - resubmitting application data');
          await resubmitApplicationData(applicationId);
          
          // Retry finalization after resubmitting form data
          const retryResponse = await fetch(`/api/public/applications/${applicationId}/finalize`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
            },
            body: JSON.stringify(finalApplicationData)
          });
          
          if (!retryResponse.ok) {
            const retryError = await retryResponse.text();
            throw new Error(`Finalization retry failed: ${retryResponse.statusText} - ${retryError}`);
          }
          
          const retryResult = await retryResponse.json();
          console.log('✅ [STEP6] Application finalized successfully after form_data resubmission:', retryResult);
          
          // Show success and navigate
          toast({
            title: "Application Submitted Successfully!",
            description: "Your financing application has been submitted for review. You'll receive updates via email."
          });
          
          // Ensure applicationId is stored in localStorage for future document uploads
          localStorage.setItem('applicationId', applicationId);
          console.log('💾 [STEP6] ApplicationId stored for future document uploads:', applicationId);
          
          setLocation('/application-success');
          return retryResult;
        }
        
        // Retry on 503 errors if we haven't exceeded max retries
        if (response.status === 503 && retryCount < maxRetries) {
          console.log(`🔄 [STEP6] Retrying submission in 3 seconds... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          return submitFinalApplication(retryCount + 1);
        }
        
        if (response.status === 503) {
          throw new Error('The application submission service is temporarily unavailable. Your application data has been saved and you can try submitting again later.');
        } else if (response.status >= 500) {
          throw new Error('Server error occurred during submission. Please try again.');
        } else {
          throw new Error(`Submission failed: ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('✅ [STEP6] Application submitted successfully:', result);

      // Ensure applicationId is stored in localStorage for future document uploads
      if (applicationId) {
        localStorage.setItem('applicationId', applicationId);
        console.log('💾 [STEP6] ApplicationId stored for future document uploads:', applicationId);
      }

      toast({
        title: "Application Submitted Successfully!",
        description: "Your financing application has been submitted for review. You'll receive updates via email.",
      });

      // Navigate to success page
      setLocation('/application-success');

    } catch (error) {
      console.error('❌ [STEP6] Final submission failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : "There was an issue submitting your application. Please try again.";
      
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
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
            totalSteps={6}
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
          totalSteps={6}
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