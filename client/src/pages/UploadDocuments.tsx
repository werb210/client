import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getRequiredDocumentTypes } from "@/utils/docRequirements";
import { fetchApplicationById, uploadDocumentToStaffAPI } from '@/lib/api';
import { DocumentUploadCard } from '@/components/DocumentUploadCard';
import { Step5Wrapper } from '@/components/Step5Wrapper';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface RequiredDocumentType {
  type: string;
  category: string;
  label: string;
  required: number;
}

export default function UploadDocuments() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedCount, setUploadedCount] = useState(0);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Parse URL parameters to get application ID
  const urlParams = new URLSearchParams(window.location.search);
  const appId = urlParams.get('app') || urlParams.get('id') || urlParams.get('applicationId');
  
  console.log('🔄 [UploadDocuments] Loading page with app ID:', appId);
  
  useEffect(() => {
    if (!appId) {
      setLoading(false);
      return;
    }
    
    console.log('🔄 [UploadDocuments] Fetching application:', appId);
    
    fetchApplicationById(appId)
      .then((data) => {
        console.log('✅ [UploadDocuments] Application fetched successfully:', data);
        setApplication(data);
      })
      .catch((error) => {
        console.warn('⚠️ [UploadDocuments] API fetch failed, using fallback mode:', error);
        // Fallback behavior if fetch fails
        setApplication({ 
          id: appId, 
          businessName: "Application",
          form_data: { 
            step1: { productCategory: "working_capital" } 
          } 
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [appId]);
  
  // Get required document types from application
  const requiredDocs = application ? getRequiredDocumentTypes(application) : [];
  
  console.log('📋 [UploadDocuments] Application data:', application);
  console.log('📋 [UploadDocuments] Required documents:', requiredDocs.length, requiredDocs);
  
  // Handle file upload completion
  const handleUploadComplete = async (file: File, docType: string) => {
    try {
      console.log(`📤 [UploadDocuments] Processing upload: ${file.name} for type ${docType}`);
      
      // Upload to staff backend API (already working from existing implementation)
      const result = await uploadDocumentToStaffAPI(appId!, file, docType);
      console.log('📤 [UploadDocuments] Upload result:', result);
      
      setUploadedCount(prev => prev + 1);
      
      toast({
        title: "Document Uploaded",
        description: `${file.name} uploaded successfully.`,
        variant: "default",
      });
    } catch (error) {
      console.error('❌ [UploadDocuments] Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle final submission
  const handleSubmitDocuments = async () => {
    if (!appId) return;
    
    try {
      console.log('🚀 [UploadDocuments] Submitting documents and triggering reassessment');
      
      // Trigger pipeline reassessment from staff backend
      const response = await fetch(`/api/public/upload/${appId}/reassess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify({
          documentsUploaded: uploadedCount,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: "Documents Submitted Successfully",
          description: "Your documents have been submitted and the application will be reassessed.",
          variant: "default",
        });
        
        // Navigate back to dashboard
        setLocation('/dashboard');
      } else {
        throw new Error('Failed to submit documents');
      }
    } catch (error) {
      console.error('❌ [UploadDocuments] Submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit documents. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <Step5Wrapper title="Loading Application...">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your application details...</p>
        </div>
      </Step5Wrapper>
    );
  }
  
  // Error state - no application ID
  if (!appId) {
    return (
      <Step5Wrapper title="Upload Documents">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <CheckCircle className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Application Not Found</h3>
            <p className="text-gray-600">No application ID found in URL.</p>
          </div>
          <Button onClick={() => setLocation('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Step5Wrapper>
    );
  }

  // No application found
  if (!application) {
    return (
      <Step5Wrapper title="Upload Documents">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <CheckCircle className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Application Not Found</h3>
            <p className="text-gray-600">Unable to load application details.</p>
          </div>
          <Button onClick={() => setLocation('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Step5Wrapper>
    );
  }

  // Always show documents regardless - use fallback if needed
  const documentsToShow: RequiredDocumentType[] = requiredDocs.length > 0 ? requiredDocs : [
    { type: 'bank_statements', category: 'banking', label: 'Bank Statements', required: 6 },
    { type: 'financial_statements', category: 'financial', label: 'Financial Statements', required: 1 },
    { type: 'tax_returns', category: 'tax', label: 'Business Tax Returns', required: 3 }
  ];

  console.log('📋 [UploadDocuments] Documents to show:', documentsToShow.length, documentsToShow);

  return (
    <Step5Wrapper 
      title="Upload Required Documents" 
      description={`Upload the documents below for ${application?.businessName || 'your application'}`}
    >
      {requiredDocs.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="text-yellow-600">⚠️</div>
            <span className="text-yellow-800 text-sm">
              Showing standard document categories for your application.
            </span>
          </div>
        </div>
      )}

      {/* Document Upload Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {documentsToShow.map((docType: RequiredDocumentType) => (
          <DocumentUploadCard 
            key={docType.type} 
            docType={docType.type} 
            appId={appId!}
            label={docType.label}
            required={docType.required}
            category={docType.category}
            onUploadComplete={handleUploadComplete}
          />
        ))}
      </div>
      
      {/* Upload Progress Summary */}
      {uploadedCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              {uploadedCount} document{uploadedCount !== 1 ? 's' : ''} uploaded successfully
            </span>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={() => setLocation('/dashboard')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Button>
        
        <Button
          onClick={handleSubmitDocuments}
          disabled={uploadedCount === 0}
          className="flex items-center space-x-2"
        >
          <span>Submit Documents</span>
          <CheckCircle className="w-4 h-4" />
        </Button>
      </div>
    </Step5Wrapper>
  );
}