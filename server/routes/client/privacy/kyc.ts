import { Router } from "express";
import { db } from "../../../db";
import { sql } from "drizzle-orm";
import { getProvider } from "../../../services/kyc/providers";

const router = Router();

// Middleware to get raw body for webhook verification
function expressRawBody(req: any, res: any, next: any) {
  let data = ""; 
  req.setEncoding("utf8");
  req.on("data", (chunk: string) => data += chunk);
  req.on("end", () => { 
    req.rawBody = data; 
    next(); 
  });
}

/* Start KYC verification - assumes req.contact?.id is set by client auth; fallback to query for testing */
router.post("/start", async (req: any, res) => {
  try {
    const contactId = req.contact?.id || String(req.body?.contactId || req.query.contactId || "");
    if (!contactId) {
      return res.status(401).json({ error: "Unauthorized - contact ID required" });
    }
    
    const email = req.body?.email || req.contact?.email;
    const phone = req.body?.phone || req.contact?.phone;
    
    const provider = getProvider();
    const session = await provider.start({ id: contactId, email, phone });
    
    // Store session in database
    await db.execute(sql`
      INSERT INTO kyc_sessions(contact_id, provider, provider_ref, provider_session_url, status, created_at, updated_at)
      VALUES (${contactId}, ${process.env.KYC_PROVIDER || 'persona'}, ${session.providerRef}, ${session.url}, ${session.status}, now(), now())
    `);
    
    res.json({
      success: true,
      session,
      url: session.url,
      providerRef: session.providerRef,
      status: session.status
    });
  } catch (error) {
    console.error("KYC start error:", error);
    res.status(500).json({ error: "Failed to start KYC verification" });
  }
});

/* Get KYC status by provider reference */
router.get("/status/:ref", async (req: any, res) => {
  try {
    const ref = String(req.params.ref);
    const provider = getProvider();
    const status = await provider.status(ref);
    
    // Update database with latest status
    if (status.status !== "pending") {
      await db.execute(sql`
        UPDATE kyc_sessions 
        SET status = ${status.status}, reason = ${status.reason || null}, updated_at = now()
        WHERE provider_ref = ${ref}
      `);
    }
    
    res.json(status);
  } catch (error) {
    console.error("KYC status error:", error);
    res.status(500).json({ error: "Failed to get KYC status" });
  }
});

/* Get KYC sessions for a contact */
router.get("/sessions/:contactId", async (req: any, res) => {
  try {
    const contactId = req.params.contactId;
    const result = await db.execute(sql`
      SELECT * FROM kyc_sessions 
      WHERE contact_id = ${contactId}
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    res.json({ sessions: result.rows || [] });
  } catch (error) {
    console.error("KYC sessions error:", error);
    res.status(500).json({ error: "Failed to retrieve KYC sessions" });
  }
});

/* Persona webhook endpoint */
router.post("/webhook", expressRawBody, async (req: any, res) => {
  try {
    const sig = req.headers["x-persona-signature"] as string || "";
    const provider = getProvider();
    
    if (!provider.webhookVerify(req.rawBody, sig)) {
      console.warn("Invalid webhook signature");
      return res.status(400).json({ error: "Invalid signature" });
    }
    
    const body = JSON.parse(req.rawBody || "{}");
    const ref = body?.data?.id || body?.data?.attributes?.["inquiry-id"];
    const status = body?.data?.attributes?.status || "pending";
    const reason = body?.data?.attributes?.["failure-reason"];
    
    // Update KYC session status
    await db.execute(sql`
      UPDATE kyc_sessions 
      SET status = ${status}, reason = ${reason || null}, provider_metadata = ${JSON.stringify(body)}, updated_at = now()
      WHERE provider_ref = ${ref}
    `);
    
    console.log(`KYC webhook: ${ref} -> ${status}`);
    res.json({ ok: true, received: true });
  } catch (error) {
    console.error("KYC webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

/* Test endpoint for development */
router.post("/test", async (req: any, res) => {
  try {
    const { contactId = "TEST_USER", action = "start" } = req.body;
    
    if (action === "start") {
      const provider = getProvider();
      const session = await provider.start({ id: contactId });
      
      await db.execute(sql`
        INSERT INTO kyc_sessions(contact_id, provider, provider_ref, provider_session_url, status)
        VALUES (${contactId}, 'test', ${session.providerRef}, ${session.url}, ${session.status})
      `);
      
      res.json({ action: "started", session });
    } else {
      res.json({ error: "Unknown test action" });
    }
  } catch (error) {
    console.error("KYC test error:", error);
    res.status(500).json({ error: "Test failed" });
  }
});

export default router;