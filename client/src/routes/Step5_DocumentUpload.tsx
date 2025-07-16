import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { Alert, AlertDescription } from '@/components/ui/alert';

import { useFormDataContext } from '@/context/FormDataContext';

import { useLocation } from 'wouter';

import { useToast } from '@/hooks/use-toast';

import { DynamicDocumentRequirements } from '@/components/DynamicDocumentRequirements';

import { ProceedBypassBanner } from '@/components/ProceedBypassBanner';

import { StepHeader } from '@/components/StepHeader';
import { RuntimeAlertPanel } from '@/components/RuntimeAlertPanel';

import { getDocumentRequirementsAggregation } from '@/lib/documentAggregation';

import { useDebouncedCallback } from 'use-debounce';

import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Save from 'lucide-react/dist/esm/icons/save';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Info from 'lucide-react/dist/esm/icons/info';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

import { DocumentUploadStatus } from '@/components/DocumentUploadStatus';
import { useDocumentVerification } from '@/hooks/useDocumentVerification';

import type { UploadedFile } from '../components/DynamicDocumentRequirements';


export default function Step5DocumentUpload() {
  const { state, dispatch } = useFormDataContext();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // ✅ USER SPECIFICATION: Track applicationId from Step 4
  const applicationId = state.applicationId || localStorage.getItem('applicationId');
  logger.log('🔍 [STEP5] Application ID check:', {
    fromState: state.applicationId,
    fromLocalStorage: localStorage.getItem('applicationId'),
    finalId: applicationId
  });

  // ✅ NEW: Document verification system
  const {
    verificationResult,
    isLoading: isVerifying,
    isVerifying: isManualVerifying,
    verifyDocuments,
    canProceedToStep6
  } = useDocumentVerification(applicationId);
  
  // ✅ USER SPECIFICATION: Collect files during Step 5
  const [files, setFiles] = useState<{ file: File; type: string; category: string }[]>(
    state.step5DocumentUpload?.files || []
  );
  
  // Track upload progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  // State for tracking uploaded files and requirements completion
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    (state.uploadedDocuments || []).map(doc => ({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      status: (doc.status as "completed" | "uploading" | "error") || "completed",
      documentType: doc.documentType,
      file: new File([], doc.name) // Create placeholder File object for existing documents
    }))
  );
  const [allRequirementsComplete, setAllRequirementsComplete] = useState(false);
  const [totalRequirements, setTotalRequirements] = useState(0);
  
  // New state for intersection-based document requirements
  const [intersectionResults, setIntersectionResults] = useState<{
    eligibleLenders: any[];
    requiredDocuments: string[];
    message: string;
    hasMatches: boolean;
    isLoading: boolean;
  }>({
    eligibleLenders: [],
    requiredDocuments: [],
    message: '',
    hasMatches: false,
    isLoading: true
  });

  // Calculate document requirements on component mount using AGGREGATION logic
  useEffect(() => {
    const calculateDocumentRequirements = async () => {
      // ✅ STEP 1: Ensure Step 2 saves user selections (ChatGPT Instructions)
      const selectedCategory = state.step2?.selectedCategory || '';
      const selectedCountry = state.step1?.businessLocation || '';
      const requestedAmount = state.step1?.fundingAmount || 0;
      
      console.log(`📋 [STEP5-AGGREGATION] Document aggregation for:`, {
        selectedCategory,
        selectedCountry,
        requestedAmount
      });
      
      // Validate that we have all required Step 2 selections
      if (!selectedCategory || !selectedCountry || !requestedAmount) {
        console.log('❌ [STEP5-AGGREGATION] Missing required selections:', {
          category: selectedCategory,
          country: selectedCountry,
          amount: requestedAmount
        });
        setIntersectionResults({
          eligibleLenders: [],
          requiredDocuments: [],
          message: 'Missing category, country, or amount selection from previous steps',
          hasMatches: false,
          isLoading: false
        });
        return;
      }

      // ✅ STEP 2: Filter all local lender products (ChatGPT Instructions)
      try {
        console.log('🔍 [STEP5-AGGREGATION] Calling document aggregation function...');
        
        const results = await getDocumentRequirementsAggregation(
          selectedCategory,
          selectedCountry, 
          requestedAmount
        );

        console.log(`📋 [STEP5-AGGREGATION] Aggregation results:`, results);
        
        // ✅ STEP 3: Aggregate and deduplicate required documents (ChatGPT Instructions)
        setIntersectionResults({
          eligibleLenders: results.eligibleProducts || [],
          requiredDocuments: results.requiredDocuments || [],
          message: results.message,
          hasMatches: results.hasMatches,
          isLoading: false
        });
        
        // ✅ STEP 4: Display requiredDocuments in Step 5 (ChatGPT Instructions)
        toast({
          title: "Document Requirements Loaded",
          description: `${results.eligibleProducts?.length || 0} eligible products, ${results.requiredDocuments?.length || 0} required document types`
        });
        
        // ✅ STEP 5: Report back to ChatGPT (ChatGPT Instructions)
        console.log(`✅ [STEP5-AGGREGATION] Number of eligible products found: ${results.eligibleProducts?.length || 0}`);
        console.log(`✅ [STEP5-AGGREGATION] Final requiredDocuments list: [${(results.requiredDocuments || []).join(', ')}]`);
        
        if (results.eligibleProducts?.length === 0) {
          console.log(`❌ [STEP5-AGGREGATION] No products match criteria: ${selectedCategory} in ${selectedCountry} for $${requestedAmount.toLocaleString()}`);
        }

      } catch (error) {
        console.error('❌ [STEP5-AGGREGATION] Error in document aggregation:', error);
        
        setIntersectionResults({
          eligibleLenders: [],
          requiredDocuments: [],
          message: `Error fetching document requirements: ${error.message}`,
          hasMatches: false,
          isLoading: false
        });
        
        toast({
          title: "Error Loading Requirements",
          description: "Failed to load document requirements. Please try again.",
          variant: "destructive"
        });
      }

    };

    calculateDocumentRequirements();
  }, [state.step2?.selectedCategory, state.step1?.businessLocation, state.step1?.fundingAmount, toast]);

  // Auto-save uploaded documents with 2-second delay
  const debouncedSave = useDebouncedCallback((files: UploadedFile[]) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        uploadedDocuments: files,
      }
    });
    logger.log('💾 Step 5 - Auto-saved document uploads:', files.length, 'files');
  }, 2000);

  // ✅ USER SPECIFICATION: Handle file collection during Step 5
  const handleFileAdded = (file: File, documentType: string, category: string) => {
    const newFile = { file, type: documentType, category };
    setFiles(prev => [...prev, newFile]);
    
    // Update context with new file
    dispatch({
      type: 'ADD_FILE',
      payload: newFile,
    });
    
    logger.log(`📁 [STEP5] File added to collection:`, {
      fileName: file.name,
      type: documentType,
      category,
      totalFiles: files.length + 1
    });
  };

  const handleFileRemoved = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.file.name !== fileName));
    
    // Update context
    dispatch({
      type: 'REMOVE_FILE',
      payload: fileName,
    });
    
    logger.log(`📁 [STEP5] File removed from collection:`, fileName);
  };

  // Handle file upload from DynamicDocumentRequirements component
  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    
    // Immediate save for uploads
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        uploadedDocuments: files,
      }
    });
  };

  // Trigger autosave when uploaded files change
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      debouncedSave(uploadedFiles);
    }
  }, [uploadedFiles, debouncedSave]);

  // Handle requirements completion status
  const handleRequirementsChange = (allComplete: boolean, total: number) => {
    logger.log(`📋 [STEP5] Requirements status update:`, {
      allComplete,
      total,
      uploadedFiles: uploadedFiles.length,
      intersectionLoading: intersectionResults.isLoading
    });
    setAllRequirementsComplete(allComplete);
    setTotalRequirements(total);
  };

  // Get selected product from previous steps for document categorization
  const selectedProduct = state.step1?.selectedProductId || '';
  
  // Navigation handlers
  const handlePrevious = () => {
    setLocation('/apply/step-4');
  };

  // ✅ ENHANCED: Bulletproof navigation with backend verification
  const handleNext = async () => {
    if (!applicationId) {
      toast({
        title: "Application ID Missing",
        description: "Cannot upload documents without application ID. Please restart from Step 4.",
        variant: "destructive",
      });
      return;
    }

    logger.log('🚀 [STEP5] Navigation attempt - checking conditions...');

    // Step 1: Backend verification check
    try {
      logger.log('🔍 [STEP5] Performing backend document verification...');
      const backendVerification = await verifyDocuments();
      
      if (backendVerification.hasUploadedDocuments) {
        logger.log(`✅ [STEP5] Backend confirmed ${backendVerification.documents.length} documents, proceeding to Step 6`);
        
        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: {
            uploadedDocuments: uploadedFiles,
            verifiedDocuments: backendVerification.documents
          }
        });
        
        dispatch({
          type: 'MARK_STEP_COMPLETE',
          payload: 5
        });

        toast({
          title: "Documents Verified",
          description: `${backendVerification.documents.length} documents verified on backend.`,
          variant: "default",
        });

        setLocation('/apply/step-6');
        return;
      }
    } catch (error) {
      logger.warn('⚠️ [STEP5] Backend verification failed, checking local state:', error);
    }

    // Step 2: Local document check (fallback)
    if (canProceedToStep6(uploadedFiles)) {
      logger.log(`✅ [STEP5] Local verification: ${uploadedFiles.length} documents uploaded, proceeding to Step 6`);
      
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          uploadedDocuments: uploadedFiles,
        }
      });
      
      dispatch({
        type: 'MARK_STEP_COMPLETE',
        payload: 5
      });

      toast({
        title: "Documents Ready",
        description: `${uploadedFiles.length} documents uploaded successfully.`,
        variant: "default",
      });

      setLocation('/apply/step-6');
      return;
    }

    // Step 3: Files ready to upload
    if (files.length > 0) {
      logger.log(`📁 [STEP5] ${files.length} files ready to upload, proceeding with upload...`);
      // Continue with existing upload logic
    } else {
      toast({
        title: "No Documents or Files",
        description: "Please upload documents or select files before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    let uploadSuccess = true;

    try {
      // ✅ USER SPECIFICATION: Sequential document upload
      for (let i = 0; i < files.length; i++) {
        const doc = files[i];
        
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [doc.file.name]: 50
        }));

        const formData = new FormData();
        formData.append("document", doc.file);
        formData.append("documentType", doc.category);

        logger.log(`📁 [STEP5] Uploading file ${i + 1}/${files.length}:`, {
          fileName: doc.file.name,
          category: doc.category,
          type: doc.type,
          applicationId
        });

        try {
          const response = await fetch(`/api/public/applications/${applicationId}/documents`, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            // Update progress to complete
            setUploadProgress(prev => ({
              ...prev,
              [doc.file.name]: 100
            }));
            
            logger.log(`✅ [STEP5] Upload successful: ${doc.file.name}`);
          } else {
            const errorText = await response.text();
            logger.error(`❌ [STEP5] Upload failed: ${doc.file.name}`, errorText);
            uploadSuccess = false;
            break;
          }
        } catch (error) {
          logger.error(`❌ [STEP5] Upload error: ${doc.file.name}`, error);
          uploadSuccess = false;
          break;
        }
      }

      if (uploadSuccess) {
        // Save uploaded files to context
        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: {
            uploadedDocuments: uploadedFiles,
          }
        });
        
        dispatch({
          type: 'MARK_STEP_COMPLETE',
          payload: 5
        });

        toast({
          title: "Documents Uploaded Successfully",
          description: `All ${files.length} documents uploaded successfully.`,
          variant: "default",
        });

        // ✅ USER SPECIFICATION: Only proceed to Step 6 if all uploads succeed
        setLocation('/apply/step-6');
      } else {
        toast({
          title: "Upload Failed",
          description: "Some documents failed to upload. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('❌ [STEP5] Upload process failed:', error);
      toast({
        title: "Upload Error",
        description: "An error occurred during document upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleSaveAndContinueLater = () => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        uploadedDocuments: uploadedFiles,
      }
    });
    
    toast({
      title: "Progress Saved",
      description: "Your document uploads have been saved. You can continue later.",
    });
  };

  const handleBypass = async () => {
    try {
      dispatch({ 
        type: "UPDATE_FORM_DATA", 
        payload: { bypassedDocuments: true } 
      });

      // Make API call to mark documents as bypassed
      if (state.step4?.applicationId) {
        await fetch(`/api/applications/${state.step4?.applicationId}/nudge-documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bypassed: true }),
        });
      }

      setLocation('/apply/step-6');
    } catch (error) {
      logger.error('Failed to bypass documents:', error);
      toast({
        title: "Error",
        description: "Failed to proceed without documents. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <RuntimeAlertPanel currentStep={5} />
      <StepHeader 
        stepNumber={5}
        title="Upload Documents"
        description="Upload the required documents for lender review"
      />

      {/* Status Badges */}
      <div className="flex justify-center items-center space-x-4">
        <Badge variant="outline" className="flex items-center space-x-1">
          <FileText className="w-3 h-3" />
          <span>{uploadedFiles.length} Uploaded</span>
        </Badge>
        <Badge variant="outline" className="flex items-center space-x-1">
          <FileText className="w-3 h-3" />
          <span>{files.length} Ready</span>
        </Badge>
        {allRequirementsComplete && (
          <Badge variant="default" className="flex items-center space-x-1 bg-green-600">
            <CheckCircle className="w-3 h-3" />
            <span>Complete</span>
          </Badge>
        )}
      </div>

      {/* Upload Progress Display */}
      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Upload Progress</span>
                <span className="text-sm text-gray-500">
                  {Object.values(uploadProgress).filter(p => p === 100).length} / {Object.keys(uploadProgress).length} complete
                </span>
              </div>
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{fileName}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proceed Without Documents Banner */}
      <ProceedBypassBanner onBypass={handleBypass} />



      {/* Files Ready for Upload */}
      {files.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Files Ready for Upload</span>
                <span className="text-sm text-gray-500">{files.length} files</span>
              </div>
              <div className="space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="truncate">{file.file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-xs">{file.category}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileRemoved(file.file.name)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Document Requirements Component */}
      <DynamicDocumentRequirements
        requirements={intersectionResults.requiredDocuments || []}
        uploadedFiles={uploadedFiles}
        onFilesUploaded={handleFilesUploaded}
        onRequirementsChange={handleRequirementsChange}
        applicationId={applicationId || 'test-app-123'}
        onFileAdded={handleFileAdded}
        onFileRemoved={handleFileRemoved}
      />

      {/* Document Upload Status */}
      <DocumentUploadStatus
        verificationResult={verificationResult}
        localUploadedFiles={uploadedFiles}
        isLoading={isVerifying || isManualVerifying}
      />

      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {allRequirementsComplete 
                ? `All ${totalRequirements} required documents uploaded` 
                : `${totalRequirements} required documents needed`}
            </div>
            <div className="text-sm text-gray-500">
              Step 5 of 7
            </div>
          </div>
          {/* Manual Verification Button */}
          {applicationId && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={verifyDocuments}
                disabled={isManualVerifying}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isManualVerifying ? 'animate-spin' : ''}`} />
                <span>{isManualVerifying ? 'Verifying...' : 'Verify Documents'}</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <Button
          onClick={handleNext}
          disabled={isUploading || isManualVerifying}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading {Object.keys(uploadProgress).length} files...</span>
            </>
          ) : isManualVerifying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Verifying Documents...</span>
            </>
          ) : (
            <>
              <span>Continue to Signature</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}