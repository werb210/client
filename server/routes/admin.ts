import { Router } from 'express';
import { db } from '../db';
import { lenderProducts, auditLogs } from '@shared/lenderSchema';
import { eq } from 'drizzle-orm';
import { insertLenderProductSchema } from '@shared/lenderSchema';

const router = Router();

// GET /api/admin/lenders - Get all lender products for admin management
router.get('/lenders', async (req, res) => {
  try {
    const products = await db.select().from(lenderProducts);
    
    res.json({
      products,
      total: products.length,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching admin lender products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lender products',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/admin/lenders - Create new lender product
router.post('/lenders', async (req, res) => {
  try {
    // Validate request body
    const validatedData = insertLenderProductSchema.parse(req.body);
    
    const [newProduct] = await db
      .insert(lenderProducts)
      .values(validatedData)
      .returning();

    // Log audit trail
    await db.insert(auditLogs).values({
      user_id: req.ip || 'system', // In production, use actual user ID
      action: 'CREATE',
      resource_type: 'lender_product',
      resource_id: newProduct.id.toString(),
      meta: { product_data: validatedData },
      ip_address: req.ip,
      user_agent: req.get('User-Agent') || null,
    });

    res.status(201).json({
      product: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating lender product:', error);
    res.status(400).json({ 
      error: 'Failed to create lender product',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/admin/lenders/:id - Update lender product
router.put('/lenders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Validate request body
    const validatedData = insertLenderProductSchema.partial().parse(req.body);
    
    const [updatedProduct] = await db
      .update(lenderProducts)
      .set(validatedData)
      .where(eq(lenderProducts.id, id))
      .returning();

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Log audit trail
    await db.insert(auditLogs).values({
      user_id: req.ip || 'system',
      action: 'UPDATE',
      resource_type: 'lender_product',
      resource_id: id.toString(),
      meta: { product_data: validatedData },
      ip_address: req.ip,
      user_agent: req.get('User-Agent') || null,
    });

    res.json({
      product: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating lender product:', error);
    res.status(400).json({ 
      error: 'Failed to update lender product',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/admin/lenders/:id - Delete lender product
router.delete('/lenders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const [deletedProduct] = await db
      .delete(lenderProducts)
      .where(eq(lenderProducts.id, id))
      .returning();

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Log audit trail
    await db.insert(auditLogs).values({
      user_id: req.ip || 'system',
      action: 'DELETE',
      resource_type: 'lender_product',
      resource_id: id.toString(),
      meta: { deleted_product: deletedProduct },
      ip_address: req.ip,
      user_agent: req.get('User-Agent') || null,
    });

    res.json({
      message: 'Product deleted successfully',
      deletedProduct
    });
  } catch (error) {
    console.error('Error deleting lender product:', error);
    res.status(500).json({ 
      error: 'Failed to delete lender product',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/stats - Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalProducts] = await db
      .select({ count: lenderProducts.id })
      .from(lenderProducts);

    const [activeProducts] = await db
      .select({ count: lenderProducts.id })
      .from(lenderProducts)
      .where(eq(lenderProducts.active, true));

    const [inactiveProducts] = await db
      .select({ count: lenderProducts.id })
      .from(lenderProducts)
      .where(eq(lenderProducts.active, false));

    res.json({
      stats: {
        total_products: totalProducts?.count || 0,
        active_products: activeProducts?.count || 0,
        inactive_products: inactiveProducts?.count || 0,
      },
      message: 'Admin statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch admin statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;