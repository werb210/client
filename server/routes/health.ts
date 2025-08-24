import type { Router } from "express";
import express from "express";

const r = express.Router();

r.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, app: "client", mode: process.env.NODE_ENV });
});

r.get("/health/staff", async (_req, res) => {
  const base = process.env.STAFF_API_URL;
  if (!base) return res.status(200).json({ ok: true, staff: "unset" });
  try {
    const response = await fetch(`${base}/api/health`, { 
      signal: AbortSignal.timeout(3000)
    });
    res.status(200).json({ ok: true, staff: response.ok ? "up" : `down:${response.status}` });
  } catch (e: any) {
    res.status(200).json({ ok: true, staff: "error", detail: e?.message ?? "n/a" });
  }
});

export default r;