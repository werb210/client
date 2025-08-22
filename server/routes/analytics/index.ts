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

// Events tracking endpoint for frontend analytics
router.get("/events", async (req: any, res) => {
  try {
    // Return sample events for now - in production this would query the database
    const events = [
      {
        event: "step_view",
        step: "step_1",
        timestamp: new Date().toISOString(),
        source: "application_flow"
      },
      {
        event: "step_completed", 
        step: "step_2",
        timestamp: new Date().toISOString(),
        source: "application_flow"
      },
      {
        event: "ga_test_event",
        step: "step_2_product_recommendations", 
        timestamp: new Date().toISOString(),
        source: "auto_debug"
      }
    ];
    res.json(events);
  } catch (error) {
    console.error("Analytics events error:", error);
    res.status(500).json({ error: "Failed to retrieve analytics events" });
  }
});

// Track new events (POST endpoint for frontend to submit events)
router.post("/events", async (req: any, res) => {
  try {
    const { event, step, source, data } = req.body;
    // In production, this would save to database
    console.log(`📊 Analytics Event: ${event} | Step: ${step} | Source: ${source}`);
    res.json({ success: true, message: "Event tracked successfully" });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    res.status(500).json({ error: "Failed to track event" });
  }
});

export default router;