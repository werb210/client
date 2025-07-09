import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormDataContext } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { DynamicDocumentRequirements } from '@/components/DynamicDocumentRequirements';
import { ProceedBypassBanner } from '@/components/ProceedBypassBanner';
import { getDocumentRequirementsIntersection } from '@/lib/documentIntersection';
import { useDebouncedCallback } from 'use-debounce';
import { 
  ArrowRight, 
  ArrowLeft, 
  Save,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

import type { UploadedFile } from '../components/DynamicDocumentRequirements';

export default function Step5DocumentUpload() {
  const { state, dispatch } = useFormDataContext();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
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
      // A. Use the form state to access required fields - map from unified schema
      const { selectedCategory, businessLocation, fundingAmount, lookingFor, headquarters } = state;
      
      // Try multiple field mappings since the schema has evolved
      const productCategory = selectedCategory || lookingFor || '';
      const location = businessLocation || headquarters || '';
      const amount = fundingAmount || state.fundingAmount || '';
      
      console.log(`🔧 [STEP5] selectedCategory from state: "${selectedCategory}"`);
      console.log(`🔧 [STEP5] businessLocation from state: "${businessLocation}"`);
      console.log(`🔧 [STEP5] fundingAmount from state: "${fundingAmount}"`);
      console.log(`🔧 [STEP5] headquarters from state: "${headquarters}"`);
      console.log(`🔧 [STEP5] lookingFor from state: "${lookingFor}"`);
      console.log(`🔧 [STEP5] Derived values: category="${productCategory}", location="${location}", amount="${amount}"`);
      console.log(`🔧 [STEP5] Full state keys:`, Object.keys(state));
      
      // Use selectedCategory directly - no conversion needed since we updated intersection logic
      const apiCategory = productCategory || '';
      
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
        console.log(`🔧 [STEP5] Missing required location data: location="${apiLocation}"`);
        setIntersectionResults({
          eligibleLenders: [],
          requiredDocuments: [],
          message: 'Business location required for document requirements calculation',
          hasMatches: false,
          isLoading: false
        });
        return;
      }

      console.log('🔍 [STEP5] Calculating document requirements with intersection logic...');
      console.log('Form data:', { selectedCategory, apiCategory, businessLocation, apiLocation, fundingAmount: amount });

      // Parse funding amount if it's a string
      const parsedFundingAmount = typeof amount === 'string' 
        ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) 
        : amount;
        
      console.log(`🔧 [STEP5] Parsed funding amount: ${parsedFundingAmount} (from "${amount}")`);

      try {
        const results = await getDocumentRequirementsIntersection(
          apiCategory,
          apiLocation,
          parsedFundingAmount
        );

        console.debug("✅ Intersection result:", results.requiredDocuments);
        setIntersectionResults({
          ...results,
          isLoading: false
        });

        // Show toast notification about results
        if (results.hasMatches && results.requiredDocuments.length > 0) {
          toast({
            title: "Document Requirements Calculated",
            description: `${results.requiredDocuments.length} documents required by all matching lenders`
          });
        } else if (results.hasMatches && results.requiredDocuments.length === 0) {
          toast({
            title: "No Common Documents Required",
            description: "Review individual lender requirements",
            variant: "destructive"
          });
        } else {
          toast({
            title: "No Matching Lenders",
            description: "Please review your selection criteria",
            variant: "destructive"
          });
        }

      } catch (error) {
        console.error('❌ [STEP5] Error calculating document requirements:', error);
        
        // Provide fallback document requirements for Equipment Financing
        const fallbackDocuments = apiCategory === 'Equipment Financing' ? [
          'Equipment Quote',
          'Accountant Prepared Financial Statements',
          'Bank Statements',
          'Equipment Specifications',
          'Business Tax Returns'
        ] : [
          'Accountant Prepared Financial Statements',
          'Bank Statements',
          'Business Tax Returns',
          'Application Form'
        ];
        
        setIntersectionResults({
          eligibleLenders: [],
          requiredDocuments: fallbackDocuments,
          message: `Using fallback requirements for ${apiCategory}`,
          hasMatches: true,
          isLoading: false
        });
        
        toast({
          title: "Using Standard Documents",
          description: `Standard document requirements loaded for ${apiCategory}`,
          variant: "default"
        });
      }
    };

    calculateDocumentRequirements();
  }, [state.selectedCategory, state.businessLocation, state.fundingAmount, toast]);

  // Auto-save uploaded documents with 2-second delay
  const debouncedSave = useDebouncedCallback((files: UploadedFile[]) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        uploadedDocuments: files,
      }
    });
    console.log('💾 Step 5 - Auto-saved document uploads:', files.length, 'files');
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
  const selectedProduct = state.selectedProductId || '';
  
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
      if (state.applicationId) {
        await fetch(`/api/applications/${state.applicationId}/nudge-documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bypassed: true }),
        });
      }

      setLocation('/apply/step-6');
    } catch (error) {
      console.error('Failed to bypass documents:', error);
      toast({
        title: "Error",
        description: "Failed to proceed without documents. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="w-5/6 h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full"></div>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Step 5: Upload Documents
          </h1>
          <p className="text-gray-600 mt-2">
            Upload the required documents for lender review
          </p>
        </div>
      </div>

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
        applicationId={state.applicationId || 'test-app-123'}
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