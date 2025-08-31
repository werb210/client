import { attachCategories } from "../api/submit-categories";
import { attachTrace, getTraceId } from "../telemetry/lineage";
import React, { useState } from 'react';
import { logger } from '@/lib/utils';
import { useLocation } from 'wouter';

import { useFormData } from '@/context/FormDataContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Checkbox } from '@/components/ui/checkbox';

import type { CheckedState } from '@radix-ui/react-checkbox';

import { Alert, AlertDescription } from '@/components/ui/alert';

import { Badge } from '@/components/ui/badge';

import { CheckCircle, AlertTriangle, FileText, Send, ArrowLeft, Clock, Shield, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { ApplicationStatusModal } from '@/components/ApplicationStatusModal';

import { canSubmitApplication } from '@/lib/applicationStatus';
import { submitApplication, retryOperation, type ApplicationPayload } from '@/services/applicationService';
import { buildSubmission } from '@/lib/submissionBridge';


/**
 * Step 7: Final Application Submission
 * 
 * Displays complete application summary, terms and conditions, and handles
 * final submission of all data and actual document files to staff API.
 */
export default function Step7Submit() {
  const { data } = useFormData();
  const state = {
    step5DocumentUpload: {
      uploadedFiles: [],
      hasDocuments: false,
      submissionMode: 'without_documents',
      ...data
    },
    step4Completed: false,
    step6Signature: {},
    applicationId: data?.applicationId || 'mock-id',
    ...data
  };
  const dispatch = (action: any) => console.log('Mock dispatch in Step7:', action);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>('');

  // Checkbox handlers
  const handleTermsChange = (checked: CheckedState) => {
    setTermsAccepted(checked === true);
  };

  const handlePrivacyChange = (checked: CheckedState) => {
    setPrivacyAccepted(checked === true);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  // Get uploaded files from state
  const uploadedFiles = state.step5DocumentUpload?.uploadedFiles || [];
  const bypassDocuments = state.step5DocumentUpload?.hasDocuments === false || false;
  
  // Calculate completion status
  const completedSteps = [
    state.step1Completed ? 'Financial Profile' : null,
    state.step2Completed ? 'Product Recommendations' : null,
    state.step3Completed ? 'Business Details' : null,
    state.step4Completed ? 'Applicant Information' : null,
    (uploadedFiles.length > 0 || bypassDocuments) ? (bypassDocuments ? 'Document Upload (Bypassed)' : 'Document Upload') : null,
    state.step6Signature?.signedAt ? 'Electronic Signature' : null
  ].filter(Boolean);

  const handleSubmit = async () => {
    if (!termsAccepted || !privacyAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept both Terms & Conditions and Privacy Policy to proceed.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Check application status before submission
      const applicationId = state.step4?.applicationId;
      if (!applicationId) {
        throw new Error('No application ID found. Cannot check status.');
      }

      logger.log('📋 Checking application status before submission...');
      const statusCheck = await canSubmitApplication(applicationId);

      if (!statusCheck.canSubmit) {
        logger.log(`🚫 Submission blocked - Application status: ${statusCheck.status}`);
        setApplicationStatus(statusCheck.status || 'unknown');
        setStatusModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      logger.log('✅ Application status check passed - proceeding with submission');

      // Use submission bridge for lender-ready payload
      const appState = (window as any).__app?.state || {};
      const payload = buildSubmission(appState, uploadedFiles.map(f => ({ type: f.documentType || 'general' })));
      
      const formData = new FormData();
      formData.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      
      // ✅ USER REQUIREMENT: Add comprehensive submission logging
      console.log("📤 Submitting application:", payload);
      console.log("📤 Application Business Name:", payload.step3?.businessName || payload.step3?.operatingName || 'NOT FOUND');
      console.log("📤 Application Legal Name:", payload.step3?.legalName || payload.step3?.businessLegalName || 'NOT FOUND');
      console.log("📤 Applicant Name:", `${payload.step4?.firstName || ''} ${payload.step4?.lastName || ''}`.trim() || 'NOT FOUND');
      console.log("📤 Application ID:", payload.applicationId);
      console.log("📤 Document Count:", uploadedFiles.length);
      console.log("📤 Document Upload Bypassed:", payload.bypassDocuments);
      
      uploadedFiles.forEach(f => formData.append('files[]', f.file, f.name));
      
      const submitUrl = `/api/v1/applications`;
      console.log("📤 Submitting to URL:", submitUrl);
      
      // ✅ USER REQUIREMENT: Wrap fetch in try/catch for comprehensive error handling
      let response;
      try {
        // Submit to staff API with multipart/form-data
        response = await fetch(submitUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`,
            'X-Trace-Id': getTraceId(),
            'X-Client-App': 'boreal-client'
          },
          body: formData, // FormData automatically sets correct Content-Type
          credentials: 'include'
        });
        
        console.log("📥 Response status:", response.status, response.statusText);
        
      } catch (fetchError) {
        console.error("❌ Fetch request failed:", fetchError);
        throw fetchError;
      }
      
      if (!response.ok) {
        console.error("❌ Response not OK:", response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Error response data:", errorData);
        throw new Error(errorData.message || `Submission failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("📥 Application submission response:", result);
      
      // 🔧 Task 1: CRM Contact Creation on Application Submit
      try {
        console.log("🔗 Creating CRM contact for application submission...");
        const crmResponse = await fetch(`/api/public/crm/contacts/auto-create`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
          },
          body: JSON.stringify({
            firstName: state.step4?.firstName || "",
            lastName: state.step4?.lastName || "",
            email: state.step4?.email || "",
            phone: state.step4?.phone || "",
            source: "application",
            applicationId: state.step4?.applicationId || "",
          }),
        });
        
        if (crmResponse.ok) {
          const crmResult = await crmResponse.json();
          console.log("✅ CRM contact created for application:", crmResult);
        } else {
          console.warn("⚠️ CRM contact creation failed:", crmResponse.status, crmResponse.statusText);
        }
      } catch (crmError) {
        console.warn("⚠️ CRM contact creation error:", crmError);
        // Don't fail the main submission for CRM issues
      }
      
      // Emit GTM event to dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'application_submitted',
        application_id: applicationId,
        product_type: state.step2?.selectedCategory || 'not_selected',
        country: state.step1?.businessLocation || 'not_specified',
      });
      
      // Update state with submission success
      dispatch({
        type: 'MARK_COMPLETE'
      });
      
      setSubmissionComplete(true);
      
      toast({
        title: "Application Submitted Successfully!",
        description: `Your application has been submitted. Reference ID: ${result.submissionId || 'Generated'}`,
        variant: "default"
      });
      
      // Redirect to success page after short delay
      setTimeout(() => {
        setLocation('/application-success');
      }, 2000);
      
    } catch (error) {
      logger.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setLocation('/apply/step-6');
  };

  if (submissionComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted Successfully!</h1>
              <p className="text-gray-600 mb-4">
                Your complete application with all documents has been submitted to our review team.
              </p>
              <Badge variant="default" className="mb-4">
                Processing Time: 1-3 Business Days
              </Badge>
              <p className="text-sm text-gray-500">
                You will receive email updates on your application status.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
            <CardTitle className="text-2xl font-bold">Step 7: Review & Submit Application</CardTitle>
            <p className="text-teal-100">
              Final review of your complete application before submission
            </p>
          </CardHeader>
        </Card>

        {/* Application Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Business:</strong> {state.step3?.operatingName || 'Not provided'}</p>
                  <p><strong>Industry:</strong> {state.step1?.industry || 'Not provided'}</p>
                  <p><strong>Location:</strong> {state.step1?.businessLocation || 'Not provided'}</p>
                  <p><strong>Structure:</strong> {state.step3?.businessStructure || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Funding Request</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Amount:</strong> {state.step1?.fundingAmount || 'Not provided'}</p>
                  <p><strong>Purpose:</strong> {state.step1?.fundsPurpose || 'Not provided'}</p>
                  <p><strong>Product Type:</strong> {state.step2?.selectedCategory || 'Not selected'}</p>
                  <p><strong>Revenue:</strong> {state.step1?.revenueLastYear || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completion Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {completedSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Uploaded Documents ({uploadedFiles.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {file.documentType || 'General'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Application Terms & Conditions</h4>
              <div className="text-sm text-gray-600 space-y-2 max-h-32 overflow-y-auto">
                <p>By submitting this application, I acknowledge and agree that:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All information provided is accurate and complete to the best of my knowledge</li>
                  <li>I authorize Boreal Financial to verify the information provided</li>
                  <li>I understand that false or misleading information may result in application denial</li>
                  <li>I agree to the credit inquiry and background check as part of the evaluation process</li>
                  <li>The terms offered are subject to final underwriting approval</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms"
                checked={termsAccepted}
                onCheckedChange={handleTermsChange}
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-5">
                I have read and agree to the Terms & Conditions outlined above
              </label>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Privacy Policy</h4>
              <div className="text-sm text-gray-600">
                <p>Your personal and business information will be kept confidential and used solely for the purpose of evaluating your financing application. We do not sell or share your information with third parties except as required for the application process.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={handlePrivacyChange}
              />
              <label htmlFor="privacy" className="text-sm text-gray-700 leading-5">
                I have read and agree to the Privacy Policy
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Submission Warning */}
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Once submitted, your application cannot be modified. 
            Please review all information carefully before proceeding.
          </AlertDescription>
        </Alert>

        {/* Navigation Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Signature
              </Button>
              
              <Button 
                onClick={handleSubmit}
                disabled={!termsAccepted || !privacyAccepted || isSubmitting}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                data-cy="submitApplication"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Modal */}
      <ApplicationStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        applicationStatus={applicationStatus}
      />
    </div>
  );
}
