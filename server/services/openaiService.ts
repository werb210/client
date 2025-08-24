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

  /**
   * Detect if the user is asking about Canadian startup funding
   */
  private detectCanadaStartupQuery(message: string): boolean {
    const canadaKeywords = ['canada', 'canadian', 'ca'];
    const startupKeywords = ['startup', 'new business', 'just started', 'starting up', 'new company', 'new venture'];
    
    const hasCanada = canadaKeywords.some(keyword => message.includes(keyword));
    const hasStartup = startupKeywords.some(keyword => message.includes(keyword));
    
    return hasCanada && hasStartup;
  }

  async initializeAssistant(): Promise<string> {
    if (this.assistantId) {
      return this.assistantId;
    }

    try {
      const assistant = await openai.beta.assistants.create({
        name: "Boreal Financial Assistant",
        instructions: `You are a helpful financial assistant for Boreal Financial's lending platform. You specialize in:

1. **Explaining Lender Types**: Help users understand different types of lenders (banks, credit unions, alternative lenders, online lenders) and which might be best for their situation
2. **Document Upload Assistance**: Guide users through document requirements and help them upload the correct files
3. **Document Categories**: Clarify what documents belong in each category (Tax Returns, Bank Statements, Financial Statements, etc.)
4. **Application Navigation**: Walk users through the 7-step application process
5. **Escalation Support**: When users need human help, offer: "I'd be happy to connect you with a human agent who can provide more personalized assistance"

Key Guidelines:
- Be professional, helpful, and encouraging
- Use simple, everyday language that non-technical users can understand
- Focus on the user's immediate needs
- For complex financial advice, always escalate to human agents
- Reference specific lender products when relevant
- Guide users step-by-step through processes

Current Application Steps:
1. Financial Profile - Basic business information
2. Product Recommendations - View matched lenders  
3. Business Details - Detailed company information
4. Applicant Information - Personal details
5. Document Upload - Required documentation (focus area)
6. Signature - Electronic signature
7. Submission - Final review and submit

**Document Categories You Can Help With:**
- Tax Returns (Business & Personal)
- Bank Statements (3-6 months recent)
- Financial Statements (P&L, Balance Sheet)
- Articles of Incorporation
- Business License
- Voided Check
- Driver's License

**Common Escalation Phrases to Watch For:**
- "I'd like to speak to a human"
- "Can I talk to someone?"
- "This is confusing"
- "I need more help"
- "I don't understand"

When you detect frustration or escalation requests, respond with: "I understand you'd like to speak with a human agent. Let me connect you with someone who can provide more personalized assistance."`,
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
      // Check for Canada startup funding questions and apply guardrails
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      const isCanadaStartupQuery = this.detectCanadaStartupQuery(lastMessage);
      
      // Immediate guardrail response for Canada startup queries
      if (isCanadaStartupQuery) {
        console.log('🔴 [GUARDRAIL] Canada startup query detected, applying compliance response');
        return "Most Canadian lenders require at least 6 months of established business operations and consistent revenue history. Startups or very new businesses typically need to demonstrate revenue before qualifying for most financing products. I can help you explore your options once you have some operating history.";
      }
      
      const systemMessage = `You are Boreal Financial's AI assistant. Help users with their lending applications.

Current Context:
- Application Step: ${context?.currentStep || 'Not started'}
- Application ID: ${context?.applicationId || 'None'}
- Available Products: ${context?.lenderProducts?.length || 0} matches
- Lender Database: ${context?.lenderProducts ? 'LIVE ACCESS' : 'Offline'}

CRITICAL COMPLIANCE RULES:

🔴 CANADA STARTUP FUNDING GUARDRAIL:
If a user asks about funding for Canadian startups, new businesses, or companies with minimal revenue in Canada, you MUST respond with:
"Most Canadian lenders require at least 6 months of established business operations and consistent revenue history. Startups or very new businesses typically need to demonstrate revenue before qualifying for most financing products. I can help you explore your options once you have some operating history."

NEVER say "Yes, we can fund startups" or give false hope about easy startup funding in Canada.

Other Important Guidelines:
- Lines of Credit: Explain eligibility requirements (credit score, revenue, time in business)
- Equipment Financing: Mention criteria (equipment type, business history, amount)
- Funding Speed: "2-5 business days after approval" 
- Bad Credit: "Some lenders accept lower credit scores, but stronger banking history helps"
- Real Estate: "We do not offer real estate-backed lending"
- Documents: "Typically bank statements, business registration, and financial statements"
- Interest Rates: "Rates vary based on your business profile, credit, and funding type"

ENHANCED LENDER RECOMMENDATIONS:
When users ask about financing, loans, or funding, leverage the live lender product database to:
- Suggest specific lenders that match their criteria
- Mention relevant product categories (Equipment Financing, Working Capital, etc.)
- Reference actual available products and amounts when applicable
- Guide them toward the next steps in their application

Be helpful, professional, and guide users through their lending journey while maintaining compliance.`;

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