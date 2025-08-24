import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development - move to server in production
});

export interface ConversationIntent {
  primary: string;
  secondary?: string[];
  confidence: number;
  entities: Record<string, any>;
}

export interface ProactiveMessage {
  message: string;
  type: 'suggestion' | 'warning' | 'tip' | 'next_step';
  priority: 'high' | 'medium' | 'low';
  trigger: string;
  actionable: boolean;
  suggestedActions?: string[];
}

export interface CoPilotGuidance {
  currentStep: string;
  stepDescription: string;
  instructions: string[];
  tips: string[];
  commonMistakes: string[];
  nextSteps: string[];
  estimatedTime: string;
  progressPercentage: number;
}

class AIConversationService {

  async processMultipleIntents(userMessage: string, context: any): Promise<{
    intents: ConversationIntent[];
    response: string;
    suggestedActions: string[];
    followUpQuestions: string[];
  }> {
    try {
      const prompt = `Analyze this user message for multiple intents in a business lending context:
      
      User Message: "${userMessage}"
      
      Context:
      - Current Step: ${context.currentStep || 'Unknown'}
      - Application Status: ${context.applicationStatus || 'In Progress'}
      - Available Lenders: ${context.lenderCount || 0}
      
      Identify all intents (questions, requests, concerns) and provide a comprehensive response that addresses each one.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", 
        messages: [
          {
            role: "system",
            content: `You are Boreal Financial's AI assistant. Analyze user messages for multiple intents and provide comprehensive responses. Return JSON:
            {
              "intents": [
                {
                  "primary": "string",
                  "secondary": ["string"],
                  "confidence": number (0-100),
                  "entities": {}
                }
              ],
              "response": "string (comprehensive answer)",
              "suggestedActions": ["string"],
              "followUpQuestions": ["string"]
            }
            
            Handle these intent types:
            - Document questions
            - Lender inquiries  
            - Timeline concerns
            - Amount discussions
            - Process navigation
            - Requirements clarification`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('❌ Multi-intent processing error:', error);
      return this.getFallbackIntentResponse(userMessage);
    }
  }

  async generateProactiveMessage(userBehavior: {
    timeOnStep: number;
    stepsCompleted: number;
    documentsUploaded: number;
    lastActivity: string;
    strugglingIndicators: string[];
  }, applicationContext: any): Promise<ProactiveMessage | null> {
    try {
      const prompt = `Generate a proactive assistance message based on user behavior:
      
      User Behavior:
      - Time on current step: ${userBehavior.timeOnStep} minutes
      - Steps completed: ${userBehavior.stepsCompleted}/7
      - Documents uploaded: ${userBehavior.documentsUploaded}
      - Last activity: ${userBehavior.lastActivity}
      - Struggling indicators: ${userBehavior.strugglingIndicators.join(', ')}
      
      Application Context:
      - Business type: ${applicationContext.businessType || 'Unknown'}
      - Loan amount: ${applicationContext.loanAmount || 'Not specified'}
      - Current step: ${applicationContext.currentStep || 'Unknown'}
      
      Determine if proactive assistance is needed and what type of message would be most helpful.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Generate proactive assistance messages for users who may need help. Return JSON:
            {
              "message": "string (helpful, not annoying)",
              "type": "suggestion|warning|tip|next_step", 
              "priority": "high|medium|low",
              "trigger": "string (what triggered this)",
              "actionable": boolean,
              "suggestedActions": ["string"]
            }
            
            Only generate messages when truly helpful. Consider:
            - User frustration indicators
            - Time spent on tasks
            - Abandonment risks
            - Natural assistance opportunities
            
            Return null if no assistance needed.`
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.message ? result : null;
      
    } catch (error) {
      console.error('❌ Proactive message error:', error);
      return null;
    }
  }

  async provideCoPilotGuidance(currentStep: number, applicationData: any): Promise<CoPilotGuidance> {
    try {
      const stepNames = [
        'Financial Profile Setup',
        'Product Recommendations',
        'Business Details',
        'Applicant Information', 
        'Document Upload',
        'Electronic Signature',
        'Review & Submission'
      ];

      const prompt = `Provide step-by-step guidance for application step ${currentStep}:
      
      Current Step: ${stepNames[currentStep - 1] || 'Unknown'}
      
      Application Data:
      - Business Type: ${applicationData.businessType || 'Not specified'}
      - Industry: ${applicationData.industry || 'Not specified'}  
      - Loan Amount: ${applicationData.loanAmount || 'Not specified'}
      - Documents Uploaded: ${applicationData.documentsUploaded || 0}
      
      Provide detailed, actionable guidance to help the user complete this step successfully.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert co-pilot for business loan applications. Provide detailed step guidance in JSON:
            {
              "currentStep": "string",
              "stepDescription": "string", 
              "instructions": ["string (specific steps)"],
              "tips": ["string (helpful advice)"],
              "commonMistakes": ["string (what to avoid)"],
              "nextSteps": ["string (what comes after)"],
              "estimatedTime": "string",
              "progressPercentage": number
            }
            
            Be specific, encouraging, and practical. Focus on maximizing approval chances.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('❌ Co-pilot guidance error:', error);
      return this.getFallbackGuidance(currentStep);
    }
  }

