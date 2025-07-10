import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { staffApi } from '@/api/staffApi';

export default function ApplicationCreationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testApplicationCreation = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🧪 Testing application creation...');
      
      // Sample application data matching the required structure
      const applicationData = {
        step1: {
          businessLocation: 'Canada',
          industry: 'Technology',
          lookingFor: 'capital',
          fundingAmount: 40000,
          salesHistory: '1_to_2_years',
          lastYearRevenue: 150000,
          averageMonthlyRevenue: 12500,
          currentAccountReceivableBalance: 25000,
          fixedAssetsValue: 50000,
          equipmentValue: 0,
          fundsPurpose: 'working_capital'
        },
        step3: {
          operatingName: 'Test Company Ltd',
          legalName: 'Test Company Limited',
          businessStreetAddress: '123 Test Street',
          businessCity: 'Toronto',
          businessState: 'Ontario',
          businessPostalCode: 'M5V 3A8',
          businessPhone: '(416) 555-0123',
          businessWebsite: 'https://testcompany.com',
          businessStructure: 'corporation',
          businessStartDate: '2020-01-15',
          numberOfEmployees: 5,
          estimatedYearlyRevenue: 150000,
          primaryBankName: 'Royal Bank of Canada',
          bankingRelationshipLength: '2_to_5_years'
        },
        step4: {
          firstName: 'John',
          lastName: 'Smith',
          title: 'CEO',
          personalEmail: 'john.smith@testcompany.com',
          personalPhone: '(416) 555-0456',
          dateOfBirth: '1985-03-15',
          socialSecurityNumber: '123 456 789',
          ownershipPercentage: 75,
          creditScore: 'good_700_749',
          personalAnnualIncome: '85000',
          applicantAddress: '456 Residential St',
          applicantCity: 'Toronto',
          applicantState: 'Ontario',
          applicantPostalCode: 'M4W 1A8',
          yearsWithBusiness: '3',
          previousLoans: 'yes',
          bankruptcyHistory: 'no',
          // Partner fields
          partnerFirstName: 'Jane',
          partnerLastName: 'Doe',
          partnerEmail: 'jane.doe@testcompany.com',
          partnerPhone: '(416) 555-0789',
          partnerDateOfBirth: '1987-07-22',
          partnerSinSsn: '987 654 321',
          partnerOwnershipPercentage: 25,
          partnerCreditScore: 'excellent_750_plus',
          partnerPersonalAnnualIncome: '75000',
          partnerAddress: '789 Partner Lane',
          partnerCity: 'Toronto',
          partnerState: 'Ontario',
          partnerPostalCode: 'M6K 2B3'
        }
      };

      console.log('📝 Test application data:', applicationData);

      const response = await staffApi.createApplication(applicationData);
      
      setResult(response);
      console.log('✅ Test application created:', response);

    } catch (error) {
      console.error('❌ Test application creation failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const testSignNowCreation = async () => {
    if (!result?.applicationId) {
      setError('No application ID available. Create an application first.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🧪 Testing SignNow document creation...');
      
      const signNowResponse = await staffApi.createSignNowDocument(result.applicationId);
      
      setResult(prev => ({ ...prev, signNow: signNowResponse }));
      console.log('✅ Test SignNow document created:', signNowResponse);

    } catch (error) {
      console.error('❌ Test SignNow creation failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-teal-700 mb-4">Application Creation Test</h1>
        <p className="text-gray-600">
          Test the complete application creation and SignNow integration workflow
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Application Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={testApplicationCreation} 
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isLoading ? 'Creating Application...' : 'Create Test Application'}
            </Button>
            
            <Button 
              onClick={testSignNowCreation} 
              disabled={isLoading || !result?.applicationId}
              variant="outline"
            >
              {isLoading ? 'Creating SignNow...' : 'Test SignNow Creation'}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Success</h3>
              <div className="text-green-700 text-sm space-y-2">
                {result.applicationId && (
                  <p><strong>Application ID:</strong> {result.applicationId}</p>
                )}
                {result.status && (
                  <p><strong>Status:</strong> {result.status}</p>
                )}
                {result.signNow && (
                  <div>
                    <p><strong>SignNow Status:</strong> {result.signNow.status}</p>
                    {result.signNow.signUrl && (
                      <p><strong>Sign URL:</strong> {result.signNow.signUrl}</p>
                    )}
                  </div>
                )}
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-green-800 font-medium">
                  View Response Details
                </summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Data Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            The test uses a Canadian business with complete step1, step3, and step4 data
            as required by the staff backend API.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold text-blue-800">Step 1</h4>
              <p className="text-blue-700">Financial Profile</p>
              <p className="text-blue-600">$40K Canadian working capital</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <h4 className="font-semibold text-green-800">Step 3</h4>
              <p className="text-green-700">Business Details</p>
              <p className="text-green-600">Toronto-based corporation</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <h4 className="font-semibold text-purple-800">Step 4</h4>
              <p className="text-purple-700">Applicant Info</p>
              <p className="text-purple-600">2 partners (75%/25%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
          onClick={() => window.location.href = '/apply/step-1'}
          variant="outline"
        >
          Back to Application
        </Button>
      </div>
    </div>
  );
}