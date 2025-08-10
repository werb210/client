import express from "express";
const router = express.Router();

// GET /api/client/messages - Get client messages
router.get("/messages", async (req, res) => {
  try {
    // Proxy to staff backend for client messages
    const response = await fetch(`${process.env.STAFF_API_URL || 'https://staff.boreal.financial/api'}/client/messages`, {
      method: 'GET',
      headers: {
        'Authorization': req.headers.authorization || '',
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      res.status(503).json({
        success: false,
        error: 'Messages temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Client messages GET error:', error);
    res.status(503).json({
      success: false,
      error: 'Messages temporarily unavailable'
    });
  }
});

// POST /api/client/messages - Send client message
router.post("/messages", async (req, res) => {
  try {
    // Proxy to staff backend for sending client messages
    const response = await fetch(`${process.env.STAFF_API_URL || 'https://staff.boreal.financial/api'}/client/messages`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.authorization || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      res.status(503).json({
        success: false,
        error: 'Message sending temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Client messages POST error:', error);
    res.status(503).json({
      success: false,
      error: 'Message sending temporarily unavailable'
    });
  }
});

export default router;