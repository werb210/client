import { Router } from "express";
import { getSummary } from "../../services/analytics";
import { backfillAnalytics } from "../../jobs/analyticsDaily";
import { runAnalyticsReportOnce } from "../../jobs/analyticsReportJob";

const router = Router();

router.get("/summary", async (req: any, res) => {
  try {
    const to = String(req.query.to || new Date().toISOString().slice(0,10));
    const from = String(req.query.from || new Date(new Date(to).getTime() - 29*24*3600*1000).toISOString().slice(0,10));
    const out = await getSummary(from, to);
    res.json({ from, to, ...out });
  } catch (error) {
    console.error("Analytics summary error:", error);
    res.status(500).json({ error: "Failed to retrieve analytics summary" });
  }
});

router.post("/backfill", async (_req, res) => {
  try {
    await backfillAnalytics(90);
    res.json({ ok: true, message: "Analytics backfill completed for 90 days" });
  } catch (error) {
    console.error("Analytics backfill error:", error);
    res.status(500).json({ error: "Failed to backfill analytics data" });
  }
});

router.post("/export/pdf", async (req: any, res) => {
  try {
    const { from, to } = req.body || {};
    const out = await runAnalyticsReportOnce({ from, to });
    res.json({ ok: true, ...out });
  } catch (error) {
    console.error("Analytics export error:", error);
    res.status(500).json({ error: "Failed to generate analytics report" });
  }
});

// Get rolling 30-day analytics
router.get("/rolling/30d", async (_req, res) => {
  try {
    const to = new Date().toISOString().slice(0,10);
    const from = new Date(new Date(to).getTime() - 29*24*3600*1000).toISOString().slice(0,10);
    const data = await getSummary(from, to);
    res.json({ period: "30d", from, to, ...data });
  } catch (error) {
    console.error("30-day analytics error:", error);
    res.status(500).json({ error: "Failed to retrieve 30-day analytics" });
  }
});

// Get rolling 7-day analytics
router.get("/rolling/7d", async (_req, res) => {
  try {
    const to = new Date().toISOString().slice(0,10);
    const from = new Date(new Date(to).getTime() - 6*24*3600*1000).toISOString().slice(0,10);
    const data = await getSummary(from, to);
    res.json({ period: "7d", from, to, ...data });
  } catch (error) {
    console.error("7-day analytics error:", error);
    res.status(500).json({ error: "Failed to retrieve 7-day analytics" });
  }
});

export default router;