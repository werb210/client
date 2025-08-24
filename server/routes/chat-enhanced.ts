// server/routes/chat-enhanced.ts - Enhanced chat routes for staff handoff and user message logging
import express from 'express';
import { requireCsrf } from '../security/csrf';

const router = express.Router();

// POST /api/chat/user-message - Log user message to staff (non-blocking)
router.post('/user-message', async (req, res) => {
  try {
    const { email, name, text, source, tenant, page } = req.body;
    
    const staffApiUrl = process.env.STAFF_API_URL;
    if (!staffApiUrl) {
      // Return success even if staff API not configured (non-blocking)
      return res.json({ ok: true, logged: false });
    }

    // Attempt to log to staff API (non-blocking)
    try {
      await fetch(`${staffApiUrl}/api/chat/user-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Boreal-Client-Portal/1.0'
        },
        body: JSON.stringify({
          email,
          name,
          text,
          source: source || 'chat',
          tenant: tenant || 'boreal',
          page: page || '/',
          timestamp: new Date().toISOString()
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      res.json({ ok: true, logged: true });
    } catch (error) {
      console.warn('⚠️ [CHAT] Failed to log user message to staff:', error);
      res.json({ ok: true, logged: false }); // Still return success
    }

  } catch (error) {
    console.error('❌ [CHAT] User message logging error:', error);
    res.status(500).json({ ok: false, error: 'Failed to process request' });
  }
});

// POST /api/chat/request-staff - Request human handoff
router.post('/request-staff', async (req, res) => {
  try {
    const { sessionId, name, email, currentPage } = req.body;
    
    const staffApiUrl = process.env.STAFF_API_URL;
    if (!staffApiUrl) {
      return res.status(503).json({
        ok: false,
        error: 'Staff handoff not configured',
        message: 'Please contact us directly at info@boreal.financial'
      });
    }

    const response = await fetch(`${staffApiUrl}/api/chat/request-staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Boreal-Client-Portal/1.0'
      },
      body: JSON.stringify({
        sessionId,
        name,
        email,
        currentPage,
        timestamp: new Date().toISOString(),
        source: 'client-portal'
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (response.ok) {
      const result = await response.json();
      res.json({
        ok: true,
        message: 'Staff handoff requested successfully',
        staffRequestId: result.requestId
      });
    } else {
      throw new Error(`Staff API error: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ [CHAT] Staff handoff error:', error);
    res.status(500).json({
      ok: false,
      error: 'Staff handoff failed',
      message: 'Please contact us directly at info@boreal.financial'
    });
  }
});

export default router;