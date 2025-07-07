import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFormData } from '@/context/FormDataContext';
import { 
  Play,
  CheckCircle,
  ArrowRight,
  FileText,
  Send,
  FileSignature,
  Clock,
  Building,
  User
} from 'lucide-react';

/**
 * Workflow Test Page - Verify new Step 4 → Step 6 → Step 7 flow
 * Tests the user's specification: Step 3 (collect) → Step 4 (submit) → Step 6 (SignNow) → Step 7 (finalize)
 */
export default function WorkflowTest() {
  const { state } = useFormData();
  const [, setLocation] = useLocation();

  const workflowSteps = [
    {
      id: 'step1',
      title: 'Step 1: Financial Profile',
      route: '/apply/step-1',
      description: 'Funding amount, industry, business location',
      status: state.step1FinancialProfile ? 'complete' : 'pending',
      icon: <Building className="w-5 h-5" />
    },
    {
      id: 'step2', 
      title: 'Step 2: Product Recommendations',
      route: '/apply/step-2',
      description: 'AI-powered lender matching from 42+ products',
      status: state.step2Recommendations?.selectedProduct ? 'complete' : 'pending',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'step3',
      title: 'Step 3: Business + Applicant Info',
      route: '/apply/step-3',
      description: 'Combined business details and personal information collection',
      status: (state.step3BusinessDetails?.completed && state.step4ApplicantDetails?.completed) ? 'complete' : 'pending',
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'step4',
      title: 'Step 4: Data Submission + Signing Initiation',
      route: '/apply/step-4',
      description: 'POST /applications/submit → POST /applications/initiate-signing → Generate signingUrl',
      status: state.applicationId ? 'complete' : 'pending',
      icon: <Send className="w-5 h-5" />
    },
    {
      id: 'step6',
      title: 'Step 6: SignNow Integration',
      route: '/apply/step-6',
      description: 'Poll signing-status → Open SignNow → Detect completion',
      status: state.step6Signature?.completed ? 'complete' : 'pending',
      icon: <FileSignature className="w-5 h-5" />
    },
    {
      id: 'step7',
      title: 'Step 7: Final Terms & Finalization',
      route: '/apply/step-7',
      description: 'Terms acceptance → POST /applications/{id}/finalize',
      status: state.isCompleted ? 'complete' : 'pending',
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  const apiEndpoints = [
    {
      step: 'Step 4 (Submit)',
      method: 'POST',
      endpoint: '/applications/submit',
      description: 'Submit complete form data + documents',
      response: 'applicationId + status'
    },
    {
      step: 'Step 4 (Initiate)',
      method: 'POST',
      endpoint: '/applications/initiate-signing',
      description: 'Initiate signing with applicationId',
      response: 'signingUrl ready for Step 6'
    },
    {
      step: 'Step 6 (Receive)',
      method: 'Context',
      endpoint: 'state.step6.signingUrl',
      description: 'Receive signingUrl from Step 4',
      response: 'Open SignNow in embedded iframe'
    },
    {
      step: 'Step 6 (Polling)',
      method: 'GET',
      endpoint: '/applications/{id}/signing-status',
      description: 'Poll for signing completion',
      response: 'status: pending/ready/completed/error'
    },
    {
      step: 'Step 7',
      method: 'POST',
      endpoint: '/applications/{id}/finalize',
      description: 'Complete application processing',
      response: 'finalizedAt timestamp'
    }
  ];

  const navigateToStep = (route: string) => {
    setLocation(route);
  };

  const startWorkflowTest = () => {
    setLocation('/apply/step-1');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
            <Play className="w-6 h-6 text-blue-600" />
            Workflow Test: Step 4 → Step 6 → Step 7 Flow
          </CardTitle>
          <p className="text-gray-600 mt-1">
            Test the restructured workflow per user specification
          </p>
        </CardHeader>
      </Card>

      {/* Current Application State */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Application State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Application ID:</span>
              <p className="font-mono">{state.applicationId || 'Not generated yet'}</p>
            </div>
            <div>
              <span className="text-gray-500">Selected Product:</span>
              <p className="font-medium">{state.step2Recommendations?.selectedProduct?.product_name || 'None selected'}</p>
            </div>
            <div>
              <span className="text-gray-500">Business Name:</span>
              <p className="font-medium">{state.step3BusinessDetails?.businessName || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-gray-500">Completion Status:</span>
              <Badge variant={state.isCompleted ? "default" : "secondary"}>
                {state.isCompleted ? 'Complete' : 'In Progress'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    step.status === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={step.status === 'complete' ? "default" : "secondary"}>
                    {step.status}
                  </Badge>
                  <Button
                    onClick={() => navigateToStep(step.route)}
                    variant="outline"
                    size="sm"
                  >
                    Test
                  </Button>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Endpoints & Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiEndpoints.map((api, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{api.step}</span>
                  <Badge variant="outline" className="font-mono">
                    {api.method}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-mono text-blue-600">{api.endpoint}</p>
                  <p className="text-gray-600">{api.description}</p>
                  <p className="text-xs text-gray-500">Response: {api.response}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Changes Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Workflow Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Step 3: Combined Data Collection</p>
                <p className="text-gray-600">Business details + applicant info collected together</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Step 4: API Submission</p>
                <p className="text-gray-600">POST /applications/submit moved from Step 6 to Step 4</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Step 6: SignNow Only</p>
                <p className="text-gray-600">Pure SignNow polling and signing workflow</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Step 7: Finalization</p>
                <p className="text-gray-600">Terms acceptance + POST /applications/{id}/finalize</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button onClick={startWorkflowTest} size="lg" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start Complete Workflow Test
            </Button>
            <Button onClick={() => setLocation('/apply/step-4')} variant="outline" size="lg">
              Test Step 4 Submission
            </Button>
            <Button onClick={() => setLocation('/apply/step-6')} variant="outline" size="lg">
              Test Step 6 SignNow
            </Button>
            <Button onClick={() => setLocation('/apply/step-7')} variant="outline" size="lg">
              Test Step 7 Finalization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}