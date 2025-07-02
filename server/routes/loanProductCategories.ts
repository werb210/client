import { Router } from 'express';
import { db } from '../db';
import { lenderProducts } from '../../shared/lenderSchema';
import { eq, and, gte, lte, ne, inArray, sql } from 'drizzle-orm';

const router = Router();

interface ProductCategoryFilters {
  country?: string;
  lookingFor?: string;
  fundingAmount?: string;
  accountsReceivableBalance?: string;
  fundsPurpose?: string;
}

// Multi-filter API endpoint for real-time product categories  
router.get('/categories', async (req, res) => {
  try {
    const {
      country = 'united_states',
      lookingFor = 'capital',
      fundingAmount = '$50,000',
      accountsReceivableBalance,
      fundsPurpose
    } = req.query as ProductCategoryFilters;

    console.log(`🔍 FILTERING PRODUCTS:`, { country, lookingFor, fundingAmount, accountsReceivableBalance, fundsPurpose });

    // Build filter conditions starting with just active products
    const conditions = [eq(lenderProducts.active, true)];

    // Product type filtering based on "What are you looking for?"
    if (lookingFor === 'equipment') {
      conditions.push(eq(lenderProducts.type, 'equipment_financing'));
    } else if (lookingFor === 'capital') {
      conditions.push(ne(lenderProducts.type, 'equipment_financing'));
    }

    // Funding amount range filtering
    const { minAmount, maxAmount } = parseFundingAmount(fundingAmount);
    if (minAmount && maxAmount) {
      // Check for overlapping ranges
      conditions.push(gte(sql`CAST(${lenderProducts.max_amount} AS DECIMAL)`, minAmount));
      conditions.push(lte(sql`CAST(${lenderProducts.min_amount} AS DECIMAL)`, maxAmount));
    }

    // Accounts receivable filtering (exclude factoring if no AR)
    if (accountsReceivableBalance === 'no_account_receivables') {
      conditions.push(ne(lenderProducts.type, 'invoice_factoring'));
    }

    // Purpose-based filtering
    if (fundsPurpose) {
      const allowedTypes = getPurposeProductTypes(fundsPurpose);
      if (allowedTypes.length > 0) {
        conditions.push(inArray(lenderProducts.type, allowedTypes));
      }
    }

    // Execute query to get product type counts
    const results = await db
      .select({
        product_type: lenderProducts.type,
        count: sql<number>`count(*)::int`
      })
      .from(lenderProducts)
      .where(and(...conditions))
      .groupBy(lenderProducts.type)
      .orderBy(sql`count(*) DESC`);

    const totalProducts = results.reduce((sum, row) => sum + row.count, 0);

    // Calculate percentages and format response
    const categories = results.map((row) => ({
      category: row.product_type,
      count: row.count,
      percentage: totalProducts > 0 ? Math.round((row.count / totalProducts) * 100) : 0
    }));

    console.log(`✅ FOUND ${totalProducts} products across ${categories.length} categories`);

    res.json({
      success: true,
      data: categories,
      totalProducts,
      filters: { country, lookingFor, fundingAmount, accountsReceivableBalance, fundsPurpose }
    });

  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product categories' });
  }
});

// Helper function to parse funding amount ranges
function parseFundingAmount(amount: string): { minAmount: number | null, maxAmount: number | null } {
  const clean = amount.replace(/[$,]/g, '');
  
  if (clean.includes('over')) {
    const match = clean.match(/over\s+(\d+)/i);
    return match ? { minAmount: parseInt(match[1]), maxAmount: 999999999 } : { minAmount: null, maxAmount: null };
  }
  
  const rangeMatch = clean.match(/(\d+)[\s-]+(\d+)/);
  if (rangeMatch) {
    return { minAmount: parseInt(rangeMatch[1]), maxAmount: parseInt(rangeMatch[2]) };
  }

  // Single amount - assume range around it
  const singleMatch = clean.match(/(\d+)/);
  if (singleMatch) {
    const amount = parseInt(singleMatch[1]);
    return { minAmount: Math.floor(amount * 0.5), maxAmount: Math.ceil(amount * 2) };
  }
  
  return { minAmount: null, maxAmount: null };
}

// Helper function to map purpose to allowed product types
function getPurposeProductTypes(purpose: string): string[] {
  const purposeMap: Record<string, string[]> = {
    'business_expansion': ['line_of_credit', 'invoice_factoring', 'working_capital', 'term_loan'],
    'working_capital': ['line_of_credit', 'working_capital', 'term_loan'],
    'equipment': ['equipment_financing'],
    'inventory': ['line_of_credit', 'invoice_factoring', 'purchase_order_financing', 'term_loan', 'working_capital'],
    'marketing': ['line_of_credit', 'term_loan', 'working_capital'],
    'debt_consolidation': ['line_of_credit', 'invoice_factoring', 'term_loan', 'working_capital'],
    'other': [] // No restrictions
  };
  
  return purposeMap[purpose] || [];
}

export default router;