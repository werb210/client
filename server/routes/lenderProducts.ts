import { Router } from "express";
import axios from "axios";

const router = Router();

// In-memory storage for lender products (replace with your database)
let lenderProducts: any[] = [];

// ✅ Single source of truth - sync endpoint for client apps
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
    
    lenderProducts[index] = {
      ...lenderProducts[index],
      ...req.body,
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
      console.warn(`⚠️  Failed to notify client app ${url}:`, error.message);
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
      console.warn('SSE connection error:', error.message);
    }
  });
}

// ✅ Initialize with some sample data
if (lenderProducts.length === 0) {
  lenderProducts = [
    {
      id: "lender_equipment_001",
      lenderId: "boreal_capital",
      name: "Equipment Financing Plus",
      description: "Comprehensive equipment financing for manufacturing and industrial businesses",
      productType: "equipment_financing",
      minAmount: 50000,
      maxAmount: 2000000,
      rate: "Prime + 2.5%",
      country: "Canada",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "lender_working_capital_001", 
      lenderId: "boreal_capital",
      name: "Working Capital Line of Credit",
      description: "Flexible working capital solutions for growing businesses",
      productType: "working_capital",
      minAmount: 25000,
      maxAmount: 500000,
      rate: "Prime + 1.5%",
      country: "Canada",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

export default router;