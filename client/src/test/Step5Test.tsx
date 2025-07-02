import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DynamicDocumentRequirements, type UploadedFile } from '../components/DynamicDocumentRequirements';

export default function Step5Test() {
  const [testFormData, setTestFormData] = useState({
    headquarters: 'US',
    lookingFor: 'capital',
    fundingAmount: 50000,
    accountsReceivableBalance: 10000,
    fundsPurpose: 'working_capital'
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [allRequirementsComplete, setAllRequirementsComplete] = useState(false);
  const [totalRequirements, setTotalRequirements] = useState(0);
  const [completedRequirements, setCompletedRequirements] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState('Term Loan');

  const handleRequirementsChange = (allComplete: boolean, total: number, completed: number) => {
    setAllRequirementsComplete(allComplete);
    setTotalRequirements(total);
    setCompletedRequirements(completed);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Step 5 Document Upload Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Headquarters:</label>
                <select 
                  value={testFormData.headquarters}
                  onChange={(e) => setTestFormData(prev => ({...prev, headquarters: e.target.value}))}
                  className="w-full p-2 border rounded"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Looking For:</label>
                <select 
                  value={testFormData.lookingFor}
                  onChange={(e) => setTestFormData(prev => ({...prev, lookingFor: e.target.value}))}
                  className="w-full p-2 border rounded"
                >
                  <option value="capital">Capital</option>
                  <option value="equipment">Equipment</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Selected Product:</label>
                <select 
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Term Loan">Term Loan</option>
                  <option value="Equipment Financing">Equipment Financing</option>
                  <option value="Line of Credit">Line of Credit</option>
                  <option value="Invoice Factoring">Invoice Factoring</option>
                  <option value="Working Capital">Working Capital</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Funding Amount:</label>
                <input 
                  type="number"
                  value={testFormData.fundingAmount}
                  onChange={(e) => setTestFormData(prev => ({...prev, fundingAmount: parseInt(e.target.value)}))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            {/* Status Display */}
            <div className="bg-blue-50 p-4 rounded border">
              <h3 className="font-semibold text-blue-900 mb-2">Document Upload Status</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Total Requirements:</span>
                  <p className="font-medium">{totalRequirements}</p>
                </div>
                <div>
                  <span className="text-blue-600">Completed:</span>
                  <p className="font-medium">{completedRequirements}</p>
                </div>
                <div>
                  <span className="text-blue-600">Files Uploaded:</span>
                  <p className="font-medium">{uploadedFiles.length}</p>
                </div>
                <div>
                  <span className="text-blue-600">All Complete:</span>
                  <p className={`font-medium ${allRequirementsComplete ? 'text-green-600' : 'text-red-600'}`}>
                    {allRequirementsComplete ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Requirements Component */}
        <DynamicDocumentRequirements
          formData={testFormData}
          uploadedFiles={uploadedFiles}
          onFilesUploaded={setUploadedFiles}
          onRequirementsChange={handleRequirementsChange}
          selectedProduct={selectedProduct}
        />

        {/* Continue Button Test */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Button variant="outline">
                Previous
              </Button>
              <Button 
                disabled={!allRequirementsComplete}
                className={allRequirementsComplete ? '' : 'opacity-50 cursor-not-allowed'}
              >
                {allRequirementsComplete 
                  ? "Continue to Next Step" 
                  : `Complete Documents (${completedRequirements}/${totalRequirements})`
                }
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <details className="text-xs">
              <summary className="cursor-pointer font-medium">Form Data & Files</summary>
              <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify({ testFormData, uploadedFiles }, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}