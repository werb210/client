import { db } from "../../db";
import { sql } from "drizzle-orm";
import { verifyShareToken } from "../../services/lender/jwt";

export async function lenderAuth(req: any, res: any, next: any) {
  try {
    const token = String(req.query.token || req.headers["x-lender-token"] || "");
    
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    
    const data: any = verifyShareToken(token);
    if (!data) {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    // Validate against DB (not expired, exists)
    const result = await db.execute(sql`
      SELECT application_id, partner_id, perms, expires_at 
      FROM app_lender_shares 
      WHERE token = ${token} 
      LIMIT 1
    `);
    
    const share = result.rows?.[0];
    if (!share) {
      return res.status(401).json({ error: "Share not found" });
    }
    
    if (new Date(share.expires_at).getTime() < Date.now()) {
      return res.status(401).json({ error: "Link expired" });
    }
    
    req.lender = { 
      applicationId: share.application_id, 
      partnerId: share.partner_id, 
      perms: share.perms, 
      token 
    };
    
    next();
  } catch (error) {
    console.error("Lender auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}