-- Add enhanced recurrence support and multi-day selection to tasks table
-- Run this in Supabase SQL Editor

-- =============================================
-- MULTI-DAY SELECTION
-- =============================================
-- Add column for multiple days (array of day numbers 0-6)
-- This replaces the single day_of_week for tasks that span multiple days
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS days_of_week INTEGER[] DEFAULT NULL;

-- Migrate existing single day to array format
UPDATE tasks 
SET days_of_week = ARRAY[day_of_week] 
WHERE days_of_week IS NULL AND day_of_week IS NOT NULL;

-- =============================================
-- ENHANCED RECURRENCE
-- =============================================
-- Add new columns for recurrence
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_type TEXT DEFAULT 'none' 
  CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'custom'));

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;

-- For custom recurrence: stores days of week as array (0=Sunday, 6=Saturday)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_days INTEGER[] DEFAULT NULL;

-- Optional end date for recurrence
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_end_date DATE DEFAULT NULL;

-- Parent task ID for recurring instances (links back to the original/template task)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;

-- Update the old is_recurring column based on new structure
UPDATE tasks SET recurrence_type = 'weekly' WHERE is_recurring = true AND recurrence_type = 'none';

-- =============================================
-- UPDATE RECURRING_TEMPLATES TABLE
-- =============================================
ALTER TABLE recurring_templates ADD COLUMN IF NOT EXISTS days_of_week INTEGER[] DEFAULT NULL;

ALTER TABLE recurring_templates ADD COLUMN IF NOT EXISTS recurrence_type TEXT DEFAULT 'weekly' 
  CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'custom'));

ALTER TABLE recurring_templates ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;

ALTER TABLE recurring_templates ADD COLUMN IF NOT EXISTS recurrence_days INTEGER[] DEFAULT NULL;

ALTER TABLE recurring_templates ADD COLUMN IF NOT EXISTS recurrence_end_date DATE DEFAULT NULL;

-- Migrate existing single day to array format for templates
UPDATE recurring_templates 
SET days_of_week = ARRAY[day_of_week] 
WHERE days_of_week IS NULL AND day_of_week IS NOT NULL;
