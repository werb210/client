import express from "express";
import { getAll } from "../services/lenderProductsCache.js";

const r = express.Router();

r.get("/api/lender-products", async (_req, res) => {
  try {
    const rawProducts = getAll();
    const products = rawProducts.map(x => ({
      /* canonical fields - no invention of defaults */
      id: x.id,
      name: x.name ?? "",
      country: x.country ?? null,        // never default to 'US'
      category: x.category ?? null,
      min_amount: x.min_amount ?? null,  // never default to 0
      max_amount: x.max_amount ?? null,  // never default to MAX_SAFE_INTEGER
      active: typeof x.active === "boolean" ? x.active : null,
      
      /* legacy aliases (for old clients) */
      countryOffered: x.country ?? null,
      productCategory: x.category ?? null,
      minimumLendingAmount: x.min_amount ?? null,
      maximumLendingAmount: x.max_amount ?? null,
      isActive: typeof x.active === "boolean" ? x.active : null,
      
      /* pass-through Staff fields that were previously lost */
      min_time_in_business: x.min_time_in_business ?? null,
      min_monthly_revenue: x.min_monthly_revenue ?? null,
      excluded_industries: x.excluded_industries ?? [],
      required_documents: x.required_documents ?? null,
    }));
    
    res.json({ products, total: products.length });
  } catch (e) {
    res.status(500).json({ error: "legacy lender-products failed", detail: String(e.message || e) });
  }
});

export default r;