import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { BusinessLogicValidationTest } from '@/components/BusinessLogicValidationTest';
import { RuntimeAlertPanel } from '@/components/RuntimeAlertPanel';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import TestTube from 'lucide-react/dist/esm/icons/test-tube';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Edit from 'lucide-react/dist/esm/icons/edit';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';

export default function ValidationTestPage() {
  const [, setLocation] = useLocation();

  const simulateStep5 = () => {
    // Simulate being on Step 5 with the RuntimeAlertPanel
    setLocation('/apply/step-5');
  };

  const simulateStep6 = () => {
    // Simulate being on Step 6 with the RuntimeAlertPanel  
    setLocation('/apply/step-6');
  };

  const simulateStep7 = () => {
    // Simulate being on Step 7 with the RuntimeAlertPanel
    setLocation('/apply/step-7');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-6 h-6" />
                Validation & Testing System
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setLocation('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Test and validate the application workflow with comprehensive debugging and validation tools.
            </p>
          </CardContent>
        </Card>

        {/* RuntimeAlertPanel Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Runtime Alert Panel Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              The RuntimeAlertPanel provides real-time validation feedback for Steps 5, 6, and 7.
              It checks document uploads, signing status, and prefill completeness.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={simulateStep5} className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Test Step 5 (Documents)
              </Button>
              <Button onClick={simulateStep6} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Test Step 6 (Signing)
              </Button>
              <Button onClick={simulateStep7} className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Test Step 7 (Finalization)
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">RuntimeAlertPanel Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Document upload verification (Step 5, 6, 7)</li>
                <li>• SignNow prefill field validation (Step 6, 7)</li>
                <li>• Signature completion checks (Step 7)</li>
                <li>• Navigation shortcuts to fix issues</li>
                <li>• Real-time status updates</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Business Logic Validation Test */}
        <BusinessLogicValidationTest />

        {/* Implementation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">✅ Completed Tasks</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">Complete</Badge>
                    <span className="text-sm">Task 1: Submission Preflight Test</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">Complete</Badge>
                    <span className="text-sm">Task 2: Smart Field Prefill Test</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">Complete</Badge>
                    <span className="text-sm">Task 3: Runtime Alert Panel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">Complete</Badge>
                    <span className="text-sm">Task 4: Business Logic Validation</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">🔧 Enhanced Features</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Document upload verification via GET /api/public/documents/:id</div>
                  <div>• SignNow status polling via GET /api/public/signnow/status/:id</div>
                  <div>• Required field validation for prefill payload</div>
                  <div>• Real-time alerts with navigation shortcuts</div>
                  <div>• Comprehensive business logic validation</div>
                  <div>• Step-based structure compliance checks</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
              <div className="space-y-1">
                <div>Template ID: e7ba8b894c644999a7b38037ea66f4cc9cc524f5</div>
                <div>Application ID: {localStorage.getItem('applicationId') || 'Not set'}</div>
                <div>Document Upload Endpoint: POST /api/public/applications/{'{applicationId}'}/documents</div>
                <div>SignNow Status Endpoint: GET /api/public/signnow/status/{'{applicationId}'}</div>
                <div>Document Check Endpoint: GET /api/public/documents/{'{applicationId}'}</div>
                <div>Polling Interval: 9 seconds</div>
                <div>Retry Limit: 10 attempts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}