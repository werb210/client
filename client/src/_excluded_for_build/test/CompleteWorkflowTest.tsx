import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  User, 
  Building, 
  CreditCard,
  Upload,
  FileSignature,
  ExternalLink
} from '@/lib/icons';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  status: 'pending' | 'in-progress' | 'completed';
  requiredFields: string[];
}

export default function CompleteWorkflowTest() {
  const [, setLocation] = useLocation();
  
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'step1',
      title: 'Financial Profile',
      description: 'Basic business information and funding requirements',
      route: '/apply/step-1',
      icon: <CreditCard className="w-5 h-5" />,
      status: 'completed',
      requiredFields: ['headquarters', 'industry', 'lookingFor', 'fundingAmount', 'salesHistory']
    },
    {
      id: 'step2',
      title: 'Product Recommendations',
      description: 'AI-powered lender product matching and selection',
      route: '/apply/step-2',
      icon: <Building className="w-5 h-5" />,
      status: 'completed',
      requiredFields: ['selectedProduct']
    },
    {
      id: 'step3',
      title: 'Business Details',
      description: 'Comprehensive business information and legal structure',
      route: '/apply/step-3',
      icon: <Building className="w-5 h-5" />,
      status: 'in-progress',
      requiredFields: ['businessName', 'businessAddress', 'businessStructure', 'businessTaxId']
    },
    {
      id: 'step4',
      title: 'Applicant Details',
      description: 'Personal information of the primary applicant',
      route: '/apply/step-4',
      icon: <User className="w-5 h-5" />,
      status: 'pending',
      requiredFields: ['firstName', 'lastName', 'personalEmail', 'creditScore']
    },
    {
      id: 'step5',
      title: 'Document Upload',
      description: 'Upload required documents based on selected product',
      route: '/apply/step-5',
      icon: <Upload className="w-5 h-5" />,
      status: 'pending',
      requiredFields: ['uploadedDocuments']
    },
    {
      id: 'step6',
      title: 'Application Submission & Signature',
      description: 'Submit to staff API and sign documents via SignNow',
      route: '/apply/step-6',
      icon: <FileSignature className="w-5 h-5" />,
      status: 'pending',
      requiredFields: ['applicationSubmitted', 'documentsSigned']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
  const totalSteps = workflowSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">
              Complete Application Workflow Test
            </CardTitle>
            <div className="space-y-3">
              <p className="text-gray-600">
                Test the complete application workflow including staff API submission and SignNow integration.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{completedSteps} of {totalSteps} steps completed</span>
                </div>
                <Progress value={progressPercentage} className="w-full" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowSteps.map((step, index) => (
            <Card 
              key={step.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                step.status === 'in-progress' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setLocation(step.route)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {step.icon}
                    <span className="font-semibold text-sm">Step {index + 1}</span>
                  </div>
                  {getStatusIcon(step.status)}
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{step.description}</p>
                
                <Badge className={getStatusColor(step.status)}>
                  {step.status.replace('-', ' ').toUpperCase()}
                </Badge>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Required Fields:</p>
                  <div className="flex flex-wrap gap-1">
                    {step.requiredFields.slice(0, 3).map((field) => (
                      <Badge key={field} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                    {step.requiredFields.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{step.requiredFields.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full"
                  variant={step.status === 'completed' ? 'outline' : 'default'}
                >
                  {step.status === 'completed' ? 'Review' : 'Continue'}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workflow Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Staff API Integration</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Collects form fields from Steps 1, 3, and 4</li>
                  <li>• Uploads documents from Step 5</li>
                  <li>• Submits complete application to staff backend</li>
                  <li>• Returns application ID for tracking</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">SignNow Integration</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Polls staff API for document preparation status</li>
                  <li>• Opens SignNow URL in new tab when ready</li>
                  <li>• Tracks signing completion automatically</li>
                  <li>• Marks application as complete when signed</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Data Flow Summary</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Steps 1-4 collect form data → Step 5 uploads documents → Step 6 submits to staff API → 
                    Staff prepares SignNow documents → User signs → Application complete
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button onClick={() => setLocation('/apply/step-1')} className="w-full">
                Start Fresh Application
              </Button>
              <Button onClick={() => setLocation('/apply/step-6')} variant="outline" className="w-full">
                Test Submission Flow
              </Button>
              <Button onClick={() => setLocation('/dashboard')} variant="outline" className="w-full">
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}