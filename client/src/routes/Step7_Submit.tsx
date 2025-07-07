import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useFormData } from '@/context/FormDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Send, 
  ArrowLeft,
  Clock,
  Shield,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Step 7: Final Application Submission
 * 
 * Displays complete application summary, terms and conditions, and handles
 * final submission of all data and actual document files to staff API.
 */
export default function Step7Submit() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

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
  
  // Calculate completion status
  const completedSteps = [
    state.step1FinancialProfile ? 'Financial Profile' : null,
    state.step2Recommendations ? 'Product Recommendations' : null,
    state.step3BusinessDetails ? 'Business Details' : null,
    state.step4ApplicantInfo ? 'Applicant Information' : null,
    uploadedFiles.length > 0 ? 'Document Upload' : null,
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
      // Create FormData for multipart upload with actual files
      const formData = new FormData();
      
      // Add all application data as JSON
      const applicationData = {
        // Step 1: Financial Profile
        businessLocation: state.step1FinancialProfile?.businessLocation || '',
        industry: state.step1FinancialProfile?.industry || '',
        lookingFor: state.step1FinancialProfile?.lookingFor || '',
        fundingAmount: state.step1FinancialProfile?.fundingAmount || '',
        useOfFunds: state.step1FinancialProfile?.useOfFunds || '',
        salesHistory: state.step1FinancialProfile?.salesHistory || '',
        lastYearRevenue: state.step1FinancialProfile?.lastYearRevenue || '',
        averageMonthlyRevenue: state.step1FinancialProfile?.averageMonthlyRevenue || '',
        accountsReceivable: state.step1FinancialProfile?.accountsReceivable || '',
        fixedAssets: state.step1FinancialProfile?.fixedAssets || '',
        equipmentValue: state.step1FinancialProfile?.equipmentValue || '',
        
        // Step 2: Selected Product
        selectedCategory: state.step1FinancialProfile?.selectedCategory || '',
        
        // Step 3: Business Details
        operatingName: state.step3BusinessDetails?.operatingName || '',
        legalName: state.step3BusinessDetails?.legalName || '',
        businessStreetAddress: state.step3BusinessDetails?.businessStreetAddress || '',
        businessCity: state.step3BusinessDetails?.businessCity || '',
        businessState: state.step3BusinessDetails?.businessState || '',
        businessPostalCode: state.step3BusinessDetails?.businessPostalCode || '',
        businessPhone: state.step3BusinessDetails?.businessPhone || '',
        businessWebsite: state.step3BusinessDetails?.businessWebsite || '',
        businessStructure: state.step3BusinessDetails?.businessStructure || '',
        businessStartDate: state.step3BusinessDetails?.businessStartDate || '',
        employeeCount: state.step3BusinessDetails?.employeeCount || '',
        estimatedYearlyRevenue: state.step3BusinessDetails?.estimatedYearlyRevenue || '',
        
        // Step 4: Applicant Information
        applicantName: `${state.step4ApplicantInfo?.firstName || ''} ${state.step4ApplicantInfo?.lastName || ''}`.trim(),
        applicantEmail: state.step4ApplicantInfo?.email || '',
        applicantPhone: state.step4ApplicantInfo?.personalPhone || '',
        dateOfBirth: state.step4ApplicantInfo?.dateOfBirth || '',
        socialSecurityNumber: state.step4ApplicantInfo?.sin || '',
        ownershipPercentage: state.step4ApplicantInfo?.ownershipPercentage || '',
        titleInBusiness: 'Owner/Principal', // Default title
        homeAddress: state.step4ApplicantInfo?.homeAddress || '',
        homeCity: state.step4ApplicantInfo?.city || '',
        homeState: state.step4ApplicantInfo?.province || '',
        homePostalCode: state.step4ApplicantInfo?.postalCode || '',
        
        // Partner information (if applicable)
        partnerName: `${state.step4ApplicantInfo?.partnerFirstName || ''} ${state.step4ApplicantInfo?.partnerLastName || ''}`.trim(),
        partnerEmail: state.step4ApplicantInfo?.partnerEmail || '',
        partnerPhone: state.step4ApplicantInfo?.partnerPersonalPhone || '',
        partnerOwnership: state.step4ApplicantInfo?.partnerOwnershipPercentage || '',
        partnerTitle: 'Partner', // Default title
        partnerSSN: state.step4ApplicantInfo?.partnerSin || '',
        
        // Step 6: Signature Status
        signatureComplete: !!state.step6Signature?.signedAt,
        signatureTimestamp: state.step6Signature?.signedAt || '',
        signNowDocumentId: state.step6Signature?.documentId || '',
        
        // Submission metadata
        submissionTimestamp: new Date().toISOString(),
        termsAccepted: true,
        privacyAccepted: true,
        applicationId: state.applicationId || '',
        
        // Document metadata
        documentCount: uploadedFiles.length,
        documentTypes: uploadedFiles.map(f => f.documentType).join(', ')
      };
      
      formData.append('applicationData', JSON.stringify(applicationData));
      
      // Add actual document files (NOT placeholders)
      uploadedFiles.forEach((uploadedFile, index) => {
        if (uploadedFile.file) {
          // Use actual File object with proper metadata
          formData.append(`document_${index}`, uploadedFile.file, uploadedFile.name);
          formData.append(`documentType_${index}`, uploadedFile.documentType || 'general');
          formData.append(`documentStatus_${index}`, uploadedFile.status || 'completed');
        }
      });
      
      // Submit to staff API with multipart/form-data
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/applications/${state.applicationId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer CLIENT_APP_SHARED_TOKEN'
        },
        body: formData, // FormData automatically sets correct Content-Type
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Submission failed: ${response.status}`);
      }
      
      const result = await response.json();
      
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
      console.error('Submission error:', error);
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
                  <p><strong>Business:</strong> {state.step3BusinessDetails?.operatingName || 'Not provided'}</p>
                  <p><strong>Industry:</strong> {state.step1FinancialProfile?.industry || 'Not provided'}</p>
                  <p><strong>Location:</strong> {state.step1FinancialProfile?.businessLocation || 'Not provided'}</p>
                  <p><strong>Structure:</strong> {state.step3BusinessDetails?.businessStructure || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Funding Request</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Amount:</strong> {state.step1FinancialProfile?.fundingAmount || 'Not provided'}</p>
                  <p><strong>Purpose:</strong> {state.step1FinancialProfile?.useOfFunds || 'Not provided'}</p>
                  <p><strong>Product Type:</strong> {state.step1FinancialProfile?.selectedCategory || 'Not selected'}</p>
                  <p><strong>Revenue:</strong> {state.step1FinancialProfile?.lastYearRevenue || 'Not provided'}</p>
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
    </div>
  );
}