import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface CategoryTestResult {
  documentName: string;
  expectedCategory: string;
  actualMapping: string;
  isCorrect: boolean;
  duplicateFound: boolean;
}

export default function Step5CategoryTest() {
  const [testResults, setTestResults] = useState<CategoryTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testDocuments = [
    {
      name: "Bank Statements",
      expectedCategory: "bank_statements",
      shouldNotAppearIn: ["financial_statements", "personal_financial_statement"]
    },
    {
      name: "Accountant Prepared Financial Statements", 
      expectedCategory: "financial_statements",
      shouldNotAppearIn: ["personal_financial_statement", "bank_statements"]
    },
    {
      name: "Personal Financial Statement",
      expectedCategory: "personal_financial_statement", 
      shouldNotAppearIn: ["financial_statements", "bank_statements"]
    },
    {
      name: "Tax Returns",
      expectedCategory: "tax_returns",
      shouldNotAppearIn: ["financial_statements", "personal_financial_statement"]
    },
    {
      name: "Equipment Quotes",
      expectedCategory: "equipment_quotes",
      shouldNotAppearIn: ["financial_statements", "personal_financial_statement"]
    }
  ];

  const runCategoryTest = async () => {
    setIsRunning(true);
    const results: CategoryTestResult[] = [];
    
    // Test the document category mapping logic
    for (const testDoc of testDocuments) {
      console.log(`🧪 Testing category mapping for: ${testDoc.name}`);
      
      // Test the getApiCategory function logic
      const getApiCategory = (label: string): string => {
        const labelLower = label.toLowerCase();
        
        // Bank statements - exact match
        if (labelLower.includes('bank') && labelLower.includes('statement')) {
          return 'bank_statements';
        }
        
        // Accountant Prepared Financial Statements - must include "accountant" AND "prepared"
        if (labelLower.includes('accountant') && labelLower.includes('prepared') && labelLower.includes('financial')) {
          return 'financial_statements';
        }
        
        // Personal Financial Statement - must include "personal" 
        if (labelLower.includes('personal') && labelLower.includes('financial') && labelLower.includes('statement')) {
          return 'personal_financial_statement';
        }
        
        // Tax Returns - specific pattern
        if (labelLower.includes('tax') && labelLower.includes('return')) {
          return 'tax_returns';
        }
        
        // Equipment Quotes - specific pattern
        if (labelLower.includes('equipment') && labelLower.includes('quote')) {
          return 'equipment_quotes';
        }
        
        // Default: normalize to underscore format
        return label.toLowerCase().replace(/\s+/g, '_');
      };
      
      const actualMapping = getApiCategory(testDoc.name);
      const isCorrect = actualMapping === testDoc.expectedCategory;
      
      // Test for duplicates by checking if this document would match other categories
      let duplicateFound = false;
      for (const shouldNotMatch of testDoc.shouldNotAppearIn) {
        // Create a mock file object to test the filtering logic
        const mockFile = {
          name: `test_${testDoc.name.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          documentType: actualMapping,
          status: "completed" as const
        };
        
        // Test if this file would incorrectly match other document types
        const testMatch = (docLabel: string, documentTypeLower: string) => {
          const docLabelLower = docLabel.toLowerCase();
          const normalizedDocType = docLabel.toLowerCase().replace(/\s+/g, '_');
          
          // EXACT MATCH
          if (documentTypeLower === normalizedDocType) {
            return true;
          }
          
          // Bank statements - must match exact pattern
          if (docLabelLower.includes('bank') && docLabelLower.includes('statement')) {
            return documentTypeLower === 'bank_statements' ||
                   documentTypeLower === 'bank_statement' ||
                   (documentTypeLower.includes('bank') && documentTypeLower.includes('statement'));
          }
          
          // Accountant Prepared Financial Statements - must match specific pattern
          if (docLabelLower.includes('accountant') && docLabelLower.includes('prepared') && docLabelLower.includes('financial')) {
            return documentTypeLower === 'financial_statements' ||
                   documentTypeLower === 'accountant_prepared_financial_statements' ||
                   (documentTypeLower.includes('accountant') && documentTypeLower.includes('financial'));
          }
          
          // Personal Financial Statement - must match exact pattern
          if (docLabelLower.includes('personal') && docLabelLower.includes('financial') && docLabelLower.includes('statement')) {
            return documentTypeLower === 'personal_financial_statement' ||
                   documentTypeLower === 'personal_financial_statements' ||
                   (documentTypeLower.includes('personal') && documentTypeLower.includes('financial'));
          }
          
          return false;
        };
        
        // Test against categories it should NOT match
        const otherDocNames = testDocuments.find(d => d.expectedCategory === shouldNotMatch)?.name;
        if (otherDocNames && testMatch(otherDocNames, mockFile.documentType)) {
          duplicateFound = true;
          break;
        }
      }
      
      results.push({
        documentName: testDoc.name,
        expectedCategory: testDoc.expectedCategory,
        actualMapping,
        isCorrect,
        duplicateFound
      });
    }
    
    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Step 5 Document Categorization Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Test Controls */}
            <div className="flex space-x-4">
              <Button 
                onClick={runCategoryTest}
                disabled={isRunning}
                className="flex items-center space-x-2"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Running Tests...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>Run Category Tests</span>
                  </>
                )}
              </Button>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <Card key={index} className={`${result.isCorrect && !result.duplicateFound ? 'border-green-200' : 'border-red-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {result.isCorrect && !result.duplicateFound ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <span className="font-medium">{result.documentName}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Expected: {result.expectedCategory} | Actual: {result.actualMapping}
                            </div>
                            {!result.isCorrect && (
                              <div className="text-sm text-red-600 mt-1">
                                ❌ Incorrect category mapping
                              </div>
                            )}
                            {result.duplicateFound && (
                              <div className="text-sm text-red-600 mt-1">
                                ⚠️ Would appear in multiple categories (duplicate)
                              </div>
                            )}
                            {result.isCorrect && !result.duplicateFound && (
                              <div className="text-sm text-green-600 mt-1">
                                ✅ Correct category mapping with no duplicates
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

            {/* Summary */}
            {testResults.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Test Summary</h3>
                  <div className="text-sm">
                    <div>✅ Correct mappings: {testResults.filter(r => r.isCorrect && !r.duplicateFound).length}/{testResults.length}</div>
                    <div>❌ Incorrect mappings: {testResults.filter(r => !r.isCorrect).length}/{testResults.length}</div>
                    <div>⚠️ Duplicates found: {testResults.filter(r => r.duplicateFound).length}/{testResults.length}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Description */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Test Purpose:</strong> Validates that document category mapping is precise and prevents cross-contamination between:
                <br />• Bank Statements → bank_statements
                <br />• Accountant Prepared Financial Statements → financial_statements  
                <br />• Personal Financial Statement → personal_financial_statement
                <br />• Tax Returns → tax_returns
                <br />• Equipment Quotes → equipment_quotes
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}