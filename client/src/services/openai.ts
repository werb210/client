import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development - move to server in production
});

export interface AnalysisRequest {
  type: 'document_analysis' | 'sentiment_analysis' | 'amount_optimization' | 'product_recommendation';
  data: any;
  context?: any;
}

export interface AnalysisResult {
  success: boolean;
  result?: any;
  error?: string;
  confidence?: number;
}

class OpenAIService {
  
  async analyzeDocument(documentText: string, applicationContext: any): Promise<AnalysisResult> {
    try {
      const prompt = `Analyze this business document for a loan application:
      
      Document Text: "${documentText}"
      
      Application Context:
      - Business Type: ${applicationContext.businessType || 'Unknown'}
      - Loan Amount: $${applicationContext.loanAmount?.toLocaleString() || 'Unknown'}
      - Purpose: ${applicationContext.loanPurpose || 'Unknown'}
      
      Extract key financial information and assess document quality for lending purposes.
      Return analysis in JSON format with extracted data and quality assessment.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a business lending document analyzer. Extract key financial data and assess document quality. Return JSON:
            {
              "extractedData": {
                "revenue": "string",
                "expenses": "string", 
                "cashFlow": "string",
                "assets": "string",
                "liabilities": "string"
              },
              "qualityScore": number (0-100),
              "concerns": ["string"],
              "recommendations": ["string"],
              "documentType": "string"
            }`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return {
        success: true,
        result: analysis,
        confidence: analysis.qualityScore || 0
      };
      
    } catch (error) {
      console.error('❌ Document analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze document'
      };
    }
  }

  async analyzeSentiment(text: string): Promise<{
    rating: number;
    confidence: number;
    emotions: string[];
    suggestions: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze sentiment for business communication. Return JSON:
            {
              "rating": number (1-5 stars),
              "confidence": number (0-1),
              "emotions": ["string"],
              "suggestions": ["string (how to improve communication)"]
            }`
          },
          {
            role: "user",
            content: `Analyze the sentiment of this business communication: "${text}"`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        emotions: result.emotions || [],
        suggestions: result.suggestions || []
      };
      
    } catch (error) {
      console.error('❌ Sentiment analysis error:', error);
      return {
        rating: 3,
        confidence: 0,
        emotions: [],
        suggestions: ['Unable to analyze sentiment']
      };
    }
  }

  async generateInsights(applicationData: any, lenderData: any[]): Promise<{
    insights: string[];
    recommendations: string[];
    riskFactors: string[];
    optimizations: string[];
  }> {
    try {
      const prompt = `Generate comprehensive insights for this business loan application:
      
      Application Data:
      - Business: ${applicationData.businessType} in ${applicationData.industry}
      - Amount: $${applicationData.loanAmount?.toLocaleString()}
      - Revenue: ${applicationData.annualRevenue}
      - Time in Business: ${applicationData.timeInBusiness}
      
      Available Lenders: ${lenderData.length} lenders
      
      Provide actionable insights, recommendations, risk factors, and optimization suggestions.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Generate comprehensive business lending insights. Return JSON:
            {
              "insights": ["string (key observations)"],
              "recommendations": ["string (actionable advice)"],
              "riskFactors": ["string (potential issues)"],
              "optimizations": ["string (improvement suggestions)"]
            }`
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
      console.error('❌ Insights generation error:', error);
      return {
        insights: [],
        recommendations: [],
        riskFactors: [],
        optimizations: []
      };
    }
  }

  async generateBusinessPlan(businessProfile: any): Promise<{
    executiveSummary: string;
    marketAnalysis: string;
    financialProjections: string;
    riskAssessment: string;
  }> {
    try {
      const prompt = `Generate a business plan outline for this lending application:
      
      Business Profile:
      - Type: ${businessProfile.businessType}
      - Industry: ${businessProfile.industry}
      - Target Loan: $${businessProfile.loanAmount?.toLocaleString()}
      - Purpose: ${businessProfile.loanPurpose}
      - Current Revenue: ${businessProfile.annualRevenue}
      
      Create a professional business plan outline suitable for lenders.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Generate professional business plan outlines for lending applications. Return JSON:
            {
              "executiveSummary": "string",
              "marketAnalysis": "string", 
              "financialProjections": "string",
              "riskAssessment": "string"
            }`
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
      console.error('❌ Business plan generation error:', error);
      return {
        executiveSummary: 'Unable to generate executive summary',
        marketAnalysis: 'Unable to generate market analysis', 
        financialProjections: 'Unable to generate financial projections',
        riskAssessment: 'Unable to generate risk assessment'
      };
    }
  }

  async processComplexQuery(query: string, context: any): Promise<{
    answer: string;
    followUpQuestions: string[];
    relatedTopics: string[];
    actionItems: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert business lending advisor. Process complex queries and provide comprehensive responses. Return JSON:
            {
              "answer": "string (comprehensive answer)",
              "followUpQuestions": ["string"],
              "relatedTopics": ["string"],
              "actionItems": ["string"]
            }`
          },
          {
            role: "user",
            content: `Query: "${query}"\n\nContext: ${JSON.stringify(context, null, 2)}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('❌ Complex query processing error:', error);
      return {
        answer: 'I apologize, but I encountered an issue processing your query. Please try rephrasing your question.',
        followUpQuestions: [],
        relatedTopics: [],
        actionItems: []
      };
    }
  }

  // Helper method to check if API key is available
  isConfigured(): boolean {
    return !!import.meta.env.VITE_OPENAI_API_KEY;
  }

  // Get usage statistics (client-side estimation)
  getUsageStats(): { 
    tokensEstimated: number; 
    requestsToday: number; 
    lastUsed: Date | null;
  } {
    // This is a simple client-side tracking - in production, track server-side
    const stats = localStorage.getItem('openai_usage_stats');
    if (stats) {
      return JSON.parse(stats);
    }
    return {
      tokensEstimated: 0,
      requestsToday: 0,
      lastUsed: null
    };
  }

  // Update usage statistics
  private updateUsageStats(estimatedTokens: number = 1000) {
    const stats = this.getUsageStats();
    const today = new Date().toDateString();
    const lastUsedDate = stats.lastUsed ? new Date(stats.lastUsed).toDateString() : null;
    
    if (lastUsedDate !== today) {
      stats.requestsToday = 1;
      stats.tokensEstimated = estimatedTokens;
    } else {
      stats.requestsToday += 1;
      stats.tokensEstimated += estimatedTokens;
    }
    
    stats.lastUsed = new Date();
    localStorage.setItem('openai_usage_stats', JSON.stringify(stats));
  }
}

export const openAIService = new OpenAIService();