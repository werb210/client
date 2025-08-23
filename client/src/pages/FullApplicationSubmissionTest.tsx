import { useState } from 'react';
import { useApplicationSubmit } from '../hooks/useApplicationSubmit';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FullApplicationSubmissionTest() {
  const mutation = useApplicationSubmit();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Complete form data based on the attached documents
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

  // Document files to upload (using your provided documents)
  const documentsToUpload = [
    { fileName: "2024 FS.pdf", category: "financial_statement", description: "2024 Financial Statement" },
    { fileName: "2023 FS.pdf", category: "financial_statement", description: "2023 Financial Statement" },
    { fileName: "2022 FS.pdf", category: "financial_statement", description: "2022 Financial Statement" },
    { fileName: "CWB - May 2025.pdf", category: "bank_statement", description: "May 2025 Bank Statement" },
    { fileName: "CWB - April 2025.pdf", category: "bank_statement", description: "April 2025 Bank Statement" },
    { fileName: "CWB - March 2025.pdf", category: "bank_statement", description: "March 2025 Bank Statement" },
    { fileName: "CWB - February 2025.pdf", category: "bank_statement", description: "February 2025 Bank Statement" },
    { fileName: "CWB - January 2025.pdf", category: "bank_statement", description: "January 2025 Bank Statement" },
    { fileName: "CWB - December 2024.pdf", category: "bank_statement", description: "December 2024 Bank Statement" },
    { fileName: "AP.pdf", category: "accounts_payable", description: "Accounts Payable Report" },
    { fileName: "AR.pdf", category: "accounts_receivable", description: "Accounts Receivable Report" }
  ];

  // Create mock file objects for testing (in real scenario these would be actual files)
  const createMockFile = (fileName: string, category: string) => {
    const content = `Mock content for ${fileName} - Category: ${category}\nThis would contain actual document data in production.`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const file = new File([blob], fileName, { type: 'application/pdf' });
    return file;
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    
    try {
      // Create document objects with mock files
      const documents = documentsToUpload.map(doc => ({
        file: createMockFile(doc.fileName, doc.category),
        category: doc.category
      }));

      console.log('🚀 Starting full application submission test...');
      console.log('📋 Form Data:', formData);
      console.log('📁 Documents to upload:', documents.length);

      // Submit the complete application
      const result = await mutation.mutateAsync({ 
        formData, 
        documents 
      });

      setSubmissionResult(result);
      
      toast({
        title: "Application Submitted Successfully!",
        description: `Application ID: ${result?.applicationId || 'Generated'}. All ${documents.length} documents uploaded and application finalized.`,
      });

      console.log('✅ Application submission completed successfully:', result);

    } catch (error) {
      console.error('❌ Application submission failed:', error);
      
      setSubmissionResult({ error: error.message });
      
      toast({
        title: "Application Submission Failed",
        description: error.message || 'An unexpected error occurred during submission.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Complete Application Submission Test
            <Badge variant="outline">Production Ready</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Business Information</h4>
              <ul className="text-sm space-y-1">
                <li>• Company: {formData.step3.operatingName}</li>
                <li>• Industry: {formData.step1.industry}</li>
                <li>• Requested Amount: ${formData.step1.requestedAmount.toLocaleString()}</li>
                <li>• Purpose: {formData.step1.use_of_funds}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Applicant Information</h4>
              <ul className="text-sm space-y-1">
                <li>• Name: {formData.step4.applicantFirstName} {formData.step4.applicantLastName}</li>
                <li>• Title: {formData.step4.title}</li>
                <li>• Email: {formData.step4.applicantEmail}</li>
                <li>• Ownership: {formData.step4.ownershipPercentage}%</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Documents to Upload ({documentsToUpload.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {documentsToUpload.map((doc, index) => (
                <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                  <Badge variant="secondary" className="text-xs mb-1">{doc.category}</Badge>
                  <div>{doc.fileName}</div>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSubmitApplication}
            disabled={isSubmitting || mutation.isPending}
            className="w-full"
            size="lg"
          >
            {isSubmitting || mutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Submitting Application...
              </>
            ) : (
              '🚀 Submit Complete Application'
            )}
          </Button>

          {submissionResult && (
            <Card className={submissionResult.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">
                  {submissionResult.error ? "❌ Submission Failed" : "✅ Submission Successful"}
                </h4>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                  {JSON.stringify(submissionResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}