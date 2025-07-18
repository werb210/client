import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';

// Mock uploaded files for testing
const mockUploadedFiles = [
  {
    id: '1',
    name: 'bank_statement_jan.pdf',
    size: 1024000,
    type: 'application/pdf',
    status: 'completed' as const,
    documentType: 'bank_statements',
    file: new File([''], 'bank_statement_jan.pdf', { type: 'application/pdf' })
  },
  {
    id: '2',
    name: 'bank_statement_feb.pdf',
    size: 1024000,
    type: 'application/pdf',
    status: 'completed' as const,
    documentType: 'bank_statements',
    file: new File([''], 'bank_statement_feb.pdf', { type: 'application/pdf' })
  },
  {
    id: '3',
    name: 'bank_statement_mar.pdf',
    size: 1024000,
    type: 'application/pdf',
    status: 'completed' as const,
    documentType: 'bank_statements',
    file: new File([''], 'bank_statement_mar.pdf', { type: 'application/pdf' })
  },
  {
    id: '4',
    name: 'bank_statement_apr.pdf',
    size: 1024000,
    type: 'application/pdf',
    status: 'completed' as const,
    documentType: 'bank_statements',
    file: new File([''], 'bank_statement_apr.pdf', { type: 'application/pdf' })
  },
  {
    id: '5',
    name: 'bank_statement_may.pdf',
    size: 1024000,
    type: 'application/pdf',
    status: 'completed' as const,
    documentType: 'bank_statements',
    file: new File([''], 'bank_statement_may.pdf', { type: 'application/pdf' })
  },
  {
    id: '6',
    name: 'bank_statement_jun.pdf',
    size: 1024000,
    type: 'application/pdf',
    status: 'completed' as const,
    documentType: 'bank_statements',
    file: new File([''], 'bank_statement_jun.pdf', { type: 'application/pdf' })
  },
  {
    id: '7',
    name: 'financial_statement_2024.pdf',
    size: 2048000,
    type: 'application/pdf',
    status: 'completed' as const,
    documentType: 'accountant_prepared_financial_statements',
    file: new File([''], 'financial_statement_2024.pdf', { type: 'application/pdf' })
  },
  {
    id: '8',
    name: 'financial_statement_2023.pdf',
    size: 2048000,
    type: 'application/pdf',
    status: 'completed' as const,
    documentType: 'accountant_prepared_financial_statements',
    file: new File([''], 'financial_statement_2023.pdf', { type: 'application/pdf' })
  },
  {
    id: '9',
    name: 'financial_statement_2022.pdf',
    size: 2048000,
    type: 'application/pdf',
    status: 'completed' as const,
    documentType: 'accountant_prepared_financial_statements',
    file: new File([''], 'financial_statement_2022.pdf', { type: 'application/pdf' })
  },
  {
    id: '10',
    name: 'personal_financial_statement.pdf',
    size: 1536000,
    type: 'application/pdf',
    status: 'completed' as const,
    documentType: 'personal_financial_statement',
    file: new File([''], 'personal_financial_statement.pdf', { type: 'application/pdf' })
  },
  {
    id: '11',
    name: 'tax_returns_2024.pdf',
    size: 1024000,
    type: 'application/pdf',
    status: 'completed' as const,
    documentType: 'tax_returns',
    file: new File([''], 'tax_returns_2024.pdf', { type: 'application/pdf' })
  }
];

const mockRequiredDocuments = [
  'Bank Statements',
  'Accountant Prepared Financial Statements',
  'Personal Financial Statement',
  'Tax Returns'
];

