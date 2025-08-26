import { Router } from 'express';
import { db } from '../db';
import { lenderProducts } from '@shared/lenderSchema';
import { eq, and, gte, lte, sql, inArray } from 'drizzle-orm';
import type { LenderProductFilters } from '@shared/lenderSchema';

const router = Router();

// GET /api/lenders - Get all lender products with optional filtering
router.get('/', async (req, res) => {
  try {
    const {
      geography,
      product_type,
      min_amount,
      max_amount,
      industries,
      lender_name,
      is_active = 'true',
      page = '1',
      limit = '50'
    } = req.query;

    const filters: LenderProductFilters = {
      type: product_type as string,
      min_amount: min_amount ? Number(min_amount) : undefined,
      max_amount: max_amount ? Number(max_amount) : undefined,
      active: is_active === 'true'
    };

    // Build query conditions
    const conditions = [];

    if (filters.active !== undefined) {
      conditions.push(eq(lenderProducts.active, filters.active));
    }

    if (filters.type) {
      conditions.push(eq(lenderProducts.type, filters.type));
    }

    if (lender_name) {
      conditions.push(sql`lower(${lenderProducts.name}) LIKE lower(${`%${lender_name}%`})`);
    }

    if (filters.min_amount) {
      conditions.push(sql`${lenderProducts.max_amount}::numeric >= ${filters.min_amount}`);
    }

    if (filters.max_amount) {
      conditions.push(sql`${lenderProducts.min_amount}::numeric <= ${filters.max_amount}`);
    }

    // Note: geography and industries filtering would need additional schema fields

    // Execute query with pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      db.select()
        .from(lenderProducts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(limitNum)
        .offset(offset)
        .orderBy(lenderProducts.name, lenderProducts.type),
      
      db.select({ count: sql<number>`count(*)` })
        .from(lenderProducts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
    ]);

    const total = totalCount[0]?.count || 0;

    res.json({
      products: products.map(product => ({
        ...product,
        min_amount: product.min_amount ? Number(product.min_amount) : null,
        max_amount: product.max_amount ? Number(product.max_amount) : null,
        interest_rate_min: product.interest_rate_min ? Number(product.interest_rate_min) : null,
        interest_rate_max: product.interest_rate_max ? Number(product.interest_rate_max) : null,
      })),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('Error fetching lender products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lender products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/lenders/:id - Get specific lender product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [product] = await db.select()
      .from(lenderProducts)
      .where(eq(lenderProducts.id, parseInt(id)))
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: 'Lender product not found' });
    }

    res.json({
      ...product,
      min_amount: product.min_amount ? Number(product.min_amount) : null,
      max_amount: product.max_amount ? Number(product.max_amount) : null,
      interest_rate_min: product.interest_rate_min ? Number(product.interest_rate_min) : null,
      interest_rate_max: product.interest_rate_max ? Number(product.interest_rate_max) : null,
    });

  } catch (error) {
    console.error('Error fetching lender product:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lender product',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/lenders/categories/summary - Get product categories with counts
router.get('/categories/summary', async (req, res) => {
  try {
    const { geography, industries } = req.query;

    const conditions = [eq(lenderProducts.active, true)];

    if (geography) {
      const geoArray = Array.isArray(geography) ? geography as string[] : [geography as string];
      // Note: geography filtering would require additional schema fields
    }

    if (industries) {
      // Note: industries filtering would require additional schema fields
    }

    const categoryStats = await db.select({
      product_type: lenderProducts.type,
      count: sql<number>`count(*)`,
      min_amount: sql<number>`min(${lenderProducts.min_amount}::numeric)`,
      max_amount: sql<number>`max(${lenderProducts.max_amount}::numeric)`,
      avg_min_rate: sql<number>`avg(${lenderProducts.interest_rate_min}::numeric)`,
      avg_max_rate: sql<number>`avg(${lenderProducts.interest_rate_max}::numeric)`
    })
      .from(lenderProducts)
      .where(and(...conditions))
      .groupBy(lenderProducts.type)
      .orderBy(sql`count(*) DESC`);

    res.json({
      categories: categoryStats.map(stat => ({
        ...stat,
        min_amount: Number(stat.min_amount),
        max_amount: Number(stat.max_amount),
        avg_min_rate: stat.avg_min_rate ? Number(stat.avg_min_rate) : null,
        avg_max_rate: stat.avg_max_rate ? Number(stat.avg_max_rate) : null,
      }))
    });

  } catch (error) {
    console.error('Error fetching category summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch category summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/lenders/required-documents/:category - Get required documents by product category
router.get('/required-documents/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { 
      headquarters = 'united_states',
      fundingAmount = '$50,000',
      accountsReceivableBalance = undefined
    } = req.query;

    console.log(`🔍 GETTING REQUIRED DOCUMENTS for category: ${category}`);
    
    // Build base conditions
    const conditions = [
      eq(lenderProducts.active, true),
      eq(lenderProducts.type, category)
    ];

    // Note: Geographic filtering would require additional schema fields
    // Currently the schema doesn't have offered_in_canada/offered_in_us fields
    // This would need to be added to the database schema if needed

    // Parse funding amount for range filtering
    const parseFundingAmountRange = (fundingAmount: string) => {
      const cleanAmount = fundingAmount.replace(/[$,]/g, '').trim();
      
      if (cleanAmount.toLowerCase().includes('over')) {
        const match = cleanAmount.match(/over\s+(\d+)/i);
        if (match) {
          return { minAmount: parseInt(match[1], 10), maxAmount: 999999999 };
        }
      }
      
      // Range format: "$10,000 - $50,000"
      const rangeMatch = cleanAmount.match(/(\d+)[\s-]+(\d+)/);
      if (rangeMatch) {
        return {
          minAmount: parseInt(rangeMatch[1], 10),
          maxAmount: parseInt(rangeMatch[2], 10)
        };
      }
      
      return { minAmount: null, maxAmount: null };
    };

    const { minAmount, maxAmount } = parseFundingAmountRange(fundingAmount as string);
    if (minAmount !== null && maxAmount !== null) {
      conditions.push(sql`${lenderProducts.min_amount}::numeric <= ${maxAmount}`);
      conditions.push(sql`${lenderProducts.max_amount}::numeric >= ${minAmount}`);
    }

    // Apply accounts receivable filter for factoring products
    if (accountsReceivableBalance === 'no_account_receivables' && category === 'factoring') {
      console.log(`❌ Excluding factoring products - user has no account receivables`);
      return res.json({ success: true, data: [] });
    }

    const results = await db
      .select({
        product_name: lenderProducts.name,
        requirements: lenderProducts.requirements
      })
      .from(lenderProducts)
      .where(and(...conditions))
      .orderBy(lenderProducts.name);

    console.log(`📊 Found ${results.length} matching products for ${category}`);

    // Extract and flatten all required documents
    const allRequiredDocuments: string[] = [];
    
    results.forEach((product: any) => {
      if (product.requirements && Array.isArray(product.requirements)) {
        allRequiredDocuments.push(...product.requirements);
      }
    });

    // Deduplicate and format documents
    const uniqueDocuments = Array.from(new Set(allRequiredDocuments));
    const formattedDocuments = uniqueDocuments.map(doc => ({
      name: doc,
      description: `Required for ${category.replace('_', ' ')} applications`,
      quantity: 1,
      required: true
    }));

    // Fallback to standard business loan documents if no specific requirements found
    if (formattedDocuments.length === 0) {
      const fallbackDocuments = [
        { name: "Bank Statements", description: "Last 6 months of business bank statements", quantity: 6, required: true },
        { name: "Tax Returns", description: "Last 3 years of business tax returns", quantity: 3, required: true },
        { name: "Accountant Prepared Financial Statements", description: "Recent profit & loss and balance sheet", quantity: 3, required: true },
        { name: "Business License", description: "Valid business registration or license", quantity: 1, required: true },
        { name: "Articles of Incorporation", description: "Legal business formation documents", quantity: 1, required: false }
      ];
      
      console.log(`✅ Using fallback documents for ${category}: ${fallbackDocuments.length} documents`);
      return res.json({ success: true, data: fallbackDocuments });
    }

    console.log(`✅ DYNAMIC RESPONSE: Found ${formattedDocuments.length} required documents for ${category}`);
    res.json({ success: true, data: formattedDocuments });

  } catch (error: any) {
    console.error("Error fetching required documents:", error);
    res.status(500).json({ success: false, message: "Failed to fetch required documents" });
  }
});

// Debug routes completely removed in production builds
if (process.env.NODE_ENV !== 'production' && process.env.REPLIT_ENVIRONMENT !== 'production') {
  // Debug route for product categories - development only
  router.get('/debug/lenders', async (req, res) => {
    try {
      const products = await db.select().from(lenderProducts);
      const productCategories = products.map(p => p.type).filter(Boolean);
      console.log('[DEBUG] Staff API - Product categories:', productCategories);
      res.json(productCategories);
    } catch (error) {
      console.error('Error in debug/lenders route:', error);
      res.status(500).json({ error: 'Failed to fetch lender categories' });
    }
  });

  // Debug route for full product info - development only  
  router.get('/debug/products', async (req, res) => {
    try {
      const products = await db.select().from(lenderProducts);
      console.log('[DEBUG] Staff API - Total products:', products.length);
      
      const categories = [...new Set(products.map(p => p.type))].filter(Boolean);
      console.log('[DEBUG] Staff API - Unique categories:', categories);
      
      res.json({
        totalProducts: products.length,
        categories: categories,
        sampleProducts: products.slice(0, 3).map(p => ({
          product_name: p.name,
          product_type: p.type,
          min_amount: p.min_amount,
          max_amount: p.max_amount
        }))
      });
    } catch (error) {
      console.error('Error in debug/products route:', error);
      res.status(500).json({ error: 'Failed to fetch debug products' });
    }
  });
}

export default router;