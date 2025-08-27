import express from "express";
import { getAll } from "../services/lenderProductsCache.js";

const r = express.Router();

/* Helper to transform to V1 format with canonical Client field names */
const toV1 = (row) => ({
  id: row.id,
  name: row.name ?? "",
  lender_name: row.lender_name ?? "",
  country: row.country ?? null,           // never default to 'US'
  category: row.category ?? null,
  min_amount: row.min_amount ?? null,
  max_amount: row.max_amount ?? null,
  active: typeof row.active === "boolean" ? row.active : null,
  updated_at: row.updated_at,

  /* NEW: expose Staff fields that were previously lost */
  min_time_in_business: row.min_time_in_business ?? null,
  min_monthly_revenue: row.min_monthly_revenue ?? null,
  excluded_industries: row.excluded_industries ?? [],
  required_documents: row.required_documents ?? [],
});

r.get("/api/v1/products", async (_req, res) => {
  try {
    const products = getAll();
    res.json(products.map(toV1));
  } catch (e) {
    res.status(500).json({ error: "v1 products failed", detail: String(e.message || e) });
  }
});

r.get("/api/v1/lenders", async (_req, res) => {
  try {
    const products = getAll();
    const lenderCounts = {};
    
    products.forEach(p => {
      const lenderId = p.lender_name || p.name || 'unknown';
      lenderCounts[lenderId] = (lenderCounts[lenderId] || 0) + 1;
    });
    
    const lenders = Object.entries(lenderCounts).map(([id, count]) => ({
      id,
      name: id,
      product_count: count
    })).sort((a, b) => b.product_count - a.product_count);
    
    res.json({ lenders });
  } catch (e) {
    res.status(500).json({ error: "v1 lenders failed", detail: String(e.message || e) });
  }
});

export default r;