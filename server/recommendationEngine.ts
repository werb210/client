import { db } from './db';
import { lenderProducts } from '@shared/lenderSchema';
import { eq, and, gte, lte, ne, inArray, sql } from 'drizzle-orm';

export interface RecommendationFilters {
  country: 'US' | 'CA';
  lookingFor: 'capital' | 'equipment' | 'both';
  fundsPurpose?: string;
  fundingAmount?: number;
  accountsReceivableBalance?: number;
}

export interface ProductCategory {
  category: string;
  count: number;
  percentage: number;
  matchScore: number;
}

export class RecommendationEngine {
  // Core filtering method with all conditional logic
  async getFilteredProducts(filters: RecommendationFilters) {
    let query = db.select().from(lenderProducts).where(eq(lenderProducts.active, true));

    const conditions = [eq(lenderProducts.active, true)];

    // Country-based filtering
    const geographyFilter = filters.country === 'US' ? 'United States' : 'Canada';
    conditions.push(sql`${lenderProducts.geography} @> ARRAY[${geographyFilter}]::text[]`);

    // Product type filtering based on lookingFor
    if (filters.lookingFor === 'equipment') {
      conditions.push(eq(lenderProducts.product_type, 'equipment_financing'));
    } else if (filters.lookingFor === 'capital') {
      conditions.push(ne(lenderProducts.product_type, 'equipment_financing'));
    }
    // 'both' allows all product types

    // Funding amount range filtering
    if (filters.fundingAmount) {
      conditions.push(
        and(
          lte(lenderProducts.min_amount, filters.fundingAmount),
          gte(lenderProducts.max_amount, filters.fundingAmount)
        )
      );
    }

    // Accounts receivable filtering (excludes factoring if no AR)
    if (filters.accountsReceivableBalance === 0) {
      conditions.push(ne(lenderProducts.product_type, 'invoice_factoring'));
    }

    // Funds purpose conditional filtering
    if (filters.fundsPurpose) {
      const allowedTypes = this.getAllowedProductTypes(filters.fundsPurpose);
      if (allowedTypes.length > 0) {
        conditions.push(inArray(lenderProducts.product_type, allowedTypes));
      }
    }

    const results = await db
      .select()
      .from(lenderProducts)
      .where(and(...conditions))
      .orderBy(lenderProducts.lender_name, lenderProducts.product_name);

    return results;
  }

  // Conditional product type filtering based on funds purpose
  private getAllowedProductTypes(purpose: string): string[] {
    const purposeMapping: Record<string, string[]> = {
      'equipment': ['equipment_financing'],
      'business_expansion': ['line_of_credit', 'invoice_factoring', 'working_capital', 'term_loan'],
      'working_capital': ['line_of_credit', 'working_capital', 'term_loan'],
      'inventory': ['line_of_credit', 'invoice_factoring', 'purchase_order_financing', 'term_loan', 'working_capital'],
      'marketing': ['line_of_credit', 'term_loan', 'working_capital'],
      'debt_consolidation': ['line_of_credit', 'invoice_factoring', 'term_loan', 'working_capital'],
      'other': [] // No restrictions for "other"
    };
    
    return purposeMapping[purpose] || [];
  }

  // Generate category statistics for display with match scoring
  async getCategoryStats(products: any[], filters: RecommendationFilters): Promise<ProductCategory[]> {
    const categoryCount = products.reduce((acc, product) => {
      const category = this.formatCategoryName(product.product_type);
      if (!acc[category]) {
        acc[category] = { count: 0, products: [] };
      }
      acc[category].count++;
      acc[category].products.push(product);
      return acc;
    }, {} as Record<string, { count: number; products: any[] }>);

    const total = products.length;
    
    return Object.entries(categoryCount).map(([category, data]) => {
      const matchScore = this.calculateCategoryMatchScore(data.products, filters);
      return {
        category,
        count: data.count,
        percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
        matchScore
      };
    }).sort((a, b) => b.matchScore - a.matchScore); // Sort by match score descending
  }

