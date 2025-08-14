import { getSummary } from "../services/analytics";

// Simplified analytics report job without PDF generation for now
export async function runAnalyticsReportOnce(range?: { from: string; to: string }) {
  const to = (range?.to || new Date().toISOString().slice(0,10));
  const fromD = new Date(new Date(to).getTime() - 29*24*3600*1000);
  const from = (range?.from || fromD.toISOString().slice(0,10));
  
  const { rows, totals } = await getSummary(from, to);
  
  // For now, return data without PDF generation
  // PDF generation would require PDFKit and S3 setup
  const report = {
    period: { from, to },
    summary: {
      new_leads: totals.leads_new,
      applications_created: totals.apps_created,
      funded_applications: totals.apps_funded,
      funded_amount: `${process.env.ANALYTICS_DEFAULT_CURRENCY || "CAD"} ${Number(totals.funded_amount||0).toLocaleString()}`,
      messages: `${totals.messages_in}/${totals.messages_out}`,
      esign: `${totals.esign_sent}/${totals.esign_completed}`,
      kyc_approved: totals.kyc_approved,
      sla_breaches: totals.slas_breached
    },
    daily_breakdown: rows
  };
  
  const recipients = ["ops@boreal.financial"];
  return { 
    file: `analytics_report_${from}_${to}.json`, 
    recipients, 
    from, 
    to,
    report 
  };
}