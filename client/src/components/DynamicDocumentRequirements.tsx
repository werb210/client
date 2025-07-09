import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, FileText, AlertCircle, RefreshCcw, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { type RequiredDoc } from '@/lib/documentRequirements';

// TypeScript Interfaces - Export for use in other components
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: "uploading" | "completed" | "error";
  documentType: string;
  preview?: string;
  uploadProgress?: number;
}

// Legacy interface for backward compatibility
interface DocumentRequirement {
  name: string;
  description: string;
  quantity: number;
}

interface DynamicDocumentRequirementsProps {
  requirements: string[];  // The 14-item intersection results
  uploadedFiles: UploadedFile[];
  onFilesUploaded: (files: UploadedFile[]) => void;
  onRequirementsChange?: (allComplete: boolean, totalRequirements: number) => void;
  applicationId: string;
}

// Individual File Item Component
function UploadedFileItem({ 
  file, 
  onRemove 
}: { 
  file: UploadedFile; 
  onRemove: (fileId: string) => void; 
}) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded border">
      <div className="flex items-center space-x-3">
        <FileText className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-900">{file.name}</span>
        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
        {file.status === "uploading" && (
          <div className="w-4 h-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        {file.status === "completed" && (
          <CheckCircle className="w-4 h-4 text-green-500" />
        )}
        {file.status === "error" && (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
      </div>
      <button
        onClick={() => onRemove(file.id)}
        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Unified Document Upload Card Component for new RequiredDoc interface
function UnifiedDocumentUploadCard({ 
  doc, 
  uploadedFiles, 
  onFilesUploaded, 
  cardIndex,
  applicationId 
}: {
  doc: RequiredDoc;
  uploadedFiles: UploadedFile[];
  onFilesUploaded: (files: UploadedFile[]) => void;
  cardIndex: number;
  applicationId: string;
}) {
  const { toast } = useToast();
  
  // Filter files for this document type using label instead of name
  const documentFiles = uploadedFiles.filter(f => 
    f.documentType?.toLowerCase().includes(doc.label.toLowerCase().replace(/\s+/g, '_')) ||
    f.name.toLowerCase().includes(doc.label.toLowerCase().split(' ')[0])
  );
  
  const requiredQuantity = doc.quantity || 1;
  const isComplete = documentFiles.length >= requiredQuantity;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const category = doc.label.toLowerCase().replace(/\s+/g, '_');
      
      // Validate file sizes (25MB limit)
      const oversizedFiles = files.filter(file => file.size > 25 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast({
          title: "File Too Large",
          description: `Files must be under 25MB. Please reduce file size and try again.`,
          variant: "destructive",
        });
        return;
      }
      
      // Create upload entries with uploading status
      const uploadingFiles = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        status: "uploading" as const,
        documentType: category
      }));
      
      // Add uploading files to state immediately
      onFilesUploaded([...uploadedFiles, ...uploadingFiles]);
      
      try {
        // Use the exact FormData structure specified
        const form = new FormData();
        files.forEach((file) => form.append('files', file));
        form.append('category', category);
        
        const response = await fetch(`/api/upload/${applicationId}`, {
          method: 'POST',
          body: form,
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        // Update status to completed
        const completedFiles = uploadingFiles.map(f => ({ ...f, status: "completed" as const }));
        onFilesUploaded([...uploadedFiles, ...completedFiles]);
        
        toast({
          title: "Upload Successful",
          description: `${files.length} file(s) uploaded successfully`,
        });
        
      } catch (error) {
        // Update status to error
        const errorFiles = uploadingFiles.map(f => ({ ...f, status: "error" as const }));
        onFilesUploaded([...uploadedFiles, ...errorFiles]);
        
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload files",
          variant: "destructive",
        });
        
        console.error('Upload error:', error);
      }
    }
  };

  const handleFileRemove = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    onFilesUploaded(updatedFiles);
  };

  return (
    <Card className={`transition-all duration-200 ${
      isComplete 
        ? 'border-green-200 bg-green-50' 
        : 'border-gray-200 hover:border-blue-200'
    }`}>
      <CardContent className="p-6">
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{doc.label}</h3>
              {isComplete && (
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{doc.description || 'Document required for your application'}</p>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Required: {requiredQuantity} file{requiredQuantity !== 1 ? 's' : ''}
              </span>
              <span className={`text-sm font-medium ${
                isComplete ? 'text-green-600' : 'text-blue-600'
              }`}>
                Uploaded: {documentFiles.length}
              </span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="ml-4">
            {isComplete ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Complete
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Required
              </span>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
            id={`upload-${cardIndex}`}
          />
          <label htmlFor={`upload-${cardIndex}`} className="cursor-pointer">
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <div>
                <span className="text-sm font-medium text-blue-600 hover:text-blue-500">Choose files</span>
                <span className="text-sm text-gray-500"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG up to 25MB each</p>
            </div>
          </label>
        </div>

        {/* Uploaded Files List */}
        {documentFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {documentFiles.map((file) => (
              <UploadedFileItem
                key={file.id}
                file={file}
                onRemove={handleFileRemove}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Component - Always accept whatever the parent sends
export function DynamicDocumentRequirements({
  requirements,
  uploadedFiles,
  onFilesUploaded,
  onRequirementsChange,
  applicationId
}: DynamicDocumentRequirementsProps) {
  
  // State for document requirements  
  const [documentRequirements, setDocumentRequirements] = useState<RequiredDoc[]>([]);

  // Always accept whatever the parent sends
  useEffect(() => {
    const docRequirements = requirements.map((docName: string, index: number) => ({
      id: `requirement-${index}`,
      label: docName,
      description: `Required document for your loan application`,
      quantity: 1,
      category: 'required',
      priority: 'high'
    }));
    
    setDocumentRequirements(docRequirements);
    console.debug("📄 Final visible doc list:", requirements);
    console.debug("📄 Equipment Quote in list?", requirements.find(doc => doc.includes('Equipment')));
  }, [requirements]);

  // Check completion status using unified requirements
  useEffect(() => {
    if (documentRequirements.length > 0) {
      const completedDocs = documentRequirements.filter(doc => {
        const documentFiles = uploadedFiles.filter(f => 
          f.documentType?.toLowerCase().includes(doc.label.toLowerCase().replace(/\s+/g, '_')) ||
          f.name.toLowerCase().includes(doc.label.toLowerCase().split(' ')[0])
        );
        return documentFiles.length >= (doc.quantity || 1);
      });
      
      const allComplete = completedDocs.length === documentRequirements.length;
      onRequirementsChange?.(allComplete, documentRequirements.length);
    }
  }, [uploadedFiles, documentRequirements, onRequirementsChange]);

  // No loading or error states needed - we always have the requirements from props

  return (
    <div className="space-y-6">
      {/* Header Section with authentic intersection info */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Required Documents - Authentic Lender Requirements
          </h3>
          <p className="text-sm text-green-800">
            Consolidated from all matching lender products for your selections
          </p>
          <p className="text-xs text-green-600 mt-1">
            Showing {documentRequirements.length} document requirements
          </p>
        </CardContent>
      </Card>

      {/* Document Requirements Grid using new structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentRequirements.length > 0 ? documentRequirements.map((doc: RequiredDoc, index: number) => (
          <UnifiedDocumentUploadCard
            key={doc.id || index}
            doc={doc}
            uploadedFiles={uploadedFiles}
            onFilesUploaded={onFilesUploaded}
            cardIndex={index}
            applicationId={applicationId}
          />
        )) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No document requirements loaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}