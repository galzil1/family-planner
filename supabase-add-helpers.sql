-- Add family helpers table
-- These are people who can be assigned to tasks but don't have accounts
-- Run this in Supabase SQL Editor

-- Create helpers table
CREATE TABLE IF NOT EXISTS helpers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#6B7280',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_helpers_family_id ON helpers(family_id);

-- Enable RLS
ALTER TABLE helpers ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see/manage helpers in their family
CREATE POLICY "Users can view helpers in their family"
  ON helpers FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create helpers in their family"
  ON helpers FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update helpers in their family"
  ON helpers FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete helpers in their family"
  ON helpers FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Add helper_id column to tasks table (optional assignment to helper instead of user)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS helper_id UUID REFERENCES helpers(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_helper_id ON tasks(helper_id);
