/**
 * Push Notification API Routes
 * Handles subscription management and push notification sending
 */

import express from 'express';
import { z } from 'zod';
import { pool } from '../config/database';
import { sendClientNotification, sendBulkNotifications, NotificationTemplates } from '../services/pushService';

const router = express.Router();

/**
 * POST /api/notifications/subscribe
 * Subscribe to push notifications
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { applicationId, subscription, userAgent } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid subscription object' 
      });
    }

    // Insert or update subscription
    const query = `
      INSERT INTO push_subscriptions (application_id, endpoint, p256dh_key, auth_key, user_agent, updated_at)
      VALUES ($1, $2, $3, $4, $5, now())
      ON CONFLICT (endpoint) 
      DO UPDATE SET 
        application_id = EXCLUDED.application_id,
        p256dh_key = EXCLUDED.p256dh_key,
        auth_key = EXCLUDED.auth_key,
        user_agent = EXCLUDED.user_agent,
        updated_at = now()
      RETURNING *
    `;

    const result = await pool.query(query, [
      applicationId || null,
      subscription.endpoint,
      subscription.keys.p256dh,
      subscription.keys.auth,
      userAgent || null
    ]);

    console.log(`✅ Push subscription saved: ${subscription.endpoint.substring(0, 50)}...`);

    res.json({ 
      success: true, 
      subscriptionId: result.rows[0].id 
    });
  } catch (error) {
    console.error('Push subscription error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save subscription' 
    });
  }
});

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from push notifications
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ 
        success: false, 
        error: 'Endpoint required' 
      });
    }

    const query = 'DELETE FROM push_subscriptions WHERE endpoint = $1';
    const result = await pool.query(query, [endpoint]);

    res.json({ 
      success: true, 
      removed: (result.rowCount || 0) > 0 
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to unsubscribe' 
    });
  }
});

/**
 * POST /api/notifications/push
 * Send push notification to specific subscription
 */
router.post('/push', async (req, res) => {
  try {
    const { subscription, payload } = req.body;

    if (!subscription || !payload) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing subscription or payload' 
      });
    }

    const result = await sendClientNotification(subscription, payload);
    res.json(result);
  } catch (error) {
    console.error('Push send error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send notification' 
    });
  }
});

/**
 * POST /api/notifications/push-to-application
 * Send push notification to all subscribers of an application
 */
router.post('/push-to-application', async (req, res) => {
  try {
    const { applicationId, payload } = req.body;

    if (!applicationId || !payload) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing applicationId or payload' 
      });
    }

    // Get all subscriptions for this application
    const query = `
      SELECT endpoint, p256dh_key, auth_key 
      FROM push_subscriptions 
      WHERE application_id = $1
    `;
    const result = await pool.query(query, [applicationId]);

    if (result.rows.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No subscriptions found for application',
        sent: 0 
      });
    }

    // Convert to web-push format
    const subscriptions = result.rows.map(row => ({
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh_key,
        auth: row.auth_key
      }
    }));

    const pushResult = await sendBulkNotifications(subscriptions, payload);
    
    res.json({ 
      success: true, 
      sent: pushResult.success,
      failed: pushResult.failed,
      errors: pushResult.errors 
    });
  } catch (error) {
    console.error('Bulk push error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send bulk notifications' 
    });
  }
});

/**
 * POST /api/notifications/document-required
 * Send document required notification
 */
router.post('/document-required', async (req, res) => {
  try {
    const { applicationId, documentType, reason } = req.body;

    if (!applicationId || !documentType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing applicationId or documentType' 
      });
    }

    const payload = reason 
      ? NotificationTemplates.documentRejected(documentType, reason)
      : NotificationTemplates.documentRequired(documentType);

    // Forward to push-to-application endpoint
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/push-to-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, payload })
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Document notification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send document notification' 
    });
  }
});

/**
 * POST /api/notifications/agent-response
 * Send agent response notification
 */
router.post('/agent-response', async (req, res) => {
  try {
    const { applicationId, message } = req.body;

    if (!applicationId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing applicationId' 
      });
    }

    const payload = NotificationTemplates.agentResponse(message);

    // Forward to push-to-application endpoint  
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/push-to-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, payload })
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Agent response notification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send agent response notification' 
    });
  }
});

/**
 * GET /api/notifications/subscriptions/:applicationId
 * Get all subscriptions for an application
 */
router.get('/subscriptions/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    const query = `
      SELECT id, endpoint, user_agent, created_at, updated_at
      FROM push_subscriptions 
      WHERE application_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [applicationId]);

    res.json({ 
      success: true, 
      subscriptions: result.rows.map(row => ({
        id: row.id,
        endpoint: row.endpoint.substring(0, 50) + '...', // Truncate for security
        userAgent: row.user_agent,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get subscriptions' 
    });
  }
});

/**
 * POST /api/notifications/test
 * Test notification endpoint for development
 */
router.post('/test', async (req, res) => {
  try {
    const { applicationId, type = 'general' } = req.body;

    let payload;
    switch (type) {
      case 'document-required':
        payload = NotificationTemplates.documentRequired('Tax Returns');
        break;
      case 'agent-response':
        payload = NotificationTemplates.agentResponse('Your agent has responded to your message');
        break;
      case 'application-update':
        payload = NotificationTemplates.applicationUpdate('Under Review');
        break;
      default:
        payload = {
          title: 'Test Notification',
          body: 'This is a test push notification from Boreal Financial',
          type: 'general' as const,
          url: '/'
        };
    }

    if (applicationId) {
      // Send to specific application
      const response = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/push-to-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, payload })
      });
      const result = await response.json();
      res.json(result);
    } else {
      // Send to all subscriptions
      const query = `
        SELECT endpoint, p256dh_key, auth_key 
        FROM push_subscriptions 
        ORDER BY created_at DESC 
        LIMIT 10
      `;
      const result = await pool.query(query);

      if (result.rows.length === 0) {
        return res.json({ 
          success: true, 
          message: 'No subscriptions found',
          sent: 0 
        });
      }

      const subscriptions = result.rows.map(row => ({
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh_key,
          auth: row.auth_key
        }
      }));

      const pushResult = await sendBulkNotifications(subscriptions, payload);
      
      res.json({ 
        success: true, 
        sent: pushResult.success,
        failed: pushResult.failed,
        errors: pushResult.errors 
      });
    }
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send test notification' 
    });
  }
});

export default router;