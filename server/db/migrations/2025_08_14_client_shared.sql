CREATE TABLE IF NOT EXISTS kyc_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL,
  provider varchar(32) NOT NULL,
  provider_ref text,
  provider_session_url text,
  status varchar(24) NOT NULL DEFAULT 'pending',
  reason text,
  provider_metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kyc_contact ON kyc_sessions(contact_id);

-- Add KYC compliance columns to existing tables if needed
ALTER TABLE comm_messages ADD COLUMN IF NOT EXISTS compliance_checked boolean DEFAULT false;
ALTER TABLE comm_messages ADD COLUMN IF NOT EXISTS compliance_action varchar(20);

-- Create compliance tracking table
CREATE TABLE IF NOT EXISTS compliance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid,
  event_type varchar(50) NOT NULL,
  message_content text,
  action_taken varchar(50),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_contact ON compliance_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_compliance_type ON compliance_events(event_type);