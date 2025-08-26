/**
 * Live data ingestion endpoint for V2 schema migration
 * Handles secure ingestion of new lender product data
 */

import { Router } from 'express';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { lenderProducts } from '../../shared/lenderSchema.js';

const router = Router();

// V2 Schema validation for incoming live data
const V2LenderProductSchema = z.object({
  id: z.string().min(1),
  lender: z.string().min(1),
  product: z.string().min(1),
  productCategory: z.string().min(1),
  minAmountUsd: z.number().positive(),
  maxAmountUsd: z.number().positive(),
  interestRateMin: z.number().min(0).optional(),
  interestRateMax: z.number().min(0).optional(),
  termMinMonths: z.number().positive().optional(),
  termMaxMonths: z.number().positive().optional(),
  rateType: z.enum(['fixed', 'variable']).optional(),
  interestFrequency: z.enum(['monthly', 'quarterly', 'annually']).optional(),
  requiredDocs: z.array(z.string()).default([]),
  minRevenue: z.number().min(0).optional(),
  industries: z.array(z.string()).optional(),
  description: z.string().optional(),
  geography: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
}).refine(data => data.maxAmountUsd >= data.minAmountUsd, {
  message: "maxAmountUsd must be greater than or equal to minAmountUsd"
});

const IngestRequestSchema = z.object({
  products: z.array(V2LenderProductSchema)
});

/**
 * POST /api/admin/ingest-live-data
 * Ingest new live data using V2 schema
 */
router.post('/ingest-live-data', async (req, res) => {
  // Starting data ingestion process
  
  try {
    // Validate request body
    const validation = IngestRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request format',
        details: validation.error.issues
      });
    }

    const { products: liveProducts } = validation.data;
    // Processing live products

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ index: number; product: string; error: string }> = [];

    // Process each product
    for (let i = 0; i < liveProducts.length; i++) {
      const liveProduct = liveProducts[i];
      
      try {
        // Map V2 schema to database schema (matching shared/lenderSchema.ts)
        const dbProduct = {
          name: liveProduct.product,
          type: liveProduct.productCategory,
          description: liveProduct.description,
          min_amount: liveProduct.minAmountUsd?.toString() || '0',
          max_amount: liveProduct.maxAmountUsd?.toString() || '0',
          interest_rate_min: liveProduct.interestRateMin?.toString(),
          interest_rate_max: liveProduct.interestRateMax?.toString(),
          term_min: liveProduct.termMinMonths,
          term_max: liveProduct.termMaxMonths,
          requirements: liveProduct.requiredDocs || [],
          video_url: null as string | null,
          active: liveProduct.isActive ?? true
        };

        // Insert into database (no conflict resolution needed for new data)
        await db.insert(lenderProducts).values(dbProduct);

        successCount++;
        
        if (i % 10 === 0) {
          // Product processed
        }

      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          index: i,
          product: liveProduct.product || liveProduct.id,
          error: errorMessage
        });
        console.error(`❌ Product ${i + 1} failed:`, errorMessage);
      }
    }

    // Log final results
    // Ingestion complete

    // Return results
    res.json({
      success: successCount,
      failed: errorCount,
      errors: errors,
      totalProcessed: liveProducts.length
    });

  } catch (error) {
    console.error('💥 Ingestion process failed:', error);
    res.status(500).json({
      success: 0,
      failed: 1,
      errors: [{ 
        index: 0, 
        product: 'System', 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }]
    });
  }
});

/**
 * GET /api/admin/database-status
 * Check current database status
 */
router.get('/database-status', async (req, res) => {
  try {
    const [countResult] = await db.select().from(lenderProducts);
    const productCount = await db.select().from(lenderProducts).then(rows => rows.length);
    
    // Get category breakdown
    const categories = await db.select({
      category: lenderProducts.type,
      count: sql`count(*)`
    })
    .from(lenderProducts)
    .groupBy(lenderProducts.type);

    res.json({
      totalProducts: productCount,
      categories: categories,
      lastUpdated: new Date().toISOString(),
      schemaVersion: 'V2'
    });

  } catch (error) {
    console.error('Database status check failed:', error);
    res.status(500).json({
      error: 'Failed to check database status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/admin/clear-database
 * Clear all lender products (for testing/migration)
 */
router.delete('/clear-database', async (req, res) => {
  try {
    // Clearing database
    
    const deleteResult = await db.delete(lenderProducts);
    
    // Database cleared
    
    res.json({
      success: true,
      message: 'Database cleared successfully',
      deletedCount: deleteResult.rowCount || 0
    });

  } catch (error) {
    console.error('Database clearing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;