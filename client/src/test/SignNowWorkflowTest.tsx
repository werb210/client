import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  FileSignature,
  Loader2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface TestDocument {
  category: string;
  label: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  fileName?: string;
}

interface MockWorkflowState {
  step: 'documents' | 'finalizing' | 'signing' | 'complete';
  documents: TestDocument[];
  applicationId: string;
  signUrl?: string;
  error?: string;
}

export default function SignNowWorkflowTest() {
  const [workflow, setWorkflow] = useState<MockWorkflowState>({
    step: 'documents',
    applicationId: 'test-app-123',
    documents: [
      { category: 'bank_statements', label: 'Bank Statements (Last 3 months)', status: 'pending' },
      { category: 'tax_returns', label: 'Business Tax Returns (Last 2 years)', status: 'pending' },
      { category: 'financial_statements', label: 'Financial Statements', status: 'pending' },
      { category: 'business_license', label: 'Business License', status: 'pending' },
      { category: 'voided_check', label: 'Voided Business Check', status: 'pending' },
      { category: 'articles_of_incorporation', label: 'Articles of Incorporation', status: 'pending' }
    ]
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleMockUpload = (category: string) => {
    setWorkflow(prev => ({
      ...prev,
      documents: prev.documents.map(doc => 
        doc.category === category 
          ? { ...doc, status: 'uploading', fileName: `${category}_document.pdf` }
          : doc
      )
    }));

    // Simulate upload delay
    setTimeout(() => {
      setWorkflow(prev => ({
        ...prev,
        documents: prev.documents.map(doc => 
          doc.category === category 
            ? { ...doc, status: 'uploaded' }
            : doc
        )
      }));
    }, 2000);
  };

  const handleFinalizeApplication = () => {
    setIsProcessing(true);
    setWorkflow(prev => ({ ...prev, step: 'finalizing' }));

    // Simulate staff API call to generate SignNow URL
    setTimeout(() => {
      setWorkflow(prev => ({
        ...prev,
        step: 'signing',
        signUrl: 'https://demo.signnow.com/document/12345/sign'
      }));
      setIsProcessing(false);
    }, 3000);
  };

  const handleSigningComplete = () => {
    setWorkflow(prev => ({ ...prev, step: 'complete' }));
  };

  const handleResetWorkflow = () => {
    setWorkflow({
      step: 'documents',
      applicationId: 'test-app-123',
      documents: [
        { category: 'bank_statements', label: 'Bank Statements (Last 3 months)', status: 'pending' },
        { category: 'tax_returns', label: 'Business Tax Returns (Last 2 years)', status: 'pending' },
        { category: 'financial_statements', label: 'Financial Statements', status: 'pending' },
        { category: 'business_license', label: 'Business License', status: 'pending' },
        { category: 'voided_check', label: 'Voided Business Check', status: 'pending' },
        { category: 'articles_of_incorporation', label: 'Articles of Incorporation', status: 'pending' }
      ]
    });
    setIsProcessing(false);
  };

  const allUploaded = workflow.documents.every(doc => doc.status === 'uploaded');
  const uploadProgress = (workflow.documents.filter(doc => doc.status === 'uploaded').length / workflow.documents.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            SignNow Workflow Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete Step 5 → Step 6 workflow testing (Documents → SignNow)
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Step indicator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Current Step: {workflow.step.charAt(0).toUpperCase() + workflow.step.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {['documents', 'finalizing', 'signing', 'complete'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      workflow.step === step ? 'bg-teal-600 text-white' :
                      index < ['documents', 'finalizing', 'signing', 'complete'].indexOf(workflow.step) ? 'bg-green-600 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        index < ['documents', 'finalizing', 'signing', 'complete'].indexOf(workflow.step) ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Document Upload */}
          {workflow.step === 'documents' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-teal-600" />
                  Step 5: Document Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Upload Progress</span>
                  <span className="text-sm text-gray-500">
                    {workflow.documents.filter(d => d.status === 'uploaded').length} of {workflow.documents.length} documents
                  </span>
                </div>
                <Progress value={uploadProgress} className="w-full" />

                <div className="space-y-3">
                  {workflow.documents.map((doc) => (
                    <div key={doc.category} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          doc.status === 'uploaded' ? 'bg-green-100 text-green-600' :
                          doc.status === 'uploading' ? 'bg-blue-100 text-blue-600' :
                          doc.status === 'error' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {doc.status === 'uploaded' ? <CheckCircle className="w-4 h-4" /> :
                           doc.status === 'uploading' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                           doc.status === 'error' ? <AlertCircle className="w-4 h-4" /> :
                           <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{doc.label}</p>
                          {doc.fileName && (
                            <p className="text-sm text-gray-500">{doc.fileName}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={doc.status === 'uploaded' ? 'outline' : 'default'}
                        onClick={() => handleMockUpload(doc.category)}
                        disabled={doc.status === 'uploading'}
                      >
                        {doc.status === 'uploaded' ? 'Replace' : 'Upload'}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!allUploaded || isProcessing}
                    onClick={handleFinalizeApplication}
                  >
                    Continue to Sign
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Finalizing Step */}
          {workflow.step === 'finalizing' && (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Preparing Documents for Signing</h3>
                <p className="text-gray-600 mb-4">
                  Generating SignNow invitation and preparing your application...
                </p>
                <div className="text-sm text-gray-500">
                  <p>✓ Validating uploaded documents</p>
                  <p>✓ Creating SignNow document template</p>
                  <p>✓ Pre-filling application data</p>
                  <p className="animate-pulse">→ Generating signing URL...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: SignNow Signing */}
          {workflow.step === 'signing' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSignature className="w-5 h-5 mr-2 text-teal-600" />
                    Step 6: SignNow Document Signing
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(workflow.signUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <FileSignature className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Ready to Sign:</strong> Your documents are ready for electronic signature. 
                    In a real workflow, this would be an embedded SignNow iframe.
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg text-center">
                  <div className="space-y-4">
                    <FileSignature className="w-16 h-16 text-teal-600 mx-auto" />
                    <h3 className="text-lg font-semibold">Mock SignNow Interface</h3>
                    <p className="text-gray-600">
                      URL: {workflow.signUrl}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>• Review all documents carefully</p>
                      <p>• Sign where indicated</p>
                      <p>• Fill in any required fields</p>
                      <p>• Click "Finish" when complete</p>
                    </div>
                    <Button onClick={handleSigningComplete} className="mt-4">
                      Simulate Signing Complete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion */}
          {workflow.step === 'complete' && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                  Application Complete!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-6">
                  Your loan application has been successfully submitted and signed. 
                  You'll receive email confirmation shortly.
                </p>
                <div className="space-y-2 text-sm text-green-600 dark:text-green-400 mb-6">
                  <p>✓ All documents uploaded and verified</p>
                  <p>✓ Electronic signature completed</p>
                  <p>✓ Application submitted to lender</p>
                  <p>✓ Email confirmations sent</p>
                </div>
                <Button onClick={handleResetWorkflow} variant="outline">
                  Test Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* API Testing Information */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">
                🔗 Required Staff API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-blue-700 dark:text-blue-300">
              <p><strong>PATCH /api/applications/:id</strong> - Save Steps 3 & 4 form data</p>
              <p><strong>POST /api/upload/:applicationId</strong> - Upload documents with category</p>
              <p><strong>POST /api/applications/:id/complete</strong> - Finalize and get SignNow URL</p>
              <p><strong>Webhook /signnow-completed</strong> - Handle signing completion</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}