import { getProducts } from "../../api/products";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AIDocumentAnalyzer } from './AIDocumentAnalyzer';
import { AICoPilot } from './AICoPilot';
import { EnhancedChatBot } from './EnhancedChatBot';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Target, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface AIInsightsDashboardProps {
  applicationData: any;
  currentStep: number;
  lenderData?: any[];
  userBehavior?: {
    timeOnStep: number;
    stepsCompleted: number;
    documentsUploaded: number;
    lastActivity: string;
    strugglingIndicators: string[];
  };
  onInsightAction?: (action: string, data: any) => void;
}

export function AIInsightsDashboard({ 
  applicationData, 
  currentStep,
  lenderData = [],
  userBehavior,
  onInsightAction 
}: AIInsightsDashboardProps) {
  const [activeTab, setActiveTab] = useState('copilot');
  const [insights, setInsights] = useState<any>({
    documentAnalysis: null,
    amountOptimization: null,
    recommendations: [],
    timeline: null
  });
  const [aiScore, setAiScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    calculateAIScore();
  }, [insights, applicationData]);

  const calculateAIScore = () => {
    let score = 0;
    let factors = 0;

    // Document completeness
    if (insights.documentAnalysis) {
      score += insights.documentAnalysis.completionPercentage * 0.3;
      factors += 30;
    }

    // Application completeness
    const stepCompletion = (currentStep / 7) * 100;
    score += stepCompletion * 0.2;
    factors += 20;

    // Data quality
    const dataQuality = Object.keys(applicationData).length > 5 ? 80 : 40;
    score += dataQuality * 0.2;
    factors += 20;

    // Optimization applied
    if (insights.amountOptimization) {
      score += 85 * 0.15;
      factors += 15;
    }

    // Recommendations followed
    if (insights.recommendations.length > 0) {
      score += 75 * 0.15;
      factors += 15;
    }

    setAiScore(Math.round(score));
  };

  const handleDocumentRecommendation = (analysis: any) => {
    setInsights(prev => ({ ...prev, documentAnalysis: analysis }));
    onInsightAction?.('document_analysis', analysis);
  };

  const handleAmountOptimization = (optimization: any) => {
    setInsights(prev => ({ ...prev, amountOptimization: optimization }));
    onInsightAction?.('amount_optimization', optimization);
  };

  const handleCoPilotGuidance = (guidance: any) => {
    onInsightAction?.('copilot_guidance', guidance);
  };

  const handleProactiveMessage = (message: any) => {
    toast({
      title: `AI ${message.type === 'warning' ? 'Alert' : 'Suggestion'}`,
      description: message.message,
      duration: 8000,
    });
    onInsightAction?.('proactive_message', message);
  };

  const handleDecisionSupport = (decision: any) => {
    onInsightAction?.('decision_support', decision);
  };

  const handleLenderRecommendation = (lenders: string[]) => {
    setInsights(prev => ({ 
      ...prev, 
      recommendations: [...prev.recommendations, ...lenders.map(l => ({ type: 'lender', value: l }))]
    }));
    onInsightAction?.('lender_recommendation', lenders);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent - Your application is well-optimized';
    if (score >= 60) return 'Good - Some improvements recommended';
    return 'Needs Work - Significant optimization opportunities';
  };

  return (
    <div className="space-y-6">
      {/* AI Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>AI Optimization Score</CardTitle>
                <CardDescription>
                  How well your application is optimized for approval
                </CardDescription>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(aiScore)}`}>
                {aiScore}
              </div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={aiScore} className="h-3" />
          <div className="flex items-center justify-between">
            <span className="text-sm">{getScoreDescription(aiScore)}</span>
            <Badge variant={aiScore >= 80 ? 'default' : aiScore >= 60 ? 'secondary' : 'destructive'}>
              {aiScore >= 80 ? 'Optimized' : aiScore >= 60 ? 'Improving' : 'Needs Work'}
            </Badge>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">{insights.documentAnalysis?.completionPercentage || 0}%</div>
              <div className="text-xs text-gray-500">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{Math.round((currentStep / 7) * 100)}%</div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{insights.recommendations.length}</div>
              <div className="text-xs text-gray-500">AI Tips</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{lenderData.length}</div>
              <div className="text-xs text-gray-500">Lenders</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="copilot" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Co-Pilot</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>AI Chat</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="copilot" className="space-y-4">
          <AICoPilot
            currentStep={currentStep}
            applicationData={applicationData}
            userBehavior={userBehavior}
            onStepGuidance={handleCoPilotGuidance}
            onProactiveMessage={handleProactiveMessage}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <AIDocumentAnalyzer
            applicationProfile={{
              businessType: applicationData.businessType || 'Unknown',
              industry: applicationData.industry || 'Unknown',
              loanAmount: applicationData.loanAmount || 0,
              loanPurpose: applicationData.loanPurpose || 'General business use',
              timeInBusiness: applicationData.timeInBusiness || 'Unknown',
              annualRevenue: applicationData.annualRevenue || 'Unknown',
              creditScore: applicationData.creditScore,
              existingDocuments: applicationData.uploadedDocuments || []
            }}
            onDocumentRecommendation={handleDocumentRecommendation}
            onAmountOptimization={handleAmountOptimization}
          />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <EnhancedChatBot
            applicationContext={applicationData}
            lenderData={lenderData}
            onDecisionSupport={handleDecisionSupport}
            onLenderRecommendation={handleLenderRecommendation}
            showAdvancedFeatures={true}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {/* Recent AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Recent AI Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {insights.recommendations.slice(0, 5).map((rec: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{rec.type}: {rec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>AI recommendations will appear here as you use the system</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Health Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Application Health Check</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Business Information</span>
                    <Badge variant={applicationData.businessType ? 'default' : 'destructive'}>
                      {applicationData.businessType ? 'Complete' : 'Missing'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Financial Profile</span>
                    <Badge variant={applicationData.annualRevenue ? 'default' : 'destructive'}>
                      {applicationData.annualRevenue ? 'Complete' : 'Missing'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Document Upload</span>
                    <Badge variant={applicationData.uploadedDocuments?.length > 0 ? 'default' : 'destructive'}>
                      {applicationData.uploadedDocuments?.length || 0} documents
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lender Selection</span>
                    <Badge variant={applicationData.selectedLenders?.length > 0 ? 'default' : 'secondary'}>
                      {applicationData.selectedLenders?.length || 0} selected
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>AI Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-green-600">
                      {insights.timeline?.estimatedDays || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">Estimated Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-600">
                      {insights.documentAnalysis?.estimatedApprovalChance || 0}%
                    </div>
                    <div className="text-sm text-gray-500">Approval Chance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-purple-600">
                      {insights.amountOptimization ? '$' + insights.amountOptimization.recommendedAmount?.toLocaleString() : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">Optimal Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-orange-600">
                      {userBehavior?.timeOnStep || 0}
                    </div>
                    <div className="text-sm text-gray-500">Minutes on Step</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}