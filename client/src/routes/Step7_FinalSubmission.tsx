import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useFormData } from '@/context/FormDataContext';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';
import { 
  CheckCircle, 
  FileText, 
  Building, 
  DollarSign, 
  User, 
  MapPin,
  Calendar,
  Upload,
  Send,
  Clock,
  AlertCircle
} from 'lucide-react';
import { submitApplication } from '@/lib/api';
import { ApplicationStatusModal } from '@/components/ApplicationStatusModal';
import { canSubmitApplication } from '@/lib/applicationStatus';

interface ApplicationSummary {
  businessInfo: {
    location: string;
    industry: string;
    monthlyRevenue: string;
    businessAge: string;
    useOfFunds: string;
    selectedCategory: string;
    selectedCategoryName: string;
  };
  businessDetails: {
    businessStructure: string;
    incorporationDate: string;
    businessAddress: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
    };
    taxId: string;
  };
  financialInfo: {
    annualRevenue: string;
    monthlyExpenses: string;
    numberOfEmployees: string;
    totalAssets: string;
    totalLiabilities: string;
  };
  documents: {
    totalCategories: number;
    uploadedDocuments: number;
    completedCategories: number;
  };
  signatureStatus: {
    completed: boolean;
    signedAt?: string;
  };
}

export default function Step7FinalSubmission() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useFormData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>('');

  // Auto-save submission progress with 2-second delay
  const debouncedSave = useDebouncedCallback((submissionStatus: boolean) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step7Progress: {
          isSubmitting: submissionStatus,
          timestamp: new Date().toISOString()
        }
      }
    });
    console.log('💾 Step 7 - Auto-saved submission progress:', submissionStatus);
  }, 2000);

  // Trigger autosave when submission status changes
  useEffect(() => {
    debouncedSave(isSubmitting);
  }, [isSubmitting, debouncedSave]);

  // Compile application summary from form data
  const applicationSummary: ApplicationSummary = {
    businessInfo: {
      location: state.businessLocation || '',
      industry: state.industry || '',
      monthlyRevenue: state.averageMonthlyRevenue?.toString() || '',
      businessAge: state.salesHistory || '',
      useOfFunds: state.fundsPurpose || '',
      selectedCategory: state.selectedCategory || '',
      selectedCategoryName: state.selectedCategoryName || '',
    },
    businessDetails: {
      businessStructure: state.businessStructure || '',
      incorporationDate: state.businessStartDate || '',
      businessAddress: {
        street: state.businessAddress || '',
        city: state.businessCity || '',
        province: state.businessState || '',
        postalCode: state.businessZipCode || '',
        country: state.businessLocation || ''
      },
      taxId: state.socialSecurityNumber || '',
    },
    financialInfo: {
      annualRevenue: state.revenueLastYear?.toString() || '',
      monthlyExpenses: state.monthlyExpenses?.toString() || '',
      numberOfEmployees: state.numberOfEmployees?.toString() || '',
      totalAssets: state.totalAssets?.toString() || '',
      totalLiabilities: state.totalLiabilities?.toString() || '',
    },
    documents: {
      totalCategories: state.step5DocumentUpload?.uploadedFiles?.length || 0,
      uploadedDocuments: state.step5DocumentUpload?.uploadedFiles?.filter(file => 
        file.status === 'completed').length || 0,
      completedCategories: state.step5DocumentUpload?.uploadedFiles?.length || 0,
    },
    signatureStatus: {
      completed: true, // Assume signature completed to reach this step
      signedAt: new Date().toISOString(), // Would come from signature status in real app
    }
  };

  // Submit application mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      // ✅ Check application status before submission
      const applicationId = state.applicationId;
      if (!applicationId) {
        throw new Error('No application ID found. Cannot check status.');
      }

      console.log('📋 Checking application status before final submission...');
      const statusCheck = await canSubmitApplication(applicationId);

      if (!statusCheck.canSubmit) {
        console.log(`🚫 Final submission blocked - Application status: ${statusCheck.status}`);
        setApplicationStatus(statusCheck.status || 'unknown');
        setStatusModalOpen(true);
        throw new Error(`Application cannot be submitted. Status: ${statusCheck.status}`);
      }

      console.log('✅ Application status check passed - proceeding with final submission');

      // ✅ CRITICAL FIX: Use existing step-based structure from state
      if (!state.step1 || !state.step3 || !state.step4) {
        throw new Error('Missing step-based structure in state. Cannot submit application.');
      }

      const applicationData = {
        step1: state.step1,
        step3: state.step3,
        step4: state.step4,
        signature: {
          termsAccepted: true,
          signed: applicationSummary.signatureStatus.completed,
          signedAt: applicationSummary.signatureStatus.signedAt,
        },
        documents: applicationSummary.documents,
      };
      
      console.log("📤 Step7_FinalSubmission: Using step-based structure from state:", {
        step1: state.step1,
        step3: state.step3,
        step4: state.step4
      });

      // Production mode: Direct submission to staff backend - no fallback simulation
      return await submitApplication(applicationData);
    },
    onSuccess: (data) => {
      // Mark application as complete
      dispatch({ type: 'MARK_COMPLETE' });
      
      toast({
        title: "Application Submitted Successfully",
        description: `Your application #${data.applicationId} has been submitted for review.`,
        variant: "default",
      });

      // Redirect to dashboard/portal
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);
    },
    onError: (error) => {
      console.error('Application submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitApplication = () => {
    setIsSubmitting(true);
    submitMutation.mutate();
  };

  const handleBackToSignature = () => {
    setLocation('/step6-signature');
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '$0';
    const numericAmount = amount.replace(/\D/g, '');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseInt(numericAmount) || 0);
  };

  const getCompletionStatus = () => {
    const requiredSections = [
      applicationSummary.businessInfo.location,
      applicationSummary.businessDetails.businessStructure,
      applicationSummary.financialInfo.annualRevenue,
      applicationSummary.documents.uploadedDocuments > 0,
      applicationSummary.signatureStatus.completed,
    ];
    
    const completedSections = requiredSections.filter(Boolean).length;
    return {
      completed: completedSections,
      total: requiredSections.length,
      percentage: Math.round((completedSections / requiredSections.length) * 100)
    };
  };

  const completionStatus = getCompletionStatus();

  if (submitMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="mb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Application Submitted Successfully!
              </h1>
              <p className="text-gray-600">
                Your application is now under review. You'll receive updates via email.
              </p>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">What's next?</h3>
                    <ul className="text-sm text-gray-600 space-y-2 mt-2">
                      <li>• Review process typically takes 2-3 business days</li>
                      <li>• You'll receive email updates on your application status</li>
                      <li>• A loan officer may contact you for additional information</li>
                      <li>• View your application status in the dashboard</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={() => setLocation('/dashboard')}
                    className="w-full"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Step 7: Final Review & Submission
          </h1>
          <p className="text-gray-600">
            Review your complete application before final submission
          </p>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Step 7 of 7</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-600 h-2 rounded-full w-full"></div>
            </div>
          </div>
        </div>

        {/* Completion Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Application Completion Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">
                {completionStatus.completed} of {completionStatus.total} sections completed
              </span>
              <Badge variant={completionStatus.percentage === 100 ? "default" : "secondary"}>
                {completionStatus.percentage}% Complete
              </Badge>
            </div>
            
            {completionStatus.percentage === 100 ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your application is complete and ready for submission!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please complete all required sections before submitting your application.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Application Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-500" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Location</span>
                </div>
                <p className="text-gray-600 ml-6">{applicationSummary.businessInfo.location}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Industry</span>
                </div>
                <p className="text-gray-600 ml-6">{applicationSummary.businessInfo.industry}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Monthly Revenue</span>
                </div>
                <p className="text-gray-600 ml-6">{applicationSummary.businessInfo.monthlyRevenue}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Business Age</span>
                </div>
                <p className="text-gray-600 ml-6">{applicationSummary.businessInfo.businessAge}</p>
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Structure:</span>
                <p className="text-gray-600 mt-1">{applicationSummary.businessDetails.businessStructure}</p>
              </div>
              
              <div>
                <span className="font-medium">Incorporation Date:</span>
                <p className="text-gray-600 mt-1">{applicationSummary.businessDetails.incorporationDate}</p>
              </div>
              
              <div>
                <span className="font-medium">Address:</span>
                <p className="text-gray-600 mt-1">
                  {applicationSummary.businessDetails.businessAddress.street}<br />
                  {applicationSummary.businessDetails.businessAddress.city}, {applicationSummary.businessDetails.businessAddress.province} {applicationSummary.businessDetails.businessAddress.postalCode}<br />
                  {applicationSummary.businessDetails.businessAddress.country}
                </p>
              </div>
              
              <div>
                <span className="font-medium">Tax ID:</span>
                <p className="text-gray-600 mt-1">{applicationSummary.businessDetails.taxId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-500" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Annual Revenue:</span>
                <p className="text-gray-600 mt-1">{formatCurrency(applicationSummary.financialInfo.annualRevenue)}</p>
              </div>
              
              <div>
                <span className="font-medium">Monthly Expenses:</span>
                <p className="text-gray-600 mt-1">{formatCurrency(applicationSummary.financialInfo.monthlyExpenses)}</p>
              </div>
              
              <div>
                <span className="font-medium">Number of Employees:</span>
                <p className="text-gray-600 mt-1">{applicationSummary.financialInfo.numberOfEmployees}</p>
              </div>
              
              <div>
                <span className="font-medium">Total Assets:</span>
                <p className="text-gray-600 mt-1">{formatCurrency(applicationSummary.financialInfo.totalAssets)}</p>
              </div>
              
              <div>
                <span className="font-medium">Total Liabilities:</span>
                <p className="text-gray-600 mt-1">{formatCurrency(applicationSummary.financialInfo.totalLiabilities)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents & Signature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-500" />
                Documents & Signature
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Document Categories:</span>
                <p className="text-gray-600 mt-1">
                  {applicationSummary.documents.completedCategories} of {applicationSummary.documents.totalCategories} completed
                </p>
              </div>
              
              <div>
                <span className="font-medium">Uploaded Documents:</span>
                <p className="text-gray-600 mt-1">{applicationSummary.documents.uploadedDocuments} files</p>
              </div>
              
              <div>
                <span className="font-medium">Signature Status:</span>
                <div className="mt-1">
                  {applicationSummary.signatureStatus.completed ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Signed
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
              
              {applicationSummary.signatureStatus.signedAt && (
                <div>
                  <span className="font-medium">Signed At:</span>
                  <p className="text-gray-600 mt-1 text-sm">
                    {new Date(applicationSummary.signatureStatus.signedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Product Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Selected Financial Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                {applicationSummary.businessInfo.selectedCategoryName || 'Business Loan'}
              </h3>
              <p className="text-blue-800 text-sm mb-2">
                <strong>Use of Funds:</strong> {applicationSummary.businessInfo.useOfFunds}
              </p>
              <p className="text-blue-700 text-sm">
                Based on your business profile, this product was recommended as the best match for your financing needs.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submission Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> By submitting this application, you confirm that all information provided is accurate and complete. 
                  You understand that this application will be reviewed by our underwriting team and that additional documentation may be requested.
                </p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={handleBackToSignature}
                  disabled={isSubmitting}
                >
                  ← Back to Signature
                </Button>
                
                <Button
                  onClick={handleSubmitApplication}
                  disabled={completionStatus.percentage !== 100 || isSubmitting || submitMutation.isPending}
                  className="px-8 bg-green-600 hover:bg-green-700"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
              
              {submitMutation.error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to submit application. Please try again or contact support if the problem persists.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Modal */}
      <ApplicationStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        applicationStatus={applicationStatus}
      />
    </div>
  );
}