-- Add parent_task_id for "this event only" recurring edits (exception one-offs)
-- Run in Supabase SQL Editor if the column doesn't exist yet.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;