  // Calculate match score for a category based on business criteria
  private calculateCategoryMatchScore(products: any[], filters: RecommendationFilters): number {
    let baseScore = 60; // Base compatibility score

    // Amount range scoring (30 points)
    if (filters.fundingAmount) {
      const amountMatches = products.filter(p => 
        p.min_amount <= filters.fundingAmount && p.max_amount >= filters.fundingAmount
      );
      const amountScore = (amountMatches.length / products.length) * 30;
      baseScore += amountScore;
    }

    // Purpose alignment scoring (10 points)
    if (filters.fundsPurpose) {
      const allowedTypes = this.getAllowedProductTypes(filters.fundsPurpose);
      if (allowedTypes.length > 0) {
        const purposeMatches = products.filter(p => allowedTypes.includes(p.product_type));
        const purposeScore = (purposeMatches.length / products.length) * 10;
        baseScore += purposeScore;
      }
    }

    return Math.min(Math.round(baseScore), 100); // Cap at 100%
  }

  // Format product type names for display
  private formatCategoryName(productType: string): string {
    const nameMap: Record<string, string> = {
      'line_of_credit': 'Business Line of Credit',
      'term_loan': 'Term Loan',
      'equipment_financing': 'Equipment Financing',
      'invoice_factoring': 'Invoice Factoring',
      'working_capital': 'Working Capital',
      'purchase_order_financing': 'Purchase Order Financing',
      'commercial_real_estate': 'Commercial Real Estate',
      'merchant_cash_advance': 'Merchant Cash Advance'
    };
    return nameMap[productType] || productType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Get comprehensive industry insights
  async getIndustryInsights(filters: RecommendationFilters) {
    const products = await this.getFilteredProducts(filters);
    const categories = await this.getCategoryStats(products, filters);
    
    // Calculate average terms and rates
    const activeProducts = products.filter(p => p.min_amount && p.max_amount);
    const avgMinAmount = activeProducts.reduce((sum, p) => sum + p.min_amount, 0) / activeProducts.length;
    const avgMaxAmount = activeProducts.reduce((sum, p) => sum + p.max_amount, 0) / activeProducts.length;
    
    const uniqueLenders = new Set(products.map(p => p.lender_name));
    
    return {
      totalProducts: products.length,
      totalLenders: uniqueLenders.size,
      categories: categories.slice(0, 6), // Top 6 categories
      averageAmountRange: {
        min: Math.round(avgMinAmount),
        max: Math.round(avgMaxAmount)
      },
      topRecommendations: categories.slice(0, 3), // Top 3 recommendations
      insights: this.generateInsights(categories, filters)
    };
  }

  // Generate contextual insights based on the data
  private generateInsights(categories: ProductCategory[], filters: RecommendationFilters): string[] {
    const insights: string[] = [];
    
    if (categories.length > 0) {
      const topCategory = categories[0];
      insights.push(`${topCategory.category} shows the highest compatibility (${topCategory.matchScore}% match) for your business profile.`);
      
      if (topCategory.count > 5) {
        insights.push(`Strong market availability with ${topCategory.count} products across multiple lenders.`);
      }
    }
    
    if (filters.lookingFor === 'equipment') {
      insights.push('Equipment financing typically offers 100% financing with the equipment serving as collateral.');
    } else if (filters.lookingFor === 'capital') {
      insights.push('Working capital solutions provide flexibility for operational expenses and growth opportunities.');
    }
    
    if (filters.country === 'CA') {
      insights.push('Canadian businesses may qualify for additional government-backed financing programs.');
    }
    
    return insights;
  }

  // Get required documents for filtered products
  async getRequiredDocuments(filters: RecommendationFilters) {
    const products = await this.getFilteredProducts(filters);
    
    // Aggregate all required documents
    const documentFrequency: Record<string, number> = {};
    const totalProducts = products.length;
    
    products.forEach(product => {
      if (product.industries && Array.isArray(product.industries)) {
        product.industries.forEach((doc: string) => {
          documentFrequency[doc] = (documentFrequency[doc] || 0) + 1;
        });
      }
    });
    
    // Convert to array with frequency percentages
    const requiredDocuments = Object.entries(documentFrequency)
      .map(([document, count]) => ({
        document,
        frequency: Math.round((count / totalProducts) * 100),
        required: count / totalProducts > 0.7 // Required if >70% of products need it
      }))
      .sort((a, b) => b.frequency - a.frequency);
    
    return {
      requiredDocuments,
      productCount: totalProducts,
      lenderCount: new Set(products.map(p => p.lender_name)).size
    };
  }
}