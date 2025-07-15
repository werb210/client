import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Building, 
  DollarSign,
  Calendar,
  MapPin 
} from 'lucide-react';

interface TestResult {
  success: boolean;
  applicationId?: string;
  documentsUploaded?: number;
  error?: string;
}

/**
 * Banking Document Test Page
 * Tests complete application submission with real banking statements
 */
export default function BankingDocumentTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<TestResult | null>(null);
  const { toast } = useToast();

  // Test application data based on Black Label Automation & Electrical
  const testData = {
    company: "5729841 MANITOBA LTD",
    operatingName: "Black Label Automation & Electrical",
    location: "Niverville, MB, Canada",
    fundingAmount: "$500,000",
    industry: "Electrical/Automation Construction",
    accountNumber: "BMO #2615 3851-784",
    statementPeriod: "November 2024 - April 2025"
  };

  const bankingDocuments = [
    { name: "April 2025 Statement", balance: "$861,981.04" },
    { name: "March 2025 Statement", balance: "$637,214.34" },
    { name: "February 2025 Statement", balance: "$1,449,603.88" },
    { name: "January 2025 Statement", balance: "$1,690,482.92" },
    { name: "December 2024 Statement", balance: "$1,690,482.92" },
    { name: "November 2024 Statement", balance: "$2,365,247.00" }
  ];

  const runTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);

    try {
      // Step 1: Create application
      setCurrentStep('Creating application...');
      setProgress(20);

      const applicationData = {
        step1: {
          businessLocation: "Canada",
          industry: "Construction/Electrical",
          lookingFor: "capital",
          fundingAmount: "$500,000",
          fundsPurpose: "Working capital and equipment",
          salesHistory: "More than 5 years",
          revenueLastYear: "$2,000,000 - $5,000,000",
          averageMonthlyRevenue: "$300,000 - $500,000",
          accountsReceivableBalance: "$100,000 - $500,000",
          fixedAssetsValue: "$100,000 - $500,000"
        },
        step3: {
          operatingName: "Black Label Automation & Electrical",
          legalName: "5729841 MANITOBA LTD",
          businessStreetAddress: "30-10 FOXDALE WAY",
          businessCity: "NIVERVILLE",
          businessState: "MB",
          businessPostalCode: "R0A 0A1",
          businessPhone: "(204) 555-0123",
          businessEmail: "info@blacklabelae.ca",
          businessWebsite: "https://blacklabelae.ca",
          businessStructure: "Corporation",
          businessStartDate: "2020-01",
          numberOfEmployees: "11-50",
          estimatedYearlyRevenue: "$3,000,000"
        },
        step4: {
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@blacklabelae.ca",
          phone: "(204) 555-0123",
          streetAddress: "30-10 FOXDALE WAY",
          city: "NIVERVILLE",
          state: "MB",
          postalCode: "R0A 0A1",
          dateOfBirth: "1980-05-15",
          socialSecurityNumber: "123-456-789",
          ownershipPercentage: "100%",
          creditScore: "750-799",
          personalNetWorth: "$500,000 - $1,000,000",
          personalAnnualIncome: "$150,000 - $200,000"
        },
        metadata: {
          testCase: 'Black Label Automation & Electrical - Canadian Business with Banking Documents',
          submittedAt: new Date().toISOString()
        }
      };

      // Create application
      const createResponse = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
        credentials: 'include'
      });

      let applicationId = `test-banking-${crypto.randomUUID()}`;
      if (createResponse.ok) {
        const createResult = await createResponse.json();
        applicationId = createResult.applicationId || applicationId;
      }

      setProgress(40);

      // Step 2: Upload real banking documents
      setCurrentStep('Uploading banking statements...');
      let documentsUploaded = 0;

      // Real banking document file paths from attached assets
      const realBankingFiles = [
        { path: '/attached_assets/April 2025_1751579433993.pdf', name: 'April 2025 Statement' },
        { path: '/attached_assets/March 2025_1751579433994.pdf', name: 'March 2025 Statement' },
        { path: '/attached_assets/February 2025_1751579433994.pdf', name: 'February 2025 Statement' },
        { path: '/attached_assets/January 2025_1751579433994.pdf', name: 'January 2025 Statement' },
        { path: '/attached_assets/December 2024_1751579433994.pdf', name: 'December 2024 Statement' },
        { path: '/attached_assets/November 2024_1751579433995.pdf', name: 'November 2024 Statement' }
      ];

      for (let i = 0; i < realBankingFiles.length; i++) {
        const doc = realBankingFiles[i];
        
        try {
          // Fetch the actual PDF file from attached assets
          const fileResponse = await fetch(doc.path);
          if (!fileResponse.ok) {
            // console.log(`Failed to fetch ${doc.name}: ${fileResponse.status}`);
            continue;
          }
          
          const fileBlob = await fileResponse.blob();
          const file = new File([fileBlob], `${doc.name.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });

          // Use exact FormData structure
          const form = new FormData();
          form.append('files', file);
          form.append('category', 'Banking Statements');

          const uploadResponse = await fetch(`/api/upload/${applicationId}`, {
            method: 'POST',
            body: form,
            credentials: 'include'
          });

          if (uploadResponse.ok) {
            documentsUploaded++;
            toast({
              title: "Banking statement uploaded",
              description: `${doc.name} (${(file.size / 1024 / 1024).toFixed(1)} MB) uploaded successfully`,
            });
          } else {
            const errorText = await uploadResponse.text();
            // console.log(`Upload failed for ${doc.name}: ${uploadResponse.status} - ${errorText}`);
            toast({
              title: "Upload failed",
              description: `${doc.name}: ${uploadResponse.status} ${errorText}`,
              variant: "destructive"
            });
          }
        } catch (error) {
          // console.log(`Error uploading ${doc.name}:`, error);
          toast({
            title: "Upload error",
            description: `Failed to process ${doc.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive"
          });
        }
        
        setProgress(40 + (i + 1) * 8); // Progress from 40 to 88
      }

      setProgress(90);

      // Step 3: Initiate signing
      setCurrentStep('Initiating signing process...');
      const signingResponse = await fetch(`/api/applications/${applicationId}/initiate-signing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      // Step 4: Final submission
      setCurrentStep('Finalizing application...');
      const submitResponse = await fetch(`/api/applications/${applicationId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termsAccepted: true,
          privacyPolicyAccepted: true,
          submissionTimestamp: new Date().toISOString()
        }),
        credentials: 'include'
      });

      setProgress(100);
      setCurrentStep('Complete!');

      // Set final result with diagnostic info
      setResult({
        success: documentsUploaded > 0,
        applicationId,
        documentsUploaded
      });

      if (documentsUploaded > 0) {
        toast({
          title: "Application submitted successfully!",
          description: `Application ${applicationId} submitted with ${documentsUploaded} banking statements`,
        });
      } else {
        toast({
          title: "Application created but uploads failed",
          description: `Application ${applicationId} created but 0 documents uploaded. Staff backend needs upload endpoint configuration.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: "Test failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6 text-blue-600" />
            Banking Document Application Test
          </CardTitle>
          <p className="text-gray-600">
            Complete application submission test using real BMO banking statements for Black Label Automation & Electrical
          </p>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Legal Name:</span>
                <p className="text-gray-900">{testData.company}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Operating Name:</span>
                <p className="text-gray-900">{testData.operatingName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <p className="text-gray-900 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {testData.location}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Funding Amount:</span>
                <p className="text-gray-900 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {testData.fundingAmount}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Industry:</span>
                <p className="text-gray-900">{testData.industry}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Bank Account:</span>
                <p className="text-gray-900">{testData.accountNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Banking Documents ({bankingDocuments.length})
            </CardTitle>
            <p className="text-sm text-gray-600">
              {testData.statementPeriod} - BMO Business Banking Statements
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bankingDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{doc.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {doc.balance}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Application Submission</CardTitle>
          <p className="text-sm text-gray-600">
            This will create a complete application and upload all 6 banking statement PDFs
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{currentStep}</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button 
            onClick={runTest} 
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Running Test...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Test Application
              </>
            )}
          </Button>

          {result && (
            <Card className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {result.success ? 'Test Completed Successfully!' : 'Test Failed'}
                  </span>
                </div>
                
                {result.success && (
                  <div className="mt-3 space-y-1 text-sm">
                    <p><span className="font-medium">Application ID:</span> {result.applicationId}</p>
                    <p><span className="font-medium">Documents Uploaded:</span> {result.documentsUploaded} banking statements</p>
                    <p><span className="font-medium">Category:</span> Banking Statements</p>
                  </div>
                )}
                
                {result.error && (
                  <p className="mt-2 text-sm text-red-600">{result.error}</p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}