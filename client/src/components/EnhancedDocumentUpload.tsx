import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  Download,
  Shield,
  Eye,
  Clock
} from 'lucide-react';

interface DocumentUploadProps {
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  requiredDocuments?: string[];
  maxFiles?: number;
  applicationType?: string;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  fileData: string;
  category: string;
  size: number;
  validationStatus?: 'authentic' | 'placeholder' | 'suspicious' | 'invalid';
  validationErrors?: string[];
  uploadedAt: string;
  securityFlags?: string[];
  riskLevel?: 'low' | 'medium' | 'high';
}

interface DocumentRequirement {
  category: string;
  displayName: string;
  required: boolean;
  description: string;
  acceptedFormats: string[];
  minSize: number;
  maxSize: number;
}

interface ValidationResult {
  isValid: boolean;
  validationStatus: 'authentic' | 'placeholder' | 'suspicious' | 'invalid';
  contentLength: number;
  checksumSHA256: string;
  filename: string;
  category: string;
  errors: string[];
  metadata: {
    uploadedBy: string;
    uploadedAt: string;
    validatedAt: string;
    originalSize: number;
    processedSize: number;
  };
}

export function EnhancedDocumentUpload({ 
  onDocumentsChange, 
  requiredDocuments = [], 
  maxFiles = 10,
  applicationType = 'business_loan'
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch document requirements on component mount
  React.useEffect(() => {
    fetch(`/api/documents/requirements/${applicationType}`)
      .then(res => res.json())
      .then(data => {
        if (data.requirements) {
          setRequirements(data.requirements);
          if (data.requirements.length > 0) {
            setSelectedCategory(data.requirements[0].category);
          }
        }
      })
      .catch(err => console.error('Failed to fetch requirements:', err));
  }, [applicationType]);

  const validateDocument = async (fileName: string, fileData: string, category: string): Promise<{
    validation: ValidationResult;
    security: {
      requiresManualReview: boolean;
      securityFlags: string[];
      riskLevel: 'low' | 'medium' | 'high';
    };
  }> => {
    const response = await fetch('/api/documents/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileData,
        category,
        uploadedBy: 'client_user'
      }),
    });

    if (!response.ok) {
      throw new Error('Document validation failed');
    }

    return response.json();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedCategory) {
      console.error('Please select a document category first');
      return;
    }

    for (const file of acceptedFiles) {
      const fileId = `${file.name}-${Date.now()}`;
      setUploading(prev => [...prev, fileId]);

      try {
        // Convert file to base64
        const fileData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix to get pure base64
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(file);
        });

        // Validate document
        const { validation, security } = await validateDocument(
          file.name,
          fileData,
          selectedCategory
        );

        const newDocument: UploadedDocument = {
          id: fileId,
          fileName: file.name,
          fileData,
          category: selectedCategory,
          size: file.size,
          validationStatus: validation.validationStatus,
          validationErrors: validation.errors,
          uploadedAt: new Date().toISOString(),
          securityFlags: security.securityFlags,
          riskLevel: security.riskLevel
        };

        setDocuments(prev => {
          const updated = [...prev, newDocument];
          onDocumentsChange(updated);
          return updated;
        });

      } catch (error) {
        console.error('Upload failed:', error);
        // Add failed document with error status
        const failedDocument: UploadedDocument = {
          id: fileId,
          fileName: file.name,
          fileData: '',
          category: selectedCategory,
          size: file.size,
          validationStatus: 'invalid',
          validationErrors: ['Upload failed: ' + (error as Error).message],
          uploadedAt: new Date().toISOString(),
          riskLevel: 'high'
        };

        setDocuments(prev => {
          const updated = [...prev, failedDocument];
          onDocumentsChange(updated);
          return updated;
        });
      } finally {
        setUploading(prev => prev.filter(id => id !== fileId));
      }
    }
  }, [selectedCategory, onDocumentsChange]);

  const removeDocument = (documentId: string) => {
    setDocuments(prev => {
      const updated = prev.filter(doc => doc.id !== documentId);
      onDocumentsChange(updated);
      return updated;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    disabled: !selectedCategory
  });

  const getStatusIcon = (status: string, riskLevel?: string) => {
    switch (status) {
      case 'authentic':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'placeholder':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'suspicious':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'invalid':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authentic':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'placeholder':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspicious':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'invalid':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompletionStats = () => {
    const requiredDocs = requirements.filter(req => req.required);
    const uploadedCategories = Array.from(new Set(documents.map(doc => doc.category)));
    const completedRequired = requiredDocs.filter(req => 
      uploadedCategories.includes(req.category)
    );
    
    return {
      completed: completedRequired.length,
      total: requiredDocs.length,
      percentage: requiredDocs.length > 0 ? Math.round((completedRequired.length / requiredDocs.length) * 100) : 0
    };
  };

  const stats = getCompletionStats();
  const authenticDocs = documents.filter(doc => doc.validationStatus === 'authentic').length;
  const flaggedDocs = documents.filter(doc => 
    doc.validationStatus === 'suspicious' || doc.validationStatus === 'placeholder'
  ).length;

  return (
    <div className="space-y-6">
      {/* Upload Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-600" />
            Document Upload Progress
          </CardTitle>
          <CardDescription>
            Upload and validate required business documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">of {stats.total} required</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{authenticDocs}</div>
              <div className="text-sm text-gray-600">validated</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{flaggedDocs}</div>
              <div className="text-sm text-gray-600">need review</div>
            </div>
          </div>
          <Progress value={stats.percentage} className="h-2" />
          <div className="text-sm text-gray-600 mt-2">
            {stats.percentage}% complete
          </div>
        </CardContent>
      </Card>

      {/* Document Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Document Category</CardTitle>
          <CardDescription>
            Choose the type of document you want to upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requirements.map((req) => (
              <button
                key={req.category}
                onClick={() => setSelectedCategory(req.category)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedCategory === req.category
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{req.displayName}</div>
                    <div className="text-sm text-gray-600">{req.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {req.acceptedFormats.join(', ')}
                    </div>
                  </div>
                  {req.required && (
                    <Badge variant="secondary" className="ml-2">Required</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Upload Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-teal-500 bg-teal-50'
                : selectedCategory
                ? 'border-gray-300 hover:border-gray-400'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            
            {!selectedCategory ? (
              <div>
                <p className="text-gray-600">Please select a document category first</p>
              </div>
            ) : isDragActive ? (
              <div>
                <p className="text-teal-600 font-medium">Drop files here...</p>
                <p className="text-sm text-gray-600 mt-1">
                  For category: {requirements.find(r => r.category === selectedCategory)?.displayName}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Uploading to: {requirements.find(r => r.category === selectedCategory)?.displayName}
                </p>
                <Button variant="outline" className="mt-3">
                  Choose Files
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>
              Review validation status and manage your documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">{doc.fileName}</div>
                      <div className="text-sm text-gray-600">
                        {requirements.find(r => r.category === doc.category)?.displayName} • {(doc.size / 1024).toFixed(1)} KB
                      </div>
                      {doc.validationErrors && doc.validationErrors.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {doc.validationErrors[0]}
                        </div>
                      )}
                      {doc.securityFlags && doc.securityFlags.length > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          Security: {doc.securityFlags[0]}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {doc.riskLevel === 'high' && (
                      <Badge variant="destructive" className="text-xs">
                        High Risk
                      </Badge>
                    )}
                    {doc.riskLevel === 'medium' && (
                      <Badge variant="secondary" className="text-xs">
                        Needs Review
                      </Badge>
                    )}
                    <Badge 
                      className={`text-xs ${getStatusColor(doc.validationStatus || 'pending')}`}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(doc.validationStatus || 'pending', doc.riskLevel)}
                        {doc.validationStatus || 'Pending'}
                      </div>
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Status */}
      {uploading.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                Uploading {uploading.length} file(s)...
              </div>
              <Progress value={50} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}