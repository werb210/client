import express from "express";
const router = express.Router();

// Support report endpoint
router.post("/report", async (req, res) => {
  try {
    const { title, description, appId, screenshot, reportedBy } = req.body;
    
    console.log('📧 [SUPPORT] Issue report received:', {
      title,
      reportedBy,
      appId,
      screenshotSize: screenshot ? `${Math.round(screenshot.length / 1024)}KB` : 'No screenshot'
    });

    // In production, this would forward to support ticketing system
    // For now, log the report
    const reportData = {
      title,
      description,
      appId: appId || 'unknown',
      reportedBy,
      timestamp: new Date().toISOString(),
      screenshot: screenshot ? 'Base64 screenshot attached' : 'No screenshot'
    };

    console.log('📋 [SUPPORT] Report data:', reportData);

    res.json({
      success: true,
      message: 'Support report received',
      reportId: `REPORT_${Date.now()}`
    });
  } catch (error) {
    console.error('❌ [SUPPORT] Report submission failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit report'
    });
  }
});

export default router;