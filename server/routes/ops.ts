import express from "express";
const router = express.Router();

router.get("/sla", async (req, res) => {
  res.json({
    submit_to_staff_visible_ms_p95: 10000,
    docs_to_ocr_ready_ms_p95: 90000
  });
});

export default router;