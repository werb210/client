import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  sessionId: string;
  userId?: string;
  applicationId?: string;
  messages: ChatMessage[];
  context: {
    currentStep?: number;
    applicationData?: any;
    lenderProducts?: any[];
  };
  escalated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class OpenAIService {
  private assistantId: string | null = null;

  async initializeAssistant(): Promise<string> {
    if (this.assistantId) {
      return this.assistantId;
    }

    try {
      const assistant = await openai.beta.assistants.create({
        name: "Boreal Financial Assistant",
        instructions: `You are a helpful financial assistant for Boreal Financial's lending platform. You help users:

1. Navigate the 7-step application process
2. Understand document requirements
3. Learn about available lending products
4. Resolve technical issues
5. Get general financial guidance

Key Guidelines:
- Be professional, helpful, and encouraging
- Use simple, everyday language
- Focus on the user's immediate needs
- Escalate complex financial advice to human agents
- Reference specific lender products when relevant
- Guide users through the application steps clearly

Current Application Steps:
1. Financial Profile - Basic business information
2. Product Recommendations - View matched lenders
3. Business Details - Detailed company information  
4. Applicant Information - Personal details
5. Document Upload - Required documentation
6. Signature - Electronic signature
7. Submission - Final review and submit

When users need help with documents, guide them to Step 5. For product questions, reference Step 2 recommendations.`,
        model: "gpt-4o",
        tools: [
          {
            type: "function",
            function: {
              name: "get_lender_products",
              description: "Get available lender products based on user criteria",
              parameters: {
                type: "object",
                properties: {
                  country: { type: "string", description: "User's country (Canada/USA)" },
                  loanType: { type: "string", description: "Type of loan needed" },
                  amount: { type: "number", description: "Loan amount requested" }
                }
              }
            }
          },
          {
            type: "function", 
            function: {
              name: "get_document_requirements",
              description: "Get document requirements for specific lender products",
              parameters: {
                type: "object",
                properties: {
                  productId: { type: "string", description: "Lender product ID" }
                }
              }
            }
          },
          {
            type: "function",
            function: {
              name: "escalate_to_human",
              description: "Escalate conversation to human agent",
              parameters: {
                type: "object",
                properties: {
                  reason: { type: "string", description: "Reason for escalation" },
                  priority: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            }
          }
        ]
      });

      this.assistantId = assistant.id;
      console.log('✅ OpenAI Assistant created:', assistant.id);
      return assistant.id;
    } catch (error) {
      console.error('❌ Failed to create OpenAI Assistant:', error);
      throw error;
    }
  }

  async createChatCompletion(
    messages: ChatMessage[],
    context?: any
  ): Promise<string> {
    try {
      const systemMessage = `You are Boreal Financial's AI assistant. Help users with their lending applications.

Current Context:
- Application Step: ${context?.currentStep || 'Not started'}
- Application ID: ${context?.applicationId || 'None'}
- Available Products: ${context?.lenderProducts?.length || 0} matches

Be helpful, professional, and guide users through their lending journey.`;

      const formattedMessages = [
        { role: 'system' as const, content: systemMessage },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: formattedMessages,
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0].message.content || 'I apologize, but I cannot provide a response right now. Please try again.';
    } catch (error) {
      console.error('❌ OpenAI chat completion error:', error);
      return 'I apologize, but I cannot provide a response right now due to a technical issue. Please try again or contact support.';
    }
  }

  async analyzeSentiment(text: string): Promise<{
    rating: number;
    confidence: number;
    escalationRecommended: boolean;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Analyze the sentiment and frustration level in this customer message. Provide a rating from 1-5 (1=very negative, 5=very positive), confidence score 0-1, and whether human escalation is recommended. Respond with JSON: { 'rating': number, 'confidence': number, 'escalationRecommended': boolean }"
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"rating": 3, "confidence": 0.5, "escalationRecommended": false}');
      
      return {
        rating: Math.max(1, Math.min(5, Math.round(result.rating))),
        confidence: Math.max(0, Math.min(1, result.confidence)),
        escalationRecommended: result.escalationRecommended || result.rating <= 2
      };
    } catch (error) {
      console.error('❌ Sentiment analysis error:', error);
      return {
        rating: 3,
        confidence: 0.5,
        escalationRecommended: false
      };
    }
  }

  async summarizeConversation(messages: ChatMessage[]): Promise<string> {
    try {
      const conversation = messages.map(msg => 
        `${msg.role.toUpperCase()}: ${msg.content}`
      ).join('\n');

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Summarize this customer support conversation concisely, highlighting key issues, questions asked, and resolution status. Keep it under 200 words."
          },
          {
            role: "user",
            content: conversation
          }
        ],
        max_tokens: 250
      });

      return response.choices[0].message.content || 'Conversation summary unavailable.';
    } catch (error) {
      console.error('❌ Conversation summary error:', error);
      return 'Unable to generate conversation summary.';
    }
  }
}

export const openaiService = new OpenAIService();
export type { ChatMessage, ChatSession };