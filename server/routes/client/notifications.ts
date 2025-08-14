import { Router } from "express";
import { db } from "../../db";
import { sql } from "drizzle-orm";
import { subscribe, notifyContact, getNotifications, markAsRead, getUnreadCount } from "../../services/notify";

const router = Router();

// Get notifications for a contact
router.get("/", async (req: any, res) => {
  try {
    const contactId = req.contact?.id || req.query.contactId; // fallback for local testing
    if (!contactId) {
      return res.status(401).json({ error: "Unauthorized - contactId required" });
    }

    const notifications = await getNotifications(undefined, contactId);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching client notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark notification as read
router.post("/:id/read", async (req: any, res) => {
  try {
    const contactId = req.contact?.id || req.query.contactId;
    if (!contactId) {
      return res.status(401).json({ error: "Unauthorized - contactId required" });
    }

    const success = await markAsRead(req.params.id, undefined, contactId);
    if (success) {
      res.json({ ok: true });
    } else {
      res.status(404).json({ error: "Notification not found or not authorized" });
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Server-Sent Events stream for real-time notifications
router.get("/stream", async (req: any, res) => {
  try {
    const contactId = req.contact?.id || req.query.contactId;
    if (!contactId) {
      return res.status(401).end();
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Cache-Control");
    res.flushHeaders?.();

    const heartbeatInterval = Number(process.env.NOTIFY_SSE_HEARTBEAT_MS || 25000);
    
    const write = (chunk: string) => {
      try {
        res.write(chunk);
      } catch (error) {
        console.error("Error writing to SSE stream:", error);
      }
    };

    const sink = { write, closed: false };
    const unsubscribe = subscribe("contact", contactId, sink);

    // Send initial hello event
    write(`event: hello\ndata: ${JSON.stringify({ contactId, timestamp: new Date().toISOString() })}\n\n`);

    // Send periodic ping to keep connection alive
    const timer = setInterval(() => {
      write(`event: ping\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
    }, heartbeatInterval);

    // Handle client disconnect
    req.on("close", () => {
      clearInterval(timer);
      unsubscribe();
      sink.closed = true;
      try {
        res.end();
      } catch (error) {
        // Connection already closed
      }
    });

    req.on("error", (error: any) => {
      console.error("SSE connection error:", error);
      clearInterval(timer);
      unsubscribe();
      sink.closed = true;
    });

  } catch (error) {
    console.error("Error setting up SSE stream:", error);
    res.status(500).end();
  }
});

// Get unread notification count
router.get("/unread-count", async (req: any, res) => {
  try {
    const contactId = req.contact?.id || req.query.contactId;
    if (!contactId) {
      return res.status(401).json({ error: "Unauthorized - contactId required" });
    }

    const count = await getUnreadCount(undefined, contactId);
    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Test endpoint to create notifications (development only)
router.post("/test", async (req: any, res) => {
  try {
    const contactId = req.contact?.id || req.body?.contactId;
    if (!contactId) {
      return res.status(400).json({ error: "contactId required" });
    }

    const { type = "test", title = "Test Notification", body = "This is a test notification from the server" } = req.body;

    const notificationId = await notifyContact(contactId, {
      type,
      title,
      body,
      link_url: `/client/notifications?contactId=${encodeURIComponent(contactId)}`
    });

    res.json({ ok: true, id: notificationId, message: "Test notification created" });
  } catch (error) {
    console.error("Error creating test notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark all notifications as read for a contact
router.post("/mark-all-read", async (req: any, res) => {
  try {
    const contactId = req.contact?.id || req.query.contactId;
    if (!contactId) {
      return res.status(401).json({ error: "Unauthorized - contactId required" });
    }

    await db.execute(sql`
      UPDATE notifications 
      SET read_at = now() 
      WHERE contact_id = ${contactId} AND read_at IS NULL
    `);

    res.json({ ok: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;