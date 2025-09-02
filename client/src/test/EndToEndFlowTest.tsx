import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Play, Database, Users, FileText } from 'lucide-react';

interface FlowTestResult {
  step: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details: any;
  timestamp?: string;
}

export default function EndToEndFlowTest() {
  const [results, setResults] = useState<FlowTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [finalApiResponse, setFinalApiResponse] = useState<any>(null);

  const updateResult = (step: string, status: FlowTestResult['status'], details: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.step === step);
      if (existing) {
        existing.status = status;
        existing.details = details;
        existing.timestamp = new Date().toISOString();
        return [...prev];
      } else {
        return [...prev, { step, status, details, timestamp: new Date().toISOString() }];
      }
    });
  };

  const runEndToEndTest = async () => {
    setIsRunning(true);
    setResults([]);
    setFinalApiResponse(null);

    try {
      // Test 1: Verify Products API
      updateResult('Products API', 'running', { message: 'Loading lender products...' });
      const productsResponse = await fetch('/api/v1/products');
      const productsData = await productsResponse.json();
      
      if (productsResponse.ok && productsData.success && productsData.products) {
        updateResult('Products API', 'passed', {
          totalProducts: productsData.products.length,
          canadianProducts: productsData.products.filter(p => p.country === 'CA').length,
          usProducts: productsData.products.filter(p => p.country === 'US').length
        });
      } else {
        updateResult('Products API', 'failed', { error: 'Products API failed' });
        return;
      }

      // Test 2: Step 1 → Step 2 → Step 5 Integration
      updateResult('Step 1→2→5 Integration', 'running', { message: 'Testing data flow integration...' });
      
      const testApplicationData = {
        step1: {
          businessLocation: 'CA',
          fundingAmount: 75000,
          industry: 'construction',
          lookingFor: 'capital'
        },
        step2: {
          selectedCategory: 'Working Capital'
        }
      };

      // Test Step 5 Document Requirements with real data
      const { getDocumentRequirementsIntersection } = await import('../lib/documentIntersection');
      
      const documentResult = await getDocumentRequirementsIntersection(
        testApplicationData.step2.selectedCategory,
        testApplicationData.step1.businessLocation,
        testApplicationData.step1.fundingAmount
      );

      updateResult('Step 1→2→5 Integration', 'passed', {
        inputData: testApplicationData,
        documentResult: {
          eligibleLenders: documentResult.eligibleLenders.length,
          lenderNames: documentResult.eligibleLenders.map(l => l.lenderName || l.name),
          requiredDocuments: documentResult.requiredDocuments,
          hasMatches: documentResult.hasMatches,
          message: documentResult.message
        }
      });

      // Test 3: Complete Application Submission
      updateResult('Application Submission', 'running', { message: 'Submitting complete application...' });
      
      const completeApplication = {
        step1: {
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
        },
        step2: {
          selectedCategory: 'Working Capital',
          selectedCategoryName: 'Working Capital'
        },
        step3: {
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
        },
        step4: {
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
        },
        step5DocumentUpload: { uploadedFiles: [] },
        documents: [],
        documentStatus: 'pending',
        submissionSource: 'end_to_end_test',
        applicationId: `test-${Date.now()}`
      };

      // Get CSRF token first
      let csrfToken = '';
      try {
        const csrfResponse = await fetch('/api/csrf-token', { credentials: 'include' });
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.token || '';
        }
      } catch (csrfError) {
        console.log('CSRF token not available, proceeding without...');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const submissionResponse = await fetch('/api/public/applications', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(completeApplication)
      });

      const submissionResult = await submissionResponse.json();
      setFinalApiResponse(submissionResult);

      if (submissionResponse.ok && submissionResult.success) {
        updateResult('Application Submission', 'passed', {
          applicationId: submissionResult.applicationId || submissionResult.submissionId,
          status: submissionResult.status,
          response: submissionResult
        });

        // Test 4: Staff Backend Verification
        updateResult('Staff Backend Verification', 'running', { message: 'Checking staff backend...' });
        
        try {
          const staffCheckResponse = await fetch('/api/staff/applications', { credentials: 'include' });
          const staffApplications = await staffCheckResponse.json();
          
          if (staffCheckResponse.ok) {
            const foundApplication = staffApplications.applications?.find(
              app => app.id === (submissionResult.applicationId || submissionResult.submissionId)
            );
            
            updateResult('Staff Backend Verification', foundApplication ? 'passed' : 'failed', {
              staffApiStatus: staffCheckResponse.status,
              applicationFound: !!foundApplication,
              totalApplications: staffApplications.applications?.length || 0,
              searchedId: submissionResult.applicationId || submissionResult.submissionId
            });
          } else {
            updateResult('Staff Backend Verification', 'failed', {
              error: `Staff API returned ${staffCheckResponse.status}`,
              response: staffApplications
            });
          }
        } catch (staffError) {
          updateResult('Staff Backend Verification', 'failed', { 
            error: staffError.message,
            note: 'Staff backend may not be accessible from client'
          });
        }

      } else {
        updateResult('Application Submission', 'failed', {
          status: submissionResponse.status,
          error: submissionResult.error || 'Submission failed',
          response: submissionResult
        });
      }

    } catch (error) {
      updateResult('Test Error', 'failed', { error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: FlowTestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running': return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default: return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            End-to-End Application Flow Test
          </CardTitle>
          <p className="text-sm text-gray-600">
            Complete Step 1 → Step 2 → Step 5 → API Submission → Staff Verification
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={runEndToEndTest} 
            disabled={isRunning}
            className="w-full h-12 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            {isRunning ? 'Testing Application Flow...' : 'Run Complete End-to-End Test'}
          </Button>

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              
              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.step}</span>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {result.step === 'Products API' && result.status === 'passed' && (
                        <div>
                          ✅ Loaded {result.details.totalProducts} total products 
                          (CA: {result.details.canadianProducts}, US: {result.details.usProducts})
                        </div>
                      )}
                      
                      {result.step === 'Step 1→2→5 Integration' && result.status === 'passed' && (
                        <div className="space-y-2">
                          <div><strong>Input:</strong> {result.details.inputData.step1.businessLocation} business, 
                          ${result.details.inputData.step1.fundingAmount.toLocaleString()} for {result.details.inputData.step2.selectedCategory}</div>
                          <div><strong>Result:</strong> {result.details.documentResult.eligibleLenders} eligible lenders found</div>
                          <div><strong>Lenders:</strong> {result.details.documentResult.lenderNames.join(', ')}</div>
                          <div><strong>Documents:</strong> {result.details.documentResult.requiredDocuments.join(', ')}</div>
                        </div>
                      )}
                      
                      {result.step === 'Application Submission' && result.status === 'passed' && (
                        <div>
                          ✅ Application ID: <code className="bg-green-100 px-1 rounded">{result.details.applicationId}</code>
                        </div>
                      )}
                      
                      {result.status === 'failed' && (
                        <div className="text-red-600">❌ {result.details.error}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {finalApiResponse && (
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Final API Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(finalApiResponse, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <Alert>
            <Users className="w-4 h-4" />
            <AlertDescription>
              <strong>Test Scenario:</strong> Canadian construction company (Northern Construction Ltd) 
              in Toronto seeking $75,000 working capital. Tests complete data flow from initial 
              financial profile through personalized document requirements and API submission.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}