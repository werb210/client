import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import { buildRequiredDocList, type RequiredDoc } from '@/lib/documentRequirements';

interface FormData {
  fundingAmount: string;
  lookingFor: string;
  country: string;
  accountsReceivableBalance: string;
  businessLocation: string;
  salesHistory: string;
  lastYearRevenue: string;
  averageMonthlyRevenue: string;
  fixedAssetsValue: string;
}

const initialFormData: FormData = {
  fundingAmount: '',
  lookingFor: '',
  country: 'US',
  accountsReceivableBalance: '',
  businessLocation: 'US',
  salesHistory: '',
  lastYearRevenue: '',
  averageMonthlyRevenue: '',
  fixedAssetsValue: ''
};

// Step 1 form options matching the actual application
const fundingAmountOptions = [
  { value: '10000', label: '$10,000 - $25,000' },
  { value: '25000', label: '$25,000 - $50,000' },
  { value: '50000', label: '$50,000 - $100,000' },
  { value: '100000', label: '$100,000 - $250,000' },
  { value: '250000', label: '$250,000 - $500,000' },
  { value: '500000', label: '$500,000+' }
];

const lookingForOptions = [
  { value: 'equipment', label: 'Equipment Financing' },
  { value: 'capital', label: 'Capital / Working Capital' },
  { value: 'both', label: 'Both Capital & Equipment' }
];

const accountsReceivableOptions = [
  { value: 'none', label: 'No Account Receivables' },
  { value: '10000', label: '$10,000 - $25,000' },
  { value: '25000', label: '$25,000 - $50,000' },
  { value: '50000', label: '$50,000 - $100,000' },
  { value: '100000', label: '$100,000 - $250,000' },
  { value: '250000', label: '$250,000+' }
];

export default function DocumentRequirementsTest() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [documents, setDocuments] = useState<RequiredDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canCalculateDocuments = formData.fundingAmount && formData.lookingFor;

  const calculateDocuments = async () => {
    if (!canCalculateDocuments) return;

    setIsLoading(true);
    setError(null);

    try {
      const wizardData = {
        country: formData.country as 'US' | 'CA',
        fundingAmount: parseInt(formData.fundingAmount),
        lookingFor: formData.lookingFor as 'equipment' | 'capital' | 'both',
        selectedProducts: [], // Will be populated by the system based on matching
        accountsReceivableBalance: formData.accountsReceivableBalance !== 'none' ? formData.accountsReceivableBalance : undefined
      };

      // console.log('📋 Calculating documents for:', wizardData);
      
      const requiredDocs = await buildRequiredDocList(wizardData);
      setDocuments(requiredDocs);
      
      // console.log('📄 Found documents:', requiredDocs.map((d: RequiredDoc) => d.label));
      
    } catch (err) {
      console.error('Error calculating documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate document requirements');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Document Requirements Calculator</h1>
          <p className="text-gray-600">
            Fill out the Step 1 form fields to see exactly what documents you'll need in Step 5
          </p>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Real-time calculation using 43+ product database
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Step 1 Form Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Step 1: Business Information
              </CardTitle>
              <CardDescription>
                Complete these fields as you would in the actual application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Funding Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  How much funding do you need? *
                </label>
                <Select value={formData.fundingAmount} onValueChange={(value) => updateFormData('fundingAmount', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select funding amount" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundingAmountOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* What are you looking for */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  What are you looking for? *
                </label>
                <Select value={formData.lookingFor} onValueChange={(value) => updateFormData('lookingFor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select financing type" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookingForOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Business Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Where is your business located?
                </label>
                <Select value={formData.businessLocation} onValueChange={(value) => updateFormData('businessLocation', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Accounts Receivable Balance */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Current Account Receivable balance
                </label>
                <Select value={formData.accountsReceivableBalance} onValueChange={(value) => updateFormData('accountsReceivableBalance', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AR balance" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountsReceivableOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Calculate Button */}
              <Button 
                onClick={calculateDocuments}
                disabled={!canCalculateDocuments || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Calculating Requirements...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Calculate Document Requirements
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 5 Document Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Step 5: Required Documents
              </CardTitle>
              <CardDescription>
                These are the documents you'll need to upload based on your selections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canCalculateDocuments ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Complete the required fields above to see document requirements</p>
                </div>
              ) : documents.length === 0 && !isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <Button variant="outline" onClick={calculateDocuments}>
                    Calculate Requirements
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{doc.label}</div>
                        {doc.description && (
                          <div className="text-sm text-gray-600 mt-1">{doc.description}</div>
                        )}
                        {doc.quantity && doc.quantity > 1 && (
                          <Badge variant="secondary" className="mt-2">
                            {doc.quantity} documents required
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {documents.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Total: {documents.length} documents required
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Example Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Common Scenarios</CardTitle>
            <CardDescription>
              Quick examples to test the document requirement system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 text-left"
                onClick={() => {
                  setFormData({
                    ...initialFormData,
                    fundingAmount: '50000',
                    lookingFor: 'capital',
                    businessLocation: 'US',
                    accountsReceivableBalance: 'none'
                  });
                }}
              >
                <div>
                  <div className="font-medium">$40K Working Capital</div>
                  <div className="text-sm text-gray-600">US business, no AR</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 text-left"
                onClick={() => {
                  setFormData({
                    ...initialFormData,
                    fundingAmount: '100000',
                    lookingFor: 'equipment',
                    businessLocation: 'CA',
                    accountsReceivableBalance: 'none'
                  });
                }}
              >
                <div>
                  <div className="font-medium">$100K Equipment</div>
                  <div className="text-sm text-gray-600">Canadian business</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 text-left"
                onClick={() => {
                  setFormData({
                    ...initialFormData,
                    fundingAmount: '250000',
                    lookingFor: 'both',
                    businessLocation: 'US',
                    accountsReceivableBalance: '100000'
                  });
                }}
              >
                <div>
                  <div className="font-medium">$250K Mixed</div>
                  <div className="text-sm text-gray-600">US business with AR</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}