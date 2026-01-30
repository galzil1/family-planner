-- Add task_time column to tasks table
-- Run this in Supabase SQL Editor

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_time TEXT DEFAULT NULL;
