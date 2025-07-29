import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface DocumentUploadSectionProps {
  applicationId: string;
}

interface DocumentType {
  type: string;
  label: string;
  required: number;
  category: string;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ applicationId }) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploading, setUploading] = useState<string | null>(null);

  // Standard document requirements - always show these for SMS workflow
  const documentTypes: DocumentType[] = [
    { type: 'bank_statements', label: 'Bank Statements', required: 6, category: 'banking' },
    { type: 'financial_statements', label: 'Financial Statements', required: 1, category: 'financial' },
    { type: 'tax_returns', label: 'Business Tax Returns', required: 3, category: 'tax' }
  ];

  const handleFileUpload = async (file: File, docType: DocumentType) => {
    setUploading(docType.type);
    
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', docType.type);
      formData.append('applicationId', applicationId);

      const response = await fetch(`/api/public/upload/${applicationId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'fallback-token'}`
        }
      });

      if (response.ok) {
        console.log('✅ Document uploaded successfully:', file.name);
        setUploadedCount(prev => prev + 1);
        toast({
          title: "Upload Successful",
          description: `${file.name} has been uploaded successfully.`,
        });
      } else {
        throw new Error(`Upload failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const handleSubmitDocuments = async () => {
    try {
      const response = await fetch(`/api/public/upload/${applicationId}/reassess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'fallback-token'}`
        }
      });

      if (response.ok) {
        toast({
          title: "Documents Submitted",
          description: "Your documents have been submitted for review.",
        });
        setLocation('/dashboard');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('❌ Document submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Upload Cards */}
      <div className="grid gap-6 md:grid-cols-1">
        {documentTypes.map((docType) => (
          <Card key={docType.type} className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">{docType.label}</h3>
                    <p className="text-sm text-gray-600">
                      Required: {docType.required} document{docType.required !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {docType.category}
                </Badge>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => handleFileUpload(file, docType));
                  }}
                  className="hidden"
                  id={`upload-${docType.type}`}
                />
                <label
                  htmlFor={`upload-${docType.type}`}
                  className="cursor-pointer block"
                >
                  {uploading === docType.type ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-blue-600">Uploading...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, JPG, PNG (max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Progress Summary */}
      {uploadedCount > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                {uploadedCount} document{uploadedCount !== 1 ? 's' : ''} uploaded successfully
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Actions */}
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
    </div>
  );
};

export default DocumentUploadSection;