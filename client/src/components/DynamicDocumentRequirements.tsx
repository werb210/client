import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, FileText, AlertCircle, RefreshCcw, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// TypeScript Interfaces
interface UploadedFile {
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

interface DocumentRequirement {
  name: string;
  description: string;
  quantity: number;
}

interface DynamicDocumentRequirementsProps {
  formData: {
    headquarters?: string;
    lookingFor?: string;
    fundingAmount?: string;
    accountsReceivableBalance?: string;
  };
  uploadedFiles: UploadedFile[];
  onFilesUploaded: (files: UploadedFile[]) => void;
  selectedProduct?: string;
  onRequirementsChange?: (allComplete: boolean, totalRequirements: number) => void;
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

// Document Upload Card Component
function DocumentUploadCard({ 
  doc, 
  uploadedFiles, 
  onFilesUploaded, 
  cardIndex 
}: {
  doc: DocumentRequirement;
  uploadedFiles: UploadedFile[];
  onFilesUploaded: (files: UploadedFile[]) => void;
  cardIndex: number;
}) {
  
  // Filter files for this document type
  const documentFiles = uploadedFiles.filter(f => 
    f.documentType?.toLowerCase().includes(doc.name.toLowerCase().replace(/\s+/g, '_')) ||
    f.name.toLowerCase().includes(doc.name.toLowerCase().split(' ')[0])
  );
  
  const isComplete = documentFiles.length >= doc.quantity;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        status: "completed" as const,
        documentType: doc.name.toLowerCase().replace(/\s+/g, '_')
      }));
      onFilesUploaded([...uploadedFiles, ...newFiles]);
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
              <h3 className="text-lg font-semibold text-gray-900">{doc.name}</h3>
              {isComplete && (
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Required: {doc.quantity} file{doc.quantity !== 1 ? 's' : ''}
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
              <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG up to 10MB each</p>
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

// Main Component
export function DynamicDocumentRequirements({
  formData,
  uploadedFiles,
  onFilesUploaded,
  selectedProduct,
  onRequirementsChange
}: DynamicDocumentRequirementsProps) {
  
  // Determine document category based on user selection
  const getDocumentCategory = () => {
    if (selectedProduct && selectedProduct.toLowerCase().includes('line of credit')) {
      return 'line_of_credit';
    }
    
    if (formData.lookingFor === 'equipment') {
      return 'equipment_financing';
    } else if (formData.lookingFor === 'capital') {
      return 'term_loan';
    } else if (formData.lookingFor === 'both') {
      return 'line_of_credit';
    } else {
      return 'term_loan';
    }
  };

  const documentCategory = getDocumentCategory();

  // Format category names for display
  const formatCategoryName = (category: string) => {
    const categoryNames = {
      'line_of_credit': 'Business Line of Credit',
      'term_loan': 'Term Loan',
      'equipment_financing': 'Equipment Financing',
      'factoring': 'Invoice Factoring',
      'working_capital': 'Working Capital',
      'purchase_order_financing': 'Purchase Order Financing'
    };
    return categoryNames[category as keyof typeof categoryNames] || category;
  };

  // Fetch required documents from API
  const { data: requiredDocs, isLoading: docsLoading, error: docsError, refetch } = useQuery({
    queryKey: ['/api/loan-products/required-documents', documentCategory, formData.headquarters, formData.fundingAmount],
    queryFn: async () => {
      const params = new URLSearchParams({
        headquarters: formData.headquarters || 'united_states',
        fundingAmount: formData.fundingAmount || '$50000',
        ...(formData.accountsReceivableBalance && { accountsReceivableBalance: formData.accountsReceivableBalance })
      });
      
      const response = await fetch(`/api/loan-products/required-documents/${documentCategory}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch required documents');
      return response.json();
    },
    enabled: !!(documentCategory && formData.headquarters && formData.fundingAmount),
    retry: 1,
  });

  // Process document requirements with fallback
  let documentRequirements = Array.isArray(requiredDocs?.data) ? requiredDocs.data : [];
  
  // Fallback to standard business loan documents if no specific requirements found
  if (documentRequirements.length === 0 && !docsLoading && !docsError) {
    documentRequirements = [
      { name: "Bank Statements", description: "Last 6 months of business bank statements", quantity: 6 },
      { name: "Tax Returns", description: "Last 3 years of business tax returns", quantity: 3 },
      { name: "Financial Statements", description: "Recent profit & loss and balance sheet", quantity: 3 },
      { name: "Business License", description: "Valid business registration or license", quantity: 1 },
      { name: "Articles of Incorporation", description: "Legal business formation documents", quantity: 1 }
    ];
  }

  // Check completion status
  useEffect(() => {
    if (documentRequirements.length > 0) {
      const completedDocs = documentRequirements.filter(doc => {
        const documentFiles = uploadedFiles.filter(f => 
          f.documentType?.toLowerCase().includes(doc.name.toLowerCase().replace(/\s+/g, '_')) ||
          f.name.toLowerCase().includes(doc.name.toLowerCase().split(' ')[0])
        );
        return documentFiles.length >= doc.quantity;
      });
      
      const allComplete = completedDocs.length === documentRequirements.length;
      onRequirementsChange?.(allComplete, documentRequirements.length);
    }
  }, [uploadedFiles, documentRequirements, onRequirementsChange]);

  // Error state
  if (docsError && !requiredDocs) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Document Requirements</h3>
        <p className="text-gray-600 mb-4">We're having trouble loading the specific document requirements for your loan type.</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Loading state
  if (docsLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading document requirements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Required Documents for {formatCategoryName(documentCategory)}
          </h3>
          <p className="text-sm text-blue-800">
            Based on your loan selection: {selectedProduct ? formatCategoryName(selectedProduct) : 'Standard requirements'}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Showing {documentRequirements.length} required document types
          </p>
        </CardContent>
      </Card>

      {/* Document Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentRequirements.length > 0 ? documentRequirements.map((doc: DocumentRequirement, index: number) => (
          <DocumentUploadCard
            key={index}
            doc={doc}
            uploadedFiles={uploadedFiles}
            onFilesUploaded={onFilesUploaded}
            cardIndex={index}
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