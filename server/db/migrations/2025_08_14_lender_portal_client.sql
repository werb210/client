CREATE TABLE IF NOT EXISTS lender_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_lender_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  partner_id uuid NOT NULL,
  token text NOT NULL,
  perms text[] NOT NULL DEFAULT '{view_docs,upload_docs,read_messages,write_messages}',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add role column to comm_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comm_messages' AND column_name='role') THEN
    ALTER TABLE comm_messages ADD COLUMN role text;
  END IF;
END $$;

-- Add partner_id column to comm_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comm_messages' AND column_name='partner_id') THEN
    ALTER TABLE comm_messages ADD COLUMN partner_id uuid;
  END IF;
END $$;

-- Create comm_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS comm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid,
  contact_id uuid,
  partner_id uuid,
  direction text,
  channel text,
  role text,
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add source and partner_id columns to documents if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='source') THEN
    ALTER TABLE documents ADD COLUMN source text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='partner_id') THEN
    ALTER TABLE documents ADD COLUMN partner_id uuid;
  END IF;
END $$;

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid,
  filename text,
  s3_key text,
  category text,
  source text,
  partner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create applications table if it doesn't exist (minimal for lender portal)
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_category text,
  stage text,
  amount_requested text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_lender_shares_token ON app_lender_shares(token);
CREATE INDEX IF NOT EXISTS idx_app_lender_shares_app ON app_lender_shares(application_id);
CREATE INDEX IF NOT EXISTS idx_comm_messages_app ON comm_messages(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_app ON documents(application_id);