export interface IndustryInsight {
  title: string;
  trends: string[];
  recommendations: string[];
  riskFactors: string[];
}

export function generateIndustryInsights(industry: string): IndustryInsight | null {
  const insights: Record<string, IndustryInsight> = {
    manufacturing: {
      title: "Manufacturing Industry Insights",
      trends: ["Equipment financing is popular", "Working capital for inventory", "Export financing opportunities"],
      recommendations: ["Consider equipment loans for machinery", "Invoice factoring for cash flow", "SBA loans for expansion"],
      riskFactors: ["Commodity price fluctuations", "Supply chain disruptions", "Regulatory compliance"]
    },
    retail: {
      title: "Retail Industry Insights", 
      trends: ["Seasonal funding needs", "E-commerce expansion", "Inventory management"],
      recommendations: ["Line of credit for seasonal inventory", "POS financing programs", "Merchant cash advances"],
      riskFactors: ["Consumer spending patterns", "Competition from online retailers", "Inventory obsolescence"]
    },
    technology: {
      title: "Technology Industry Insights",
      trends: ["Rapid growth funding needs", "R&D investment requirements", "Talent acquisition costs"],
      recommendations: ["Venture debt for growth", "Equipment financing for tech infrastructure", "Working capital for scaling"],
      riskFactors: ["Market volatility", "Technology obsolescence", "Competition from startups"]
    },
    healthcare: {
      title: "Healthcare Industry Insights",
      trends: ["Equipment modernization", "Practice expansion", "Regulatory compliance costs"],
      recommendations: ["Medical equipment financing", "Practice acquisition loans", "Working capital for operations"],
      riskFactors: ["Regulatory changes", "Insurance reimbursement delays", "Malpractice liability"]
    },
    construction: {
      title: "Construction Industry Insights",
      trends: ["Equipment replacement cycles", "Project-based financing", "Seasonal cash flow"],
      recommendations: ["Equipment financing for machinery", "Lines of credit for materials", "Contract financing"],
      riskFactors: ["Weather dependencies", "Material cost fluctuations", "Project delays"]
    },
    professional_services: {
      title: "Professional Services Insights",
      trends: ["Office expansion", "Technology upgrades", "Staff growth"],
      recommendations: ["Working capital loans", "Equipment financing for tech", "Lines of credit for cash flow"],
      riskFactors: ["Client concentration", "Economic downturns", "Competition"]
    },
    hospitality: {
      title: "Hospitality Industry Insights",
      trends: ["Recovery from pandemic", "Technology integration", "Customer experience enhancement"],
      recommendations: ["Equipment financing for renovations", "Working capital for operations", "SBA loans for expansion"],
      riskFactors: ["Seasonal fluctuations", "Economic sensitivity", "Labor shortages"]
    },
    agriculture: {
      title: "Agriculture Industry Insights",
      trends: ["Sustainable farming practices", "Equipment modernization", "Direct-to-consumer sales"],
      recommendations: ["Equipment financing for machinery", "Operating loans for inputs", "USDA loan programs"],
      riskFactors: ["Weather dependence", "Commodity price volatility", "Environmental regulations"]
    }
  };
  
  return insights[industry] || null;
}

export function formatCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    'term_loan': 'Term Loans',
    'line_of_credit': 'Lines of Credit',
    'equipment_financing': 'Equipment Financing',
    'working_capital': 'Working Capital',
    'invoice_factoring': 'Invoice Factoring',
    'purchase_order_financing': 'Purchase Order Financing',
    'commercial_real_estate': 'Commercial Real Estate',
    'merchant_cash_advance': 'Merchant Cash Advance'
  };
  
  return categoryNames[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}