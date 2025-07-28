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


import { getDocumentRequirementsAggregation } from '@/lib/documentAggregation';
import { normalizeDocumentName } from '../../../shared/documentTypes';
import { getStoredApplicationId, validateApplicationIdForAPI } from '@/lib/uuidUtils';

import { useDebouncedCallback } from 'use-debounce';

import { ArrowRight, ArrowLeft, Save, FileText, CheckCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';

import { DocumentUploadStatus } from '@/components/DocumentUploadStatus';
import { useDocumentVerification } from '@/hooks/useDocumentVerification';

import type { UploadedFile } from '../components/DynamicDocumentRequirements';


export default function Step5DocumentUpload() {
  const { state, dispatch } = useFormDataContext();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // ✅ Use centralized UUID validation for consistent application ID management
  const applicationId = getStoredApplicationId();
  
  // 🟨 STEP 4: Log Step 5 using ID for matching - REPLIT MUST DO
  console.log("Step 5 using ID:", applicationId);
  
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
    canProceedToStep6,
    refetchDocuments
  } = useDocumentVerification(applicationId);

  // Manual verification only - no auto-loading to prevent API spam
  // Removed auto-verification to prevent continuous 501 errors from unimplemented endpoint
  
  // ✅ USER SPECIFICATION: Collect files during Step 5
  const [files, setFiles] = useState<{ file: File; type: string; category: string }[]>(
    state.step5DocumentUpload?.files || []
  );
  
  // Track upload progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  // State for tracking uploaded files and requirements completion
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    (state.step5DocumentUpload?.uploadedFiles || []).map(doc => ({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      status: (doc.status as "completed" | "uploading" | "error") || "completed",
      documentType: doc.documentType,
      file: doc.file || new File([], doc.name) // Use existing file or create placeholder
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

  // FIX #5: Reload uploaded documents on component mount
  useEffect(() => {
    const reloadUploadedDocuments = async () => {
      if (!applicationId) {
        console.log('⚠️ [STEP5-RELOAD] No application ID available for document reload');
        return;
      }

      try {
        console.log(`📂 [STEP5-RELOAD] Fetching uploaded documents for application ${applicationId}`);
        const response = await fetch(`/api/public/applications/${applicationId}/documents`);
        
        if (response.ok) {
          const uploadedDocs = await response.json();
          console.log(`✅ [STEP5-RELOAD] Loaded ${uploadedDocs.length} documents:`, uploadedDocs);
          
          // Convert server response to UploadedFile format
          const reloadedFiles: UploadedFile[] = uploadedDocs.map((doc: any) => ({
            id: doc.documentId || doc.id,
            name: doc.fileName || doc.name,
            size: doc.fileSize || doc.size,
            type: doc.mimeType || 'application/pdf',
            status: (doc.status === 'uploaded' ? 'completed' : doc.status) as "completed" | "uploading" | "error",
            documentType: doc.documentType,
            file: new File([], doc.fileName || doc.name), // Placeholder file for display
            uploadedAt: doc.uploadedAt
          }));
          
          setUploadedFiles(reloadedFiles);
          
          // Update context state
          dispatch({
            type: 'UPDATE_FORM_DATA',
            payload: {
              step5DocumentUpload: {
                ...state.step5DocumentUpload,
                uploadedFiles: reloadedFiles
              }
            }
          });
          
        } else {
          console.log(`⚠️ [STEP5-RELOAD] Failed to fetch documents: ${response.status}`);
          // For S3 uploads that aren't showing in staff backend yet, keep existing local files
          console.log(`📂 [STEP5-RELOAD] Keeping ${uploadedFiles.length} locally tracked files`);
        }
      } catch (error) {
        console.log('❌ [STEP5-RELOAD] Error loading documents:', String(error));
      }
    };

    reloadUploadedDocuments();
  }, [applicationId, dispatch]); // Reload when applicationId changes

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
          message: `Error fetching document requirements: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

  // FIX #6: Clear Step 5 state when navigating back
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // If user navigated back to Step 4 or earlier, clear Step 5 state
    if (currentPath.includes('/step-4') || currentPath.includes('/step-3') || currentPath.includes('/step-2') || currentPath.includes('/step-1')) {
      console.log('🔄 [STEP5-CLEAR] User navigated back, clearing Step 5 state');
      
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          step5DocumentUpload: { 
            uploadedFiles: [],
            completed: false
          }
        }
      });
      
      // Also clear local state
      setUploadedFiles([]);
      setFiles([]);
    }
  }, [dispatch]); // React to navigation changes

  // Auto-save uploaded documents with 2-second delay
  const debouncedSave = useDebouncedCallback((files: UploadedFile[]) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step5DocumentUpload: {
          uploadedFiles: files,
          completed: files.length > 0
        }
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
    console.log("📤 [STEP5] handleFilesUploaded called with:", files.length, "files");
    console.log("📤 [STEP5] Files details:", files.map(f => ({ name: f.name, type: f.documentType })));
    
    setUploadedFiles(files);
    
    // Save to proper step5DocumentUpload location
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step5DocumentUpload: {
          uploadedFiles: files,
          completed: files.length > 0
        }
      }
    });
    
    console.log("📤 [STEP5] Dispatched UPDATE_FORM_DATA with", files.length, "files");
  };

  // Trigger autosave when uploaded files change
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      debouncedSave(uploadedFiles);
    }
  }, [uploadedFiles, debouncedSave]);

  // FIX #4: Enhanced document validation function
  const validateDocumentUploads = (requirements: string[], files: UploadedFile[]) => {
    if (!requirements || requirements.length === 0) {
      return { allComplete: true, validationResults: [] };
    }
    
    console.log(`🧪 [VALIDATION] Validating ${files.length} files against ${requirements.length} requirements`);
    
    // Group uploaded files by normalized document type
    const filesByType = files.reduce((acc, file) => {
      // ✅ Accept multiple upload states for S3 compatibility
      const isValidFile = file.status === 'completed' || file.status === 'uploading' || (file as any).uploadedAt;
      if (isValidFile && file.documentType) {
        const normalizedType = normalizeDocumentName(file.documentType);
        if (!acc[normalizedType]) acc[normalizedType] = [];
        acc[normalizedType].push(file);
      }
      return acc;
    }, {} as Record<string, UploadedFile[]>);
    
    console.log(`🧪 [VALIDATION] Files grouped by type:`, Object.keys(filesByType).map(type => 
      `${type}: ${filesByType[type].length} files`
    ));
    
    // Validate each requirement
    const validationResults = requirements.map(requirement => {
      const normalizedRequirement = normalizeDocumentName(requirement);
      const uploadedFiles = filesByType[normalizedRequirement] || [];
      
      // Determine required quantity using same logic as deduplication
      const requiredCount = requirement.toLowerCase().includes('bank') && requirement.toLowerCase().includes('statement') ? 6 :
                           requirement.toLowerCase().includes('accountant') && requirement.toLowerCase().includes('financial') && requirement.toLowerCase().includes('statement') ? 3 : 1;
      
      const isComplete = uploadedFiles.length >= requiredCount;
      
      console.log(`📊 [VALIDATION] "${requirement}" (${normalizedRequirement}): ${uploadedFiles.length}/${requiredCount} - ${isComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
      
      return {
        documentType: requirement,
        normalizedType: normalizedRequirement,
        required: requiredCount,
        uploaded: uploadedFiles.length,
        complete: isComplete
      };
    });
    
    const allComplete = validationResults.every(result => result.complete);
    const completedCount = validationResults.filter(r => r.complete).length;
    
    console.log(`🎯 [VALIDATION] Overall: ${allComplete ? 'ALL COMPLETE' : 'INCOMPLETE'} (${completedCount}/${validationResults.length})`);
    
    return { allComplete, validationResults };
  };

  // ✅ ENHANCED VALIDATION: Use new validation function
  const validateDocumentCompleteness = () => {
    const result = validateDocumentUploads(intersectionResults.requiredDocuments, uploadedFiles);
    return result.allComplete;
  };

  const canProceed = () => {
    // ✅ BYPASS CHECK MODE: Always allow proceeding for submission without documents flow
    const completedFiles = uploadedFiles.filter(f => f.status === 'completed').length;
    const totalUploadedFiles = uploadedFiles.length;
    
    // Also check if we have any files with S3 storage (from console logs showing S3 success)
    const s3Files = uploadedFiles.filter(f => f.storageKey || f.storage === 's3').length;
    
    // Check localStorage for any document evidence
    const localStorageFiles = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]').length;
    
    console.log(`🔍 [CANPROCEED] Bypass check mode - always allow continuing:`, {
      completedFiles,
      totalUploadedFiles,
      s3Files,
      localStorageFiles,
      allRequirementsComplete,
      intersectionHasMatches: intersectionResults.hasMatches,
      requiredDocsLength: intersectionResults.requiredDocuments.length,
      uploadedFileDetails: uploadedFiles.map(f => ({ name: f.name, status: f.status, storage: f.storage, storageKey: f.storageKey }))
    });
    
    // PRIORITY 1: If user has any uploaded files (completed, S3, or any status), proceed with documents
    if (completedFiles > 0 || s3Files > 0 || totalUploadedFiles > 0 || localStorageFiles > 0) {
      console.log(`✅ [CANPROCEED] Found uploaded documents (completed: ${completedFiles}, S3: ${s3Files}, total: ${totalUploadedFiles}, localStorage: ${localStorageFiles}) - proceeding with documents`);
      return true;
    }
    
    // PRIORITY 2: If requirements marked complete by DynamicDocumentRequirements, proceed
    if (allRequirementsComplete) {
      console.log(`✅ [CANPROCEED] Requirements marked complete - proceeding`);
      return true;
    }
    
    // ✅ NEW: PRIORITY 3: Always allow proceeding without documents (minimal validation mode)
    console.log(`✅ [CANPROCEED] Bypass check mode - allowing submission without documents`);
    return true;
  };

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

  // ✅ ENHANCED: Allow continuing to Step 6 even without documents
  const handleNext = async () => {
    if (!applicationId) {
      toast({
        title: "Application ID Missing",
        description: "Cannot upload documents without application ID. Please restart from Step 4.",
        variant: "destructive",
      });
      return;
    }

    logger.log('🚀 [STEP5] Navigation attempt - using bypass check mode...');

    // ✅ BYPASS CHECK MODE: Always allow proceeding (minimal validation)
    console.log('✅ [STEP5] Bypass check mode - proceeding to Step 6 regardless of document status');
    
    // Determine if user has uploaded documents or is submitting without documents
    const hasDocuments = uploadedFiles.length > 0;
    const submissionMode = hasDocuments ? 'with_documents' : 'without_documents';
    
    console.log(`📋 [STEP5] Submission mode: ${submissionMode} (${uploadedFiles.length} documents)`);
    
    // Set appropriate flags for Step 6 processing
    const step5State = {
      uploadedFiles: uploadedFiles,
      completed: true,
      submissionMode: submissionMode,
      hasDocuments: hasDocuments,
      bypassDocuments: !hasDocuments // Set bypass flag if no documents
    };
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step5DocumentUpload: step5State
      }
    });
    
    dispatch({
      type: 'MARK_STEP_COMPLETE',
      payload: 5
    });

    // Show appropriate message based on submission mode
    if (submissionMode === 'without_documents') {
      toast({
        title: "Proceeding Without Documents",
        description: "You can complete the application. SMS link will be sent for document upload.",
        variant: "default",
      });
    } else {
      toast({
        title: "Documents Ready",
        description: `${uploadedFiles.length} documents prepared. Proceeding to signature.`,
        variant: "default",
      });
    }

    console.log(`📋 [STEP5] Moving to Step 6 with ${submissionMode} mode`);
    setLocation('/apply/step-6');
  };

  const handleSaveAndContinueLater = () => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step5DocumentUpload: {
          uploadedFiles: uploadedFiles,
          completed: uploadedFiles.length > 0
        }
      }
    });
    
    toast({
      title: "Progress Saved",
      description: "Your document uploads have been saved. You can continue later.",
    });
  };

  const handleBypass = async () => {
    try {
      console.log('🚀 [STEP5] Starting document bypass process...');
      
      // ✅ CRITICAL FIX: Set bypass flag in step5DocumentUpload structure 
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          step5DocumentUpload: {
            ...state.step5DocumentUpload,
            files,
            uploadedFiles,
            bypassDocuments: true,
            completed: true,
            allRequirementsComplete: false,
            totalRequirements
          }
        }
      });

      // ✅ TASK 1: Persist bypass flag to backend if sync is enabled
      const currentApplicationId = applicationId || state.applicationId || localStorage.getItem('applicationId');
      if (currentApplicationId) {
        try {
          await fetch(`/api/public/applications/${currentApplicationId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
            },
            body: JSON.stringify({ bypassDocuments: true }),
          });
          console.log('✅ [STEP5] Bypass flag persisted to backend');
        } catch (backendError) {
          console.warn('⚠️ [STEP5] Backend sync failed, continuing with local state:', backendError);
        }
      }

      toast({
        title: "Document Upload Bypassed",
        description: "You can upload required documents later. Proceeding to electronic signature.",
        variant: "default"
      });

      console.log('✅ [STEP5] Bypass complete - moving to Step 6');
      setLocation('/apply/step-6');
      
    } catch (error) {
      console.error('❌ [STEP5] Failed to bypass documents:', error);
      toast({
        title: "Error",
        description: "Failed to proceed without documents. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">

      <StepHeader 
        stepNumber={5}
        title="Upload Documents"
        description="Upload the required documents for lender review"
      />

      {/* Status Badges */}
      <div className="flex justify-center items-center space-x-4">
        <Badge variant="outline" className="flex items-center space-x-1">
          <FileText className="w-3 h-3" />
          <span>{uploadedFiles.filter(f => f.status === 'completed').length} Uploaded</span>
        </Badge>
        {/* Only show Ready badge if there are files pending upload */}
        {files.length > 0 && (
          <Badge variant="outline" className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>{files.length} Ready</span>
          </Badge>
        )}
        {/* Show uploading status if currently uploading */}
        {isUploading && (
          <Badge variant="outline" className="flex items-center space-x-1 bg-blue-50 text-blue-700">
            <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
            <span>Uploading...</span>
          </Badge>
        )}
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



      {/* Files Ready for Upload - Only show if there are actually pending files */}
      {files.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Files Uploading</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                    {files.length} in progress
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                {files.map((file, index) => {
                  const uploadStatus = uploadProgress[file.file.name];
                  const isUploading = uploadStatus && uploadStatus < 100;
                  const isCompleted = uploadStatus === 100;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="relative">
                          <FileText className={`w-4 h-4 ${isCompleted ? 'text-green-600' : isUploading ? 'text-blue-600' : 'text-blue-600'}`} />
                          {isUploading && (
                            <div className="absolute -top-1 -right-1 w-2 h-2">
                              <div className="animate-spin rounded-full h-2 w-2 border border-blue-600 border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{file.file.name}</div>
                          <div className="text-xs text-gray-500 flex items-center space-x-2">
                            <span>{file.category}</span>
                            <span>•</span>
                            <span>{(file.file.size / 1024 / 1024).toFixed(1)} MB</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCompleted ? (
                          <Badge variant="default" className="bg-green-600 text-xs">
                            ✓ Uploaded
                          </Badge>
                        ) : isUploading ? (
                          <Badge variant="default" className="bg-blue-600 text-xs">
                            {uploadStatus}%
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-blue-600 text-xs">
                            Uploading...
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-blue-600 text-center">
                Files are being uploaded immediately to staff backend...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Document Requirements Component */}
      <div data-document-upload>
        <DynamicDocumentRequirements
          requirements={intersectionResults.requiredDocuments || []}
          uploadedFiles={uploadedFiles}
          onFilesUploaded={handleFilesUploaded}
          onRequirementsChange={handleRequirementsChange}
          applicationId={applicationId || 'test-app-123'}
          onFileAdded={handleFileAdded}
          onFileRemoved={handleFileRemoved}
        />
      </div>

      {/* Document Upload Status */}
      {verificationResult ? (
        <DocumentUploadStatus
          verificationResult={verificationResult}
          localUploadedFiles={uploadedFiles}
          isLoading={isVerifying || isManualVerifying}
          onRetryUpload={(documentType) => {
            logger.log(`🔄 [STEP5] Retry upload requested for: ${documentType}`);
            // Scroll to upload area or trigger upload modal
            const uploadElement = document.querySelector('[data-document-upload]');
            if (uploadElement) {
              uploadElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onRefreshStatus={() => {
            logger.log('🔄 [STEP5] Manual status refresh requested');
            refetchDocuments();
          }}
        />
      ) : (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">Document verification loading...</div>
            </div>
          </CardContent>
        </Card>
      )}

      

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
          disabled={isUploading || isManualVerifying || !canProceed()}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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
              <span>Continue to Final Submission</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}