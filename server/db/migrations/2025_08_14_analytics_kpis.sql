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

CREATE OR REPLACE VIEW analytics_rolling_30d AS
SELECT
  (SELECT COALESCE(SUM(leads_new),0) FROM analytics_daily WHERE day > now()::date - 30) AS leads_30d,
  (SELECT COALESCE(SUM(apps_created),0) FROM analytics_daily WHERE day > now()::date - 30) AS apps_30d,
  (SELECT COALESCE(SUM(apps_funded),0) FROM analytics_daily WHERE day > now()::date - 30) AS funded_30d,
  (SELECT COALESCE(SUM(funded_amount),0) FROM analytics_daily WHERE day > now()::date - 30) AS funded_amount_30d;