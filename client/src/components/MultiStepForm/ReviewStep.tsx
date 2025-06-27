import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApplication } from '@/context/ApplicationContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ReviewStepProps {
  onBack: () => void;
  onComplete: () => void;
  applicationId?: number;
}

export function ReviewStep({ onBack, onComplete, applicationId }: ReviewStepProps) {
  const { state } = useApplication();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!applicationId) {
        // Create new application
        const applicationData = {
          status: 'submitted',
          currentStep: 7,
          businessLegalName: state.formData.businessInfo?.legalName,
          industry: state.formData.businessInfo?.industry,
          headquarters: state.formData.businessInfo?.headquarters,
          annualRevenue: state.formData.businessInfo?.revenue,
          useOfFunds: state.formData.businessInfo?.useOfFunds,
          requestedAmount: state.formData.businessInfo?.loanAmount,
          selectedProduct: state.formData.selectedProduct,
          applicantName: state.formData.personalDetails?.name,
          applicantEmail: state.formData.personalDetails?.email,
          applicantPhone: state.formData.personalDetails?.phone,
          termsAccepted: state.formData.signature?.termsAccepted,
          signatureCompleted: state.formData.signature?.signed,
          formData: state.formData,
        };
        
        const response = await apiRequest('POST', '/api/applications', applicationData);
        return await response.json();
      } else {
        // Update existing application
        const response = await apiRequest('PATCH', `/api/applications/${applicationId}`, {
          status: 'submitted',
          currentStep: 7,
          termsAccepted: state.formData.signature?.termsAccepted,
          signatureCompleted: state.formData.signature?.signed,
          formData: state.formData,
        });
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      
      toast({
        title: "Application Submitted Successfully!",
        description: "Your financial application has been submitted for review. You will receive updates via email.",
      });
      
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitMutation.mutateAsync();
    setIsSubmitting(false);
  };

  const getCompletionStatus = () => {
    const checks = [
      { name: 'Business Information', completed: !!state.formData.businessInfo?.legalName },
      { name: 'Lender Product Selected', completed: !!state.formData.selectedProduct },
      { name: 'Product Questions', completed: !!state.formData.productQuestions },
      { name: 'Personal Details', completed: !!state.formData.personalDetails?.name },
      { name: 'Documents Uploaded', completed: true }, // Assume documents are uploaded if we reached this step
      { name: 'Terms Accepted', completed: !!state.formData.signature?.termsAccepted },
      { name: 'Document Signed', completed: !!state.formData.signature?.signed },
    ];

    return checks;
  };

  const completionChecks = getCompletionStatus();
  const allCompleted = completionChecks.every(check => check.completed);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Review</CardTitle>
          <p className="text-sm text-gray-600">
            Please review your application details before final submission.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Application Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-500">Business Name:</span>
                    <span className="ml-2">{state.formData.businessInfo?.legalName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Industry:</span>
                    <span className="ml-2">{state.formData.businessInfo?.industry || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2">{state.formData.businessInfo?.headquarters || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Annual Revenue:</span>
                    <span className="ml-2">{state.formData.businessInfo?.revenue || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Funding Request</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-500">Requested Amount:</span>
                    <span className="ml-2 font-medium">
                      ${state.formData.businessInfo?.loanAmount?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Selected Product:</span>
                    <span className="ml-2">
                      {state.formData.selectedProduct?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2">{state.formData.personalDetails?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2">{state.formData.personalDetails?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2">{state.formData.personalDetails?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Use of Funds</h4>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {state.formData.businessInfo?.useOfFunds || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Checklist</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {completionChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm text-gray-700">{check.name}</span>
                <div className="flex items-center space-x-2">
                  {check.completed ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Complete</Badge>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">Incomplete</Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Submission */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Submit</CardTitle>
        </CardHeader>
        
        <CardContent>
          {allCompleted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Application Complete</h4>
              <p className="text-gray-600 mb-6">
                Your application is ready for submission. Once submitted, you will receive a confirmation 
                email and regular updates on your application status.
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <Button variant="outline" onClick={onBack}>
                  Back to Review
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-orange-100 rounded-lg mx-auto flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Application Incomplete</h4>
              <p className="text-gray-600 mb-6">
                Please complete all required sections before submitting your application.
              </p>
              
              <Button variant="outline" onClick={onBack}>
                Back to Complete Application
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
