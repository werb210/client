import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import RefreshCcw from 'lucide-react/dist/esm/icons/refresh-ccw';
import Upload from 'lucide-react/dist/esm/icons/upload';
import X from 'lucide-react/dist/esm/icons/x';

import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useToast } from '@/hooks/use-toast';

import { type RequiredDoc } from '@/lib/documentRequirements';

import { normalizeDocumentName } from '@/utils/documentNormalization';
import { 
  DocumentType, 
  SUPPORTED_DOCUMENT_TYPES, 
  getDocumentLabel,
  getDocumentDescription,
  getDocumentQuantity
} from '@/shared/documentTypes';
import { 
  normalizeDocumentName as normalizeDocumentNameEnhanced,
  getDocumentRequirements 
} from '@/shared/documentMapping';


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
  // ✅ USER SPECIFICATION: File collection callbacks
  onFileAdded?: (file: File, documentType: string, category: string) => void;
  onFileRemoved?: (fileName: string) => void;
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
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            {/* 🧪 DEBUG: Log error status for debugging */}
            {console.log(`🧪 [DEBUG] File showing error status: ${file.name}, documentType: ${file.documentType}, status: ${file.status}`)}
          </>
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
  applicationId,
  onFileAdded,
  onFileRemoved
}: {
  doc: RequiredDoc;
  uploadedFiles: UploadedFile[];
  onFilesUploaded: (files: UploadedFile[]) => void;
  cardIndex: number;
  applicationId: string;
  onFileAdded?: (file: File, documentType: string, category: string) => void;
  onFileRemoved?: (fileName: string) => void;
}) {
  const { toast } = useToast();
  
  // ✅ CORRECT DOCUMENT CLASSIFICATION: Ensure files appear in correct documentType section
  const normalizedDocType = doc.label.toLowerCase().replace(/\s+/g, '_');
  const documentFiles = uploadedFiles.filter(f => {
    // ✅ Ensure files stay bound to correct category based on document_type field from server
    const fileDocType = f.documentType?.toLowerCase() || '';
    
    // If uploaded file's document_type doesn't match current upload type, block it
    if (fileDocType !== normalizedDocType) {
      return false; // Block misassigned category
    }
    
    return true; // Only show files that match this exact document type
  });
  
  // 🧪 DEBUG: Status recovery for files that might be incorrectly marked as errors
  React.useEffect(() => {
    const errorFiles = documentFiles.filter(f => f.status === 'error');
    if (errorFiles.length > 0) {
      console.log(`🧪 [DEBUG] Found ${errorFiles.length} files with error status in ${doc.label}:`, 
        errorFiles.map(f => ({ name: f.name, status: f.status, documentType: f.documentType })));
      
      // Check if these files might have been successfully uploaded but marked as errors
      errorFiles.forEach(f => {
        if (f.uploadedAt || f.id) {
          console.log(`🧪 [DEBUG] File ${f.name} has error status but seems to have upload data - possible false negative`);
        }
      });
    }
  }, [documentFiles, doc.label]);
  
  const requiredQuantity = doc.quantity || 1;
  const isComplete = documentFiles.length >= requiredQuantity;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Map document labels to API categories with precise matching
      const getApiCategory = (label: string): string => {
        const labelLower = label.toLowerCase();
        
        // 🧪 DEBUG: Log label for equipment quote debugging
        if (labelLower.includes('equipment')) {
          console.log(`🧪 [DEBUG] Equipment document label: "${label}" → lowercase: "${labelLower}"`);
        }
        
        // Bank statements - exact match
        if (labelLower.includes('bank') && labelLower.includes('statement')) {
          return 'bank_statements';
        }
        
        // Accountant Prepared Financial Statements - must include "accountant" AND "prepared"
        if (labelLower.includes('accountant') && labelLower.includes('prepared') && labelLower.includes('financial')) {
          return 'financial_statements';
        }
        
        // Personal Financial Statement - must include "personal" 
        if (labelLower.includes('personal') && labelLower.includes('financial') && labelLower.includes('statement')) {
          return 'personal_financial_statement';
        }
        
        // Tax Returns - specific pattern
        if (labelLower.includes('tax') && labelLower.includes('return')) {
          return 'tax_returns';
        }
        
        // Equipment Quotes - specific pattern with debug logging
        if (labelLower.includes('equipment') && labelLower.includes('quote')) {
          console.log(`🧪 [DEBUG] Equipment quote matched: "${label}" → "equipment_quote"`);
          return 'equipment_quote';
        }
        
        // Business License - specific pattern
        if (labelLower.includes('business') && labelLower.includes('license')) {
          return 'business_license';
        }
        
        // Articles of Incorporation - specific pattern
        if (labelLower.includes('articles') && labelLower.includes('incorporation')) {
          return 'articles_of_incorporation';
        }
        
        // Debt Schedule - specific pattern
        if (labelLower.includes('debt') && labelLower.includes('schedule')) {
          return 'debt_schedule';
        }
        
        // Default: normalize to underscore format
        const defaultCategory = label.toLowerCase().replace(/\s+/g, '_');
        console.log(`🧪 [DEBUG] Default category mapping: "${label}" → "${defaultCategory}"`);
        return defaultCategory;
      };
      
      const category = getApiCategory(doc.label);
      
      // 🧪 DEBUG: Enhanced logging for equipment quote debugging
      console.log(`🧪 [DEBUG] Document label: "${doc.label}"`);
      console.log(`🧪 [DEBUG] Mapped category: "${category}"`);
      console.log(`🧪 [DEBUG] Files to upload: ${files.length}`);
      
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
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        status: "uploading" as const,
        documentType: category
      }));
      
      // Add uploading files to state immediately
      onFilesUploaded([...uploadedFiles, ...uploadingFiles]);
      
      // Upload each file immediately to staff backend
      try {
        console.log(`📤 [STEP5] Starting immediate upload of ${files.length} files for applicationId: ${applicationId}`);
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append('document', file);
          formData.append('documentType', category.toLowerCase().replace(/\s+/g, '_'));
          
          // 🧪 REQUIRED DEBUG LOGGING as per user instructions
          console.log("📤 Uploading:", file.name, category.toLowerCase().replace(/\s+/g, '_'));
          console.log(`📤 [STEP5] Uploading file ${i + 1}/${files.length}: ${file.name}`);
          console.log(`📤 [STEP5] Document type: ${category}`);
          console.log(`📤 [STEP5] Application ID: ${applicationId}`);
          console.log(`📤 [STEP5] FormData payload:`, {
            document: file.name,
            documentType: category.toLowerCase().replace(/\s+/g, '_'),
            endpoint: `/api/public/upload/${applicationId}`
          });
          
          const uploadResponse = await fetch(`/api/public/upload/${applicationId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
            },
            body: formData
          });
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`❌ [STEP5] Upload failed for ${file.name}:`, uploadResponse.status, errorText);
            throw new Error(`Upload failed for ${file.name}: ${uploadResponse.status}`);
          }
          
          const uploadResult = await uploadResponse.json();
          console.log("✅ Uploaded:", uploadResult);
          
          // 🧪 DEBUG: Validate upload success response
          if (uploadResult && (uploadResult.success === true || uploadResult.documentId)) {
            console.log(`🧪 [DEBUG] Upload SUCCESS confirmed for ${file.name} - response contains success/documentId`);
          } else {
            console.warn(`🧪 [DEBUG] Upload response unusual for ${file.name}:`, uploadResult);
          }
        }
        
        // ✅ CRITICAL FIX: Replace uploading files with completed files (not add to them)
        const completedFiles = uploadingFiles.map(f => ({ 
          ...f, 
          status: "completed" as const,
          uploadedAt: new Date().toISOString()
        }));
        const otherFiles = uploadedFiles.filter(f => !uploadingFiles.some(u => u.id === f.id));
        onFilesUploaded([...otherFiles, ...completedFiles]);
        
        // 🧪 DEBUG: Log successful status updates
        console.log(`🧪 [DEBUG] Status update - marked ${completedFiles.length} files as completed:`, 
          completedFiles.map(f => ({ name: f.name, status: f.status, documentType: f.documentType })));
        
        console.log(`✅ [STEP5] All ${files.length} files uploaded successfully to staff backend`);
        
        toast({
          title: "Upload Successful",
          description: `${files.length} file(s) uploaded to staff backend successfully`,
        });
        
      } catch (error) {
        console.error('❌ [STEP5] Upload error:', error);
        
        // ✅ CRITICAL FIX: Replace uploading files with error files (not add to them)
        const errorFiles = uploadingFiles.map(f => ({ ...f, status: "error" as const }));
        const otherFiles = uploadedFiles.filter(f => !uploadingFiles.some(u => u.id === f.id));
        onFilesUploaded([...otherFiles, ...errorFiles]);
        
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload files to staff backend",
          variant: "destructive",
        });
      }
      
      // Clear the input
      e.target.value = '';
      return;
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
  applicationId,
  onFileAdded,
  onFileRemoved
}: DynamicDocumentRequirementsProps) {
  
  // State for document requirements  
  const [documentRequirements, setDocumentRequirements] = useState<RequiredDoc[]>([]);

  // ✅ DEDUPLICATION LOGIC: Ensure unique documentType rendering
  useEffect(() => {
    if (!requirements || requirements.length === 0) {
      setDocumentRequirements([]);
      return;
    }
    
    const getDocumentQuantity = (docName: string): number => {
      const normalizedName = docName.toLowerCase();
      
      // Banking Statements always require 6 documents
      if (normalizedName.includes('bank') && normalizedName.includes('statement')) {
        return 6;
      }
      
      // Accountant Prepared Financial Statements require 3 documents
      if (normalizedName.includes('accountant') && normalizedName.includes('financial') && normalizedName.includes('statement')) {
        return 3;
      }
      
      // All other documents require 1
      return 1;
    };
    
    const getDocumentLabel = (docName: string): string => {
      // Use centralized normalization utility
      return normalizeDocumentName(docName);
    };
    
    // ✅ Ensure unique documentType rendering
    const renderedTypes = new Set<string>();
    const deduplicatedRequirements: RequiredDoc[] = [];
    
    for (const docName of requirements) {
      const normalizedType = getDocumentLabel(docName).toLowerCase().replace(/\s+/g, '_');
      
      // Skip if this document type has already been rendered
      if (renderedTypes.has(normalizedType)) {
        console.log(`🔄 Skipping duplicate document type: ${normalizedType}`);
        continue;
      }
      
      renderedTypes.add(normalizedType);
      deduplicatedRequirements.push({
        id: `requirement-${normalizedType}`,
        label: getDocumentLabel(docName),
        description: `Required document for your loan application`,
        quantity: getDocumentQuantity(docName),
        category: 'required',
        priority: 'high'
      });
    }
    
    setDocumentRequirements(deduplicatedRequirements);
    console.log(`📄 Unique document types after deduplication: ${deduplicatedRequirements.length} (from ${requirements.length} original)`);
  }, [requirements]);

  // ✅ DOCUMENT CLASSIFICATION: Ensure correct document-to-category mapping
  useEffect(() => {
    if (documentRequirements.length > 0) {
      // ✅ Ensure correct document classification based on document_type field from server
      const docsByType = uploadedFiles.reduce((acc, doc) => {
        if (doc.status === "completed" && doc.documentType) {
          if (!acc[doc.documentType]) acc[doc.documentType] = [];
          acc[doc.documentType].push(doc);
        }
        return acc;
      }, {} as Record<string, typeof uploadedFiles>);
      
      const completedDocs = documentRequirements.filter(doc => {
        const normalizedDocType = doc.label.toLowerCase().replace(/\s+/g, '_');
        
        // ✅ Fix UploadCount logic: only count successfully uploaded files
        const uploadedCount = docsByType[normalizedDocType]?.filter(d => d.status === 'completed')?.length || 0;
        
        // ✅ Ensure files stay bound to correct category
        const documentFiles = uploadedFiles.filter(f => {
          if (f.status !== "completed") return false;
          
          // Block misassigned category - ensure exact match to prevent cross-contamination
          const fileDocType = f.documentType?.toLowerCase() || '';
          return fileDocType === normalizedDocType;
        });
        
        logger.log(`📊 Document "${doc.label}" files found: ${documentFiles.length}/${doc.quantity || 1} (completed uploads only)`);
        return documentFiles.length >= (doc.quantity || 1);
      });
      
      const allComplete = completedDocs.length === documentRequirements.length;
      logger.log(`📋 Document completion: ${completedDocs.length}/${documentRequirements.length} complete`);
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
            onFileAdded={onFileAdded}
            onFileRemoved={onFileRemoved}
          />
        )) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No document requirements available for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}