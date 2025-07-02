import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DynamicDocumentRequirements, type UploadedFile } from '@/components/DynamicDocumentRequirements';
import { Badge } from '@/components/ui/badge';

export default function UnifiedDocumentTest() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Test scenarios showing how unified document requirements work
  const testScenarios = [
    {
      title: "Equipment Financing - US $80K",
      description: "Single equipment financing product selection",
      formData: {
        lookingFor: "equipment",
        businessLocation: "United States", 
        fundingAmount: "$80000",
        selectedProducts: [
          { id: "1", name: "Equipment Loan", category: "equipment_financing", product_type: "equipment_financing" }
        ]
      },
      expectedCategories: ["equipment_financing"],
      expectedDocs: "Equipment-specific documents + standard business docs"
    },
    {
      title: "Both Capital + Equipment - CA $250K", 
      description: "Multiple product types selected",
      formData: {
        lookingFor: "both",
        businessLocation: "Canada",
        fundingAmount: "$250000", 
        accountsReceivableBalance: "$50000",
        selectedProducts: [
          { id: "2", name: "Business Line of Credit", category: "line_of_credit", product_type: "line_of_credit" },
          { id: "3", name: "Equipment Financing", category: "equipment_financing", product_type: "equipment_financing" }
        ]
      },
      expectedCategories: ["line_of_credit", "equipment_financing"],
      expectedDocs: "Union of LOC + Equipment + Base documents (no duplicates)"
    },
    {
      title: "Multiple Factoring Products",
      description: "Multiple products in same category",
      formData: {
        lookingFor: "capital",
        businessLocation: "United States",
        fundingAmount: "$150000",
        accountsReceivableBalance: "$75000",
        selectedProducts: [
          { id: "4", name: "Invoice Factoring Pro", category: "factoring", product_type: "invoice_factoring" },
          { id: "5", name: "Advanced Factoring", category: "factoring", product_type: "invoice_factoring" }
        ]
      },
      expectedCategories: ["term_loan", "invoice_factoring"],
      expectedDocs: "Unique union - AR aging + business docs (no duplicates despite 2 factoring products)"
    },
    {
      title: "Working Capital Focus",
      description: "Working capital with mixed product selection",
      formData: {
        lookingFor: "capital",
        businessLocation: "Canada",
        fundingAmount: "$100000",
        selectedProducts: [
          { id: "6", name: "Working Capital Loan", category: "working_capital", product_type: "working_capital" },
          { id: "7", name: "Term Loan", category: "term_loan", product_type: "term_loan" }
        ]
      },
      expectedCategories: ["term_loan", "working_capital"], 
      expectedDocs: "Working capital + term loan specific documents"
    }
  ];

  const scenario = testScenarios[currentScenario];

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleRequirementsChange = (allComplete: boolean, totalRequirements: number) => {
    console.log(`📋 Requirements status: ${allComplete ? 'Complete' : 'Incomplete'} (${totalRequirements} total)`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Unified Document Requirements Testing
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            This demonstrates the new unified logic that consolidates document requirements 
            from ALL matching lender products and eliminates duplicates.
          </p>
        </div>

        {/* Scenario Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {testScenarios.map((test, index) => (
                <Button
                  key={index}
                  variant={currentScenario === index ? "default" : "outline"}
                  onClick={() => setCurrentScenario(index)}
                  className="p-4 h-auto text-left flex flex-col items-start"
                >
                  <span className="font-semibold">{test.title}</span>
                  <span className="text-sm opacity-70">{test.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Scenario Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Current Test: {scenario.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Form Data */}
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Form Data Input:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Looking For:</strong> {scenario.formData.lookingFor}</div>
                  <div><strong>Location:</strong> {scenario.formData.businessLocation}</div>
                  <div><strong>Amount:</strong> {scenario.formData.fundingAmount}</div>
                  {scenario.formData.accountsReceivableBalance && (
                    <div><strong>AR Balance:</strong> {scenario.formData.accountsReceivableBalance}</div>
                  )}
                </div>
              </div>

              {/* Selected Products */}
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Selected Products:</h4>
                <div className="space-y-2">
                  {scenario.formData.selectedProducts.map((product, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Badge variant="outline">{product.category}</Badge>
                      <span className="text-sm">{product.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Expected Results */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-blue-900 mb-2">Expected Logic:</h4>
              <div className="text-sm space-y-1">
                <div><strong>Document Categories:</strong> {scenario.expectedCategories.join(', ')}</div>
                <div><strong>Expected Result:</strong> {scenario.expectedDocs}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unified Document Requirements Component */}
        <Card>
          <CardHeader>
            <CardTitle>Unified Document Requirements Result</CardTitle>
            <p className="text-sm text-gray-600">
              This shows the actual unified requirements generated by the new system
            </p>
          </CardHeader>
          <CardContent>
            <DynamicDocumentRequirements
              formData={scenario.formData}
              uploadedFiles={uploadedFiles}
              onFilesUploaded={handleFilesUploaded}
              selectedProduct={scenario.formData.selectedProducts[0]?.name}
              onRequirementsChange={handleRequirementsChange}
            />
          </CardContent>
        </Card>

        {/* Implementation Details */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">✅ Unified Logic Implementation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <strong className="text-green-900">1. Category Determination:</strong> 
              <span className="ml-2">Maps user selection + product types → document categories</span>
            </div>
            <div>
              <strong className="text-green-900">2. Multi-API Calls:</strong>
              <span className="ml-2">Fetches requirements for ALL categories in parallel</span>
            </div>
            <div>
              <strong className="text-green-900">3. Deduplication:</strong>
              <span className="ml-2">Merges all results, removes duplicates by document ID/label</span>
            </div>
            <div>
              <strong className="text-green-900">4. Fallback System:</strong>
              <span className="ml-2">Uses standard business documents as base requirements</span>
            </div>
            <div>
              <strong className="text-green-900">5. No 8-Product Database:</strong>
              <span className="ml-2">Exclusively uses 43+ product staff database, zero fallback</span>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}