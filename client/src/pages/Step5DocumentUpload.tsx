import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, CheckCircle, AlertCircle, X, FileIcon } from 'lucide-react';

interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'uploading' | 'completed' | 'error';
  documentType?: string;
}

interface DocumentRequirement {
  name: string;
  description: string;
  quantity: number;
  required: boolean;
  examples: string[];
}

interface Step5DocumentUploadProps {
  formData: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function Step5DocumentUpload({ formData, onNext, onBack }: Step5DocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<DocumentFile[]>([]);
  const [allRequirementsMet, setAllRequirementsMet] = useState(false);

  // Determine document category based on user's selection
  const getDocumentCategory = () => {
    const selectedProduct = formData.selectedProduct;
    
    // Use selectedProduct if it contains specific product type information
    if (selectedProduct && selectedProduct.toLowerCase().includes('line of credit')) {
      return 'line_of_credit';
    }
    
    // Primary logic based on form data
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

  // Fetch loan product categories for context
  const { data: categories } = useQuery({
    queryKey: ['/api/loan-products/categories', 
      formData.headquarters, 
      formData.lookingFor, 
      formData.accountsReceivableBalance, 
      formData.fundingAmount],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (formData.headquarters) params.append('country', formData.headquarters);
      if (formData.lookingFor) params.append('lookingFor', formData.lookingFor);
      if (formData.accountsReceivableBalance) params.append('accountsReceivableBalance', formData.accountsReceivableBalance);
      if (formData.fundingAmount) params.append('fundingAmount', formData.fundingAmount);
      if (formData.fundsPurpose) params.append('fundsPurpose', formData.fundsPurpose);
      
      const response = await fetch(`/api/loan-products/categories?${params.toString()}`);
      return response.json();
    }
  });

  // Fetch required documents based on selection
  const { data: requiredDocs, isLoading: docsLoading } = useQuery({
    queryKey: ['/api/loan-products/required-documents', 
      documentCategory, 
      formData.fundingAmount, 
      formData.headquarters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (formData.fundingAmount) params.append('fundingAmount', formData.fundingAmount);
      if (formData.headquarters) params.append('country', formData.headquarters);
      if (formData.lookingFor) params.append('lookingFor', formData.lookingFor);
      if (formData.accountsReceivableBalance) params.append('accountsReceivableBalance', formData.accountsReceivableBalance);
      
      const response = await fetch(`/api/loan-products/required-documents/${documentCategory}?${params.toString()}`);
      return response.json();
    }
  });

  // Default document requirements fallback
  const defaultDocumentRequirements: DocumentRequirement[] = [
    {
      name: "Bank Statements",
      description: "Recent 3-6 months of business bank statements",
      quantity: 1,
      required: true,
      examples: ["Monthly bank statements", "Account summaries", "Transaction records"]
    },
    {
      name: "Financial Statements",
      description: "Income statement and balance sheet",
      quantity: 1,
      required: true,
      examples: ["Profit & Loss statement", "Balance sheet", "Cash flow statement"]
    },
    {
      name: "Tax Returns",
      description: "Business tax returns for previous 2 years",
      quantity: 2,
      required: true,
      examples: ["Corporate tax returns", "Business income tax", "CRA/IRS filings"]
    },
    {
      name: "Business License",
      description: "Current business registration and licenses",
      quantity: 1,
      required: true,
      examples: ["Business registration certificate", "Operating license", "Professional licenses"]
    }
  ];

  const documentRequirements = requiredDocs?.requirements || defaultDocumentRequirements;

  // Handle file upload
  const handleFileUpload = (files: FileList, documentType: string) => {
    const newFiles: DocumentFile[] = Array.from(files).map(file => ({
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

  // Remove uploaded file
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Check if all requirements are met
  useEffect(() => {
    if (documentRequirements.length > 0) {
      const allComplete = documentRequirements.every((doc) => {
        const documentFiles = uploadedFiles.filter(f => 
          f.documentType?.toLowerCase().includes(doc.name.toLowerCase().replace(/\s+/g, '_')) ||
          f.name.toLowerCase().includes(doc.name.toLowerCase().split(' ')[0])
        );
        return documentFiles.length >= doc.quantity;
      });
      setAllRequirementsMet(allComplete);
    }
  }, [uploadedFiles, documentRequirements]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onSubmit = () => {
    onNext({ uploadedDocuments: uploadedFiles });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Step 5: Document Upload
          </CardTitle>
          <CardDescription>
            Upload the required documents for your {documentCategory.replace(/_/g, ' ')} application. 
            All documents must be uploaded to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-900">Upload Progress</h4>
                <Badge variant={allRequirementsMet ? "default" : "secondary"}>
                  {uploadedFiles.length} / {documentRequirements.reduce((acc, doc) => acc + doc.quantity, 0)} Documents
                </Badge>
              </div>
              <Progress 
                value={(uploadedFiles.length / documentRequirements.reduce((acc, doc) => acc + doc.quantity, 0)) * 100} 
                className="h-2"
              />
              <p className="text-sm text-blue-700 mt-2">
                {allRequirementsMet ? 
                  "All required documents uploaded. You can proceed to the next step." :
                  "Please upload all required documents to continue."
                }
              </p>
            </div>

            {/* Document Requirements */}
            {docsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading document requirements...</p>
              </div>
            ) : (
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
                    }`}>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{doc.name}</h3>
                              {doc.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              {isComplete && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{doc.description}</p>
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Examples: </span>
                              {doc.examples.join(', ')}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">Required quantity: </span>
                              {doc.quantity} document{doc.quantity > 1 ? 's' : ''}
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <Badge variant={isComplete ? "default" : "secondary"}>
                              {documentFiles.length} / {doc.quantity}
                            </Badge>
                          </div>
                        </div>

                        {/* File Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleFileUpload(e.target.files, doc.name);
                              }
                            }}
                            className="hidden"
                            id={`file-upload-${index}`}
                          />
                          <label htmlFor={`file-upload-${index}`} className="cursor-pointer">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF, DOC, DOCX, JPG, PNG up to 10MB
                            </p>
                          </label>
                        </div>

                        {/* Uploaded Files */}
                        {documentFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                            {documentFiles.map((file) => (
                              <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                  <FileIcon className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(file.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload Summary */}
            {uploadedFiles.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Upload Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Documents: </span>
                    <span className="font-medium">{uploadedFiles.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Size: </span>
                    <span className="font-medium">
                      {formatFileSize(uploadedFiles.reduce((acc, file) => acc + file.size, 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Message */}
            {!allRequirementsMet && uploadedFiles.length > 0 && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">
                  Please ensure all required documents are uploaded before continuing.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button 
                onClick={onSubmit} 
                disabled={!allRequirementsMet}
                className={allRequirementsMet ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {allRequirementsMet ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Continue to Step 6
                  </>
                ) : (
                  'Upload Required Documents'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}