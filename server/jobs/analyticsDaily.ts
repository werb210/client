import { computeDaily } from "../services/analytics";

export async function backfillAnalytics(daysBack = 90) {
  const now = new Date();
  for (let i=daysBack; i>=0; i--){
    const d = new Date(now.getTime() - i*24*3600*1000);
    await computeDaily(d.toISOString().slice(0,10));
  }
}