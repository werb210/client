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

import { getDocumentRequirementsIntersection } from '@/lib/documentIntersection';

import { useDebouncedCallback } from 'use-debounce';

import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Save from 'lucide-react/dist/esm/icons/save';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Info from 'lucide-react/dist/esm/icons/info';

import type { UploadedFile } from '../components/DynamicDocumentRequirements';


export default function Step5DocumentUpload() {
  const { state, dispatch } = useFormDataContext();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Debug: Check applicationId availability
  const applicationId = state.applicationId || localStorage.getItem('applicationId');
  logger.log('🔍 [STEP5] Application ID check:', {
    fromState: state.applicationId,
    fromLocalStorage: localStorage.getItem('applicationId'),
    finalId: applicationId
  });
  
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

  // Calculate document requirements on component mount
  useEffect(() => {
    const calculateDocumentRequirements = async () => {
      // A. Use step-based structure exclusively - STEP-BASED COMPLIANCE
      const productCategory = state.step2?.selectedCategory || state.step1?.lookingFor || '';
      const location = state.step1?.businessLocation || '';
      const amount = state.step1?.fundingAmount || '';
      
      logger.log(`🔧 [STEP5] selectedCategory from step2: "${state.step2?.selectedCategory}"`);
      logger.log(`🔧 [STEP5] businessLocation from step1: "${state.step1?.businessLocation}"`);
      logger.log(`🔧 [STEP5] fundingAmount from step1: "${state.step1?.fundingAmount}"`);
      logger.log(`🔧 [STEP5] lookingFor from step1: "${state.step1?.lookingFor}"`);
      logger.log(`🔧 [STEP5] Derived values: category="${productCategory}", location="${location}", amount="${amount}"`);
      logger.log(`🔧 [STEP5] Full state keys:`, Object.keys(state));
      
      // Add validation logging for step-based structure compliance
      logger.log("[Step 5] Category used for required docs:", state.step2?.selectedCategory);
      logger.log("[Step 5] Step-based validation:", {
        step1Available: !!state.step1,
        step2Available: !!state.step2,
        step2Category: state.step2?.selectedCategory,
        step1Location: state.step1?.businessLocation,
        step1Amount: state.step1?.fundingAmount
      });

      // Map category names from Step 2 to API format
      const categoryMapping: Record<string, string> = {
        'Working Capital': 'working_capital',
        'Term Loan': 'term_loan',
        'Business Line of Credit': 'line_of_credit',
        'Equipment Financing': 'equipment_financing',
        'Invoice Factoring': 'invoice_factoring',
        'Purchase Order Financing': 'purchase_order_financing',
        'Asset-Based Lending': 'asset_based_lending',
        'SBA Loan': 'sba_loan'
      };

      // Get fallback documents for the selected category
      const getFallbackDocuments = (category: string): string[] => {
        const fallbackMap: Record<string, string[]> = {
          'working_capital': [
            'Bank Statements',
            'Accountant Prepared Financial Statements',
            'Tax Returns',
            'Business License',
            'Accounts Receivable Aging Report'
          ],
          'term_loan': [
            'Bank Statements',
            'Accountant Prepared Financial Statements',
            'Tax Returns',
            'Business License',
            'Business Plan'
          ],
          'line_of_credit': [
            'Bank Statements',
            'Accountant Prepared Financial Statements',
            'Tax Returns',
            'Business License'
          ],
          'equipment_financing': [
            'Bank Statements',
            'Accountant Prepared Financial Statements',
            'Tax Returns',
            'Equipment Quote',
            'Business License'
          ],
          'invoice_factoring': [
            'Bank Statements',
            'Accountant Prepared Financial Statements',
            'Invoice Samples',
            'Accounts Receivable Aging Report'
          ]
        };
        
        return fallbackMap[category] || [
          'Bank Statements',
          'Accountant Prepared Financial Statements',
          'Tax Returns',
          'Business License'
        ];
      };
      
      // Use step2.selectedCategory - STEP-BASED COMPLIANCE
      const apiCategory = categoryMapping[productCategory] || productCategory.toLowerCase().replace(/ /g, '_') || '';
      
      // Convert business location to API format (CA -> canada, US -> united_states)
      const convertLocationToApiFormat = (location: string): string => {
        const mappings: { [key: string]: string } = {
          'CA': 'canada',
          'US': 'united_states',
          'canada': 'canada',
          'united_states': 'united_states'
        };
        return mappings[location] || location.toLowerCase();
      };
      
      const apiLocation = location ? convertLocationToApiFormat(location) : '';
      
      // Validate required fields - use more flexible validation since intersection logic handles missing data better
      if (!apiLocation) {
        logger.log(`🔧 [STEP5] Missing required location data: location="${apiLocation}"`);
        setIntersectionResults({
          eligibleLenders: [],
          requiredDocuments: [],
          message: 'Business location required for document requirements calculation',
          hasMatches: false,
          isLoading: false
        });
        return;
      }

      logger.log('🔍 [STEP5] Calculating document requirements with intersection logic...');
      logger.log('Form data:', { productCategory, apiCategory, location, apiLocation, fundingAmount: amount });

      // Parse funding amount if it's a string
      const parsedFundingAmount = typeof amount === 'string' 
        ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) 
        : amount;
        
      logger.log(`🔧 [STEP5] Parsed funding amount: ${parsedFundingAmount} (from "${amount}")`);

      try {
        const results = await getDocumentRequirementsIntersection(
          apiCategory,
          apiLocation,
          parsedFundingAmount
        );

        // console.debug("✅ Intersection result:", results.requiredDocuments);
        logger.log(`[Step 5] Intersection results:`, results);
        
        // Show toast notification about results
        if (results.hasMatches && results.requiredDocuments.length > 0) {
          setIntersectionResults({
            ...results,
            isLoading: false
          });
          
          toast({
            title: "Document Requirements Calculated",
            description: `${results.requiredDocuments.length} documents required by all matching lenders`
          });
        } else if (results.hasMatches && results.requiredDocuments.length === 0) {
          // Use fallback documents when no intersection found
          logger.log(`[Step 5] No intersection documents found, using fallback for ${productCategory}`);
          const fallbackDocuments = getFallbackDocuments(apiCategory);
          
          setIntersectionResults({
            eligibleLenders: results.eligibleLenders,
            requiredDocuments: fallbackDocuments,
            message: `Using standard requirements for ${productCategory}`,
            hasMatches: true,
            isLoading: false
          });
          
          logger.log(`[Step 5] Applied fallback documents:`, fallbackDocuments);
          
          toast({
            title: "Document Requirements Loaded",
            description: `Standard document requirements loaded for ${productCategory}`,
            variant: "default"
          });
        } else {
          // No matches at all - use fallback
          logger.log(`[Step 5] No matching lenders found, using fallback for ${productCategory}`);
          const fallbackDocuments = getFallbackDocuments(apiCategory);
          
          setIntersectionResults({
            eligibleLenders: [],
            requiredDocuments: fallbackDocuments,
            message: `Using standard requirements for ${productCategory}`,
            hasMatches: true,
            isLoading: false
          });
          
          logger.log(`[Step 5] Applied fallback documents:`, fallbackDocuments);
          
          toast({
            title: "Document Requirements Loaded",
            description: `Standard document requirements loaded for ${productCategory}`,
            variant: "default"
          });
        }

      } catch (error) {
        logger.error('❌ [STEP5] Error calculating document requirements:', error);
        
        // Use fallback documents based on selected category
        const fallbackDocuments = getFallbackDocuments(apiCategory);
        
        setIntersectionResults({
          eligibleLenders: [],
          requiredDocuments: fallbackDocuments,
          message: `Using standard requirements for ${productCategory}`,
          hasMatches: true,
          isLoading: false
        });
        
        logger.log(`[Step 5] Using fallback documents for ${productCategory}:`, fallbackDocuments);
        
        toast({
          title: "Document Requirements Loaded",
          description: `Standard document requirements loaded for ${productCategory}`,
          variant: "default"
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
    setAllRequirementsComplete(allComplete);
    setTotalRequirements(total);
  };

  // Get selected product from previous steps for document categorization
  const selectedProduct = state.step1?.selectedProductId || '';
  
  // Navigation handlers
  const handlePrevious = () => {
    setLocation('/apply/step-4');
  };

  const handleNext = () => {
    if (!allRequirementsComplete) {
      toast({
        title: "Required Documents Missing",
        description: "Please upload all required documents before proceeding.",
        variant: "destructive",
      });
      return;
    }

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
    setLocation('/apply/step-6');
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
        {allRequirementsComplete && (
          <Badge variant="default" className="flex items-center space-x-1 bg-green-600">
            <CheckCircle className="w-3 h-3" />
            <span>Complete</span>
          </Badge>
        )}
      </div>

      {/* Proceed Without Documents Banner */}
      <ProceedBypassBanner onBypass={handleBypass} />



      {/* Dynamic Document Requirements Component */}
      <DynamicDocumentRequirements
        requirements={intersectionResults.requiredDocuments || []}
        uploadedFiles={uploadedFiles}
        onFilesUploaded={handleFilesUploaded}
        onRequirementsChange={handleRequirementsChange}
        applicationId={applicationId || 'test-app-123'}
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
          disabled={!allRequirementsComplete}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          <span>Continue to Signature</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}