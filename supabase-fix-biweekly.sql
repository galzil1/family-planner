-- Fix: Add 'biweekly' to the recurrence_type check constraint
-- Run this in Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_recurrence_type_check;

-- Add the new constraint with 'biweekly' included
ALTER TABLE tasks ADD CONSTRAINT tasks_recurrence_type_check 
  CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'biweekly', 'monthly', 'custom'));

-- Also fix the recurring_templates table if it exists
ALTER TABLE recurring_templates DROP CONSTRAINT IF EXISTS recurring_templates_recurrence_type_check;

ALTER TABLE recurring_templates ADD CONSTRAINT recurring_templates_recurrence_type_check 
  CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'biweekly', 'monthly', 'custom'));
