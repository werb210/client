import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, ArrowRight, Upload, FileText, CheckCircle, X } from 'lucide-react';
import { useComprehensiveForm } from '@/context/ComprehensiveFormContext';
import { useQuery } from '@tanstack/react-query';

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
  status: 'completed' | 'error';
  documentType: string;
}

interface Step5Props {
  onNext: () => void;
  onPrevious: () => void;
}

export function Step5DocumentUpload({ onNext, onPrevious }: Step5Props) {
  const { state, updateFormData } = useComprehensiveForm();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [allRequiredDocsComplete, setAllRequiredDocsComplete] = useState(false);
  const [totalRequiredDocs, setTotalRequiredDocs] = useState(0);

  // Create form data for API calls
  const formData = {
    headquarters: state.formData.headquarters || 'US',
    fundingAmount: state.formData.fundingAmount || 0,
    lookingFor: state.formData.lookingFor || 'capital',
    accountsReceivableBalance: state.formData.accountsReceivableBalance || 0,
    fundsPurpose: state.formData.fundsPurpose || '',
    selectedProduct: state.formData.selectedProductName || '',
  };

  // Determine document category based on selection
  const getDocumentCategory = () => {
    if (formData.selectedProduct && formData.selectedProduct.toLowerCase().includes('line of credit')) {
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

  // Mock document requirements based on category (since we don't have the API endpoint yet)
  const getDocumentRequirements = (category: string): DocumentRequirement[] => {
    const commonDocs = [
      {
        name: 'Bank Statements',
        description: 'Most recent 3 months of business bank statements',
        quantity: 3,
        required: true
      },
      {
        name: 'Financial Statements',
        description: 'Profit & Loss and Balance Sheet for current year',
        quantity: 2,
        required: true
      },
      {
        name: 'Tax Returns',
        description: 'Business tax returns for the past 2 years',
        quantity: 2,
        required: true
      }
    ];

    const categorySpecificDocs: Record<string, DocumentRequirement[]> = {
      equipment_financing: [
        ...commonDocs,
        {
          name: 'Equipment Quote',
          description: 'Detailed quote or invoice for equipment to be financed',
          quantity: 1,
          required: true
        },
        {
          name: 'Equipment Specifications',
          description: 'Technical specifications and photos of equipment',
          quantity: 1,
          required: false
        }
      ],
      line_of_credit: [
        ...commonDocs,
        {
          name: 'Accounts Receivable Aging',
          description: 'Current AR aging report showing outstanding invoices',
          quantity: 1,
          required: true
        }
      ],
      term_loan: [
        ...commonDocs,
        {
          name: 'Business Plan',
          description: 'Detailed business plan showing use of funds',
          quantity: 1,
          required: false
        }
      ]
    };

    return categorySpecificDocs[category] || commonDocs;
  };

  const documentRequirements = getDocumentRequirements(documentCategory);

  // Track completion status
  useEffect(() => {
    if (documentRequirements.length > 0) {
      const requiredDocs = documentRequirements.filter(doc => doc.required);
      const allComplete = requiredDocs.every((doc) => {
        const documentFiles = uploadedFiles.filter(f => 
          f.documentType?.toLowerCase().includes(doc.name.toLowerCase().replace(/\s+/g, '_')) ||
          f.name.toLowerCase().includes(doc.name.toLowerCase().split(' ')[0])
        );
        return documentFiles.length >= doc.quantity;
      });
      setAllRequiredDocsComplete(allComplete);
      setTotalRequiredDocs(requiredDocs.length);
    }
  }, [uploadedFiles, documentRequirements]);

  const handleFileUpload = (files: FileList, documentType: string) => {
    const newFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      status: "completed" as const,
      documentType: documentType.toLowerCase().replace(/\s+/g, '_')
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleContinue = () => {
    // Save uploaded files to form data
    updateFormData({
      uploadedDocuments: uploadedFiles.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        documentType: f.documentType,
        status: f.status
      }))
    });
    onNext();
  };

  const handleSkipDocuments = () => {
    updateFormData({
      documentsSkipped: true,
      uploadedDocuments: []
    });
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <p className="text-sm text-gray-600">
          Upload the required documents for your {documentCategory.replace(/_/g, ' ')} application
        </p>
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
                    <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                    <p className="text-xs text-gray-500">
                      Required: {doc.quantity} document{doc.quantity > 1 ? 's' : ''}
                      {documentFiles.length > 0 && ` • Uploaded: ${documentFiles.length}`}
                    </p>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id={`upload-${index}`}
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files, doc.name);
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor={`upload-${index}`} className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                    </p>
                  </label>
                </div>

                {/* Uploaded Files */}
                {documentFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {documentFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Skip Documents Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-yellow-800 mb-3">
                If you do not have all the documents available right now click here to move on but be aware this will result in delays. We will send you a link to upload after you finalize your application.
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                onClick={handleSkipDocuments}
              >
                Skip Documents for Now
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button 
            type="button"
            variant="outline" 
            onClick={onPrevious}
            className="min-w-[120px]"
          >
            Previous
          </Button>
          
          <Button 
            type="button" 
            onClick={handleContinue}
            disabled={!allRequiredDocsComplete && totalRequiredDocs > 0}
            className={`min-w-[120px] ${
              !allRequiredDocsComplete && totalRequiredDocs > 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {!allRequiredDocsComplete && totalRequiredDocs > 0 ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Complete Required Documents
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Document Category: {documentCategory}</p>
            <p>Required Docs: {totalRequiredDocs}</p>
            <p>All Complete: {allRequiredDocsComplete.toString()}</p>
            <p>Uploaded Files: {uploadedFiles.length}</p>
            <p>Selected Product: {formData.selectedProduct}</p>
            <p>Looking For: {formData.lookingFor}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}