import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { aiConversationService, type CoPilotGuidance, type ProactiveMessage } from '@/services/aiConversationService';
import { 
  Bot, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Lightbulb,
  ArrowRight,
  Target,
  MessageCircle
} from 'lucide-react';

interface AICoPilotProps {
  currentStep: number;
  applicationData: any;
  userBehavior?: {
    timeOnStep: number;
    stepsCompleted: number;
    documentsUploaded: number;
    lastActivity: string;
    strugglingIndicators: string[];
  };
  onStepGuidance?: (guidance: CoPilotGuidance) => void;
  onProactiveMessage?: (message: ProactiveMessage) => void;
}

export function AICoPilot({ 
  currentStep, 
  applicationData, 
  userBehavior,
  onStepGuidance,
  onProactiveMessage 
}: AICoPilotProps) {
  const [guidance, setGuidance] = useState<CoPilotGuidance | null>(null);
  const [proactiveMessage, setProactiveMessage] = useState<ProactiveMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProactive, setShowProactive] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (currentStep && applicationData) {
      loadGuidance();
    }
  }, [currentStep, applicationData]);

  useEffect(() => {
    if (userBehavior && showProactive) {
      checkForProactiveAssistance();
    }
  }, [userBehavior, showProactive]);

  const loadGuidance = async () => {
    setLoading(true);
    try {
      const stepGuidance = await aiConversationService.provideCoPilotGuidance(currentStep, applicationData);
      setGuidance(stepGuidance);
      onStepGuidance?.(stepGuidance);
    } catch (error) {
      console.error('❌ Failed to load guidance:', error);
      toast({
        title: 'Guidance Error',
        description: 'Unable to load step guidance. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkForProactiveAssistance = async () => {
    if (!userBehavior) return;

    try {
      const message = await aiConversationService.generateProactiveMessage(userBehavior, applicationData);
      if (message) {
        setProactiveMessage(message);
        onProactiveMessage?.(message);
      }
    } catch (error) {
      console.error('❌ Proactive assistance error:', error);
    }
  };

  const dismissProactiveMessage = () => {
    setProactiveMessage(null);
    setShowProactive(false);
    
    // Re-enable proactive messages after 5 minutes
    setTimeout(() => setShowProactive(true), 5 * 60 * 1000);
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'tip': return <Target className="h-4 w-4" />;
      case 'next_step': return <ArrowRight className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'tip': return 'border-green-200 bg-green-50';
      case 'next_step': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 animate-pulse" />
            <CardTitle>Loading AI Guidance...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Proactive Message */}
      {proactiveMessage && (
        <Alert className={`${getMessageTypeColor(proactiveMessage.type)} border-l-4`}>
          <div className="flex items-start space-x-3">
            {getMessageTypeIcon(proactiveMessage.type)}
            <div className="flex-1">
              <AlertDescription className="font-medium">
                {proactiveMessage.message}
              </AlertDescription>
              {proactiveMessage.suggestedActions && proactiveMessage.suggestedActions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {proactiveMessage.suggestedActions.map((action, index) => (
                    <div key={index} className="text-sm">
                      • {action}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={proactiveMessage.priority === 'high' ? 'destructive' : 'secondary'}>
                {proactiveMessage.priority}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={dismissProactiveMessage}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Step Guidance */}
      {guidance && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="h-5 w-5" />
                <div>
                  <CardTitle>{guidance.currentStep}</CardTitle>
                  <CardDescription>{guidance.stepDescription}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="text-lg font-semibold">{guidance.progressPercentage}%</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={guidance.progressPercentage} className="h-2" />

            {/* Instructions */}
            <div>
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Step-by-Step Instructions</span>
              </h4>
              <ol className="space-y-2">
                {guidance.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            {guidance.tips.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span>Helpful Tips</span>
                </h4>
                <ul className="space-y-2">
                  {guidance.tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-yellow-500 mt-1">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Mistakes */}
            {guidance.commonMistakes.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Avoid These Common Mistakes</span>
                </h4>
                <ul className="space-y-2">
                  {guidance.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-red-500 mt-1">⚠️</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timeline */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Estimated Time</span>
              </div>
              <span className="text-sm">{guidance.estimatedTime}</span>
            </div>

            {/* Next Steps Preview */}
            {guidance.nextSteps.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                  <span>What's Next?</span>
                </h4>
                <ul className="space-y-2">
                  {guidance.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                      <span className="text-blue-500 mt-1">→</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={loadGuidance}>
                <Bot className="h-4 w-4 mr-2" />
                Refresh Guidance
              </Button>
              
              <Button className="bg-blue-600 hover:bg-blue-700">
                Continue Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}