import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIDocumentAnalyzer } from '@/components/AIDocumentAnalyzer';
import { AICoPilot } from '@/components/AICoPilot';
import { EnhancedChatBot } from '@/components/EnhancedChatBot';
import { AIInsightsDashboard } from '@/components/AIInsightsDashboard';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain,
  FileText,
  MessageSquare,
  Target,
  TrendingUp,
  Lightbulb,
  Zap,
  CheckCircle
} from 'lucide-react';

export default function AIDemoPage() {
  const [currentDemo, setCurrentDemo] = useState('overview');
  const { toast } = useToast();

  // Demo application data
  const demoApplicationData = {
    businessType: 'Technology Consulting',
    industry: 'Software Development',
    loanAmount: 150000,
    loanPurpose: 'Equipment financing and working capital',
    annualRevenue: '$750,000',
    timeInBusiness: '3 years',
    creditScore: '720',
    existingDocuments: ['Business Registration', 'Tax Returns (2022)'],
    uploadedDocuments: ['business_registration.pdf', 'tax_returns_2022.pdf'],
    selectedLenders: ['Business Development Bank', 'TD Commercial Banking'],
    currentStep: 3,
    status: 'in_progress'
  };

  // Demo user behavior
  const demoUserBehavior = {
    timeOnStep: 8,
    stepsCompleted: 2,
    documentsUploaded: 2,
    lastActivity: 'document_upload',
    strugglingIndicators: ['long_time_on_step']
  };

  // Demo lender data
  const demoLenders = [
    { name: 'Business Development Bank', category: 'Government', minAmount: 25000, maxAmount: 500000 },
    { name: 'TD Commercial Banking', category: 'Major Bank', minAmount: 50000, maxAmount: 2000000 },
    { name: 'RBC Business Banking', category: 'Major Bank', minAmount: 25000, maxAmount: 1500000 },
    { name: 'Financing.ca', category: 'Alternative', minAmount: 10000, maxAmount: 300000 }
  ];

  const handleInsightAction = (action: string, data: any) => {
    toast({
      title: `AI Demo: ${action}`,
      description: `Received ${action} with data: ${JSON.stringify(data).slice(0, 100)}...`,
    });
  };

  const features = [
    {
      id: 'document-detection',
      title: 'Document Detection',
      description: 'AI suggests missing documents based on application type',
      icon: <FileText className="h-5 w-5" />,
      status: 'completed'
    },
    {
      id: 'amount-optimization',
      title: 'Amount Optimization',
      description: 'Suggests optimal loan amounts based on financial capacity',
      icon: <Target className="h-5 w-5" />,
      status: 'completed'
    },
    {
      id: 'product-recommendations',
      title: 'Product Recommendations',
      description: 'AI suggests best product types for business needs',
      icon: <TrendingUp className="h-5 w-5" />,
      status: 'completed'
    },
    {
      id: 'multi-intent-processing',
      title: 'Multi-Intent Chat',
      description: 'Handle complex questions spanning multiple topics',
      icon: <MessageSquare className="h-5 w-5" />,
      status: 'completed'
    },
    {
      id: 'proactive-assistance',
      title: 'Proactive Assistance',
      description: 'AI initiates conversations based on user behavior',
      icon: <Lightbulb className="h-5 w-5" />,
      status: 'completed'
    },
    {
      id: 'application-copilot',
      title: 'Application Co-Pilot',
      description: 'Step-by-step guidance through entire process',
      icon: <Brain className="h-5 w-5" />,
      status: 'completed'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI-Powered Lending Assistant</h1>
                <p className="mt-2 text-gray-600">
                  Comprehensive AI features for intelligent business lending applications
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>OpenAI GPT-4o Powered</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Implemented AI Features</span>
            </CardTitle>
            <CardDescription>
              Advanced AI capabilities now available in the financial application system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => (
                <div key={feature.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                      <Badge 
                        variant={feature.status === 'completed' ? 'default' : 'secondary'}
                        className="mt-2"
                      >
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Tabs */}
        <Tabs value={currentDemo} onValueChange={setCurrentDemo}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analyzer">Document Analyzer</TabsTrigger>
            <TabsTrigger value="copilot">AI Co-Pilot</TabsTrigger>
            <TabsTrigger value="chat">Enhanced Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AIInsightsDashboard
              applicationData={demoApplicationData}
              currentStep={3}
              lenderData={demoLenders}
              userBehavior={demoUserBehavior}
              onInsightAction={handleInsightAction}
            />
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Document Analysis Demo</CardTitle>
                <CardDescription>
                  See how AI analyzes your application and suggests optimal improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIDocumentAnalyzer
                  applicationProfile={{
                    businessType: demoApplicationData.businessType,
                    industry: demoApplicationData.industry,
                    loanAmount: demoApplicationData.loanAmount,
                    loanPurpose: demoApplicationData.loanPurpose,
                    timeInBusiness: demoApplicationData.timeInBusiness,
                    annualRevenue: demoApplicationData.annualRevenue,
                    creditScore: demoApplicationData.creditScore,
                    existingDocuments: demoApplicationData.existingDocuments
                  }}
                  onDocumentRecommendation={(rec) => handleInsightAction('document_recommendation', rec)}
                  onAmountOptimization={(opt) => handleInsightAction('amount_optimization', opt)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="copilot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Co-Pilot Demo</CardTitle>
                <CardDescription>
                  Step-by-step guidance and proactive assistance throughout the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AICoPilot
                  currentStep={demoApplicationData.currentStep}
                  applicationData={demoApplicationData}
                  userBehavior={demoUserBehavior}
                  onStepGuidance={(guidance) => handleInsightAction('step_guidance', guidance)}
                  onProactiveMessage={(message) => handleInsightAction('proactive_message', message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced AI Chat Demo</CardTitle>
                <CardDescription>
                  Multi-intent processing, lender Q&A, and decision tree navigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedChatBot
                  applicationContext={demoApplicationData}
                  lenderData={demoLenders}
                  onDecisionSupport={(decision) => handleInsightAction('decision_support', decision)}
                  onLenderRecommendation={(lenders) => handleInsightAction('lender_recommendation', lenders)}
                  showAdvancedFeatures={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready to Experience AI-Powered Lending?</h3>
              <p className="text-gray-600">
                Try the complete application flow with all AI features integrated
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.location.href = '/apply/step-1'}
                >
                  Start New Application
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}