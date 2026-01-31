-- Add WhatsApp support for users and notification tracking
-- Run this in Supabase SQL Editor

-- =============================================
-- ADD WHATSAPP NUMBER TO USERS
-- =============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Create index for faster lookups by WhatsApp number
CREATE INDEX IF NOT EXISTS idx_users_whatsapp_number ON users(whatsapp_number) WHERE whatsapp_number IS NOT NULL;

-- =============================================
-- NOTIFICATION LOG TABLE
-- =============================================
-- Track sent notifications to prevent duplicates
CREATE TABLE IF NOT EXISTS notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder', 'daily_summary', 'task_assigned')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    whatsapp_message_sid TEXT, -- Twilio message SID for tracking
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for checking if notification was already sent
CREATE INDEX IF NOT EXISTS idx_notification_log_task_user ON notification_log(task_id, user_id, notification_type);

-- Index for cleanup of old notifications
CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON notification_log(sent_at);

-- =============================================
-- ROW LEVEL SECURITY FOR NOTIFICATION_LOG
-- =============================================
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notification log" ON notification_log
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only system (via service role) can insert notifications
-- This is handled automatically when using service role key for the notify API

-- =============================================
-- FUNCTION TO CLEAN OLD NOTIFICATION LOGS
-- =============================================
-- Optional: Run periodically to clean logs older than 30 days
CREATE OR REPLACE FUNCTION clean_old_notification_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM notification_log WHERE sent_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
