import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentUpload } from '@/components/DocumentUpload';
import { Applications } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function UploadDocuments() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse URL parameters to get application ID
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const appId = urlParams.get('app');

  useEffect(() => {
    if (!appId) {
      toast({
        title: "Error",
        description: "No application ID found. Redirecting to dashboard.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [appId, navigate, toast]);

  const handleDocumentsChange = (updatedDocuments: any[]) => {
    setDocuments(updatedDocuments);
  };

  const handleFinalSubmit = async () => {
    if (!appId) return;

    setIsSubmitting(true);
    try {
      const payload = { 
        documents,
        extraFields: {
          submittedAt: new Date().toISOString(),
          documentsComplete: true
        }
      };
      
      const res = await Applications.complete(appId, payload);
      
      if (res.ok) {
        toast({
          title: "Application Submitted",
          description: "Your application has been successfully submitted for review.",
        });
        navigate('/dashboard');
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appId) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">Loading application...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload Supporting Documents</CardTitle>
          <CardDescription>
            Your application has been signed. Please upload any required supporting documents to complete your submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DocumentUpload
            applicationId={parseInt(appId)}
            onDocumentsChange={handleDocumentsChange}
            className="w-full"
          />
          
          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Save for Later
            </Button>
            <Button 
              onClick={handleFinalSubmit}
              disabled={isSubmitting || documents.length === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}