import { Router } from "express";
import { db } from "../../db";
import { sql } from "drizzle-orm";
import { lenderAuth } from "./mw";
// AWS S3 imports removed - handled by staff backend

const router = Router();

// Public endpoints (no auth required)
/* Create demo token endpoint (for testing) */
router.post("/demo/token", async (req: any, res) => {
  try {
    const { createDemoLenderData } = await import("../../utils/lenderDemo");
    const result = await createDemoLenderData();
    res.json(result);
  } catch (error) {
    console.error("Create demo token error:", error);
    res.status(500).json({ error: "Failed to create demo token" });
  }
});

// Protected endpoints (require auth)
router.use(lenderAuth);

/* App summary + docs list */
router.get("/app", async (req: any, res) => {
  try {
    const appId = req.lender.applicationId;
    
    // Get application details
    const appResult = await db.execute(sql`
      SELECT id, product_category, stage, amount_requested 
      FROM applications 
      WHERE id = ${appId} 
      LIMIT 1
    `);
    const app = appResult.rows?.[0];
    
    // Get documents for this application
    const docsResult = await db.execute(sql`
      SELECT id, filename, category, source, created_at 
      FROM documents 
      WHERE application_id = ${appId} 
      ORDER BY created_at DESC
    `);
    const docs = docsResult.rows || [];
    
    res.json({ 
      application: app || null, 
      documents: docs 
    });
  } catch (error) {
    console.error("Get app error:", error);
    res.status(500).json({ error: "Failed to load application" });
  }
});

/* Messages (read/write via channel 'portal' role 'lender') */
router.get("/messages", async (req: any, res) => {
  try {
    const appId = req.lender.applicationId;
    
    const result = await db.execute(sql`
      SELECT id, body, created_at, role, direction
      FROM comm_messages 
      WHERE application_id = ${appId} AND channel = 'portal'
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    
    res.json(result.rows || []);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

router.post("/messages", async (req: any, res) => {
  try {
    if (!req.lender.perms.includes("write_messages")) {
      return res.status(403).json({ error: "Write messages permission required" });
    }
    
    const appId = req.lender.applicationId;
    const body = String(req.body?.body || "").trim();
    
    if (!body) {
      return res.status(400).json({ error: "Message body required" });
    }
    
    await db.execute(sql`
      INSERT INTO comm_messages(application_id, partner_id, direction, channel, role, body, created_at)
      VALUES (${appId}, ${req.lender.partnerId}, 'in', 'portal', 'lender', ${body}, now())
    `);
    
    res.json({ ok: true });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/* Upload (simple direct upload; for large files, switch to presigned URLs) */
router.post("/upload", async (req: any, res) => {
  try {
    if (!req.lender.perms.includes("upload_docs")) {
      return res.status(403).json({ error: "Upload documents permission required" });
    }
    
    const appId = req.lender.applicationId;
    const { filename, contentB64, category } = req.body || {};
    
    if (!filename || !contentB64) {
      return res.status(400).json({ error: "Filename and content required" });
    }
    
    // For demo purposes, create a mock S3 key without actual upload
    const s3Key = `lender/${appId}/${Date.now()}_${String(filename).replace(/\s+/g, "_")}`;
    
    // S3 upload removed - handled by staff backend
    console.log("📝 [LENDER] Document upload metadata stored:", { s3Key, filename, category });
    
    // Store document metadata in database
    await db.execute(sql`
      INSERT INTO documents(application_id, filename, s3_key, category, source, partner_id, created_at)
      VALUES (${appId}, ${filename}, ${s3Key}, ${category || null}, 'lender', ${req.lender.partnerId}, now())
    `);
    
    res.json({ ok: true, s3_key: s3Key });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

/* Test endpoint to create demo data */
router.post("/demo/setup", async (req: any, res) => {
  try {
    const appId = req.lender.applicationId;
    
    // Ensure demo application exists
    await db.execute(sql`
      INSERT INTO applications (id, user_id, status, business_legal_name, product_category, stage, amount_requested)
      VALUES (${appId}, 'demo-user', 'submitted', 'Demo Business Inc', 'Equipment Financing', 'underwriting', '$75,000')
      ON CONFLICT (id) DO UPDATE SET 
        product_category = EXCLUDED.product_category,
        stage = EXCLUDED.stage,
        amount_requested = EXCLUDED.amount_requested
    `);
    
    // Add demo messages
    await db.execute(sql`
      INSERT INTO comm_messages(application_id, direction, channel, role, body, created_at)
      VALUES 
        (${appId}, 'out', 'portal', 'system', 'Application submitted for review', now() - interval '2 days'),
        (${appId}, 'in', 'portal', 'lender', 'Reviewing financial statements - need updated bank statements', now() - interval '1 day'),
        (${appId}, 'out', 'portal', 'applicant', 'Bank statements uploaded to document section', now() - interval '12 hours')
      ON CONFLICT DO NOTHING
    `);
    
    // Add demo documents
    await db.execute(sql`
      INSERT INTO documents (application_id, filename, category, source, created_at)
      VALUES 
        (${appId}, 'business_plan.pdf', 'business_plan', 'applicant', now() - interval '3 days'),
        (${appId}, 'financial_statements.xlsx', 'financial', 'applicant', now() - interval '2 days'),
        (${appId}, 'bank_statements.pdf', 'banking', 'applicant', now() - interval '1 day')
      ON CONFLICT DO NOTHING
    `);
    
    res.json({ ok: true, message: "Demo data created successfully" });
  } catch (error) {
    console.error("Demo setup error:", error);
    res.status(500).json({ error: "Failed to setup demo" });
  }
});

export default router;