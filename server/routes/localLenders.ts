import { Router } from 'express';
import { db } from '../db';
import { lenderProducts } from '@shared/lenderSchema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

const router = Router();

// Normalize database data to match frontend interface
function normalizeProduct(product: any) {
  return {
    id: product.id.toString(),
    product_name: product.name,
    lender_name: extractLenderName(product.name),
    product_type: product.type,
    geography: determineGeography(product.name),
    min_amount: parseFloat(product.min_amount || '0'),
    max_amount: parseFloat(product.max_amount || '0'),
    min_revenue: determineMinRevenue(product.type, parseFloat(product.min_amount || '0')),
    industries: determineIndustries(product.type),
    video_url: product.video_url,
    description: product.description,
    interest_rate_min: parseFloat(product.interest_rate_min || '0'),
    interest_rate_max: parseFloat(product.interest_rate_max || '0'),
    term_min: product.term_min,
    term_max: product.term_max,
    requirements: product.requirements || [],
    active: product.active
  };
}

function extractLenderName(productName: string): string {
  // Extract lender name from product name (e.g., "Business Loan - BMO" -> "BMO")
  const parts = productName.split(' - ');
  return parts.length > 1 ? parts[1] : 'Unknown Lender';
}

function determineGeography(productName: string): string[] {
  // Determine geography based on lender name
  const lenderName = extractLenderName(productName).toLowerCase();
  
  if (lenderName.includes('bmo') || lenderName.includes('rbc') || lenderName.includes('td')) {
    return ['CA'];
  } else if (lenderName.includes('capital one') || lenderName.includes('wells fargo') || 
             lenderName.includes('bank of america') || lenderName.includes('ondeck') || 
             lenderName.includes('bluevine')) {
    return ['US'];
  }
  
  return ['US', 'CA']; // Default to both
}

function determineMinRevenue(productType: string, minAmount: number): number {
  // Estimate minimum revenue based on product type and loan amount
  const revenueMultiplier = {
    'line_of_credit': 2.5,
    'working_capital': 2.0,
    'term_loan': 3.0,
    'equipment_financing': 2.5,
    'commercial_real_estate': 4.0,
    'merchant_cash_advance': 2.0,
    'invoice_factoring': 1.5
  };
  
  const multiplier = revenueMultiplier[productType as keyof typeof revenueMultiplier] || 2.5;
  return Math.max(minAmount * multiplier, 100000);
}

function determineIndustries(productType: string): string[] {
  // Determine suitable industries based on product type
  const industryMapping = {
    'line_of_credit': ['retail', 'technology', 'manufacturing', 'healthcare', 'professional_services'],
    'working_capital': ['retail', 'wholesale', 'manufacturing', 'services'],
    'term_loan': ['retail', 'professional_services', 'manufacturing', 'technology'],
    'equipment_financing': ['construction', 'manufacturing', 'transportation', 'agriculture'],
    'commercial_real_estate': ['real_estate', 'retail', 'manufacturing', 'professional_services'],
    'merchant_cash_advance': ['retail', 'restaurant', 'services', 'e-commerce'],
    'invoice_factoring': ['manufacturing', 'wholesale', 'services', 'transportation']
  };
  
  return industryMapping[productType as keyof typeof industryMapping] || ['general'];
}

// GET /api/local/lenders - Get all lender products with filtering
router.get('/', async (req, res) => {
  try {
    const {
      type,
      min_amount,
      max_amount,
      geography,
      industries,
      active = 'true'
    } = req.query;

    let query = db.select().from(lenderProducts);
    const conditions = [];

    // Apply filters
    if (active === 'true') {
      conditions.push(eq(lenderProducts.active, true));
    }

    if (type) {
      conditions.push(eq(lenderProducts.type, type as string));
    }

    if (min_amount) {
      conditions.push(gte(lenderProducts.min_amount, min_amount as string));
    }

    if (max_amount) {
      conditions.push(lte(lenderProducts.max_amount, max_amount as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const products = await query;
    const normalizedProducts = products.map(normalizeProduct);

    // Apply geography filtering (client-side since it's not in DB)
    let filteredProducts = normalizedProducts;
    if (geography) {
      const geoArray = Array.isArray(geography) ? geography : [geography];
      filteredProducts = normalizedProducts.filter(product => 
        product.geography.some(geo => geoArray.includes(geo))
      );
    }

    // Apply industry filtering (client-side since it's not in DB)
    if (industries) {
      const industryArray = Array.isArray(industries) ? industries : [industries];
      filteredProducts = filteredProducts.filter(product => 
        product.industries.some(industry => industryArray.includes(industry))
      );
    }

    res.json({
      products: filteredProducts,
      total: filteredProducts.length,
      page: 1,
      limit: filteredProducts.length,
      totalPages: 1
    });

  } catch (error) {
    console.error('Error fetching local lender products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lender products',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/local/lenders/:id - Get specific lender product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [product] = await db
      .select()
      .from(lenderProducts)
      .where(eq(lenderProducts.id, parseInt(id)));

    if (!product) {
      return res.status(404).json({ error: 'Lender product not found' });
    }

    res.json(normalizeProduct(product));

  } catch (error) {
    console.error('Error fetching lender product:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lender product',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/local/lenders/stats - Get database statistics
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await db
      .select({ count: sql<number>`count(*)` })
      .from(lenderProducts);

    const activeProducts = await db
      .select({ count: sql<number>`count(*)` })
      .from(lenderProducts)
      .where(eq(lenderProducts.active, true));

    const productsByType = await db
      .select({ 
        type: lenderProducts.type, 
        count: sql<number>`count(*)` 
      })
      .from(lenderProducts)
      .where(eq(lenderProducts.active, true))
      .groupBy(lenderProducts.type);

    res.json({
      totalProducts: totalProducts[0]?.count || 0,
      activeProducts: activeProducts[0]?.count || 0,
      productsByType: productsByType.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {} as Record<string, number>),
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching lender stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lender statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;