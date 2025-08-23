import express from "express";
import syncLenderProducts from "./routes/api/sync/lender-products";
import { getLenderProductJsonSchema } from "../shared/schemas/lenderProductSchema";

const router = express.Router();

// Sync endpoint for receiving lender products from staff app
router.post("/api/sync/lender-products", syncLenderProducts);

// ✅ NEW: Schema endpoint for staff app form generation
router.get("/api/schema/lender-products", (req, res) => {
  try {
    const schema = getLenderProductJsonSchema();
    res.status(200).json({
      success: true,
      schema,
      meta: {
        version: "1.0.0",
        description: "Lender product schema for client-staff synchronization",
        fields: Object.keys(schema.properties).length,
        generated: new Date().toISOString()
      }
    });
    console.log("✅ Served lender product schema to staff app");
  } catch (error) {
    console.error("❌ Failed to generate schema:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to generate schema" 
    });
  }
});

// Serve lender products data as static JSON
router.get("/data/lenderProducts.json", (req, res) => {
  res.sendFile("lenderProducts.json", { root: "data" }, (err) => {
    if (err) {
      console.error("Failed to serve lender products:", err);
      res.status(404).json({ products: [] });
    }
  });
});

export default router;