import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Play } from 'lucide-react';
import { useFormData } from '@/context/FormDataContext';

interface TestStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  data?: any;
  result?: any;
  error?: string;
}

export default function CompleteApplicationTest() {
  const { data: formData, dispatch } = useFormData();
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    { step: 'Step 1: Financial Profile', status: 'pending' },
    { step: 'Step 2: Product Category', status: 'pending' },
    { step: 'Step 3: Business Details', status: 'pending' },
    { step: 'Step 4: Applicant Info', status: 'pending' },
    { step: 'Step 5: Document Requirements', status: 'pending' },
    { step: 'Step 7: API Submission', status: 'pending' },
    { step: 'Staff Backend Verification', status: 'pending' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const updateStep = (stepIndex: number, updates: Partial<TestStep>) => {
    setTestSteps(prev => prev.map((step, i) => 
      i === stepIndex ? { ...step, ...updates } : step
    ));
  };

  const runCompleteTest = async () => {
    setIsRunning(true);
    setApiResponse(null);

    try {
      // Step 1: Financial Profile
      updateStep(0, { status: 'running' });
      const step1Data = {
        businessLocation: 'CA',
        headquarters: 'canada',
        headquartersState: 'ON',
        industry: 'construction',
        lookingFor: 'capital',
        fundingAmount: 75000,
        fundsPurpose: 'working_capital',
        salesHistory: '3+yr',
        revenueLastYear: 500000,
        averageMonthlyRevenue: 50000,
        accountsReceivableBalance: 25000,
        fixedAssetsValue: 100000,
        equipmentValue: 50000
      };

      dispatch({
        type: 'UPDATE_STEP1',
        payload: step1Data
      });
      updateStep(0, { status: 'completed', data: step1Data });

      // Step 2: Product Category
      updateStep(1, { status: 'running' });
      const step2Data = {
        selectedCategory: 'Working Capital',
        selectedCategoryName: 'Working Capital'
      };
      
      localStorage.setItem('bf:step2:category', 'Working Capital');
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'selectedCategory',
        value: 'Working Capital'
      });
      updateStep(1, { status: 'completed', data: step2Data });

      // Step 3: Business Details
      updateStep(2, { status: 'running' });
      const step3Data = {
        operatingName: 'Northern Construction Ltd',
        legalName: 'Northern Construction Limited',
        businessStreetAddress: '123 King Street West',
        businessCity: 'Toronto',
        businessState: 'ON',
        businessPostalCode: 'M5H 3M7',
        businessPhone: '+14165551234',
        businessWebsite: 'www.northernconstruction.ca',
        businessStartDate: '2018-03-15',
        businessStructure: 'corporation',
        employeeCount: 12,
        estimatedYearlyRevenue: 550000
      };

      dispatch({
        type: 'UPDATE_STEP3',
        payload: step3Data
      });
      updateStep(2, { status: 'completed', data: step3Data });

      // Step 4: Applicant Information
      updateStep(3, { status: 'running' });
      const step4Data = {
        applicantFirstName: 'Michael',
        applicantLastName: 'Chen',
        applicantEmail: 'mchen@northernconstruction.ca',
        applicantPhone: '+14165559876',
        applicantAddress: '456 Bay Street',
        applicantCity: 'Toronto',
        applicantState: 'ON',
        applicantZipCode: 'M5G 2C8',
        applicantDateOfBirth: '1980-06-15',
        applicantSSN: '123456789',
        ownershipPercentage: 100,
        hasPartner: false
      };

      dispatch({
        type: 'UPDATE_STEP4',
        payload: step4Data
      });
      updateStep(3, { status: 'completed', data: step4Data });

      // Step 5: Test Document Requirements Integration
      updateStep(4, { status: 'running' });
      try {
        // Import the document intersection function
        const { getDocumentRequirementsIntersection } = await import('../lib/documentIntersection');
        
        const documentResult = await getDocumentRequirementsIntersection(
          'Working Capital',
          'CA', 
          75000
        );
        
        updateStep(4, { 
          status: 'completed', 
          result: {
            eligibleLenders: documentResult.eligibleLenders.length,
            requiredDocuments: documentResult.requiredDocuments,
            hasMatches: documentResult.hasMatches,
            message: documentResult.message
          }
        });
      } catch (error) {
        updateStep(4, { status: 'failed', error: error.message });
      }

      // Step 7: API Submission
      updateStep(5, { status: 'running' });
      try {
        const submissionPayload = {
          step1: step1Data,
          step2: step2Data,
          step3: step3Data,
          step4: step4Data,
          step5DocumentUpload: { uploadedFiles: [] },
          documents: [],
          documentStatus: 'pending',
          submissionSource: 'client_portal_test',
          applicationId: `test-app-${Date.now()}`
        };

        console.log('🧪 Submitting test application:', submissionPayload);

        const response = await fetch('/api/public/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(submissionPayload)
        });

        const result = await response.json();
        setApiResponse(result);

        if (response.ok && result.success) {
          updateStep(5, { status: 'completed', result });
          
          // Step 8: Verify with staff backend
          updateStep(6, { status: 'running' });
          try {
            // Check if application was received in staff backend
            const staffResponse = await fetch(`/api/applications/${result.applicationId || result.submissionId}`, {
              credentials: 'include'
            });
            
            if (staffResponse.ok) {
              const staffResult = await staffResponse.json();
              updateStep(6, { status: 'completed', result: staffResult });
            } else {
              updateStep(6, { status: 'failed', error: `Staff API returned ${staffResponse.status}` });
            }
          } catch (staffError) {
            updateStep(6, { status: 'failed', error: staffError.message });
          }
        } else {
          updateStep(5, { status: 'failed', error: result.error || 'API submission failed' });
        }

      } catch (error) {
        updateStep(5, { status: 'failed', error: error.message });
      }

    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running': return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default: return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-6 h-6" />
            Complete Application Flow Test
          </CardTitle>
          <p className="text-sm text-gray-600">
            Tests Step 1 → Step 2 → Step 5 data integration and API submission
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runCompleteTest} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Test...' : 'Run Complete Application Test'}
          </Button>

          <div className="grid grid-cols-1 gap-3">
            {testSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(step.status)}
                <div className="flex-1">
                  <div className="font-medium">{step.step}</div>
                  {step.error && (
                    <div className="text-sm text-red-600">Error: {step.error}</div>
                  )}
                  {step.result && step.step.includes('Step 5') && (
                    <div className="text-sm text-gray-600">
                      Found {step.result.eligibleLenders} eligible lenders, 
                      {step.result.requiredDocuments?.length || 0} required documents
                    </div>
                  )}
                  {step.result && step.step.includes('API Submission') && (
                    <div className="text-sm text-green-600">
                      Application ID: {step.result.applicationId || step.result.submissionId}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {apiResponse && (
            <Alert className="mt-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>API Response:</strong>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-500 space-y-1">
            <div><strong>Test Scenario:</strong> Canadian construction company</div>
            <div><strong>Location:</strong> Toronto, ON</div>
            <div><strong>Funding:</strong> $75,000 working capital</div>
            <div><strong>Expected Integration:</strong> Step 5 should filter lenders by CA location and $75K amount</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}