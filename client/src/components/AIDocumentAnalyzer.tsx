import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { aiDocumentDetection, type ApplicationProfile, type DocumentAnalysis } from '@/services/aiDocumentDetection';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Brain,
  Target,
  Lightbulb
} from 'lucide-react';

interface AIDocumentAnalyzerProps {
  applicationProfile: ApplicationProfile;
  onDocumentRecommendation?: (recommendation: any) => void;
  onAmountOptimization?: (optimization: any) => void;
  showAnalysis?: boolean;
}

export function AIDocumentAnalyzer({ 
  applicationProfile, 
  onDocumentRecommendation,
  onAmountOptimization,
  showAnalysis = true 
}: AIDocumentAnalyzerProps) {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [amountOptimization, setAmountOptimization] = useState<any>(null);
  const [productRecommendations, setProductRecommendations] = useState<any>(null);
  const [timelinePrediction, setTimelinePrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (applicationProfile && showAnalysis) {
      runAnalysis();
    }
  }, [applicationProfile, showAnalysis]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      // Run all analyses in parallel
      const [
        documentAnalysis,
        amountAnalysis, 
        productAnalysis,
        timelineAnalysis
      ] = await Promise.all([
        aiDocumentDetection.analyzeDocumentRequirements(applicationProfile),
        aiDocumentDetection.optimizeLoanAmount(applicationProfile),
        aiDocumentDetection.suggestProductTypes(applicationProfile),
        aiDocumentDetection.predictApprovalTimeline(applicationProfile, [])
      ]);

      setAnalysis(documentAnalysis);
      setAmountOptimization(amountAnalysis);
      setProductRecommendations(productAnalysis);
      setTimelinePrediction(timelineAnalysis);

      // Trigger callbacks
      onDocumentRecommendation?.(documentAnalysis);
      onAmountOptimization?.(amountAnalysis);

      toast({
        title: 'AI Analysis Complete',
        description: 'Your application has been analyzed with AI-powered insights',
      });

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      toast({
        title: 'Analysis Error',
        description: 'Unable to complete AI analysis. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getApprovalChanceColor = (chance: number) => {
    if (chance >= 80) return 'text-green-600';
    if (chance >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 animate-pulse" />
            <CardTitle>AI Analysis in Progress</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
              <span>Analyzing document requirements...</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <span>Optimizing loan amounts...</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span>Recommending products...</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              <span>Predicting timelines...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <h3 className="font-medium">AI Analysis Ready</h3>
              <p className="text-sm text-gray-500">Click to analyze your application with AI</p>
            </div>
            <Button onClick={runAnalysis} className="bg-blue-600 hover:bg-blue-700">
              <Brain className="h-4 w-4 mr-2" />
              Analyze with AI
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Document Analysis</CardTitle>
              <Badge variant="secondary">AI-Powered</Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Completion</div>
              <div className="text-lg font-semibold">{analysis.completionPercentage}%</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={analysis.completionPercentage} className="h-2" />
          
          {analysis.missingDocuments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>Missing Documents ({analysis.missingDocuments.length})</span>
              </h4>
              
              {analysis.missingDocuments.map((doc, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(doc.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{doc.documentType}</div>
                      <div className="text-sm mt-1">{doc.reason}</div>
                      {doc.alternativeOptions && doc.alternativeOptions.length > 0 && (
                        <div className="text-xs mt-2">
                          <span className="font-medium">Alternatives:</span> {doc.alternativeOptions.join(', ')}
                        </div>
                      )}
                    </div>
                    <Badge variant={doc.priority === 'high' ? 'destructive' : doc.priority === 'medium' ? 'default' : 'secondary'}>
                      {doc.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Next Steps</h4>
              <ul className="text-sm space-y-1">
                {analysis.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Approval Estimate</span>
              </h4>
              <div className={`text-2xl font-semibold ${getApprovalChanceColor(analysis.estimatedApprovalChance)}`}>
                {analysis.estimatedApprovalChance}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Optimization */}
      {amountOptimization && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <CardTitle>Loan Amount Optimization</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Recommended</div>
                <div className="text-xl font-semibold text-blue-600">
                  ${amountOptimization.recommendedAmount?.toLocaleString()}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Minimum</div>
                <div className="text-lg font-medium">
                  ${amountOptimization.minAmount?.toLocaleString()}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Maximum</div>
                <div className="text-lg font-medium">
                  ${amountOptimization.maxAmount?.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">AI Reasoning</h4>
              <p className="text-sm">{amountOptimization.reasoning}</p>
            </div>

            {amountOptimization.improvementSuggestions?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Improvement Suggestions</span>
                </h4>
                <ul className="text-sm space-y-1">
                  {amountOptimization.improvementSuggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-yellow-500 mt-1">💡</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Product Recommendations */}
      {productRecommendations && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <CardTitle>Product Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {productRecommendations.recommendedProducts?.map((product: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{product.productType}</h4>
                  <Badge variant="outline">
                    {product.suitabilityScore}% match
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-green-600 mb-1">Pros:</div>
                    <ul className="space-y-1">
                      {product.pros?.map((pro: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="font-medium text-red-600 mb-1">Cons:</div>
                    <ul className="space-y-1">
                      {product.cons?.map((con: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1">×</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                  <span className="font-medium">Typical Terms:</span> {product.typicalTerms}
                </div>
              </div>
            ))}
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">AI Analysis</h4>
              <p className="text-sm">{productRecommendations.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Prediction */}
      {timelinePrediction && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Approval Timeline Prediction</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Estimated Timeline</div>
              <div className="text-2xl font-semibold text-blue-600">
                {timelinePrediction.estimatedDays} days
              </div>
              <div className="text-sm text-gray-500">
                {timelinePrediction.confidenceLevel}% confidence
              </div>
            </div>

            {timelinePrediction.milestones?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Timeline Milestones</h4>
                <div className="space-y-3">
                  {timelinePrediction.milestones.map((milestone: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {milestone.estimatedDay}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{milestone.milestone}</div>
                        <div className="text-sm text-gray-600">{milestone.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          This analysis is generated by AI and provides recommendations based on your application profile. 
          Final decisions depend on individual lender criteria and current market conditions.
        </AlertDescription>
      </Alert>
    </div>
  );
}