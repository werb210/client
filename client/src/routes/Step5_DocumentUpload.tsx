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
      
      // Validate required fields
      if (!apiCategory || !apiLocation || !amount) {
        console.log(`🔧 [STEP5] Missing required data: category="${apiCategory}", location="${apiLocation}", amount="${amount}"`);
        setIntersectionResults({
          eligibleLenders: [],
          requiredDocuments: ['Bank Statements', 'Tax Returns', 'Financial Statements', 'Business License', 'Articles of Incorporation'],
          message: 'Using fallback document requirements - form data incomplete',
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
        console.error('❌ [STEP5] Error details:', error.message, error.stack);
        setIntersectionResults({
          eligibleLenders: [],
          requiredDocuments: [],
          message: `Error: ${error?.message || 'Unknown error occurred'}`,
          hasMatches: false,
          isLoading: false
        });
      }
    };

    calculateDocumentRequirements();
  }, [state.selectedCategory, state.businessLocation, state.fundingAmount, toast]);

  // Handle file upload from DynamicDocumentRequirements component
  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    
    // Update form data state using unified schema
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        uploadedDocuments: files,
      }
    });
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="bg-gradient-to-r from-teal-600 to-orange-500 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-white">
                  Document Upload
                </CardTitle>
                <p className="text-white/90 mt-2">
                  Upload the required documents for your application
                </p>
              </div>
              <div className="flex items-center space-x-2">
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
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Proceed Without Documents Banner */}
      <ProceedBypassBanner onBypass={handleBypass} />

      {/* Intersection Results Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span>Document Requirements Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {intersectionResults.isLoading ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Calculating document requirements...</span>
            </div>
          ) : intersectionResults.hasMatches ? (
            <div className="space-y-4">
              {/* Matching Lenders Info */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Found {intersectionResults.eligibleLenders.length} matching lender
                  {intersectionResults.eligibleLenders.length !== 1 ? 's' : ''} for your criteria:
                  <div className="mt-2">
                    {intersectionResults.eligibleLenders.map((lender, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-1">
                        {lender.lenderName}: {lender.name}
                      </Badge>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Document Requirements */}
              {intersectionResults.requiredDocuments.length > 0 ? (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Documents Required by ALL Matching Lenders:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {intersectionResults.requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">{doc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {intersectionResults.message}
                  </p>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>No Common Documents Required:</strong> {intersectionResults.message}
                    <br />
                    <span className="text-sm mt-1 block">
                      You may need to review individual lender requirements or contact support.
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>No Matching Lenders:</strong> {intersectionResults.message}
                <br />
                <span className="text-sm mt-1 block">
                  Please review your selection in previous steps or contact support.
                </span>
                <br />
                <span className="text-xs text-gray-500 mt-2 block">
                  Debug: hasMatches={intersectionResults.hasMatches.toString()}, 
                  eligibleLenders={intersectionResults.eligibleLenders.length}, 
                  requiredDocs={intersectionResults.requiredDocuments.length}
                </span>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Document Requirements Component */}
      <DynamicDocumentRequirements
        formData={{
          lookingFor: state.lookingFor,
          businessLocation: state.businessLocation,
          fundingAmount: state.fundingAmount?.toString(),
          accountsReceivableBalance: state.accountsReceivableBalance?.toString()
        }}
        uploadedFiles={uploadedFiles}
        onFilesUploaded={handleFilesUploaded}
        onRequirementsChange={handleRequirementsChange}
        selectedProduct={selectedProduct}
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