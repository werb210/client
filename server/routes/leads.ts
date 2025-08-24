// server/routes/leads.ts - Lead capture and forwarding to Staff API
import express from 'express';
import { z } from 'zod';
import { issueCsrf, requireCsrf } from '../security/csrf';

const router = express.Router();

// Validation schema for lead data
const leadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  consent: z.boolean(),
  source: z.string().default('chat'),
  page: z.string().optional(),
  tenant: z.string().optional(),
  language: z.string().default('en'),
  utmParams: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional()
  }).optional()
});

// In-memory lead queue for when Staff API is unavailable
interface QueuedLead {
  timestamp: string;
  payload: any;
  retryCount: number;
}

const leadQueue: QueuedLead[] = [];
let isProcessingQueue = false;

// POST /api/leads - Submit lead with CSRF protection
router.post('/leads', requireCsrf, async (req, res) => {
  try {
    // Validate input with Zod
    const validatedData = leadSchema.parse(req.body);
    
    if (!validatedData.consent) {
      return res.status(400).json({
        ok: false,
        error: 'Consent is required to proceed',
        code: 'CONSENT_REQUIRED'
      });
    }

    const leadPayload = {
      ...validatedData,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionId || 'anonymous'
    };

    console.log('[LEADS] Processing lead submission:', {
      name: validatedData.name,
      email: validatedData.email,
      source: validatedData.source,
      hasConsent: validatedData.consent
    });

    // Try to forward to Staff API
    try {
      const staffApiUrl = process.env.STAFF_API_URL;
      if (!staffApiUrl) {
        throw new Error('STAFF_API_URL not configured');
      }

      const staffResponse = await fetch(`${staffApiUrl}/api/chat/log-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Boreal-Client-Portal/1.0'
        },
        body: JSON.stringify(leadPayload),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (staffResponse.ok) {
        const result = await staffResponse.json();
        console.log('✅ [LEADS] Successfully forwarded to Staff API');
        
        // Process any queued leads on successful connection
        processLeadQueue();
        
        return res.status(200).json({
          ok: true,
          message: 'Lead captured successfully',
          contactId: result.contactId
        });
      } else {
        throw new Error(`Staff API responded with status ${staffResponse.status}`);
      }
    } catch (staffError) {
      const errorMessage = staffError instanceof Error ? staffError.message : 'Unknown error';
      console.warn('⚠️ [LEADS] Staff API unavailable, queuing lead:', errorMessage);
      
      // Queue the lead for retry
      leadQueue.push({
        timestamp: new Date().toISOString(),
        payload: leadPayload,
        retryCount: 0
      });

      // Return success to user (they don't need to know about the queue)
      return res.status(202).json({
        ok: true,
        message: 'Lead captured successfully',
        queued: true
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        ok: false,
        error: 'Validation failed',
        details: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }

    console.error('❌ [LEADS] Lead processing error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to process lead',
      code: 'PROCESSING_ERROR'
    });
  }
});

// Background queue processing
async function processLeadQueue() {
  if (isProcessingQueue || leadQueue.length === 0) return;
  
  isProcessingQueue = true;
  const staffApiUrl = process.env.STAFF_API_URL;
  
  if (!staffApiUrl) {
    isProcessingQueue = false;
    return;
  }

  console.log(`🔄 [LEADS] Processing ${leadQueue.length} queued leads`);

  while (leadQueue.length > 0) {
    const queuedLead = leadQueue.shift();
    if (!queuedLead) continue;

    try {
      const response = await fetch(`${staffApiUrl}/api/chat/log-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Boreal-Client-Portal/1.0'
        },
        body: JSON.stringify(queuedLead.payload),
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        console.log('✅ [LEADS] Queued lead processed successfully');
      } else {
        throw new Error(`Staff API error: ${response.status}`);
      }
    } catch (error) {
      queuedLead.retryCount++;
      
      if (queuedLead.retryCount < 3) {
        // Re-queue for retry
        leadQueue.push(queuedLead);
        console.log(`🔄 [LEADS] Re-queuing lead (attempt ${queuedLead.retryCount + 1})`);
      } else {
        console.error('❌ [LEADS] Lead dropped after 3 retry attempts:', error);
      }
    }
  }

  isProcessingQueue = false;
}

// GET /api/leads/queue-status - Check queue status (for monitoring)
router.get('/queue-status', (req, res) => {
  res.json({
    queueLength: leadQueue.length,
    isProcessing: isProcessingQueue,
    timestamp: new Date().toISOString()
  });
});

// Periodic queue processing (every 5 minutes)
setInterval(processLeadQueue, 5 * 60 * 1000);

export default router;