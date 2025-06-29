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
      geography: geography ? (Array.isArray(geography) ? geography as string[] : [geography as string]) : undefined,
      product_type: product_type as string,
      min_amount: min_amount ? Number(min_amount) : undefined,
      max_amount: max_amount ? Number(max_amount) : undefined,
      industries: industries ? (Array.isArray(industries) ? industries as string[] : [industries as string]) : undefined,
      lender_name: lender_name as string,
      is_active: is_active === 'true'
    };

    // Build query conditions
    const conditions = [];

    if (filters.is_active !== undefined) {
      conditions.push(eq(lenderProducts.is_active, filters.is_active));
    }

    if (filters.product_type) {
      conditions.push(eq(lenderProducts.product_type, filters.product_type));
    }

    if (filters.lender_name) {
      conditions.push(sql`lower(${lenderProducts.lender_name}) LIKE lower(${`%${filters.lender_name}%`})`);
    }

    if (filters.min_amount) {
      conditions.push(gte(lenderProducts.max_amount, filters.min_amount.toString()));
    }

    if (filters.max_amount) {
      conditions.push(lte(lenderProducts.min_amount, filters.max_amount.toString()));
    }

    if (filters.geography && filters.geography.length > 0) {
      conditions.push(sql`${lenderProducts.geography} && ${JSON.stringify(filters.geography)}`);
    }

    if (filters.industries && filters.industries.length > 0) {
      conditions.push(sql`${lenderProducts.industries} && ${JSON.stringify(filters.industries)}`);
    }

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
        .orderBy(lenderProducts.lender_name, lenderProducts.product_name),
      
      db.select({ count: sql<number>`count(*)` })
        .from(lenderProducts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
    ]);

    const total = totalCount[0]?.count || 0;

    res.json({
      products: products.map(product => ({
        ...product,
        min_amount: Number(product.min_amount),
        max_amount: Number(product.max_amount),
        min_revenue: product.min_revenue ? Number(product.min_revenue) : null,
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
      .where(eq(lenderProducts.id, id))
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: 'Lender product not found' });
    }

    res.json({
      ...product,
      min_amount: Number(product.min_amount),
      max_amount: Number(product.max_amount),
      min_revenue: product.min_revenue ? Number(product.min_revenue) : null,
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

    const conditions = [eq(lenderProducts.is_active, true)];

    if (geography) {
      const geoArray = Array.isArray(geography) ? geography as string[] : [geography as string];
      conditions.push(sql`${lenderProducts.geography} && ${JSON.stringify(geoArray)}`);
    }

    if (industries) {
      const industryArray = Array.isArray(industries) ? industries as string[] : [industries as string];
      conditions.push(sql`${lenderProducts.industries} && ${JSON.stringify(industryArray)}`);
    }

    const categoryStats = await db.select({
      product_type: lenderProducts.product_type,
      count: sql<number>`count(*)`,
      min_amount: sql<number>`min(${lenderProducts.min_amount}::numeric)`,
      max_amount: sql<number>`max(${lenderProducts.max_amount}::numeric)`,
      avg_min_rate: sql<number>`avg(${lenderProducts.interest_rate_min}::numeric)`,
      avg_max_rate: sql<number>`avg(${lenderProducts.interest_rate_max}::numeric)`
    })
      .from(lenderProducts)
      .where(and(...conditions))
      .groupBy(lenderProducts.product_type)
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

export default router;