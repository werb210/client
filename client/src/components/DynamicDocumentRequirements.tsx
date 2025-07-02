import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, CheckCircle, X, Upload, AlertTriangle, Loader2 } from 'lucide-react';
import { getDocumentCategory, formatCategoryName } from '../utils/categoryMapping';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'uploading' | 'completed' | 'error';
  documentType: string;
}

interface DocumentRequirement {
  name: string;
  description: string;
  quantity: number;
}

interface Props {
  formData: any;
  uploadedFiles: UploadedFile[];
  onFilesUploaded: (files: UploadedFile[]) => void;
  onRequirementsChange: (allComplete: boolean, total: number, completed: number) => void;
  selectedProduct?: string;
}

export function DynamicDocumentRequirements({ 
  formData, 
  uploadedFiles, 
  onFilesUploaded, 
  onRequirementsChange, 
  selectedProduct = ''
}: Props) {
  
  const documentCategory = getDocumentCategory(formData, selectedProduct);

  // Query document requirements from real lender database
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['/api/loan-products/required-documents', documentCategory, formData.headquarters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('headquarters', formData.headquarters === 'CA' ? 'canada' : 'united_states');
      
      console.log(`🔍 Fetching document requirements for category: ${documentCategory}`);
      
      const response = await fetch(`/api/loan-products/required-documents/${documentCategory}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch document requirements: ${response.status}`);
      }
      const data = await response.json();
      console.log(`✅ Document requirements loaded:`, data);
      return data;
    },
    enabled: !!(documentCategory && formData.headquarters),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Extract document requirements with fallback
  let documentRequirements: DocumentRequirement[] = [];
  let dataSource = 'loading';
  
  if (!isLoading && apiResponse?.success) {
    documentRequirements = apiResponse.data || [];
    dataSource = apiResponse.source || 'database';
  }

  // Track completion and notify parent
  useEffect(() => {
    if (documentRequirements.length === 0) {
      onRequirementsChange(false, 0, 0);
      return;
    }

    let completedRequirements = 0;
    const allComplete = documentRequirements.every(doc => {
      const matchingFiles = uploadedFiles.filter(f => 
        f.documentType?.includes(doc.name.toLowerCase().replace(/\s+/g, '_')) &&
        f.status === 'completed'
      );
      const isComplete = matchingFiles.length >= doc.quantity;
      if (isComplete) completedRequirements++;
      return isComplete;
    });
    
    onRequirementsChange(allComplete, documentRequirements.length, completedRequirements);
  }, [uploadedFiles, documentRequirements, onRequirementsChange]);

  const handleFileUpload = (files: FileList, documentName: string) => {
    const newFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      status: 'completed' as const, // For demo purposes, mark as completed immediately
      documentType: documentName.toLowerCase().replace(/\s+/g, '_')
    }));
    onFilesUploaded([...uploadedFiles, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    const updated = uploadedFiles.filter(f => f.id !== fileId);
    onFilesUploaded(updated);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
        <p className="text-gray-600">Loading document requirements...</p>
        <p className="text-sm text-gray-500 mt-2">
          Checking requirements for {formatCategoryName(documentCategory)}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <div className="flex items-center space-x-2 text-red-800 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">Unable to Load Document Requirements</span>
        </div>
        <p className="text-red-700 mb-4">
          {error instanceof Error ? error.message : 'Failed to load document requirements'}
        </p>
        <p className="text-sm text-red-600">
          Please try refreshing the page or contact support if the issue persists.
        </p>
      </div>
    );
  }

  if (documentRequirements.length === 0) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <div className="flex items-center space-x-2 text-yellow-800 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">No Specific Requirements Found</span>
        </div>
        <p className="text-yellow-700">
          No document requirements found for {formatCategoryName(documentCategory)}. 
          Please continue to the next step or contact support for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Required Documents for {formatCategoryName(documentCategory)}
        </h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>Based on your selection: {selectedProduct || formData.lookingFor}</p>
          <p>Geography: {formData.headquarters === 'CA' ? 'Canada' : 'United States'}</p>
          <p className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              dataSource === 'database' ? 'bg-green-500' : 'bg-yellow-500'
            }`}></span>
            Data source: {dataSource === 'database' ? 'Real lender database' : 'Standard requirements'}
          </p>
        </div>
      </div>

      {/* Document Requirements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documentRequirements.map((doc, index) => {
          const documentFiles = uploadedFiles.filter(f => 
            f.documentType?.includes(doc.name.toLowerCase().replace(/\s+/g, '_'))
          );
          const completedFiles = documentFiles.filter(f => f.status === 'completed');
          const isComplete = completedFiles.length >= doc.quantity;
          const progress = Math.min((completedFiles.length / doc.quantity) * 100, 100);
          
          return (
            <div key={index} className={`border-2 rounded-lg p-6 transition-all duration-200 ${
              isComplete 
                ? 'border-green-200 bg-green-50 shadow-sm' 
                : 'border-gray-200 bg-white hover:border-blue-200'
            }`}>
              {/* Document Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                    {doc.name}
                    {isComplete && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-500">
                      Required: {doc.quantity}
                    </span>
                    <span className={`font-medium ${
                      isComplete ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      Uploaded: {completedFiles.length}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isComplete 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isComplete ? 'Complete' : 'Required'}
                </span>
              </div>

              {/* Progress Bar */}
              {doc.quantity > 1 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isComplete ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              )}

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files, doc.name)}
                  className="hidden"
                  id={`upload-${index}`}
                />
                <label htmlFor={`upload-${index}`} className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm">
                    <span className="text-blue-600 font-medium">Choose files</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, JPG, PNG, XLS (max 10MB each)
                  </p>
                </label>
              </div>

              {/* File List */}
              {documentFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Uploaded Files:</h5>
                  {documentFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          file.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : file.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {file.status}
                        </span>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}