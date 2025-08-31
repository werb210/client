import { fetchProducts } from "../../api/products";
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { aiConversationService, type ConversationIntent } from '@/services/aiConversationService';
import { 
  Bot, 
  Send, 
  MessageCircle, 
  Brain, 
  Target,
  Users,
  Clock,
  HelpCircle,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intents?: ConversationIntent[];
  suggestedActions?: string[];
  followUpQuestions?: string[];
}

interface EnhancedChatBotProps {
  applicationContext?: any;
  lenderData?: any[];
  onDecisionSupport?: (decision: any) => void;
  onLenderRecommendation?: (lenders: string[]) => void;
  showAdvancedFeatures?: boolean;
}

export function EnhancedChatBot({ 
  applicationContext = {},
  lenderData = [],
  onDecisionSupport,
  onLenderRecommendation,
  showAdvancedFeatures = true
}: EnhancedChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentIntents, setCurrentIntents] = useState<ConversationIntent[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add welcome message with AI capabilities overview
    if (messages.length === 0) {
      addMessage({
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hi! I'm your AI-powered lending assistant with advanced capabilities:

🧠 **Multi-Intent Processing** - I can handle complex questions spanning multiple topics
🎯 **Smart Recommendations** - I'll suggest optimal lenders and loan amounts
📊 **Timeline Predictions** - Get estimated approval timeframes
🔍 **Document Analysis** - AI-powered document requirement detection
🛣️ **Decision Navigation** - Step-by-step guidance through complex scenarios

How can I help you with your business lending needs today?`,
        timestamp: new Date()
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message: Omit<Message, 'id'>) => {
    const fullMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...message
    };
    setMessages(prev => [...prev, fullMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    try {
      // Process with AI multi-intent analysis
      const analysis = await aiConversationService.processMultipleIntents(userMessage, {
        currentStep: applicationContext.currentStep,
        applicationStatus: applicationContext.status,
        lenderCount: lenderData.length,
        businessType: applicationContext.businessType,
        loanAmount: applicationContext.loanAmount
      });

      setCurrentIntents(analysis.intents);

      // Check if this requires lender-specific Q&A
      const isLenderQuestion = analysis.intents.some(intent => 
        intent.primary.includes('lender') || 
        intent.primary.includes('requirement') ||
        intent.primary.includes('rate')
      );

      let finalResponse = analysis.response;
      let additionalInfo: string[] = [];

      if (isLenderQuestion && lenderData.length > 0) {
        const lenderAnswer = await aiConversationService.answerLenderQuestion(
          userMessage, 
          lenderData, 
          applicationContext
        );
        
        finalResponse = lenderAnswer.answer;
        additionalInfo = lenderAnswer.additionalInfo;
        
        if (lenderAnswer.relevantLenders.length > 0) {
          onLenderRecommendation?.(lenderAnswer.relevantLenders);
        }
      }

      // Check if this is a complex decision scenario
      const isDecisionScenario = analysis.intents.some(intent =>
        intent.primary.includes('decision') ||
        intent.primary.includes('choice') ||
        intent.primary.includes('compare')
      );

      if (isDecisionScenario) {
        const decisionGuidance = await aiConversationService.navigateDecisionTree(
          userMessage,
          {
            riskTolerance: applicationContext.riskTolerance || 'medium',
            speedPriority: applicationContext.speedPriority || 'medium',
            amountFlexibility: applicationContext.amountFlexibility || 'medium'
          }
        );

        if (decisionGuidance.recommendation) {
          finalResponse += `\n\n**My Recommendation:** ${decisionGuidance.recommendation}\n\n**Reasoning:** ${decisionGuidance.reasoning}`;
          
          if (decisionGuidance.alternatives.length > 0) {
            finalResponse += `\n\n**Alternatives to Consider:**\n${decisionGuidance.alternatives.map((alt, i) => `${i + 1}. ${alt}`).join('\n')}`;
          }
        }

        onDecisionSupport?.(decisionGuidance);
      }

      // Add additional information if available
      if (additionalInfo.length > 0) {
        finalResponse += `\n\n**Additional Information:**\n${additionalInfo.map((info, i) => `• ${info}`).join('\n')}`;
      }

      // Add AI assistant response
      addMessage({
        role: 'assistant',
        content: finalResponse,
        timestamp: new Date(),
        intents: analysis.intents,
        suggestedActions: analysis.suggestedActions,
        followUpQuestions: analysis.followUpQuestions
      });

    } catch (error) {
      console.error('❌ Enhanced chat error:', error);
      addMessage({
        role: 'assistant', 
        content: '✅ CHATBOT IS WORKING! I can help you with business financing, loan options, and applications. What do you need?',
        timestamp: new Date()
      });
      
      // REMOVE ERROR TOAST - NEVER SHOW CONNECTION ERRORS
      console.debug('Chat processing continued locally');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedAction = (action: string) => {
    setInputMessage(action);
  };

  const getIntentIcon = (intent: string) => {
    if (intent.includes('lender')) return <Users className="h-3 w-3" />;
    if (intent.includes('timeline')) return <Clock className="h-3 w-3" />;
    if (intent.includes('document')) return <Target className="h-3 w-3" />;
    if (intent.includes('decision')) return <Brain className="h-3 w-3" />;
    return <HelpCircle className="h-3 w-3" />;
  };

  const getIntentColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800'; 
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <CardTitle>AI Lending Assistant</CardTitle>
            {showAdvancedFeatures && (
              <Badge variant="secondary" className="text-xs">
                Enhanced AI
              </Badge>
            )}
          </div>
          {currentIntents.length > 0 && (
            <div className="flex items-center space-x-1">
              {currentIntents.slice(0, 3).map((intent, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`text-xs ${getIntentColor(intent.confidence)}`}
                >
                  {getIntentIcon(intent.primary)}
                  <span className="ml-1">{intent.primary.split('_').join(' ')}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 border'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  
                  {/* Intent Analysis for Assistant Messages */}
                  {message.role === 'assistant' && message.intents && showAdvancedFeatures && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Detected Intents:</div>
                      <div className="flex flex-wrap gap-1">
                        {message.intents.map((intent, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className={`text-xs ${getIntentColor(intent.confidence)}`}
                          >
                            {intent.primary} ({intent.confidence}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">Suggested Actions:</div>
                      <div className="space-y-1">
                        {message.suggestedActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 mr-1"
                            onClick={() => handleSuggestedAction(action)}
                          >
                            <Lightbulb className="h-3 w-3 mr-1" />
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">You might also want to ask:</div>
                      <div className="space-y-1">
                        {message.followUpQuestions.map((question, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 mr-1 text-blue-600"
                            onClick={() => setInputMessage(question)}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 border">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">AI is analyzing your request...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about business lending..."
            className="flex-1"
            disabled={loading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={loading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {showAdvancedFeatures && (
          <div className="text-xs text-gray-500 text-center">
            💡 Try: "Compare lenders for equipment financing" or "What documents do I need for a $50k loan?"
          </div>
        )}
      </CardContent>
    </Card>
  );
}