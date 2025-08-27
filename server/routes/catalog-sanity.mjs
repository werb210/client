import express from "express";
import { getAll } from "../services/lenderProductsCache.js";

const r = express.Router();

r.get("/api/catalog/sanity", async (_req, res) => {
  try {
    const products = getAll();
    
    // Count by country
    const countryCounts = {};
    products.forEach(p => {
      const country = p.country || 'NULL';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    
    // Count by category
    const categoryCounts = {};
    products.forEach(p => {
      const category = p.category || 'NULL';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Calculate amount ranges
    const validAmounts = products.filter(p => 
      p.min_amount !== null && p.max_amount !== null &&
      typeof p.min_amount === 'number' && typeof p.max_amount === 'number'
    );
    
    const ranges = validAmounts.length > 0 ? {
      min_min: Math.min(...validAmounts.map(p => p.min_amount)),
      max_min: Math.max(...validAmounts.map(p => p.min_amount)),
      min_max: Math.min(...validAmounts.map(p => p.max_amount)),
      max_max: Math.max(...validAmounts.map(p => p.max_amount))
    } : {
      min_min: null,
      max_min: null, 
      min_max: null,
      max_max: null
    };
    
    const by_country = Object.entries(countryCounts)
      .map(([k, n]) => ({ k, n }))
      .sort((a, b) => b.n - a.n);
      
    const by_category = Object.entries(categoryCounts)
      .map(([k, n]) => ({ k, n }))
      .sort((a, b) => b.n - a.n);
    
    res.json({ 
      total: products.length,
      by_country,
      by_category,
      ranges
    });
  } catch (e) {
    res.status(500).json({ error: "sanity failed", detail: String(e.message || e) });
  }
});

export default r;