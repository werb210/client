import { db } from "../db";
import { sql } from "drizzle-orm";

export async function computeDaily(dayISO: string) {
  const r1 = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM contacts WHERE DATE(created_at)=${dayISO}) AS leads_new,
      (SELECT COUNT(*) FROM applications WHERE DATE(created_at)=${dayISO}) AS apps_created,
      (SELECT COUNT(*) FROM applications WHERE funded_at IS NOT NULL AND DATE(funded_at)=${dayISO}) AS apps_funded,
      (SELECT COALESCE(SUM(amount_funded),0) FROM applications WHERE funded_at IS NOT NULL AND DATE(funded_at)=${dayISO}) AS funded_amount,
      (SELECT AVG(hours_to_decision) FROM le_outcomes WHERE DATE(updated_at)=${dayISO}) AS avg_hours_to_decision,
      (SELECT COUNT(*) FROM thread_slas WHERE DATE(breached_at)=${dayISO}) AS slas_breached,
      (SELECT COUNT(*) FROM comm_messages WHERE direction='in'  AND DATE(created_at)=${dayISO}) AS messages_in,
      (SELECT COUNT(*) FROM comm_messages WHERE direction='out' AND DATE(created_at)=${dayISO}) AS messages_out,
      (SELECT COUNT(*) FROM esign_envelopes WHERE DATE(created_at)=${dayISO}) AS esign_sent,
      (SELECT COUNT(*) FROM esign_envelopes WHERE status='completed' AND DATE(updated_at)=${dayISO}) AS esign_completed,
      (SELECT COUNT(*) FROM kyc_sessions WHERE status='approved' AND DATE(updated_at)=${dayISO}) AS kyc_approved
  `);
  const row = r1.rows?.[0] || {};
  await db.execute(sql`
    INSERT INTO analytics_daily(day, leads_new, apps_created, apps_funded, funded_amount, avg_hours_to_decision, slas_breached, messages_in, messages_out, esign_sent, esign_completed, kyc_approved, updated_at)
    VALUES (${dayISO}, ${row.leads_new||0}, ${row.apps_created||0}, ${row.apps_funded||0}, ${row.funded_amount||0}, ${row.avg_hours_to_decision||null}, ${row.slas_breached||0}, ${row.messages_in||0}, ${row.messages_out||0}, ${row.esign_sent||0}, ${row.esign_completed||0}, ${row.kyc_approved||0}, now())
    ON CONFLICT (day) DO UPDATE SET
      leads_new=EXCLUDED.leads_new,
      apps_created=EXCLUDED.apps_created,
      apps_funded=EXCLUDED.apps_funded,
      funded_amount=EXCLUDED.funded_amount,
      avg_hours_to_decision=EXCLUDED.avg_hours_to_decision,
      slas_breached=EXCLUDED.slas_breached,
      messages_in=EXCLUDED.messages_in,
      messages_out=EXCLUDED.messages_out,
      esign_sent=EXCLUDED.esign_sent,
      esign_completed=EXCLUDED.esign_completed,
      kyc_approved=EXCLUDED.kyc_approved,
      updated_at=now()
  `);
}

export async function getSummary(fromISO: string, toISO: string) {
  const r = await db.execute(sql`
    SELECT * FROM analytics_daily
    WHERE day BETWEEN ${fromISO}::date AND ${toISO}::date
    ORDER BY day ASC
  `);
  const rows = r.rows || [];
  const totals = rows.reduce((a:any, x:any)=>({
    leads_new: a.leads_new + Number(x.leads_new||0),
    apps_created: a.apps_created + Number(x.apps_created||0),
    apps_funded: a.apps_funded + Number(x.apps_funded||0),
    funded_amount: a.funded_amount + Number(x.funded_amount||0),
    messages_in: a.messages_in + Number(x.messages_in||0),
    messages_out: a.messages_out + Number(x.messages_out||0),
    esign_sent: a.esign_sent + Number(x.esign_sent||0),
    esign_completed: a.esign_completed + Number(x.esign_completed||0),
    kyc_approved: a.kyc_approved + Number(x.kyc_approved||0),
    slas_breached: a.slas_breached + Number(x.slas_breached||0)
  }), { leads_new:0, apps_created:0, apps_funded:0, funded_amount:0, messages_in:0, messages_out:0, esign_sent:0, esign_completed:0, kyc_approved:0, slas_breached:0 });
  return { rows, totals };
}