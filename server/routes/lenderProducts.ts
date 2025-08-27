import { Router } from "express";
import axios from "axios";
import { LenderProductSchema } from "../../shared/schemas/lenderProductSchema";

const router = Router();

// In-memory storage for lender products (replace with your database)
let lenderProducts: any[] = [];

// ✅ Single source of truth - sync endpoint for client apps (GET)
router.get("/sync", async (req, res) => {
  try {
    // In a real implementation, this would query your database
    // const products = await db.select().from(lenderProducts).orderBy(lenderProducts.name);
    
    const products = lenderProducts.sort((a, b) => a.name.localeCompare(b.name));
    
    res.status(200).json({ 
      success: true, 
      products,
      lastUpdated: new Date().toISOString(),
      count: products.length
    });
  } catch (error) {
    console.error("Failed to fetch lender products:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch lender products" 
    });
  }
});

// ✅ CLIENT APP PATCH - Secure complete replacement sync endpoint (POST)
router.post("/sync", async (req, res) => {
  try {
    // Validate staff authorization
    const authHeader = req.headers.authorization;
    const syncSecret = process.env.CLIENT_SYNC_SECRET || 'dev_sync_secret_2024';
    const expectedAuth = `Bearer ${syncSecret}`;
    
    if (!syncSecret) {
      console.error("❌ CLIENT_SYNC_SECRET not configured");
      return res.status(500).json({ 
        success: false, 
        error: "Server configuration error" 
      });
    }
    
    if (authHeader !== expectedAuth) {
      console.warn("❌ Unauthorized sync attempt from:", req.ip);
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized - invalid sync credentials" 
      });
    }

    const { products } = req.body;
    
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ 
        success: false, 
        error: "Products array is required" 
      });
    }

    // Completely replace the lender product list (client patch functionality)
    lenderProducts.length = 0; // Clear existing products
    lenderProducts.push(...products); // Add new products
    
    // Notify client apps of complete sync
    await notifyClientApps();
    
    // Broadcast to SSE connections
    broadcastProductUpdate();

    res.status(200).json({ 
      success: true, 
      count: products.length,
      message: `Successfully synced ${products.length} lender products`
    });
    
    console.log(`✅ CLIENT SYNC: Replaced all products with ${products.length} new products`);
  } catch (error) {
    console.error("❌ Client sync failed:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to sync lender products" 
    });
  }
});

// ✅ Add new product with auto-sync
router.post("/", async (req, res) => {
  try {
    const newProduct = {
      id: `lender_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    lenderProducts.push(newProduct);
    
    // Notify client apps of update
    await notifyClientApps();
    
    // Broadcast to SSE connections
    broadcastProductUpdate();
    
    res.status(201).json({ 
      success: true, 
      product: newProduct 
    });
    
    console.log(`✅ Added lender product: ${newProduct.name}`);
  } catch (error) {
    console.error("Failed to add lender product:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to add lender product" 
    });
  }
});

// ✅ Update product with auto-sync
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const index = lenderProducts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    // ✅ SECURITY FIX: Validate and filter input using schema
    const validationResult = LenderProductSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid product data",
        details: validationResult.error.errors
      });
    }

    // Only update with validated properties, excluding 'id' to prevent tampering
    const { id: _, ...validUpdates } = validationResult.data;
    
    lenderProducts[index] = {
      ...lenderProducts[index],
      ...validUpdates,
      updatedAt: new Date().toISOString()
    };
    
    // Notify client apps of update
    await notifyClientApps();
    
    // Broadcast to SSE connections
    broadcastProductUpdate();
    
    res.status(200).json({ 
      success: true, 
      product: lenderProducts[index] 
    });
    
    console.log(`✅ Updated lender product: ${lenderProducts[index].name}`);
  } catch (error) {
    console.error("Failed to update lender product:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to update lender product" 
    });
  }
});

// ✅ Delete product with auto-sync
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const index = lenderProducts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    const deletedProduct = lenderProducts.splice(index, 1)[0];
    
    // Notify client apps of deletion
    await notifyClientApps();
    
    // Broadcast to SSE connections
    broadcastProductUpdate();
    
    res.status(200).json({ 
      success: true, 
      deletedProduct 
    });
    
    console.log(`✅ Deleted lender product: ${deletedProduct.name}`);
  } catch (error) {
    console.error("Failed to delete lender product:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete lender product" 
    });
  }
});

// ✅ Manual "Push All Products" button endpoint
router.post("/push", async (req, res) => {
  try {
    await notifyClientApps();
    
    res.status(200).json({ 
      success: true, 
      message: "Lender products pushed to all client apps",
      productsCount: lenderProducts.length
    });
    
    console.log(`✅ Manually pushed ${lenderProducts.length} lender products to client apps`);
  } catch (error) {
    console.error("Failed to push lender products:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to push lender products" 
    });
  }
});

// ✅ Webhook notification system
async function notifyClientApps() {
  const clientAppUrls = [
    process.env.CLIENT_APP_URL || "http://localhost:5000"
  ];
  
  const notifications = clientAppUrls.map(async (url) => {
    try {
      await axios.post(`${url}/webhooks/lender-products/update`, {
        timestamp: new Date().toISOString(),
        productsCount: lenderProducts.length
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'staff-app'
        }
      });
      
      console.log(`✅ Notified client app: ${url}`);
    } catch (error) {
      console.warn(`⚠️  Failed to notify client app ${url}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  });
  
  await Promise.allSettled(notifications);
}

// SSE connections tracking
let sseConnections: any[] = [];

// ✅ Server-Sent Events for real-time updates
router.get("/events", (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  // Add this connection to the list
  sseConnections.push(res);
  
  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
  
  // Keep connection alive with periodic heartbeat
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
    } catch (error) {
      clearInterval(heartbeat);
    }
  }, 30000);
  
  // Clean up when client disconnects
  req.on('close', () => {
    clearInterval(heartbeat);
    const index = sseConnections.indexOf(res);
    if (index !== -1) {
      sseConnections.splice(index, 1);
    }
  });
});

// Helper function to broadcast updates to all SSE connections
function broadcastProductUpdate() {
  const message = JSON.stringify({ 
    type: 'lender-products-updated', 
    timestamp: new Date().toISOString(),
    count: lenderProducts.length
  });
  
  sseConnections.forEach(connection => {
    try {
      connection.write(`data: ${message}\n\n`);
    } catch (error) {
      console.warn('SSE connection error:', error instanceof Error ? error.message : 'Unknown error');
    }
  });
}

// ✅ Initialize with minimal fallback data (push-based system doesn't need initialization)
(async () => {
  if (lenderProducts.length === 0) {
    console.log("📦 Using push-based lender products system - no initialization needed");
  }
})();

export default router;