  async answerLenderQuestion(question: string, lenderData: any[], context: any): Promise<{
    answer: string;
    relevantLenders: string[];
    additionalInfo: string[];
    suggestedQuestions: string[];
  }> {
    try {
      const prompt = `Answer this specific question about lenders:
      
      Question: "${question}"
      
      Available Lenders: ${lenderData.map(l => l.name || l.lenderName).join(', ')}
      
      Context:
      - Business Type: ${context.businessType || 'Unknown'}
      - Loan Amount: ${context.loanAmount || 'Not specified'}
      - Industry: ${context.industry || 'Unknown'}
      
      Provide a comprehensive answer focusing on the specific lenders in our database.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Answer specific questions about business lenders. Use the provided lender data to give accurate information. Return JSON:
            {
              "answer": "string (comprehensive answer)",
              "relevantLenders": ["string (specific lender names)"],
              "additionalInfo": ["string (extra helpful details)"],
              "suggestedQuestions": ["string (related questions)"]
            }
            
            Be factual and specific. Only reference lenders that are actually available.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('❌ Lender Q&A error:', error);
      return this.getFallbackLenderAnswer(question);
    }
  }

  async navigateDecisionTree(scenario: string, userPreferences: any): Promise<{
    recommendation: string;
    reasoning: string;
    alternatives: string[];
    nextDecisionPoint: string;
    decisionFactors: Array<{
      factor: string;
      importance: number;
      recommendation: string;
    }>;
  }> {
    try {
      const prompt = `Help navigate this lending decision scenario:
      
      Scenario: "${scenario}"
      
      User Preferences:
      - Risk Tolerance: ${userPreferences.riskTolerance || 'Medium'}
      - Speed Priority: ${userPreferences.speedPriority || 'Medium'}
      - Amount Flexibility: ${userPreferences.amountFlexibility || 'Medium'}
      - Collateral Availability: ${userPreferences.collateralAvailable || 'Unknown'}
      
      Provide decision guidance considering all factors.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Navigate complex lending decisions like an expert advisor. Return JSON:
            {
              "recommendation": "string (clear recommendation)",
              "reasoning": "string (why this is recommended)",
              "alternatives": ["string (other viable options)"],
              "nextDecisionPoint": "string (what to decide next)",
              "decisionFactors": [
                {
                  "factor": "string",
                  "importance": number (1-10),
                  "recommendation": "string"
                }
              ]
            }
            
            Consider Canadian lending practices and real-world constraints.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('❌ Decision tree error:', error);
      return this.getFallbackDecision(scenario);
    }
  }

  private getFallbackIntentResponse(userMessage: string) {
    return {
      intents: [
        {
          primary: "general_inquiry",
          secondary: [],
          confidence: 50,
          entities: {}
        }
      ],
      response: "I understand you're asking about your application. Let me help you with that. Could you be more specific about what you'd like to know?",
      suggestedActions: ["Clarify your question", "Check application status"],
      followUpQuestions: ["What specific part of the application do you need help with?"]
    };
  }

  private getFallbackGuidance(currentStep: number): CoPilotGuidance {
    const stepNames = [
      'Financial Profile Setup',
      'Product Recommendations', 
      'Business Details',
      'Applicant Information',
      'Document Upload',
      'Electronic Signature',
      'Review & Submission'
    ];

    return {
      currentStep: stepNames[currentStep - 1] || 'Unknown Step',
      stepDescription: "Complete the required information for this step",
      instructions: ["Fill out all required fields", "Review your information carefully"],
      tips: ["Take your time to ensure accuracy", "Contact support if you need help"],
      commonMistakes: ["Incomplete information", "Incorrect formatting"],
      nextSteps: ["Continue to next step", "Review previous steps if needed"],
      estimatedTime: "5-10 minutes",
      progressPercentage: Math.round((currentStep / 7) * 100)
    };
  }

  private getFallbackLenderAnswer(question: string) {
    return {
      answer: "I can help you with lender information. Could you be more specific about what you'd like to know?",
      relevantLenders: [],
      additionalInfo: ["Browse our lender directory", "Contact support for detailed comparisons"],
      suggestedQuestions: ["What are the requirements for this lender?", "What are the typical interest rates?"]
    };
  }

  private getFallbackDecision(scenario: string) {
    return {
      recommendation: "Consider all available options carefully",
      reasoning: "Each lending scenario is unique and requires personalized analysis",
      alternatives: ["Consult with a lending advisor", "Review all available products"],
      nextDecisionPoint: "Gather more information about your specific needs",
      decisionFactors: [
        {
          factor: "Individual circumstances",
          importance: 10,
          recommendation: "Consult with an expert"
        }
      ]
    };
  }
}

export const aiConversationService = new AIConversationService();