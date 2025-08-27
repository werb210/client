import express from "express";
import { replaceAll, getAll, pullFromStaffBackend } from "../services/lenderProductsCache.js";

const router = express.Router();

router.post("/api/sync/lender-products", express.json({ limit: "2mb" }), (req, res) => {
  try {
    const AUTH = req.get("authorization") || "";
    const token = (AUTH.startsWith("Bearer ") ? AUTH.slice(7) : "");
    const envToken = process.env.SYNC_TOKEN || "";
    
    // Authentication successful
    
    if (!token || token !== envToken) {
      console.warn("❌ Unauthorized sync attempt from:", req.ip);
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    const products = req.body?.products;
    if (!Array.isArray(products) || !products.length) {
      return res.status(400).json({ ok: false, error: "invalid_payload" });
    }

    const result = replaceAll(products);
    console.log(`✅ Staff sync: ${result.saved} products (CA: ${result.CA}, US: ${result.US}) sig: ${result.sig.substring(0, 8)}`);
    
    return res.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("❌ Sync error:", e?.message || e);
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.get("/api/lender-products", (_req, res) => {
  try {
    const items = getAll();
    const CA = items.filter(p => p.country === "CA").length;
    const US = items.filter(p => p.country === "US").length;
    
    console.log(`✅ Served ${items.length} products from in-memory catalog (CA: ${CA}, US: ${US})`);
    res.json({ success: true, total: items.length, products: items, countries: { CA, US } });
  } catch (e: any) {
    console.error("❌ Failed to serve products:", e?.message || e);
    res.status(500).json({ success: false, error: String(e?.message || e) });
  }
});

// Pull endpoint to fetch products from staff backend  
router.post("/internal/pull-staff-products", async (_req, res) => {
  try {
    const result = await pullFromStaffBackend();
    console.log(`✅ Manual pull completed: ${result.saved} products (CA: ${result.CA}, US: ${result.US})`);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("❌ Manual pull failed:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;