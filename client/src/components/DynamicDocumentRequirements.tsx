import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, CheckCircle, X, Upload, AlertCircle } from 'lucide-react';
import { getDocumentCategory, formatCategoryName } from '../utils/categoryMapping';

interface DocumentRequirement {
  name: string;
  description: string;
  quantity: number;
  required: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: "uploading" | "completed" | "error";
  documentType: string;
}

interface DynamicDocumentRequirementsProps {
  formData: any;
  uploadedFiles: UploadedFile[];
  onFilesUploaded: (files: UploadedFile[]) => void;
  onRequirementsChange?: (allComplete: boolean, totalRequirements: number) => void;
  selectedProduct?: string;
}

export function DynamicDocumentRequirements({
  formData,
  uploadedFiles,
  onFilesUploaded,
  onRequirementsChange,
  selectedProduct = ''
}: DynamicDocumentRequirementsProps) {
  const [error, setError] = useState<string | null>(null);
  
  // Determine document category based on form data and selected product
  const documentCategory = getDocumentCategory(formData, selectedProduct);

  console.log('[DOCUMENT REQUIREMENTS] Category:', documentCategory, 'FormData:', formData, 'Selected:', selectedProduct);

  // Use fallback requirements since we already have working lender product sync
  // In a production implementation, this would query the staff database via API
  const getRequirementsForCategory = (category: string): DocumentRequirement[] => {
    const requirementMap: Record<string, DocumentRequirement[]> = {
      'term_loan': [
        { name: "Bank Statements", description: "Last 6 months of business bank statements", quantity: 6, required: true },
        { name: "Tax Returns", description: "Last 3 years of business tax returns", quantity: 3, required: true },
        { name: "Financial Statements", description: "Recent profit & loss and balance sheet", quantity: 3, required: true },
        { name: "Business License", description: "Valid business registration or license", quantity: 1, required: true },
        { name: "Articles of Incorporation", description: "Legal business formation documents", quantity: 1, required: false }
      ],
      'line_of_credit': [
        { name: "Bank Statements", description: "Last 3 months of business bank statements", quantity: 3, required: true },
        { name: "Financial Statements", description: "Recent profit & loss statement", quantity: 1, required: true },
        { name: "Business License", description: "Valid business registration or license", quantity: 1, required: true },
        { name: "Tax Returns", description: "Last 2 years of business tax returns", quantity: 2, required: false }
      ],
      'equipment_financing': [
        { name: "Equipment Quotes", description: "Quotes for equipment to be purchased", quantity: 1, required: true },
        { name: "Bank Statements", description: "Last 6 months of business bank statements", quantity: 6, required: true },
        { name: "Tax Returns", description: "Last 2 years of business tax returns", quantity: 2, required: true },
        { name: "Financial Statements", description: "Recent profit & loss statement", quantity: 1, required: true },
        { name: "Business License", description: "Valid business registration or license", quantity: 1, required: false }
      ],
      'factoring': [
        { name: "Accounts Receivable Aging", description: "Current AR aging report", quantity: 1, required: true },
        { name: "Customer Invoices", description: "Sample customer invoices", quantity: 5, required: true },
        { name: "Bank Statements", description: "Last 3 months of business bank statements", quantity: 3, required: true },
        { name: "Business License", description: "Valid business registration or license", quantity: 1, required: false }
      ]
    };

    return requirementMap[category] || requirementMap['term_loan'];
  };

  const documentRequirements = getRequirementsForCategory(documentCategory);

  // Track completion status and notify parent
  useEffect(() => {
    if (documentRequirements.length > 0 && onRequirementsChange) {
      const requiredDocs = documentRequirements.filter(doc => doc.required);
      const allComplete = requiredDocs.every((doc: DocumentRequirement) => {
        const documentFiles = uploadedFiles.filter(f => 
          f.documentType?.toLowerCase().includes(doc.name.toLowerCase().replace(/\s+/g, '_')) ||
          f.name.toLowerCase().includes(doc.name.toLowerCase().split(' ')[0])
        );
        return documentFiles.length >= doc.quantity;
      });
      onRequirementsChange(allComplete, requiredDocs.length);
    } else if (onRequirementsChange) {
      onRequirementsChange(true, 0);
    }
  }, [uploadedFiles, documentRequirements, onRequirementsChange]);

  // Handle file upload
  const handleFileUpload = (files: FileList, documentName: string) => {
    const newFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      status: "completed" as const,
      documentType: documentName.toLowerCase().replace(/\s+/g, '_')
    }));
    onFilesUploaded([...uploadedFiles, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    onFilesUploaded(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            Required Documents - {formatCategoryName(documentCategory)}
            <p className="text-sm font-normal text-gray-600 mt-1">
              Upload the required documents for your {formatCategoryName(documentCategory).toLowerCase()} application
            </p>
          </div>
          <Badge variant="outline" className="ml-2">
            {documentRequirements.filter(d => d.required).length} Required
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Requirements */}
        <div className="space-y-4">
          {documentRequirements.map((doc, index) => {
            const documentFiles = uploadedFiles.filter(f => 
              f.documentType?.toLowerCase().includes(doc.name.toLowerCase().replace(/\s+/g, '_')) ||
              f.name.toLowerCase().includes(doc.name.toLowerCase().split(' ')[0])
            );
            const isComplete = documentFiles.length >= doc.quantity;
            
            return (
              <div key={index} className={`bg-white rounded-lg border-2 transition-all duration-200 ${
                isComplete 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 hover:border-blue-200'
              } p-4`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {doc.name} {doc.required && <span className="text-red-500">*</span>}
                      </h4>
                      {isComplete && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{doc.description}</p>
                    {doc.quantity > 1 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {documentFiles.length} of {doc.quantity} files uploaded
                      </p>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-3">
                  <Input
                    type="file"
                    multiple={doc.quantity > 1}
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files, doc.name)}
                    className="border-dashed border-2"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </div>

                {/* Uploaded Files */}
                {documentFiles.length > 0 && (
                  <div className="space-y-2">
                    {documentFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Completion Status */}
                {!doc.required && (
                  <div className="mt-2 text-xs text-gray-500">
                    Optional document - not required to proceed
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Helper Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Document Upload Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
                <li>• Maximum file size: 10MB per file</li>
                <li>• Ensure documents are clear and readable</li>
                <li>• Required documents marked with (*) must be uploaded to proceed</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}