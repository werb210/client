import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface FileTestResult {
  name: string;
  type: string;
  size: number;
  accepted: boolean;
  error?: string;
  uploadResult?: string;
}

export default function FileTypeValidationTest() {
  const [testResults, setTestResults] = useState<FileTestResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const supportedTypes = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'
  ];

  const handleFileTest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    const results: FileTestResult[] = [];
    
    for (const file of files) {
      console.log(`🧪 Testing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
      
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAccepted = supportedTypes.includes(fileExtension);
      const isValidSize = file.size <= 25 * 1024 * 1024; // 25MB limit
      
      let uploadResult = '';
      let error = '';
      
      if (!isAccepted) {
        error = `File type ${fileExtension} not supported`;
      } else if (!isValidSize) {
        error = `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds 25MB limit`;
      } else {
        // Test file processing without actual upload (validation only)
        try {
          // Simulate file processing validation
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
          const mimeTypeValid = file.type && file.type.length > 0;
          
          if (supportedTypes.includes(fileExtension) && mimeTypeValid) {
            uploadResult = `✅ File validation passed: ${fileExtension} (${file.type})`;
          } else if (!mimeTypeValid) {
            uploadResult = `⚠️ File validation warning: Missing MIME type for ${fileExtension}`;
          } else {
            uploadResult = `❌ File validation failed: ${fileExtension} not supported`;
          }
        } catch (validationError) {
          uploadResult = `❌ Validation error: ${validationError.message}`;
        }
      }
      
      results.push({
        name: file.name,
        type: file.type,
        size: file.size,
        accepted: isAccepted && isValidSize,
        error,
        uploadResult
      });
    }
    
    setTestResults(results);
    setIsUploading(false);
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>File Type Validation Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Supported Types */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Supported File Types:</strong> {supportedTypes.join(', ')}
                <br />
                <strong>Size Limit:</strong> 25MB per file
              </AlertDescription>
            </Alert>

            {/* File Upload Test */}
            <div className="space-y-4">
              <div>
                <label htmlFor="file-test" className="block text-sm font-medium mb-2">
                  Select files to test validation and upload
                </label>
                <input
                  type="file"
                  id="file-test"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={handleFileTest}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              
              {isUploading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Testing file uploads...</span>
                </div>
              )}
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <Card key={index} className={`${result.accepted ? 'border-green-200' : 'border-red-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {result.accepted ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <span className="font-medium">{result.name}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Type: {result.type} | Size: {(result.size / (1024 * 1024)).toFixed(2)}MB
                            </div>
                            {result.error && (
                              <div className="text-sm text-red-600 mt-1">
                                Error: {result.error}
                              </div>
                            )}
                            {result.uploadResult && (
                              <div className="text-sm mt-2 font-mono bg-gray-50 p-2 rounded">
                                {result.uploadResult}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Testing Instructions */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Testing Instructions</h3>
                <ul className="text-sm space-y-1">
                  <li>• Test PDF files (should be accepted)</li>
                  <li>• Test Microsoft Office files (.doc, .docx, .xls, .xlsx)</li>
                  <li>• Test image files (.png, .jpg, .jpeg)</li>
                  <li>• Test unsupported files (.txt, .zip, .exe) - should be rejected</li>
                  <li>• Test oversized files (&gt;25MB) - should be rejected</li>
                  <li>• Verify upload success/failure messages</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}