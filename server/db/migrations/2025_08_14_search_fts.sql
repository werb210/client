-- Full Text Search (FTS) migration for Client Application
-- Contacts, Applications, Messages, Documents FTS and Saved Views table
-- Created: August 14, 2025

-- Create search document columns and indexes for full-text search

-- Communications/Messages FTS
ALTER TABLE IF EXISTS comm_messages 
ADD COLUMN IF NOT EXISTS search_doc tsvector;

CREATE INDEX IF NOT EXISTS idx_comm_messages_search 
ON comm_messages USING gin(search_doc);

-- Update search_doc for existing messages
UPDATE comm_messages 
SET search_doc = to_tsvector('english', 
  coalesce(channel, '') || ' ' || 
  coalesce(direction, '') || ' ' || 
  coalesce(body, '') || ' ' || 
  coalesce(subject, '')
) WHERE search_doc IS NULL;

-- Create trigger to auto-update search_doc on messages
CREATE OR REPLACE FUNCTION update_comm_messages_search_doc() 
RETURNS trigger AS $$
BEGIN
  NEW.search_doc = to_tsvector('english', 
    coalesce(NEW.channel, '') || ' ' || 
    coalesce(NEW.direction, '') || ' ' || 
    coalesce(NEW.body, '') || ' ' || 
    coalesce(NEW.subject, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_comm_messages_search_doc ON comm_messages;
CREATE TRIGGER trigger_comm_messages_search_doc
  BEFORE INSERT OR UPDATE ON comm_messages
  FOR EACH ROW EXECUTE FUNCTION update_comm_messages_search_doc();

-- Documents FTS
ALTER TABLE IF EXISTS documents 
ADD COLUMN IF NOT EXISTS search_doc tsvector;

CREATE INDEX IF NOT EXISTS idx_documents_search 
ON documents USING gin(search_doc);

-- Update search_doc for existing documents
UPDATE documents 
SET search_doc = to_tsvector('english', 
  coalesce(filename, '') || ' ' || 
  coalesce(category, '') || ' ' || 
  coalesce(document_type, '') || ' ' ||
  coalesce(notes, '')
) WHERE search_doc IS NULL;

-- Create trigger to auto-update search_doc on documents
CREATE OR REPLACE FUNCTION update_documents_search_doc() 
RETURNS trigger AS $$
BEGIN
  NEW.search_doc = to_tsvector('english', 
    coalesce(NEW.filename, '') || ' ' || 
    coalesce(NEW.category, '') || ' ' || 
    coalesce(NEW.document_type, '') || ' ' ||
    coalesce(NEW.notes, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_documents_search_doc ON documents;
CREATE TRIGGER trigger_documents_search_doc
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_documents_search_doc();

-- Applications FTS
ALTER TABLE IF EXISTS applications 
ADD COLUMN IF NOT EXISTS search_doc tsvector;

CREATE INDEX IF NOT EXISTS idx_applications_search 
ON applications USING gin(search_doc);

-- Update search_doc for existing applications
UPDATE applications 
SET search_doc = to_tsvector('english', 
  coalesce(business_name, '') || ' ' || 
  coalesce(legal_business_name, '') || ' ' || 
  coalesce(first_name, '') || ' ' || 
  coalesce(last_name, '') || ' ' ||
  coalesce(email, '') || ' ' ||
  coalesce(use_of_funds, '') || ' ' ||
  coalesce(status, '')
) WHERE search_doc IS NULL;

-- Create trigger to auto-update search_doc on applications
CREATE OR REPLACE FUNCTION update_applications_search_doc() 
RETURNS trigger AS $$
BEGIN
  NEW.search_doc = to_tsvector('english', 
    coalesce(NEW.business_name, '') || ' ' || 
    coalesce(NEW.legal_business_name, '') || ' ' || 
    coalesce(NEW.first_name, '') || ' ' || 
    coalesce(NEW.last_name, '') || ' ' ||
    coalesce(NEW.email, '') || ' ' ||
    coalesce(NEW.use_of_funds, '') || ' ' ||
    coalesce(NEW.status, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_applications_search_doc ON applications;
CREATE TRIGGER trigger_applications_search_doc
  BEFORE INSERT OR UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_applications_search_doc();

-- Contacts FTS
ALTER TABLE IF EXISTS contacts 
ADD COLUMN IF NOT EXISTS search_doc tsvector;

CREATE INDEX IF NOT EXISTS idx_contacts_search 
ON contacts USING gin(search_doc);

-- Update search_doc for existing contacts
UPDATE contacts 
SET search_doc = to_tsvector('english', 
  coalesce(first_name, '') || ' ' || 
  coalesce(last_name, '') || ' ' || 
  coalesce(email, '') || ' ' || 
  coalesce(phone, '') || ' ' ||
  coalesce(company_name, '') || ' ' ||
  coalesce(notes, '')
) WHERE search_doc IS NULL;

-- Create trigger to auto-update search_doc on contacts
CREATE OR REPLACE FUNCTION update_contacts_search_doc() 
RETURNS trigger AS $$
BEGIN
  NEW.search_doc = to_tsvector('english', 
    coalesce(NEW.first_name, '') || ' ' || 
    coalesce(NEW.last_name, '') || ' ' || 
    coalesce(NEW.email, '') || ' ' || 
    coalesce(NEW.phone, '') || ' ' ||
    coalesce(NEW.company_name, '') || ' ' ||
    coalesce(NEW.notes, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_contacts_search_doc ON contacts;
CREATE TRIGGER trigger_contacts_search_doc
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_contacts_search_doc();

-- Saved Views table for search customization
CREATE TABLE IF NOT EXISTS saved_search_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  contact_id text,
  name varchar(255) NOT NULL,
  query_text text,
  filters jsonb,
  sort_order varchar(50) DEFAULT 'relevance',
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_search_views_user ON saved_search_views(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_search_views_contact ON saved_search_views(contact_id);

-- Comments for documentation
COMMENT ON TABLE saved_search_views IS 'Saved search configurations for users and contacts';
COMMENT ON COLUMN saved_search_views.filters IS 'JSON filters for search refinement';
COMMENT ON COLUMN saved_search_views.sort_order IS 'Sort order: relevance, date_desc, date_asc';