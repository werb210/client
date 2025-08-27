import express from "express";
import { getAll } from "../services/lenderProductsCache.js";

const r = express.Router();

/* Helper to transform to V1 format with exposed Staff fields */
const toV1 = (row) => ({
  id: row.id,
  productName: row.name ?? "",
  lenderName: row.lender_name ?? row.name ?? "",
  countryOffered: row.country ?? null,           // never default to 'US'
  productCategory: row.category ?? null,
  minimumLendingAmount: row.min_amount ?? null,
  maximumLendingAmount: row.max_amount ?? null,
  isActive: typeof row.active === "boolean" ? row.active : null,

  /* NEW: expose Staff fields that were previously lost */
  min_time_in_business: row.min_time_in_business ?? null,
  min_monthly_revenue: row.min_monthly_revenue ?? null,
  excluded_industries: row.excluded_industries ?? [],
  required_documents: row.required_documents ?? null,
});

r.get("/api/v1/products", async (_req, res) => {
  try {
    const products = getAll();
    console.log('V1 DEBUG - First product from cache:', JSON.stringify({
      id: products[0]?.id,
      min_time_in_business: products[0]?.min_time_in_business,
      min_monthly_revenue: products[0]?.min_monthly_revenue,
      excluded_industries: products[0]?.excluded_industries,
      required_documents: products[0]?.required_documents
    }, null, 2));
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