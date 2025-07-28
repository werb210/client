/**
 * Document Upload Card component for individual document types
 * Used in the /upload-documents page
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadCardProps {
  docType: string;
  appId: string;
  label?: string;
  required?: number;
  category?: string;
  onUploadComplete?: (file: File, docType: string) => void;
}

export function DocumentUploadCard({ 
  docType, 
  appId, 
  label, 
  required = 1, 
  category = 'general',
  onUploadComplete 
}: DocumentUploadCardProps) {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const displayLabel = label || docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type (PDF, images)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, JPEG, or PNG files only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log(`📤 [DocumentUploadCard] Uploading ${file.name} for type ${docType}`);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', docType);
      formData.append('applicationId', appId);

      // Upload to staff backend API (use correct endpoint)
      const response = await fetch(`/api/public/upload/${appId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ [DocumentUploadCard] Upload successful:`, result);

        setUploadedFiles(prev => [...prev, file]);
        setUploadProgress(100);

        toast({
          title: "Upload Successful",
          description: `${file.name} uploaded successfully.`,
          variant: "default",
        });

        // Call completion callback
        onUploadComplete?.(file, docType);
      } else {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ [DocumentUploadCard] Upload failed:`, error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000); // Reset progress after 2s
    }
  };

  const removeFile = (fileIndex: number) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== fileIndex));
  };

  const isComplete = uploadedFiles.length >= required;
  const needsMore = required - uploadedFiles.length;

  return (
    <Card className={`border-2 ${isComplete ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-100' : 'bg-blue-100'}`}>
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <FileText className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{displayLabel}</CardTitle>
              <p className="text-sm text-gray-600 capitalize">{category} Document</p>
            </div>
          </div>
          <Badge variant={isComplete ? "default" : "secondary"} className={isComplete ? "bg-green-600" : ""}>
            {uploadedFiles.length}/{required}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {needsMore > 0 && (
          <div className="space-y-2">
            {needsMore > 1 && (
              <p className="text-sm text-gray-600">
                {needsMore} more {needsMore === 1 ? 'file' : 'files'} required
              </p>
            )}
            <div className="relative">
              <Button
                className="w-full"
                disabled={isUploading}
                onClick={() => document.getElementById(`file-input-${docType}`)?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : `Upload ${displayLabel}`}
              </Button>
              <input
                id={`file-input-${docType}`}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Completion Status */}
        {isComplete && (
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>All required files uploaded</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}