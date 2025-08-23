import express from "express";
import syncLenderProducts from "./routes/api/sync/lender-products";

const router = express.Router();

// Sync endpoint for receiving lender products from staff app
router.post("/api/sync/lender-products", syncLenderProducts);

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