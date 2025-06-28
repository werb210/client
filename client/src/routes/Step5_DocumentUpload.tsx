import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import { uploadDocument, fetchRequiredDocuments, type DocumentRequirement } from '@/lib/api';

// Remove local interface - using the one from api.ts

interface UploadedDocument {
  id: string;
  categoryId: string;
  name: string;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  documents: UploadedDocument[];
  uploadLater: boolean;
}

export default function Step5DocumentUpload() {
  const { state, dispatch, saveToStorage } = useFormData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);

  // Get selected product category from previous steps
  const selectedCategory = state.step1FinancialProfile.selectedCategory || 'business-loan';

  // Fetch required documents based on selected product category
  const { data: requirements, isLoading: requirementsLoading } = useQuery({
    queryKey: ['/api/documents/requirements', selectedCategory],
    queryFn: () => fetchRequiredDocuments(selectedCategory),
  });

  // Initialize document categories when requirements are loaded
  React.useEffect(() => {
    if (requirements) {
      const categories = requirements.reduce((acc, req) => {
        const existingCategory = acc.find(cat => cat.id === req.category);
        if (existingCategory) {
          return acc;
        }
        return [
          ...acc,
          {
            id: req.category,
            name: req.category.replace('-', ' ').toUpperCase(),
            documents: [],
            uploadLater: false,
          }
        ];
      }, [] as DocumentCategory[]);
      setDocumentCategories(categories);
    }
  }, [requirements]);

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, categoryId }: { file: File; categoryId: string }) => {
      return uploadDocument(file, categoryId);
    },
    onSuccess: (response, { file, categoryId }) => {
      setDocumentCategories(prev => 
        prev.map(category => {
          if (category.id === categoryId) {
            return {
              ...category,
              documents: category.documents.map(doc => 
                doc.name === file.name && doc.status === 'uploading'
                  ? { ...doc, status: 'completed', progress: 100, id: response.documentId, url: response.url }
                  : doc
              ),
            };
          }
          return category;
        })
      );
      
      toast({
        title: "Document Uploaded",
        description: `${file.name} has been successfully uploaded.`,
      });
    },
    onError: (error, { file, categoryId }) => {
      setDocumentCategories(prev => 
        prev.map(category => {
          if (category.id === categoryId) {
            return {
              ...category,
              documents: category.documents.map(doc => 
                doc.name === file.name && doc.status === 'uploading'
                  ? { ...doc, status: 'error', error: error.message }
                  : doc
              ),
            };
          }
          return category;
        })
      );
      
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[], categoryId: string) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        toast({
          title: "File Rejected",
          description: `${file.name}: ${error.message}`,
          variant: "destructive",
        });
      });
    });

    // Process accepted files
    acceptedFiles.forEach(file => {
      const newDocument: UploadedDocument = {
        id: `temp-${Date.now()}-${file.name}`,
        categoryId,
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0,
      };

      // Add to state immediately
      setDocumentCategories(prev => 
        prev.map(category => 
          category.id === categoryId
            ? { ...category, documents: [...category.documents, newDocument] }
            : category
        )
      );

      // Start upload
      uploadMutation.mutate({ file, categoryId });
    });
  }, [uploadMutation, toast]);

  const createDropzone = (categoryId: string) => {
    const requirement = requirements?.find(req => req.category === categoryId);
    
    return useDropzone({
      onDrop: (accepted, rejected) => onDrop(accepted, rejected, categoryId),
      accept: requirement?.acceptedFormats.reduce((acc, format) => {
        acc[`application/${format}`] = [`.${format}`];
        return acc;
      }, {} as Record<string, string[]>) || {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'image/*': ['.png', '.jpg', '.jpeg']
      },
      maxSize: (requirement?.maxSizeMB || 10) * 1024 * 1024,
      multiple: true,
    });
  };

  const toggleUploadLater = (categoryId: string) => {
    setDocumentCategories(prev => 
      prev.map(category => 
        category.id === categoryId
          ? { ...category, uploadLater: !category.uploadLater }
          : category
      )
    );
  };

  const removeDocument = (categoryId: string, documentId: string) => {
    setDocumentCategories(prev => 
      prev.map(category => 
        category.id === categoryId
          ? { ...category, documents: category.documents.filter(doc => doc.id !== documentId) }
          : category
      )
    );
  };

  const getDocumentIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const canProceed = () => {
    if (!requirements) return false;
    
    return requirements.every(req => {
      const category = documentCategories.find(cat => cat.id === req.category);
      if (!category) return false;
      
      // If marked as upload later, it's allowed
      if (category.uploadLater) return true;
      
      // If required, must have at least one completed document
      if (req.required) {
        return category.documents.some(doc => doc.status === 'completed');
      }
      
      return true;
    });
  };

  const onSubmit = () => {
    // Update context with document information
    const documentData = {
      categories: documentCategories,
      completedAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'UPDATE_STEP5', payload: documentData });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 6 });
    
    // Save to storage
    saveToStorage();
    
    toast({
      title: "Documents Processed",
      description: "Document upload step completed. Proceeding to review.",
    });

    // Navigate to Step 6 signature
    setLocation('/step6-signature');
  };

  const handleSaveProgress = () => {
    const documentData = {
      categories: documentCategories,
      savedAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'UPDATE_STEP5', payload: documentData });
    saveToStorage();
    
    toast({
      title: "Progress Saved",
      description: "Your document upload progress has been saved.",
    });
  };

  const handleBack = () => {
    setLocation('/step4-financial-info');
  };

  if (requirementsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading document requirements...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Upload</h1>
          <p className="text-gray-600 mt-2">
            Upload required documents for your loan application
          </p>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Step 5 of 6</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full w-5/6"></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {documentCategories.map((category) => {
            const requirement = requirements?.find(req => req.category === category.id);
            const dropzone = createDropzone(category.id);
            
            return (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {category.name}
                      {requirement?.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </CardTitle>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`upload-later-${category.id}`}
                        checked={category.uploadLater}
                        onCheckedChange={() => toggleUploadLater(category.id)}
                      />
                      <label 
                        htmlFor={`upload-later-${category.id}`}
                        className="text-sm text-gray-600 cursor-pointer"
                      >
                        Upload Later
                      </label>
                    </div>
                  </div>
                  
                  {requirement?.description && (
                    <p className="text-sm text-gray-600">{requirement.description}</p>
                  )}
                </CardHeader>
                
                <CardContent>
                  {!category.uploadLater ? (
                    <>
                      {/* Dropzone */}
                      <div
                        {...dropzone.getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                          dropzone.isDragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input {...dropzone.getInputProps()} />
                        <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 mb-2">
                          Drag and drop files here, or click to select files
                        </p>
                        <p className="text-sm text-gray-500">
                          Accepted formats: {requirement?.acceptedFormats.join(', ') || 'PDF, DOC, DOCX, PNG, JPG'}
                          <br />
                          Max size: {requirement?.maxSizeMB || 10}MB per file
                        </p>
                      </div>

                      {/* Uploaded Documents */}
                      {category.documents.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {category.documents.map((document) => (
                            <div key={document.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              {getDocumentIcon(document.status)}
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {document.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(document.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                
                                {document.status === 'uploading' && (
                                  <Progress value={document.progress} className="mt-1 h-1" />
                                )}
                                
                                {document.error && (
                                  <p className="text-xs text-red-500 mt-1">{document.error}</p>
                                )}
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocument(category.id, document.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Documents will be uploaded later</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary and Navigation */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">Upload Summary</h3>
                <p className="text-sm text-gray-600">
                  {documentCategories.reduce((total, cat) => total + cat.documents.filter(doc => doc.status === 'completed').length, 0)} documents uploaded
                </p>
              </div>
              
              {!canProceed() && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Some required documents are missing</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveProgress}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
              <Button
                onClick={onSubmit}
                disabled={!canProceed()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Review Application
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}