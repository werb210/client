import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormDataContext } from '@/context/FormDataContext';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  FileText, 
  Building, 
  DollarSign, 
  User, 
  MapPin,
  Calendar,
  Upload,
  Send,
  Clock,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { submitApplication } from '@/lib/api';

interface ApplicationSummary {
  businessInfo: {
    location: string;
    industry: string;
    fundingAmount: string;
    fundsPurpose: string;
    selectedCategory: string;
  };
  businessDetails: {
    businessName: string;
    businessStructure: string;
    businessPhone: string;
    businessEmail: string;
  };
  applicantInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  documents: {
    totalUploaded: number;
  };
  signatureStatus: {
    completed: boolean;
    signedAt?: string;
  };
}

export default function Step7FinalSubmissionComplete() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useFormDataContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Compile application summary from unified schema
  const applicationSummary: ApplicationSummary = {
    businessInfo: {
      location: state.businessLocation || '',
      industry: state.industry || '',
      fundingAmount: state.fundingAmount ? `$${state.fundingAmount.toLocaleString()}` : '',
      fundsPurpose: state.fundsPurpose || '',
      selectedCategory: state.selectedProductId || '',
    },
    businessDetails: {
      businessName: state.businessName || '',
      businessStructure: state.businessStructure || '',
      businessPhone: state.businessPhone || '',
      businessEmail: state.businessEmail || '',
    },
    applicantInfo: {
      firstName: state.firstName || '',
      lastName: state.lastName || '',
      email: state.email || '',
      phone: state.phone || '',
    },
    documents: {
      totalUploaded: state.uploadedDocuments?.length || 0,
    },
    signatureStatus: {
      completed: !!state.signingUrl, // If we have a signing URL, assume process was initiated
      signedAt: state.signedAt,
    },
  };

  // Submit application mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!termsAccepted || !privacyAccepted) {
        throw new Error('Please accept both Terms & Conditions and Privacy Policy');
      }

      // Create form data with all application information
      const formData = new FormData();
      
      // Add all form fields as JSON
      const applicationData = {
        // Business Information
        businessLocation: state.businessLocation,
        industry: state.industry,
        fundingAmount: state.fundingAmount,
        fundsPurpose: state.fundsPurpose,
        selectedProductId: state.selectedProductId,
        
        // Business Details
        businessName: state.businessName,
        businessStructure: state.businessStructure,
        businessPhone: state.businessPhone,
        businessEmail: state.businessEmail,
        businessAddress: state.businessAddress,
        businessCity: state.businessCity,
        businessState: state.businessState,
        businessZipCode: state.businessZipCode,
        
        // Applicant Information
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        phone: state.phone,
        dateOfBirth: state.dateOfBirth,
        socialSecurityNumber: state.socialSecurityNumber,
        ownershipPercentage: state.ownershipPercentage,
        
        // Partner Information (if applicable)
        partnerFirstName: state.partnerFirstName,
        partnerLastName: state.partnerLastName,
        partnerEmail: state.partnerEmail,
        partnerPhone: state.partnerPhone,
        partnerOwnershipPercentage: state.partnerOwnershipPercentage,
        
        // Financial Information
        annualRevenue: state.annualRevenue,
        monthlyRevenue: state.monthlyRevenue,
        accountsReceivableBalance: state.accountsReceivableBalance,
        
        // Terms acceptance
        termsAccepted,
        privacyAccepted,
        submittedAt: new Date().toISOString(),
      };
      
      formData.append('applicationData', JSON.stringify(applicationData));
      
      // Add uploaded documents
      if (state.uploadedDocuments) {
        state.uploadedDocuments.forEach((doc, index) => {
          if (doc.file) {
            formData.append(`documents`, doc.file);
            formData.append(`documentTypes`, doc.documentType);
          }
        });
      }
      
      return submitApplication(formData);
    },
    onSuccess: (data) => {
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          applicationId: data.applicationId,
          submittedAt: new Date().toISOString(),
          currentStep: 8, // Mark as completed
        }
      });
      
      toast({
        title: "Application Submitted Successfully!",
        description: `Application ID: ${data.applicationId}`,
      });
      
      setLocation('/application-success');
    },
    onError: (error) => {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!termsAccepted || !privacyAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept both Terms & Conditions and Privacy Policy before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    setLocation('/apply/step-6');
  };

  const canSubmit = termsAccepted && privacyAccepted && !isSubmitting;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-full p-3">
            <Send className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Final Submission</h1>
        <p className="text-lg text-gray-600">
          Review your application and submit for processing
        </p>
      </div>

      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Application Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Building className="h-5 w-5 text-teal-600" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Business:</span>
                <p>{applicationSummary.businessDetails.businessName || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Industry:</span>
                <p>{applicationSummary.businessInfo.industry || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Location:</span>
                <p>{applicationSummary.businessInfo.location || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Structure:</span>
                <p>{applicationSummary.businessDetails.businessStructure || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Funding Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Funding Request
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Amount:</span>
                <p className="text-lg font-semibold text-green-600">
                  {applicationSummary.businessInfo.fundingAmount || 'Not specified'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Purpose:</span>
                <p>{applicationSummary.businessInfo.fundsPurpose || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Applicant Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Primary Applicant
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <p>{`${applicationSummary.applicantInfo.firstName} ${applicationSummary.applicantInfo.lastName}`.trim() || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p>{applicationSummary.applicantInfo.email || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>
                <p>{applicationSummary.applicantInfo.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Documents Status */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Documents
            </h3>
            <div className="flex items-center gap-4">
              <Badge variant={applicationSummary.documents.totalUploaded > 0 ? "default" : "secondary"}>
                {applicationSummary.documents.totalUploaded} Documents Uploaded
              </Badge>
              {applicationSummary.signatureStatus.completed && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Signature Process Initiated
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Terms and Agreements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the Terms & Conditions
                </label>
                <p className="text-xs text-muted-foreground">
                  By checking this box, you agree to our terms of service and lending policies.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="privacy"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the Privacy Policy
                </label>
                <p className="text-xs text-muted-foreground">
                  You acknowledge that your information will be processed according to our privacy policy.
                </p>
              </div>
            </div>
          </div>
          
          {(!termsAccepted || !privacyAccepted) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You must accept both the Terms & Conditions and Privacy Policy to submit your application.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Signature
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8"
        >
          {isSubmitting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Application
            </>
          )}
        </Button>
      </div>

      {/* Submission Status */}
      {submitMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {submitMutation.error instanceof Error 
              ? submitMutation.error.message 
              : 'Failed to submit application. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}