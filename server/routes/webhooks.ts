import { Router } from "express";
import { refreshLenderProductsCache } from "../services/lenderProductsCache";

const router = Router();

// ✅ Webhook endpoint for lender product updates
router.post("/lender-products/update", async (req, res) => {
  try {
    const { timestamp, productsCount } = req.body;
    
    console.log(`📢 Received lender products update webhook:`, {
      timestamp,
      productsCount,
      source: req.headers['x-webhook-source']
    });
    
    // Refresh the lender products cache
    await refreshLenderProductsCache();
    
    res.status(200).json({ 
      success: true, 
      message: "Lender products cache refreshed",
      processedAt: new Date().toISOString()
    });
    
    console.log(`✅ Lender products cache refreshed via webhook`);
    
  } catch (error) {
    console.error("Failed to process lender products webhook:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to refresh lender products cache" 
    });
  }
});

// ✅ Health check for webhook endpoints
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "webhook-handler",
    timestamp: new Date().toISOString()
  });
});

export default router;