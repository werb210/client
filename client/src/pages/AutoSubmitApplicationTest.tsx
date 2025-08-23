import { useEffect } from 'react';
import { useApplicationSubmit } from '../hooks/useApplicationSubmit';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AutoSubmitApplicationTest() {
  const mutation = useApplicationSubmit();
  const { toast } = useToast();

  // Complete application data with all your documents
  const formData = {
    step1: {
      requestedAmount: 500000,
      use_of_funds: "Equipment Purchase",
      headquarters: "Canada",
      industry: "Manufacturing",
      salesHistory: "3-5 years", 
      averageMonthlyRevenue: 75000,
      accountsReceivableBalance: 120000,
      fixedAssetsValue: 300000,
      equipmentValue: 200000
    },
    step3: {
      operatingName: "Boreal Manufacturing Inc.",
      legalName: "Boreal Manufacturing Incorporated",
      businessAddress: "123 Industrial Ave",
      businessCity: "Toronto",
      businessState: "Ontario", 
      businessZipCode: "M5V 3A8",
      businessPhone: "416-555-0123",
      businessEmail: "info@borealmanufacturing.ca",
      businessWebsite: "https://borealmanufacturing.ca",
      businessStructure: "Corporation",
      businessRegistrationDate: "2020-03-15",
      businessTaxId: "123456789RT0001",
      businessDescription: "Advanced manufacturing company specializing in precision equipment and industrial components with 25 years of experience in the Canadian market.",
      numberOfEmployees: 45,
      primaryBankName: "Canadian Western Bank", 
      bankingRelationshipLength: "5+ years"
    },
    step4: {
      applicantFirstName: "Michael",
      applicantLastName: "Thompson", 
      applicantEmail: "michael.thompson@borealmanufacturing.ca",
      applicantPhone: "416-555-0124",
      ownershipPercentage: "75",
      title: "President & CEO",
      applicantDateOfBirth: "1975-08-22",
      applicantSSN: "123-45-6789",
      personalEmail: "michael.thompson@gmail.com",
      personalPhone: "416-555-9876",
      homeAddress: "456 Maple Street",
      homeCity: "Toronto", 
      homeState: "Ontario",
      homeZipCode: "M4R 2B3",
      personalIncome: "$150,000-$199,999",
      creditScore: "750-800",
      yearsWithBusiness: "5+",
      previousLoans: "Yes - successfully repaid",
      bankruptcyHistory: "No"
    },
    productId: "equipment_financing_001",
    clientId: "client_boreal_001"
  };

  const createMockFile = (fileName: string, category: string) => {
    const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj  
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT/F1 12 Tf 72 720 Td(${fileName} - ${category})Tj ET
endstream endobj
xref 0 5
0000000000 65535 f 0000000009 00000 n 0000000058 00000 n 0000000115 00000 n 0000000214 00000 n
trailer<</Size 5/Root 1 0 R>>startxref 309 %%EOF`;
    const blob = new Blob([content], { type: 'application/pdf' });
    return new File([blob], fileName, { type: 'application/pdf' });
  };

  // Auto-submit when component loads
  useEffect(() => {
    const submitApplication = async () => {
      console.log('🚀 AUTO-SUBMITTING COMPLETE APPLICATION...');
      
      try {
        // Create documents based on your attached files
        const documents = [
          { file: createMockFile("2024_FS.pdf", "financial_statement"), category: "financial_statement" },
          { file: createMockFile("2023_FS.pdf", "financial_statement"), category: "financial_statement" },
          { file: createMockFile("2022_FS.pdf", "financial_statement"), category: "financial_statement" },
          { file: createMockFile("CWB_May_2025.pdf", "bank_statement"), category: "bank_statement" },
          { file: createMockFile("CWB_April_2025.pdf", "bank_statement"), category: "bank_statement" },
          { file: createMockFile("CWB_March_2025.pdf", "bank_statement"), category: "bank_statement" },
          { file: createMockFile("CWB_February_2025.pdf", "bank_statement"), category: "bank_statement" },
          { file: createMockFile("CWB_January_2025.pdf", "bank_statement"), category: "bank_statement" },
          { file: createMockFile("CWB_December_2024.pdf", "bank_statement"), category: "bank_statement" },
          { file: createMockFile("Accounts_Payable.pdf", "accounts_payable"), category: "accounts_payable" },
          { file: createMockFile("Accounts_Receivable.pdf", "accounts_receivable"), category: "accounts_receivable" }
        ];

        console.log(`📋 Submitting application for: ${formData.step3.operatingName}`);
        console.log(`💰 Requested Amount: $${formData.step1.requestedAmount.toLocaleString()}`);
        console.log(`📁 Documents: ${documents.length} files`);

        const result = await mutation.mutateAsync({ formData, documents });

        console.log('✅ APPLICATION SUBMITTED SUCCESSFULLY!');
        console.log('📊 Result:', result);

        toast({
          title: "🎉 Application Submitted Successfully!",
          description: `Application ID: ${result?.applicationId || 'Generated'}. All ${documents.length} documents uploaded and processed.`,
        });

      } catch (error) {
        console.error('❌ Application submission failed:', error);
        
        toast({
          title: "❌ Application Submission Failed",
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          variant: "destructive",
        });
      }
    };

    // Auto-submit after a short delay
    const timer = setTimeout(submitApplication, 1000);
    return () => clearTimeout(timer);
  }, [mutation, toast]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Auto-Submitting Complete Application
            <Badge variant="outline" className="animate-pulse">RUNNING</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-600">✅ Business Details</h4>
                <p className="text-sm">{formData.step3.operatingName}</p>
                <p className="text-sm text-gray-600">{formData.step1.industry} • ${formData.step1.requestedAmount.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-600">✅ Applicant Info</h4>
                <p className="text-sm">{formData.step4.applicantFirstName} {formData.step4.applicantLastName}</p>
                <p className="text-sm text-gray-600">{formData.step4.title} • {formData.step4.ownershipPercentage}% Owner</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-green-600">✅ Documents (11 files)</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• 2024 Financial Statement</div>
                <div>• 2023 Financial Statement</div>
                <div>• 2022 Financial Statement</div>
                <div>• May 2025 Bank Statement</div>
                <div>• April 2025 Bank Statement</div>
                <div>• March 2025 Bank Statement</div>
                <div>• February 2025 Bank Statement</div>
                <div>• January 2025 Bank Statement</div>
                <div>• December 2024 Bank Statement</div>
                <div>• Accounts Payable Report</div>
                <div>• Accounts Receivable Report</div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="font-medium text-blue-700">
                  {mutation.isPending ? 'Submitting application...' : 'Preparing submission...'}
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Creating application → Uploading documents → Finalizing submission
              </p>
            </div>

            {mutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-700">Submission Failed</h4>
                <p className="text-sm text-red-600">Check console for details</p>
              </div>
            )}

            {mutation.isSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-700">🎉 Application Submitted!</h4>
                <p className="text-sm text-green-600">Check console for submission details</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}