export default function DocumentValidationTest() {
  const [uploadedFiles] = useState(mockUploadedFiles);
  const [requiredDocuments] = useState(mockRequiredDocuments);

  // ✅ FIXED VALIDATION LOGIC: Proper validation for Continue button
  const validateDocumentUploads = () => {
    if (!requiredDocuments || requiredDocuments.length === 0) {
      return true; // No requirements = can proceed
    }
    
    // Group uploaded files by document type
    const docsByType = uploadedFiles.reduce((acc, doc) => {
      if (doc.status === 'completed' && doc.documentType) {
        if (!acc[doc.documentType]) acc[doc.documentType] = [];
        acc[doc.documentType].push(doc);
      }
      return acc;
    }, {} as Record<string, typeof uploadedFiles>);
    
    // Check each required document type
    const validationResults = requiredDocuments.map(reqDoc => {
      const normalizedType = reqDoc.toLowerCase().replace(/\s+/g, '_');
      const uploadedDocs = docsByType[normalizedType] || [];
      const successfulUploads = uploadedDocs.filter(doc => doc.status === 'completed');
      
      // Determine required count (6 for bank statements, 3 for financial statements, 1 for others)
      const requiredCount = reqDoc.toLowerCase().includes('bank') && reqDoc.toLowerCase().includes('statement') ? 6 :
                           reqDoc.toLowerCase().includes('financial') && reqDoc.toLowerCase().includes('statement') ? 3 : 1;
      
      const isComplete = successfulUploads.length >= requiredCount;
      
      console.log(`📊 Document validation "${reqDoc}": ${successfulUploads.length}/${requiredCount} (${isComplete ? 'COMPLETE' : 'INCOMPLETE'})`);
      
      return {
        documentType: reqDoc,
        normalizedType,
        required: requiredCount,
        uploaded: successfulUploads.length,
        complete: isComplete
      };
    });
    
    const allComplete = validationResults.every(result => result.complete);
    console.log(`📋 Overall validation: ${allComplete ? 'COMPLETE' : 'INCOMPLETE'} (${validationResults.filter(r => r.complete).length}/${validationResults.length} document types)`);
    
    return { allComplete, validationResults };
  };

  // ✅ FIXED DISPLAY COUNTER: Only count successfully uploaded files
  const getSuccessfulUploads = () => {
    return uploadedFiles.filter(f => f.status === 'completed');
  };

  // ✅ DEDUPLICATION TEST: Ensure no file appears under multiple document types
  const testDeduplication = () => {
    const docsByType = uploadedFiles.reduce((acc, doc) => {
      if (doc.documentType) {
        if (!acc[doc.documentType]) acc[doc.documentType] = [];
        acc[doc.documentType].push(doc);
      }
      return acc;
    }, {} as Record<string, typeof uploadedFiles>);

    console.log('📋 Documents by type:', docsByType);
    
    // Check for duplicate files across types
    const allFileNames = uploadedFiles.map(f => f.name);
    const uniqueFileNames = [...new Set(allFileNames)];
    
    return {
      totalFiles: uploadedFiles.length,
      uniqueFiles: uniqueFileNames.length,
      hasDuplicates: allFileNames.length !== uniqueFileNames.length,
      docsByType
    };
  };

  const validation = validateDocumentUploads();
  const successfulUploads = getSuccessfulUploads();
  const deduplicationTest = testDeduplication();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Document Validation Test</h1>
        <p className="text-gray-600">Testing the Step 5 document validation logic</p>
      </div>

      {/* Overall Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {validation.allComplete ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span>Overall Validation Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Continue Button Status</div>
                <Badge variant={validation.allComplete ? "default" : "destructive"} className="text-sm">
                  {validation.allComplete ? "ENABLED" : "DISABLED"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Uploaded Files Count</div>
                <div className="text-lg font-bold text-blue-600">
                  {successfulUploads.length} / {uploadedFiles.length}
                  <span className="text-sm text-gray-500 ml-1">(completed only)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Type Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Document Type Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validation.validationResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {result.complete ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium">{result.documentType}</div>
                    <div className="text-sm text-gray-500">
                      Type: {result.normalizedType}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {result.uploaded} / {result.required}
                  </div>
                  <div className="text-sm text-gray-500">uploaded</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deduplication Test */}
      <Card>
        <CardHeader>
          <CardTitle>Deduplication Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Total Files</div>
                <div className="text-lg font-bold">{deduplicationTest.totalFiles}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Unique Files</div>
                <div className="text-lg font-bold">{deduplicationTest.uniqueFiles}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Duplicates</div>
                <Badge variant={deduplicationTest.hasDuplicates ? "destructive" : "default"}>
                  {deduplicationTest.hasDuplicates ? "FOUND" : "NONE"}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Files by Document Type</div>
              <div className="space-y-2">
                {Object.entries(deduplicationTest.docsByType).map(([docType, files]) => (
                  <div key={docType} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{docType}</span>
                    <span className="text-sm text-gray-600">
                      {files.length} files ({files.filter(f => f.status === 'completed').length} completed)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => {
                console.log('🧪 Running validation test...');
                const result = validateDocumentUploads();
                console.log('Validation result:', result);
              }}
              className="w-full"
            >
              Run Validation Test
            </Button>
            
            <Button
              onClick={() => {
                console.log('🧪 Running deduplication test...');
                const result = testDeduplication();
                console.log('Deduplication result:', result);
              }}
              variant="outline"
              className="w-full"
            >
              Run Deduplication Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}