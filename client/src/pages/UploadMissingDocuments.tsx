import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CloudUpload, CheckCircle, AlertTriangle, ArrowLeft, FileText } from 'lucide-react';
import { DynamicDocumentRequirements } from '@/components/DynamicDocumentRequirements';
import { ENHANCED_DOCUMENT_REQUIREMENTS } from '../../../shared/documentMapping';

interface ApplicationData {
  id: string;
  form_data: {
    step1: {
      productCategory?: string;
      lookingFor?: string;
      fundsPurpose?: string;
    };
  };
  status: string;
}

export default function UploadMissingDocuments() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [requiredDocTypes, setRequiredDocTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [allRequiredUploaded, setAllRequiredUploaded] = useState(false);

  useEffect(() => {
    // Get application ID from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id');
    const storageId = localStorage.getItem('applicationId');
    
    const finalId = urlId || storageId;
    
    console.log('🔍 [UPLOAD-DOCS] Application ID check:', {
      fromURL: urlId,
      fromLocalStorage: storageId,
      finalId
    });

    if (!finalId) {
      console.warn('⚠️ [UPLOAD-DOCS] No application ID found');
      toast({
        title: "Missing Application",
        description: "Please start an application before uploading documents.",
        variant: "destructive"
      });
      setLocation('/dashboard');
      return;
    }

    setApplicationId(finalId);
    loadApplicationData(finalId);
  }, [setLocation]);

  const loadApplicationData = async (appId: string) => {
    try {
      setIsLoading(true);
      console.log('📋 [UPLOAD-DOCS] Loading application data for:', appId);
      
      const response = await fetch(`/api/public/applications/${appId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load application: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [UPLOAD-DOCS] Application data loaded:', data);
      
      setApplicationData(data.application || data);
      
      // Determine required documents based on product category
      const productCategory = data.application?.form_data?.step1?.productCategory || 
                             data.form_data?.step1?.productCategory ||
                             data.application?.form_data?.step1?.lookingFor ||
                             data.form_data?.step1?.lookingFor ||
                             data.application?.form_data?.step1?.fundsPurpose ||
                             data.form_data?.step1?.fundsPurpose;

      console.log('🔍 [UPLOAD-DOCS] Product category determined:', productCategory);
      
      const requiredDocs = getRequiredDocuments(productCategory);
      setRequiredDocTypes(requiredDocs);
      
      console.log('📋 [UPLOAD-DOCS] Required document types:', requiredDocs);
      
    } catch (error) {
      console.error('❌ [UPLOAD-DOCS] Error loading application:', error);
      toast({
        title: "Error Loading Application",
        description: "Could not load application data. Please try again.",
        variant: "destructive"
      });
      setLocation('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getRequiredDocuments = (productCategory: string): string[] => {
    if (!productCategory) {
      console.log('⚠️ [UPLOAD-DOCS] No product category, using default documents');
      return ['bank_statements', 'financial_statements', 'tax_returns'];
    }

    // Normalize category name for mapping
    const normalizedCategory = productCategory.toLowerCase().replace(/\s+/g, '_');
    
    // Map various category names to document requirements
    const categoryMappings: Record<string, string[]> = {
      // Direct mappings from ENHANCED_DOCUMENT_REQUIREMENTS
      'line_of_credit': ENHANCED_DOCUMENT_REQUIREMENTS.line_of_credit || [],
      'term_loan': ENHANCED_DOCUMENT_REQUIREMENTS.term_loan || [],
      'equipment_financing': ENHANCED_DOCUMENT_REQUIREMENTS.equipment_financing || [],
      'invoice_factoring': ENHANCED_DOCUMENT_REQUIREMENTS.invoice_factoring || [],
      'working_capital': ENHANCED_DOCUMENT_REQUIREMENTS.working_capital || [],
      'purchase_order_financing': ENHANCED_DOCUMENT_REQUIREMENTS.purchase_order_financing || [],
      'asset_based_lending': ENHANCED_DOCUMENT_REQUIREMENTS.asset_based_lending || [],
      
      // Alternative naming patterns
      'equipment': ENHANCED_DOCUMENT_REQUIREMENTS.equipment_financing || [],
      'factoring': ENHANCED_DOCUMENT_REQUIREMENTS.invoice_factoring || [],
      'capital': ENHANCED_DOCUMENT_REQUIREMENTS.working_capital || [],
      'loan': ENHANCED_DOCUMENT_REQUIREMENTS.term_loan || [],
      'credit': ENHANCED_DOCUMENT_REQUIREMENTS.line_of_credit || [],
    };

    // Try exact match first
    if (categoryMappings[normalizedCategory]) {
      console.log('✅ [UPLOAD-DOCS] Found exact category match:', normalizedCategory);
      return categoryMappings[normalizedCategory];
    }

    // Try partial matches
    for (const [key, docs] of Object.entries(categoryMappings)) {
      if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
        console.log('✅ [UPLOAD-DOCS] Found partial category match:', key);
        return docs;
      }
    }

    console.log('⚠️ [UPLOAD-DOCS] No category match found, using default documents');
    return ['bank_statements', 'financial_statements', 'tax_returns'];
  };

  const handleFileUploadSuccess = (files: any[]) => {
    console.log('📤 [UPLOAD-DOCS] Files uploaded successfully:', files);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Check if all required documents are now uploaded
    checkAllDocumentsUploaded();
  };

  const checkAllDocumentsUploaded = () => {
    // This would need to be implemented based on the upload state
    // For now, we'll check after a short delay to allow state updates
    setTimeout(() => {
      const uploadedCount = uploadedFiles.length;
      const requiredCount = requiredDocTypes.length;
      
      console.log('🔍 [UPLOAD-DOCS] Upload progress check:', {
        uploaded: uploadedCount,
        required: requiredCount
      });
      
      if (uploadedCount >= requiredCount && requiredCount > 0) {
        setAllRequiredUploaded(true);
        toast({
          title: "All Documents Uploaded!",
          description: "A Boreal team member will review your application shortly.",
          variant: "default"
        });
      }
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost" 
                onClick={() => setLocation('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-xl font-bold text-teal-700">Upload Missing Documents</h1>
            </div>
            <div className="text-sm text-gray-500">
              Application ID: {applicationId?.slice(0, 8)}...
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        {allRequiredUploaded && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ All required documents submitted. A Boreal team member will review your application shortly.
            </AlertDescription>
          </Alert>
        )}

        {/* Application Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>Document Upload</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Application Status</p>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {applicationData?.status || 'In Progress'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Required Documents</p>
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  {requiredDocTypes.length} document types required
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload Section */}
        {applicationId && requiredDocTypes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CloudUpload className="w-5 h-5 text-purple-600" />
                <span>Required Documents</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Please upload all required documents for your application.
              </p>
            </CardHeader>
            <CardContent>
              <DynamicDocumentRequirements
                applicationId={applicationId}
                onUploadSuccess={handleFileUploadSuccess}
                requiredDocumentTypes={requiredDocTypes}
              />
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
              Upload Instructions
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Upload documents in PDF, PNG, or JPG format</li>
              <li>• Maximum file size: 10MB per document</li>
              <li>• Ensure all documents are clear and readable</li>
              <li>• You can upload multiple files for each document type</li>
              <li>• Documents are immediately uploaded and secured</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}