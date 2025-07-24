import React, { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

import { CheckCircle, FileText, AlertCircle, RefreshCcw, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getDocumentLabel as getDocumentTypeLabel } from '../../../shared/documentTypes';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useToast } from '@/hooks/use-toast';

import { type RequiredDoc } from '@/lib/documentRequirements';

import { 
  DocumentType, 
  SUPPORTED_DOCUMENT_TYPES, 
  getDocumentLabel,
  getDocumentDescription,
  getDocumentQuantity,
  normalizeDocumentName
} from '../../../shared/documentTypes';
import { 
  getDocumentRequirements 
} from '../../../shared/documentMapping';
import { 
  DOCUMENT_TYPE_MAP,
  getApiCategory,
  getDisplayName,
  isValidDocumentType,
  normalizeDocumentName as normalizeDocName
} from '../lib/documentMapping';
import { 
  normalizeDocRequirement,
  getCanonicalDocumentInfo,
  CANONICAL_DOCUMENT_LABELS,
  type CanonicalDocumentType
} from '../lib/docNormalization';


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

  // Generate preview URL for documents if not already present
  const getPreviewUrl = (file: UploadedFile) => {
    if (file.preview) return file.preview;
    
    // For PDF and image files, create object URL for preview
    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      return URL.createObjectURL(file.file);
    }
    
    return null;
  };

  const previewUrl = getPreviewUrl(file);

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded border">
      <div className="flex items-center space-x-3">
        {previewUrl ? (
          <div className="relative group">
            <FileText className="w-4 h-4 text-blue-500 cursor-pointer" />
            {/* Preview tooltip/modal on hover */}
            <div className="absolute left-0 bottom-6 z-50 hidden group-hover:block">
              <div className="bg-black bg-opacity-75 rounded p-2 max-w-xs">
                {file.type === 'application/pdf' ? (
                  <iframe 
                    src={previewUrl} 
                    className="w-48 h-32 border-0"
                    title={`Preview of ${file.name}`}
                  />
                ) : (
                  <img 
                    src={previewUrl}
                    alt={`Preview of ${file.name}`}
                    className="max-w-48 max-h-32 object-contain"
                    onError={() => console.warn('Preview failed for', file.name)}
                  />
                )}
                <div className="text-white text-xs mt-1 text-center">Preview</div>
              </div>
            </div>
          </div>
        ) : (
          <FileText className="w-4 h-4 text-gray-500" />
        )}
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
  
  // ✅ PATCH 2: Use shared normalizeDocumentName function for consistent mapping
  const getApiDocumentType = normalizeDocumentName;
  
  const apiDocumentType = getApiDocumentType(doc.label);
  const documentFiles = uploadedFiles.filter(f => {
    // ✅ Ensure files stay bound to correct category based on document_type field from server
    const fileDocType = f.documentType?.toLowerCase() || '';
    const isMatch = f.status === "completed" && fileDocType === apiDocumentType;
    
    console.log(`🔍 [CARD] File "${f.name}" (type: "${fileDocType}") vs requirement "${doc.label}" (api: "${apiDocumentType}") → match: ${isMatch}`);
    return isMatch;
  });
  
  // 🧪 DEBUG: Status recovery for files that might be incorrectly marked as errors
  React.useEffect(() => {
    const errorFiles = documentFiles.filter(f => f.status === 'error');
    if (errorFiles.length > 0) {
      console.log(`🧪 [DEBUG] Found ${errorFiles.length} files with error status in ${doc.label}:`, 
        errorFiles.map(f => ({ name: f.name, status: f.status, documentType: f.documentType })));
      
      // Check if these files might have been successfully uploaded but marked as errors
      errorFiles.forEach(f => {
        if ((f as any).uploadedAt || f.id) {
          console.log(`🧪 [DEBUG] File ${f.name} has error status but seems to have upload data - possible false negative`);
        }
      });
    }
  }, [documentFiles, doc.label]);
  
  const requiredQuantity = doc.quantity || 1;
  const isComplete = documentFiles.length >= requiredQuantity;

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size (non-zero and under 25MB)
    if (file.size === 0) {
      return { isValid: false, error: "File is empty. Please upload a valid document." };
    }
    
    if (file.size > 25 * 1024 * 1024) {
      return { isValid: false, error: "File must be under 25MB. Please reduce file size and try again." };
    }

    // Check valid file types and MIME types
    const validExtensions = ['.pdf', '.docx', '.xlsx', '.xls', '.png', '.jpg', '.jpeg', '.doc'];
    const validMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/msword',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidExtension = validExtensions.includes(fileExtension);
    const isValidMimeType = validMimeTypes.includes(file.type);

    if (!isValidExtension) {
      return { isValid: false, error: "Invalid file type. Please upload PDF, Word, Excel, or image files only." };
    }

    if (!isValidMimeType && file.type !== 'application/octet-stream') {
      return { isValid: false, error: "Invalid file format. Please upload a valid document file." };
    }

    // Reject obvious fake or placeholder files
    if (file.type === 'application/octet-stream' && !fileExtension.match(/\.(pdf|docx|xlsx|xls|png|jpg|jpeg|doc)$/)) {
      return { isValid: false, error: "Unrecognized file format. Please upload a proper document file." };
    }

    return { isValid: true };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Use canonical document normalization for API mapping
      const normalizedType = normalizeDocRequirement(doc.label);
      const category = normalizedType || getApiCategory(doc.label);
      
      // 🧪 DEBUG: Enhanced logging for equipment quote debugging
      console.log(`🧪 [DEBUG] Document label: "${doc.label}"`);
      console.log(`🧪 [DEBUG] Mapped category: "${category}"`);
      console.log(`🧪 [DEBUG] Files to upload: ${files.length}`);
      
      // Validate all files before proceeding
      for (const file of files) {
        const validation = validateFile(file);
        if (!validation.isValid) {
          toast({
            title: "Invalid File",
            description: validation.error,
            variant: "destructive",
          });
          return;
        }
      }

      console.log(`✅ [VALIDATION] All ${files.length} files passed validation checks`);
      
      // Additional file integrity logging
      files.forEach(file => {
        console.log(`📄 [FILE-INFO] ${file.name}: ${file.size} bytes, type: ${file.type}`);
      });
      
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
          formData.append('documentType', category);
          
          // 🧪 REQUIRED DEBUG LOGGING as per user instructions
          console.log("📤 Uploading:", file.name, category);
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
  
  // 📱 MOBILE RESPONSIVENESS: Keyboard detection state
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 📱 MOBILE RESPONSIVENESS: Keyboard detection with viewport/keyboard monitoring
  useEffect(() => {
    const detectMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /iPhone|iPad|Android/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
      return isMobileDevice;
    };

    const handleResize = () => {
      const currentIsMobile = detectMobile();
      
      if (currentIsMobile) {
        // Keyboard detection: if screen height is significantly reduced, keyboard is likely open
        const isKeyboardOpen = window.innerHeight < 600;
        setKeyboardOpen(isKeyboardOpen);
        
        console.log(`📱 [MOBILE] Viewport: ${window.innerWidth}x${window.innerHeight}, Keyboard: ${isKeyboardOpen ? 'OPEN' : 'CLOSED'}`);
        
        // Auto-scroll into view when keyboard opens
        if (isKeyboardOpen && containerRef.current) {
          setTimeout(() => {
            containerRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center'
            });
          }, 100);
        }
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (isMobile && event.target instanceof HTMLInputElement) {
        // Input field focused on mobile - ensure visibility
        setTimeout(() => {
          event.target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 300); // Delay to allow keyboard animation
      }
    };

    // Initialize mobile detection
    detectMobile();
    handleResize();

    // Add event listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);
    
    // Visual Viewport API support for better keyboard detection
    if ('visualViewport' in window && window.visualViewport) {
      const visualViewport = window.visualViewport;
      
      const handleViewportChange = () => {
        if (isMobile) {
          const keyboardHeight = window.innerHeight - visualViewport.height;
          const isKeyboardVisible = keyboardHeight > 150; // Threshold for keyboard detection
          setKeyboardOpen(isKeyboardVisible);
          
          console.log(`📱 [VISUAL VIEWPORT] Height: ${visualViewport.height}, Keyboard height: ${keyboardHeight}, Visible: ${isKeyboardVisible}`);
          
          // Update CSS custom properties for dynamic styling
          document.documentElement.style.setProperty('--device-height', `${window.innerHeight}px`);
          document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
        }
      };
      
      visualViewport.addEventListener('resize', handleViewportChange);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('focusin', handleFocusIn);
        visualViewport.removeEventListener('resize', handleViewportChange);
      };
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [isMobile]);

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
    
    // This function is no longer needed since we handle normalization in the main loop
    
    // ✅ FIXED DEDUPLICATION: Work at document type level, not display label level
    const renderedDocumentTypes = new Set<string>();
    const deduplicatedRequirements: RequiredDoc[] = [];
    
    console.log(`🔍 [DEBUG] Processing ${requirements.length} document requirements:`, requirements);
    
    for (const docName of requirements) {
      // First normalize to get the document type (this is the key for deduplication)
      const documentType = normalizeDocumentName(docName);
      console.log(`🔍 [DEBUG] Processing "${docName}" → documentType: "${documentType}"`);
      
      // Skip if this document TYPE has already been rendered (not display label)
      if (renderedDocumentTypes.has(documentType)) {
        console.log(`🔄 [DUPLICATE] Skipping duplicate document type: "${documentType}" (original: "${docName}")`);
        continue;
      }
      
      // Now get the display label for this document type
      const displayLabel = getDocumentTypeLabel(documentType as any);
      console.log(`🔍 [DEBUG] Document type "${documentType}" → display label: "${displayLabel}"`);
      
      renderedDocumentTypes.add(documentType);
      deduplicatedRequirements.push({
        id: `requirement-${documentType}`,
        label: displayLabel,
        description: `Required document for your loan application`,
        quantity: getDocumentQuantity(docName),
        category: 'required'
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
        
        // ✅ COMPREHENSIVE FIX: Map ALL display names to API document types
        const getApiDocumentType = (displayLabel: string): string => {
          const labelLower = displayLabel.toLowerCase();
          
          // Bank statements
          if (labelLower.includes('bank') && labelLower.includes('statement')) {
            return 'bank_statements';
          }
          
          // Accountant Prepared Financial Statements → financial_statements
          if (labelLower.includes('accountant') && labelLower.includes('prepared') && labelLower.includes('financial')) {
            return 'financial_statements';
          }
          
          // General Financial Statements → financial_statements  
          if (labelLower.includes('financial') && labelLower.includes('statement')) {
            return 'financial_statements';
          }
          
          // Personal Financial Statement
          if (labelLower.includes('personal') && labelLower.includes('financial') && labelLower.includes('statement')) {
            return 'personal_financial_statement';
          }
          
          // Tax Returns
          if (labelLower.includes('tax') && labelLower.includes('return')) {
            return 'tax_returns';
          }
          
          // Equipment Quote
          if (labelLower.includes('equipment') && labelLower.includes('quote')) {
            return 'equipment_quote';
          }
          
          // Business License
          if (labelLower.includes('business') && labelLower.includes('license')) {
            return 'business_license';
          }
          
          // Articles of Incorporation
          if (labelLower.includes('articles') && labelLower.includes('incorporation')) {
            return 'articles_of_incorporation';
          }
          
          // Profit & Loss Statement
          if (labelLower.includes('profit') && (labelLower.includes('loss') || labelLower.includes('&'))) {
            return 'profit_loss_statement';
          }
          
          // Balance Sheet
          if (labelLower.includes('balance') && labelLower.includes('sheet')) {
            return 'balance_sheet';
          }
          
          // Cash Flow Statement
          if (labelLower.includes('cash') && labelLower.includes('flow')) {
            return 'cash_flow_statement';
          }
          
          // Accounts Receivable (A/R)
          if ((labelLower.includes('accounts') && labelLower.includes('receivable')) || 
              (labelLower.includes('a/r') || labelLower.includes('ar '))) {
            return 'accounts_receivable';
          }
          
          // Accounts Payable (A/P)
          if ((labelLower.includes('accounts') && labelLower.includes('payable')) || 
              (labelLower.includes('a/p') || labelLower.includes('ap '))) {
            return 'accounts_payable';
          }
          
          // Driver's License (Front & Back)
          if (labelLower.includes('driver') && labelLower.includes('license')) {
            return 'drivers_license_front_back';
          }
          
          // VOID/PAD or Voided Check
          if (labelLower.includes('void') || labelLower.includes('pad')) {
            return 'void_pad';
          }
          
          // Business Plan
          if (labelLower.includes('business') && labelLower.includes('plan')) {
            return 'business_plan';
          }
          
          // Personal Guarantee
          if (labelLower.includes('personal') && labelLower.includes('guarantee')) {
            return 'personal_guarantee';
          }
          
          // Invoice Samples
          if (labelLower.includes('invoice') && labelLower.includes('sample')) {
            return 'invoice_samples';
          }
          
          // Collateral Documents
          if (labelLower.includes('collateral')) {
            return 'collateral_docs';
          }
          
          // Supplier Agreement
          if (labelLower.includes('supplier') && labelLower.includes('agreement')) {
            return 'supplier_agreement';
          }
          
          // Proof of Identity
          if (labelLower.includes('proof') && labelLower.includes('identity')) {
            return 'proof_of_identity';
          }
          
          // Signed Application
          if (labelLower.includes('signed') && labelLower.includes('application')) {
            return 'signed_application';
          }
          
          // Debt Schedule
          if (labelLower.includes('debt') && labelLower.includes('schedule')) {
            return 'debt_schedule';
          }
          
          // Default: convert to underscore format
          return labelLower.replace(/\s+/g, '_');
        };
        
        const apiDocumentType = getApiDocumentType(doc.label);
        
        // ✅ Fix UploadCount logic: only count successfully uploaded files
        const uploadedCount = docsByType[apiDocumentType]?.filter(d => d.status === 'completed')?.length || 0;
        
        // ✅ Ensure files stay bound to correct category using API document type
        const documentFiles = uploadedFiles.filter(f => {
          if (f.status !== "completed") return false;
          
          // Use API document type for matching uploaded files
          const fileDocType = f.documentType?.toLowerCase() || '';
          const isMatch = fileDocType === apiDocumentType;
          console.log(`🔍 [CARD] File "${f.name}" (type: "${fileDocType}") vs requirement "${doc.label}" (api: "${apiDocumentType}") → match: ${isMatch}`);
          return isMatch;
        });
        
        const isComplete = documentFiles.length >= (doc.quantity || 1);
        console.log(`📊 Document validation "${doc.label}": ${documentFiles.length}/${doc.quantity || 1} (${isComplete ? 'COMPLETE' : 'INCOMPLETE'})`);
        logger.log(`📊 Document validation "${doc.label}": ${documentFiles.length}/${doc.quantity || 1} (${isComplete ? 'COMPLETE' : 'INCOMPLETE'})`);
        return isComplete;
      });
      
      const allComplete = completedDocs.length === documentRequirements.length;
      logger.log(`📋 Document completion: ${completedDocs.length}/${documentRequirements.length} complete`);
      onRequirementsChange?.(allComplete, documentRequirements.length);
    }
  }, [uploadedFiles, documentRequirements, onRequirementsChange]);

  // No loading or error states needed - we always have the requirements from props

  return (
    <div 
      ref={containerRef}
      className={`space-y-6 transition-all duration-300 ${
        isMobile && keyboardOpen 
          ? 'pb-4' // Reduced padding when keyboard open
          : 'pb-8' // Normal padding
      }`}
      style={{
        // Dynamic height adjustment for mobile keyboard
        ...(isMobile && keyboardOpen && {
          maxHeight: 'calc(var(--device-height, 100vh) - var(--keyboard-height, 0px) - 100px)',
          overflowY: 'auto'
        })
      }}
    >
      {/* 📱 MOBILE KEYBOARD INDICATOR */}
      {isMobile && keyboardOpen && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-sm text-blue-800">
          📱 Mobile keyboard detected - interface optimized for easier use
        </div>
      )}
      
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

      {/* Document Requirements Grid using new structure with mobile-optimized layout */}
      <div className={`grid gap-6 ${
        isMobile && keyboardOpen
          ? 'grid-cols-1' // Single column when keyboard open on mobile
          : 'grid-cols-1 md:grid-cols-2' // Responsive grid normally
      }`}>
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