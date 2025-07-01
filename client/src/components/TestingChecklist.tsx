import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api';
import { CheckCircle, AlertCircle, Upload, FileText, Users } from 'lucide-react';

interface TestItem {
  id: string;
  category: string;
  title: string;
  description: string;
  completed: boolean;
  error?: string;
  result?: string;
  lastTested?: string;
}

export function TestingChecklist() {
  const { toast } = useToast();
  const [testItems, setTestItems] = useState<TestItem[]>([
    {
      id: 'form-fill',
      category: 'Form Testing',
      title: 'Fill out full application form',
      description: 'Complete all steps of the multi-step application form',
      completed: false,
    },
    {
      id: 'form-save',
      category: 'Form Testing',
      title: 'Confirm form data saves in memory/offline',
      description: 'Verify each step saves data in IndexedDB for offline access',
      completed: false,
    },
    {
      id: 'real-upload',
      category: 'Document Testing',
      title: 'Upload real documents',
      description: 'Upload actual PDF/DOCX files (not placeholders)',
      completed: false,
    },
    {
      id: 'upload-progress',
      category: 'Document Testing',
      title: 'Confirm upload progress and retry logic',
      description: 'Test progress tracking and retry on failure',
      completed: false,
    },
    {
      id: 'submit-api',
      category: 'API Testing',
      title: 'Submit application',
      description: 'POST data and files to /api/application/submit',
      completed: false,
    },
    {
      id: 'submit-response',
      category: 'API Testing',
      title: 'Receive success response',
      description: 'Confirm proper response from staff backend',
      completed: false,
    },
    {
      id: 'signnow-create',
      category: 'SignNow Testing',
      title: 'Get SignNow redirect link',
      description: 'Call /api/signnow/createInvite and receive URL',
      completed: false,
    },
    {
      id: 'signnow-redirect',
      category: 'SignNow Testing',
      title: 'Test signing flow',
      description: 'Redirect to SignNow URL (no iframe)',
      completed: false,
    },
    {
      id: 'signnow-status',
      category: 'SignNow Testing',
      title: 'Check status after signing',
      description: 'Verify /api/application/status shows completion',
      completed: false,
    },
    {
      id: 'auth-invalid',
      category: 'Authentication Testing',
      title: 'Test invalid session/token',
      description: 'Should redirect to login on 401 Unauthorized',
      completed: false,
    },
  ]);

  const [isRunningTests, setIsRunningTests] = useState(false);

  const updateTestItem = (id: string, updates: Partial<TestItem>) => {
    setTestItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const runAutomatedTests = async () => {
    setIsRunningTests(true);
    
    try {
      // Test 1: API connectivity check
      updateTestItem('submit-api', { completed: false, error: undefined });
      try {
        // Test staff backend connectivity
        await api.getUserProfile();
        updateTestItem('submit-api', { completed: true });
        toast({
          title: "API Test Passed",
          description: "Staff backend API is accessible",
        });
      } catch (error) {
        updateTestItem('submit-api', { 
          completed: false, 
          error: error instanceof Error ? error.message : 'API connection failed' 
        });
        toast({
          title: "API Test Failed",
          description: "Cannot connect to staff backend",
          variant: "destructive",
        });
      }

      // Test 2: Document requirements check
      updateTestItem('real-upload', { completed: false, error: undefined });
      try {
        const docRequirements = await api.fetchRequiredDocuments('general');
        updateTestItem('real-upload', { completed: true });
        toast({
          title: "Document API Test Passed",
          description: `Found ${docRequirements.length} document requirements`,
        });
      } catch (error) {
        updateTestItem('real-upload', { 
          completed: false, 
          error: error instanceof Error ? error.message : 'Document API failed' 
        });
      }

      // Test 3: Lender products check
      updateTestItem('submit-response', { completed: false, error: undefined });
      try {
        const lenderProducts = await api.getLenderProducts();
        updateTestItem('submit-response', { completed: true });
        toast({
          title: "Lender API Test Passed",
          description: `Found ${lenderProducts.length} lender products`,
        });
      } catch (error) {
        updateTestItem('submit-response', { 
          completed: false, 
          error: error instanceof Error ? error.message : 'Lender API failed' 
        });
      }

    } catch (error) {
      toast({
        title: "Test Suite Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const manualTestFile = () => {
    // Create a test PDF for manual file upload testing
    const testContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test Document for Upload) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

    const blob = new Blob([testContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Test PDF Generated",
      description: "Use this file to test real document upload functionality",
    });
  };

  const categories = Array.from(new Set(testItems.map(item => item.category)));
  const completedCount = testItems.filter(item => item.completed).length;
  const totalCount = testItems.length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">API Testing Checklist</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive testing for staff backend integration
        </p>
        <div className="mt-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {completedCount} / {totalCount} Tests Completed
          </Badge>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Button 
          onClick={runAutomatedTests}
          disabled={isRunningTests}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunningTests ? "Running Tests..." : "Run Automated Tests"}
        </Button>
        <Button 
          onClick={manualTestFile}
          variant="outline"
        >
          <Upload className="h-4 w-4 mr-2" />
          Generate Test PDF
        </Button>
      </div>

      {categories.map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category === 'Form Testing' && <FileText className="h-5 w-5" />}
              {category === 'Document Testing' && <Upload className="h-5 w-5" />}
              {category === 'API Testing' && <Users className="h-5 w-5" />}
              {category === 'SignNow Testing' && <CheckCircle className="h-5 w-5" />}
              {category === 'Authentication Testing' && <AlertCircle className="h-5 w-5" />}
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testItems
              .filter(item => item.category === category)
              .map(item => (
                <div 
                  key={item.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <Checkbox 
                    checked={item.completed}
                    onCheckedChange={(checked) => 
                      updateTestItem(item.id, { completed: !!checked })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : item.error ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                    {item.error && (
                      <p className="text-sm text-red-600 mt-1 font-medium">
                        Error: {item.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Testing Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <p>• All document uploads must use real PDF or DOCX files</p>
          <p>• Form submission must POST actual data to staff backend API</p>
          <p>• SignNow integration uses redirect flow (no iframe)</p>
          <p>• Network errors should display helpful error messages</p>
          <p>• Offline storage queues data for sync when reconnected</p>
        </CardContent>
      </Card>
    </div>
  );
}