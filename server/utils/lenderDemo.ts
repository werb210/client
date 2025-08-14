import { db } from "../db";
import { sql } from "drizzle-orm";
import { createShareToken } from "../services/lender/jwt";

export async function createDemoLenderData() {
  try {
    // Create demo application with integer ID
    const appResult = await db.execute(sql`
      INSERT INTO applications (user_id, status, business_legal_name, product_category, stage, amount_requested)
      VALUES ('demo-user', 'submitted', 'Demo Business Inc', 'Equipment Financing', 'underwriting', '$75,000')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    
    const appId = appResult.rows?.[0]?.id || 1; // Use existing or fallback
    
    // Create demo lender partner
    const partnerResult = await db.execute(sql`
      INSERT INTO lender_partners (name, email, notes)
      VALUES ('Demo Lender Bank', 'lender@demo.com', 'Demo lender for testing')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    
    const partnerId = partnerResult.rows?.[0]?.id || 'demo-partner-id';
    
    // Create JWT token
    const token = createShareToken({
      applicationId: appId,
      partnerId: partnerId,
      perms: ['view_docs', 'upload_docs', 'read_messages', 'write_messages']
    }, '30d');
    
    // Store token in database
    await db.execute(sql`
      INSERT INTO app_lender_shares (application_id, partner_id, token, perms, expires_at)
      VALUES (${appId}, ${partnerId}, ${token}, array['view_docs','upload_docs','read_messages','write_messages'], now() + interval '30 days')
      ON CONFLICT (token) DO UPDATE SET expires_at = EXCLUDED.expires_at
    `);
    
    // Add demo messages
    await db.execute(sql`
      INSERT INTO comm_messages (application_id, direction, channel, role, body, created_at)
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
    
    return {
      success: true,
      token,
      applicationId: appId,
      partnerId,
      message: 'Demo lender data created successfully'
    };
  } catch (error) {
    console.error('Create demo lender data error:', error);
    throw error;
  }
}