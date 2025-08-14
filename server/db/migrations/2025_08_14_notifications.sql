-- Notifications system migration
-- Created: August 14, 2025
-- Purpose: Support real-time notifications for both staff and client applications

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  contact_id uuid,
  type varchar(32) NOT NULL,
  title text NOT NULL,
  body text,
  link_url text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_contact ON notifications(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_type ON notifications(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread_user ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notif_unread_contact ON notifications(contact_id, read_at) WHERE read_at IS NULL;

-- Comment for documentation
COMMENT ON TABLE notifications IS 'Real-time notifications for staff and client applications with SSE support';
COMMENT ON COLUMN notifications.user_id IS 'Staff user ID (for staff notifications)';
COMMENT ON COLUMN notifications.contact_id IS 'Client contact ID (for client notifications)';
COMMENT ON COLUMN notifications.type IS 'Notification type: info, success, warning, error, kyc, esign, sla, etc.';
COMMENT ON COLUMN notifications.link_url IS 'Optional URL for notification action';