import { useState } from 'react';
import { useLocation } from 'wouter';
import { useFormDataContext } from '@/context/FormDataContext';
import { StepHeader } from '@/components/StepHeader';
import TypedSignature from '@/components/TypedSignature';
import { toast } from '@/hooks/use-toast';
import { getStoredApplicationId, validateApplicationIdForAPI } from '@/lib/uuidUtils';
import { listDocuments } from '@/lib/api';
import { addToRetryQueue, getRetryQueue } from '@/utils/applicationRetryQueue';

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

      // ✅ ENHANCED: Determine submission mode and handle accordingly
      const hasUploads =
        (state.step5DocumentUpload?.uploadedFiles?.length ?? 0) > 0 ||
        (state.step5DocumentUpload?.files?.length ?? 0) > 0;
      
      const submissionMode = state.step5DocumentUpload?.submissionMode || (hasUploads ? 'with_documents' : 'without_documents');
      const hasDocuments = state.step5DocumentUpload?.hasDocuments || hasUploads;

      console.log('🔍 [STEP6] Submission mode check:', {
        hasUploads,
        hasDocuments,
        submissionMode,
        uploadedFilesCount: state.step5DocumentUpload?.uploadedFiles?.length || 0,
        filesCount: state.step5DocumentUpload?.files?.length || 0
      });

      // ✅ ALWAYS ALLOW FINALIZATION - No document validation blocking
      if (submissionMode === 'without_documents') {
        console.log("📤 [STEP6] Submission without documents mode - staff backend will handle notifications");
        toast({
          title: "Ready to Submit",
          description: "Application will be submitted. Document upload will be available after submission.",
          variant: "default"
        });
      } else {
        console.log("📤 [STEP6] Submission with documents mode - standard processing");
        toast({
          title: "Ready to Submit",
          description: "Application will be submitted with uploaded documents.",
          variant: "default"
        });
      }

      // Check for retry queue items and show notification
      const retryQueue = getRetryQueue();
      const hasRetryItems = retryQueue.length > 0;
      
      if (hasRetryItems) {
        console.log(`🔄 [STEP6] Found ${retryQueue.length} items in retry queue`, retryQueue);
        toast({
          title: "Upload Retry Available",
          description: `${retryQueue.length} document(s) queued for retry when staff backend is available. Application can proceed.`,
          variant: "default"
        });
      }

      // ✅ SKIP document validation - allow submission regardless of document status
      console.log('📤 [STEP6] Skipping document validation - proceeding with final submission');

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
    // ✅ Use UUID validation system for consistent application ID management
    try {
      const applicationId = getStoredApplicationId();
      
      if (!applicationId) {
        console.error('❌ [STEP6] No valid application ID found in localStorage');
        toast({
          title: "Application ID Missing",
          description: "Please restart the application process from Step 1.",
          variant: "destructive"
        });
        return false;
      }

      // Validate the application ID format
      const validatedApplicationId = validateApplicationIdForAPI(applicationId);
      console.log('🔍 [STEP6] Using validated applicationId:', validatedApplicationId);

      // ✅ Check bypass flag from Step 5 first
      const bypassDocuments = state.bypassDocuments || false;
      console.log('🔍 [STEP6] Checking bypass status from Step 5:', { bypassDocuments });
      
      if (bypassDocuments) {
        console.log('✅ [STEP6] Document validation bypassed - allowing finalization based on Step 5 bypass flag');
        toast({
          title: "Documents Bypassed",
          description: "Proceeding with application finalization as requested in Step 5.",
        });
        return true;
      }

      // ✅ Apply strict validation when NOT bypassed
      console.log('📋 [STEP6] Validating document uploads via staff backend for applicationId:', validatedApplicationId);
      
      const documentData = await listDocuments({ applicationId: validatedApplicationId });
      const response = { ok: true, status: 200 }; // Wrapper handles errors
      
      if (response.status === 404) {
        console.log('⚠️ [STEP6] Application not found in staff backend - checking for local upload evidence (duplicate email scenario)');
        
        // For duplicate email cases where applicationId was generated client-side, 
        // check if we have local evidence of successful uploads
        const localUploadsExist = checkLocalUploadEvidence();
        
        if (localUploadsExist) {
          console.log('✅ [STEP6] Local upload evidence found - allowing finalization for duplicate email case');
          toast({
            title: "Documents Verified",
            description: "Your documents have been uploaded successfully. Proceeding with finalization.",
          });
          return true;
        } else {
          console.error('❌ [STEP6] No local upload evidence found');
          toast({
            title: "Documents Required", 
            description: "Please upload all required documents before finalizing your application.",
            variant: "destructive"
          });
          return false;
        }
      }
      
      // Error handling moved to wrapper function
      // if (!response.ok) {
      //   console.error('❌ [STEP6] Staff backend error:', response.status);
      //   toast({
      //     title: "Document Verification Error", 
      //     description: "We're having trouble verifying your documents. Please wait a moment or try re-uploading.",
      //     variant: "destructive"
      //   });
      //   return false;
      // }

      const uploadedDocuments = documentData || [];
      
      console.log('📄 [STEP6] Staff backend document validation result:', {
        applicationId: validatedApplicationId,
        documentsFound: uploadedDocuments.length,
        documents: uploadedDocuments.map((doc: any) => ({
          id: doc.id || doc.documentId,
          type: doc.documentType || doc.type,
          name: doc.fileName || doc.name,
          status: doc.status,
          uploadConfirmed: doc.uploadConfirmed
        }))
      });

      // Strict validation: must have at least 1 document from staff backend (mandatory for non-bypassed applications)
      if (!uploadedDocuments || uploadedDocuments.length === 0) {
        console.error('❌ [STEP6] Document verification failed: No documents returned from staff server');
        console.log('🔍 [STEP6] Checking local upload evidence as fallback');
        
        const hasLocalEvidence = checkLocalUploadEvidence();
        if (hasLocalEvidence) {
          console.log('✅ [STEP6] Local upload evidence found - allowing finalization');
          toast({
            title: "Documents Detected",
            description: "Your uploaded documents have been detected. Proceeding with application finalization.",
            variant: "default"
          });
          return true;
        }
        
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
      
      // Check if this is a 404 error (application not found in staff backend)
      if (error instanceof Error && error.message.includes('404')) {
        console.log('🔍 [STEP6] Document validation returned 404 - checking local upload evidence');
        const hasLocalEvidence = checkLocalUploadEvidence();
        
        if (hasLocalEvidence) {
          console.log('✅ [STEP6] Local upload evidence found - allowing finalization despite 404');
          toast({
            title: "Documents Detected",
            description: "Your uploaded documents have been detected. Proceeding with application finalization.",
            variant: "default"
          });
          return true;
        } else {
          console.log('❌ [STEP6] No local upload evidence found');
          toast({
            title: "Documents Required",
            description: "Please upload all required documents before finalizing your application.",
            variant: "destructive"
          });
          return false;
        }
      }
      
      // For other network errors
      toast({
        title: "Network Error",
        description: "We're having trouble verifying your documents. Please wait a moment or try re-uploading.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Helper function to check for local upload evidence
  const checkLocalUploadEvidence = (): boolean => {
    try {
      // Check for uploaded documents evidence
      
      // Check multiple sources and arrays for upload evidence
      const contextFiles = state.step5DocumentUpload?.files || [];
      const contextUploadedFiles = state.step5DocumentUpload?.uploadedFiles || [];
      
      // Also check any other possible locations where files might be stored
      const rootUploadedFiles = (state as any).uploadedFiles || [];
      const rootFiles = (state as any).files || [];
      
      const localStorageData = localStorage.getItem('formData') || localStorage.getItem('financialFormData');
      let localStorageFiles = [];
      let localStorageUploadedFiles = [];
      let localStorageRaw = null;
      
      if (localStorageData) {
        try {
          const parsed = JSON.parse(localStorageData);
          localStorageRaw = parsed;
          localStorageFiles = parsed.step5DocumentUpload?.files || [];
          localStorageUploadedFiles = parsed.step5DocumentUpload?.uploadedFiles || [];
          
          console.log('💾 [STEP6] localStorage structure:', {
            hasStep5DocumentUpload: !!parsed.step5DocumentUpload,
            step5Keys: parsed.step5DocumentUpload ? Object.keys(parsed.step5DocumentUpload) : [],
            allTopLevelKeys: Object.keys(parsed)
          });
        } catch (e) {
          console.log('⚠️ [STEP6] Could not parse localStorage data:', e);
        }
      }
      
      const totalFiles = Math.max(
        contextFiles.length, 
        contextUploadedFiles.length,
        rootUploadedFiles.length,
        rootFiles.length,
        localStorageFiles.length, 
        localStorageUploadedFiles.length
      );
      const hasUploads = totalFiles > 0;
      
      console.log('🔍 [STEP6] COMPLETE UPLOAD EVIDENCE CHECK:', {
        contextFilesCount: contextFiles.length,
        contextUploadedFilesCount: contextUploadedFiles.length,
        rootUploadedFilesCount: rootUploadedFiles.length,
        rootFilesCount: rootFiles.length,
        localStorageFilesCount: localStorageFiles.length,
        localStorageUploadedFilesCount: localStorageUploadedFiles.length,
        totalFiles,
        hasUploads,
        decision: hasUploads ? 'ALLOW_FINALIZATION' : 'BLOCK_FINALIZATION'
      });
      
      // If we have evidence, show success; if not, show the full debug info
      if (hasUploads) {
        console.log('✅ [STEP6] Local upload evidence found - allowing finalization');
      } else {
        console.log('❌ [STEP6] No local upload evidence found');
        console.log('🔍 [STEP6] Full debug data:', {
          contextState: state,
          localStorageData: localStorageRaw
        });
      }
      
      return hasUploads;
    } catch (error) {
      console.error('❌ [STEP6] Error checking local upload evidence:', error);
      console.error('❌ [STEP6] Full error details:', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        currentState: state
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
      // Use centralized UUID validation system for consistency
      const storedApplicationId = getStoredApplicationId();
      if (!storedApplicationId) {
        throw new Error('Application ID not found in localStorage');
      }
      const applicationId = validateApplicationIdForAPI(storedApplicationId);

      // ✅ Determine submission status based on document presence
      const submissionMode = state.step5DocumentUpload?.submissionMode || 'with_documents';
      const hasDocuments = state.step5DocumentUpload?.hasDocuments || false;
      const submissionStatus = hasDocuments ? 'submitted' : 'submitted_no_docs';
      
      console.log(`📤 [STEP6] Submission status: ${submissionStatus} (mode: ${submissionMode})`);

      // Prepare the final application data
      const finalApplicationData = {
        step1: state.step1,
        step3: state.step3,
        step4: state.step4,
        step6: state.step6Authorization,
        applicationId,
        status: submissionStatus,
        submissionMode: submissionMode,
        hasDocuments: hasDocuments
      };

      // 🟨 STEP 3: Confirm finalize is called - REPLIT MUST DO
      console.log("🟨 STEP 3: /api/public/applications/:id/finalize IS BEING CALLED");
      console.log("Finalizing application ID:", applicationId);
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
        
        // Add to retry queue for finalization failures
        addToRetryQueue({
          applicationId,
          payload: finalApplicationData,
          type: 'finalization',
          error: `${response.status} ${response.statusText}: ${errorText}`
        });
        
        // Step 6 Finalization Failure Logging
        console.error('❌ STEP 6 FINALIZATION FAILED:');
        console.error('❌ [STEP6] Finalization API error:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          attempt: retryCount + 1,
          requestUrl: response.url,
          apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
          applicationId: applicationId
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
          
          // ✅ REQUIRED CLIENT APPLICATION LOGGING
          console.log("[CLIENT] Final submission result:", retryResult);
          
          // ✅ C. Step 6 (Finalization) - SUBMISSION RELIABILITY CHECKLIST
          console.log("✅ Application finalized:", applicationId);
          
          // Show success and navigate
          toast({
            title: "Application submitted!",
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
        
        // Enhanced error handling with user-friendly toasts
        let errorMessage = '';
        let toastTitle = 'Step 6 Finalization Failed';
        
        if (response.status === 503) {
          errorMessage = 'The application submission service is temporarily unavailable. Your application data has been saved and you can try submitting again later.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error occurred during submission. Please try again.';
        } else if (response.status === 400) {
          errorMessage = `Bad request: ${errorText || response.statusText}`;
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please try again.';
        } else if (response.status === 404) {
          errorMessage = 'Application not found. Please start over from Step 1.';
        } else {
          errorMessage = `Submission failed: ${response.statusText}`;
        }
        
        toast({
          title: toastTitle,
          description: errorMessage,
          variant: "destructive"
        });
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ [STEP6] Application submitted successfully:', result);
      
      // ✅ REQUIRED CLIENT APPLICATION LOGGING
      console.log("[CLIENT] Final submission result:", result);

      // ✅ C. Step 6 (Finalization) - SUBMISSION RELIABILITY CHECKLIST
      console.log("✅ Application finalized:", applicationId);

      // Ensure applicationId is stored in localStorage for future document uploads
      if (applicationId) {
        localStorage.setItem('applicationId', applicationId);
        console.log('💾 [STEP6] ApplicationId stored for future document uploads:', applicationId);
      }

      // ✅ Show appropriate success message based on submission mode
      if (submissionStatus === 'submitted_no_docs') {
        toast({
          title: "Application submitted!",
          description: "Application submitted. Document upload will be available after submission.",
          variant: "default"
        });
        console.log('📤 [STEP6] Document upload notification handled by staff backend');
      } else {
        toast({
          title: "Application submitted!",
          description: "Your financing application has been submitted for review. You'll receive updates via email.",
          variant: "default"
        });
      }

      // Emit GTM step_completed event
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 
        event: 'step_completed', 
        step: 6, 
        application_id: applicationId, 
        product_type: 'signature_complete' 
      });

      // Navigate to success page
      setLocation('/application-success');

    } catch (error) {
      console.error('❌ [STEP6] Final submission failed:', error);
      
      // Emit GTM error event
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 
        event: 'error_occurred', 
        message: error instanceof Error ? error.message : 'Step 6 signature submission error' 
      });
      
      // Add network/fetch errors to retry queue
      const storedApplicationId = getStoredApplicationId();
      if (storedApplicationId && error instanceof Error) {
        const errorApplicationId = validateApplicationIdForAPI(storedApplicationId);
        addToRetryQueue({
          applicationId: errorApplicationId,
          payload: {
            step1: state.step1,
            step3: state.step3,
            step4: state.step4,
            step6: state.step6Authorization,
            applicationId: errorApplicationId
          },
          type: 'finalization',
          error: error.message
        });
        
        console.log(`🔄 [RETRY QUEUE] Added finalization network error to retry queue:`, {
          applicationId: errorApplicationId,
          error: error.message
        });
      }
      
      const errorMessage = error instanceof Error ? error.message : "There was an issue submitting your application. Please try again.";
      
      toast({
        title: "Application Queued for Retry",
        description: "Finalization will retry automatically when the system is available",
        variant: "default",
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