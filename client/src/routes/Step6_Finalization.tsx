import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useFormData } from '@/context/FormDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StepHeader } from '@/components/StepHeader';
import { useToast } from '@/hooks/use-toast';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Send from 'lucide-react/dist/esm/icons/send';
import Home from 'lucide-react/dist/esm/icons/home';

export default function Step6_Finalization() {
  const { state } = useFormData();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Create fullFormData from state
  const fullFormData = {
    step1: state.step1,
    step3: state.step3,
    step4: state.step4,
    documents: state.uploadedDocuments || [],
    submittedAt: new Date().toISOString()
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    console.log("📤 Submitting form data:", fullFormData);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify(fullFormData)
      });

      console.log("📥 Response status:", response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log("📥 Response data:", result);
        
        setSubmitted(true);
        toast({
          title: "Application Submitted Successfully!",
          description: "Your application has been submitted for review.",
        });
      } else {
        const errorText = await response.text();
        console.error("❌ Submission failed", errorText);
        toast({
          title: "Submission Failed",
          description: "There was a problem submitting your application. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      toast({
        title: "Network Error",
        description: "Unable to submit application. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <StepHeader 
          stepNumber={6}
          title="Application Submitted"
          description="Your application has been successfully submitted"
        />
        
        <Card className="mt-6">
          <CardContent className="py-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-4 text-green-800">Application Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you! Your application has been submitted. Our team will review your documents and get in touch with you soon.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <StepHeader 
        stepNumber={6}
        title="Submit Application"
        description="Review and submit your completed application"
      />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Final Submission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Please confirm to submit your application. You'll receive an email once we begin reviewing your submission.
            </p>
            
            {/* Summary of submitted data */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Application Summary:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Funding Amount: ${state.step1?.fundingAmount?.toLocaleString() || 'Not specified'}</li>
                <li>• Business: {state.step3?.operatingName || 'Not specified'}</li>
                <li>• Applicant: {state.step4?.applicantFirstName} {state.step4?.applicantLastName}</li>
                <li>• Documents: {state.uploadedDocuments?.length || 0} uploaded</li>
              </ul>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}