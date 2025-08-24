import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development - move to server in production
});

export interface DocumentRequirement {
  documentType: string;
  required: boolean;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  alternativeOptions?: string[];
}

export interface DocumentAnalysis {
  missingDocuments: DocumentRequirement[];
  completionPercentage: number;
  nextSteps: string[];
  estimatedApprovalChance: number;
  recommendations: string[];
}

export interface ApplicationProfile {
  businessType: string;
  industry: string;
  loanAmount: number;
  loanPurpose: string;
  timeInBusiness: string;
  annualRevenue: string;
  creditScore?: string;
  existingDocuments: string[];
}

class AIDocumentDetectionService {
  
  async analyzeDocumentRequirements(profile: ApplicationProfile): Promise<DocumentAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(profile);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert business lending advisor. Analyze application profiles and recommend required documents for optimal approval chances. Focus on Canadian lending requirements and Boreal Financial's standards.
            
            Return JSON with this exact structure:
            {
              "missingDocuments": [
                {
                  "documentType": "string",
                  "required": boolean,
                  "reason": "string", 
                  "priority": "high|medium|low",
                  "alternativeOptions": ["string"]
                }
              ],
              "completionPercentage": number,
              "nextSteps": ["string"],
              "estimatedApprovalChance": number,
              "recommendations": ["string"]
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

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return this.validateAndEnhanceAnalysis(analysis, profile);
      
    } catch (error) {
      console.error('❌ AI Document Detection error:', error);
      return this.getFallbackAnalysis(profile);
    }
  }

  async optimizeLoanAmount(profile: ApplicationProfile): Promise<{
    recommendedAmount: number;
    minAmount: number;
    maxAmount: number;
    reasoning: string;
    riskFactors: string[];
    improvementSuggestions: string[];
  }> {
    try {
      const prompt = `Analyze this business profile and recommend optimal loan amounts:
      
      Business: ${profile.businessType} in ${profile.industry}
      Requested: $${profile.loanAmount.toLocaleString()}
      Revenue: ${profile.annualRevenue}
      Time in Business: ${profile.timeInBusiness}
      Purpose: ${profile.loanPurpose}
      
      Consider:
      - Canadian lending standards
      - Industry-specific risk factors
      - Cash flow requirements
      - Debt service coverage ratios
      - Seasonal variations
      
      Provide practical, conservative recommendations that maximize approval chances.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a Canadian business lending expert. Provide loan amount optimization advice in JSON format:
            {
              "recommendedAmount": number,
              "minAmount": number, 
              "maxAmount": number,
              "reasoning": "string",
              "riskFactors": ["string"],
              "improvementSuggestions": ["string"]
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

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('❌ Loan optimization error:', error);
      return this.getFallbackOptimization(profile);
    }
  }

  async suggestProductTypes(profile: ApplicationProfile): Promise<{
    recommendedProducts: Array<{
      productType: string;
      suitabilityScore: number;
      pros: string[];
      cons: string[];
      typicalTerms: string;
    }>;
    reasoning: string;
  }> {
    try {
      const prompt = `Business Profile Analysis:
      - Type: ${profile.businessType}
      - Industry: ${profile.industry}
      - Loan Purpose: ${profile.loanPurpose}
      - Amount: $${profile.loanAmount.toLocaleString()}
      - Revenue: ${profile.annualRevenue}
      - Time in Business: ${profile.timeInBusiness}
      
      Recommend the best financing products from these options:
      - Equipment Financing
      - Working Capital Loan
      - Business Line of Credit
      - Invoice Factoring
      - Term Loan
      - Merchant Cash Advance
      
      Consider Canadian market conditions and typical approval criteria.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system", 
            content: `Analyze business profiles and recommend optimal financing products. Return JSON:
            {
              "recommendedProducts": [
                {
                  "productType": "string",
                  "suitabilityScore": number (0-100),
                  "pros": ["string"],
                  "cons": ["string"], 
                  "typicalTerms": "string"
                }
              ],
              "reasoning": "string"
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
      console.error('❌ Product recommendation error:', error);
      return this.getFallbackProducts(profile);
    }
  }

  async predictApprovalTimeline(profile: ApplicationProfile, selectedLenders: string[]): Promise<{
    estimatedDays: number;
    confidenceLevel: number;
    factors: Array<{
      factor: string;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
    }>;
    milestones: Array<{
      milestone: string;
      estimatedDay: number;
      description: string;
    }>;
  }> {
    try {
      const prompt = `Predict approval timeline for this lending scenario:
      
      Business Profile:
      - ${profile.businessType} in ${profile.industry}
      - $${profile.loanAmount.toLocaleString()} for ${profile.loanPurpose}
      - ${profile.annualRevenue} revenue, ${profile.timeInBusiness} in business
      - Documents: ${profile.existingDocuments.join(', ')}
      
      Selected Lenders: ${selectedLenders.join(', ')}
      
      Consider:
      - Lender processing speeds
      - Document completeness
      - Industry complexity
      - Loan amount complexity
      - Time of year factors
      - Underwriting complexity`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Predict business loan approval timelines based on industry experience. Return JSON:
            {
              "estimatedDays": number,
              "confidenceLevel": number (0-100),
              "factors": [
                {
                  "factor": "string",
                  "impact": "positive|negative|neutral",
                  "description": "string"
                }
              ],
              "milestones": [
                {
                  "milestone": "string", 
                  "estimatedDay": number,
                  "description": "string"
                }
              ]
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

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('❌ Timeline prediction error:', error);
      return this.getFallbackTimeline();
    }
  }

  private buildAnalysisPrompt(profile: ApplicationProfile): string {
    return `Analyze this Canadian business loan application for missing documents:

    Business Profile:
    - Type: ${profile.businessType}
    - Industry: ${profile.industry}  
    - Loan Amount: $${profile.loanAmount.toLocaleString()}
    - Purpose: ${profile.loanPurpose}
    - Annual Revenue: ${profile.annualRevenue}
    - Time in Business: ${profile.timeInBusiness}
    - Existing Documents: ${profile.existingDocuments.join(', ') || 'None uploaded'}
    
    Standard Canadian lender requirements typically include:
    - Business Registration/Articles of Incorporation
    - 3-6 months business bank statements
    - Personal and business tax returns (last 2 years)
    - Financial statements (P&L, Balance Sheet)
    - Personal financial statement
    - Business plan (for larger loans)
    - Personal guarantee
    - Void cheque
    - Driver's license/ID
    
    Identify what's missing, prioritize by importance, and suggest alternatives where applicable.
    Focus on documents that will maximize approval chances for this specific profile.`;
  }

  private validateAndEnhanceAnalysis(analysis: any, profile: ApplicationProfile): DocumentAnalysis {
    // Ensure all required fields exist with defaults
    return {
      missingDocuments: analysis.missingDocuments || [],
      completionPercentage: Math.min(100, Math.max(0, analysis.completionPercentage || 0)),
      nextSteps: analysis.nextSteps || ['Upload required documents'],
      estimatedApprovalChance: Math.min(100, Math.max(0, analysis.estimatedApprovalChance || 50)),
      recommendations: analysis.recommendations || ['Complete document upload to improve approval chances']
    };
  }

  private getFallbackAnalysis(profile: ApplicationProfile): DocumentAnalysis {
    const commonDocuments = [
      {
        documentType: "Business Bank Statements",
        required: true,
        reason: "Required to verify cash flow and business operations",
        priority: "high" as const,
        alternativeOptions: ["3-6 months of recent statements"]
      },
      {
        documentType: "Business Tax Returns",
        required: true,
        reason: "Demonstrates business financial history and tax compliance",
        priority: "high" as const,
        alternativeOptions: ["Last 2 years of business returns"]
      }
    ];

    return {
      missingDocuments: commonDocuments,
      completionPercentage: 25,
      nextSteps: ["Upload business bank statements", "Provide tax returns"],
      estimatedApprovalChance: 60,
      recommendations: ["Complete document upload to improve approval chances"]
    };
  }

  private getFallbackOptimization(profile: ApplicationProfile) {
    return {
      recommendedAmount: Math.round(profile.loanAmount * 0.8),
      minAmount: Math.round(profile.loanAmount * 0.5),
      maxAmount: Math.round(profile.loanAmount * 1.2),
      reasoning: "Conservative estimate based on typical lending ratios",
      riskFactors: ["Insufficient data for detailed analysis"],
      improvementSuggestions: ["Provide more detailed financial information"]
    };
  }

  private getFallbackProducts(profile: ApplicationProfile) {
    return {
      recommendedProducts: [
        {
          productType: "Working Capital Loan",
          suitabilityScore: 75,
          pros: ["General business use", "Flexible terms"],
          cons: ["May require personal guarantee"],
          typicalTerms: "6-24 months, 8-15% interest"
        }
      ],
      reasoning: "Default recommendation for general business needs"
    };
  }

  private getFallbackTimeline() {
    return {
      estimatedDays: 14,
      confidenceLevel: 60,
      factors: [
        {
          factor: "Standard processing time",
          impact: "neutral" as const,
          description: "Typical lender processing speed"
        }
      ],
      milestones: [
        {
          milestone: "Application Review", 
          estimatedDay: 3,
          description: "Initial application assessment"
        },
        {
          milestone: "Underwriting",
          estimatedDay: 10, 
          description: "Detailed financial review"
        },
        {
          milestone: "Final Decision",
          estimatedDay: 14,
          description: "Approval or decline notification"
        }
      ]
    };
  }
}

export const aiDocumentDetection = new AIDocumentDetectionService();