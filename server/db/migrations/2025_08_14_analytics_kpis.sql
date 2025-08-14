-- Analytics KPIs migration for Client Application
-- Daily KPIs tracking and 30-day rolling views
-- Created: August 14, 2025

-- Daily analytics table for KPI tracking
CREATE TABLE IF NOT EXISTS analytics_daily (
  day date PRIMARY KEY,
  leads_new int DEFAULT 0,
  apps_created int DEFAULT 0,
  apps_funded int DEFAULT 0,
  funded_amount numeric DEFAULT 0,
  avg_hours_to_decision numeric,
  slas_breached int DEFAULT 0,
  messages_in int DEFAULT 0,
  messages_out int DEFAULT 0,
  esign_sent int DEFAULT 0,
  esign_completed int DEFAULT 0,
  kyc_approved int DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_daily_day ON analytics_daily(day DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_updated ON analytics_daily(updated_at);

-- 30-day rolling analytics view
CREATE OR REPLACE VIEW analytics_rolling_30d AS
SELECT
  (SELECT COALESCE(SUM(leads_new),0) FROM analytics_daily WHERE day > now()::date - 30) AS leads_30d,
  (SELECT COALESCE(SUM(apps_created),0) FROM analytics_daily WHERE day > now()::date - 30) AS apps_30d,
  (SELECT COALESCE(SUM(apps_funded),0) FROM analytics_daily WHERE day > now()::date - 30) AS funded_30d,
  (SELECT COALESCE(SUM(funded_amount),0) FROM analytics_daily WHERE day > now()::date - 30) AS funded_amount_30d,
  (SELECT COALESCE(AVG(avg_hours_to_decision),0) FROM analytics_daily WHERE day > now()::date - 30 AND avg_hours_to_decision IS NOT NULL) AS avg_decision_time_30d,
  (SELECT COALESCE(SUM(slas_breached),0) FROM analytics_daily WHERE day > now()::date - 30) AS sla_breaches_30d,
  (SELECT COALESCE(SUM(messages_in),0) FROM analytics_daily WHERE day > now()::date - 30) AS messages_in_30d,
  (SELECT COALESCE(SUM(messages_out),0) FROM analytics_daily WHERE day > now()::date - 30) AS messages_out_30d,
  (SELECT COALESCE(SUM(esign_sent),0) FROM analytics_daily WHERE day > now()::date - 30) AS esign_sent_30d,
  (SELECT COALESCE(SUM(esign_completed),0) FROM analytics_daily WHERE day > now()::date - 30) AS esign_completed_30d,
  (SELECT COALESCE(SUM(kyc_approved),0) FROM analytics_daily WHERE day > now()::date - 30) AS kyc_approved_30d;

-- Weekly analytics view
CREATE OR REPLACE VIEW analytics_rolling_7d AS
SELECT
  (SELECT COALESCE(SUM(leads_new),0) FROM analytics_daily WHERE day > now()::date - 7) AS leads_7d,
  (SELECT COALESCE(SUM(apps_created),0) FROM analytics_daily WHERE day > now()::date - 7) AS apps_7d,
  (SELECT COALESCE(SUM(apps_funded),0) FROM analytics_daily WHERE day > now()::date - 7) AS funded_7d,
  (SELECT COALESCE(SUM(funded_amount),0) FROM analytics_daily WHERE day > now()::date - 7) AS funded_amount_7d,
  (SELECT COALESCE(AVG(avg_hours_to_decision),0) FROM analytics_daily WHERE day > now()::date - 7 AND avg_hours_to_decision IS NOT NULL) AS avg_decision_time_7d,
  (SELECT COALESCE(SUM(slas_breached),0) FROM analytics_daily WHERE day > now()::date - 7) AS sla_breaches_7d,
  (SELECT COALESCE(SUM(messages_in),0) FROM analytics_daily WHERE day > now()::date - 7) AS messages_in_7d,
  (SELECT COALESCE(SUM(messages_out),0) FROM analytics_daily WHERE day > now()::date - 7) AS messages_out_7d,
  (SELECT COALESCE(SUM(esign_sent),0) FROM analytics_daily WHERE day > now()::date - 7) AS esign_sent_7d,
  (SELECT COALESCE(SUM(esign_completed),0) FROM analytics_daily WHERE day > now()::date - 7) AS esign_completed_7d,
  (SELECT COALESCE(SUM(kyc_approved),0) FROM analytics_daily WHERE day > now()::date - 7) AS kyc_approved_7d;

-- Monthly summary view
CREATE OR REPLACE VIEW analytics_monthly AS
SELECT
  DATE_TRUNC('month', day) AS month,
  SUM(leads_new) AS leads_new,
  SUM(apps_created) AS apps_created,
  SUM(apps_funded) AS apps_funded,
  SUM(funded_amount) AS funded_amount,
  AVG(avg_hours_to_decision) AS avg_hours_to_decision,
  SUM(slas_breached) AS slas_breached,
  SUM(messages_in) AS messages_in,
  SUM(messages_out) AS messages_out,
  SUM(esign_sent) AS esign_sent,
  SUM(esign_completed) AS esign_completed,
  SUM(kyc_approved) AS kyc_approved,
  COUNT(*) AS days_with_data
FROM analytics_daily
WHERE day >= DATE_TRUNC('month', CURRENT_DATE - interval '12 months')
GROUP BY DATE_TRUNC('month', day)
ORDER BY month DESC;

-- Initialize today's row if it doesn't exist
INSERT INTO analytics_daily (day)
SELECT CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM analytics_daily WHERE day = CURRENT_DATE);

-- Comments for documentation
COMMENT ON TABLE analytics_daily IS 'Daily KPI metrics for business analytics and reporting';
COMMENT ON VIEW analytics_rolling_30d IS '30-day rolling window analytics summary';
COMMENT ON VIEW analytics_rolling_7d IS '7-day rolling window analytics summary';
COMMENT ON VIEW analytics_monthly IS 'Monthly aggregated analytics with historical trends';

COMMENT ON COLUMN analytics_daily.leads_new IS 'New leads generated on this day';
COMMENT ON COLUMN analytics_daily.apps_created IS 'New applications created on this day';
COMMENT ON COLUMN analytics_daily.apps_funded IS 'Applications that received funding on this day';
COMMENT ON COLUMN analytics_daily.funded_amount IS 'Total amount funded on this day in default currency';
COMMENT ON COLUMN analytics_daily.avg_hours_to_decision IS 'Average decision time in hours for applications decided this day';
COMMENT ON COLUMN analytics_daily.slas_breached IS 'Number of SLA breaches recorded on this day';
COMMENT ON COLUMN analytics_daily.messages_in IS 'Inbound messages received on this day';
COMMENT ON COLUMN analytics_daily.messages_out IS 'Outbound messages sent on this day';
COMMENT ON COLUMN analytics_daily.esign_sent IS 'E-signature requests sent on this day';
COMMENT ON COLUMN analytics_daily.esign_completed IS 'E-signature completions on this day';
COMMENT ON COLUMN analytics_daily.kyc_approved IS 'KYC approvals completed on this day';