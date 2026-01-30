-- Fix infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- First, drop all existing policies on users table
DROP POLICY IF EXISTS "Users can read own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "Users can read family members" ON users;

-- Recreate policies without recursion
-- Users can read their own record (simple, no recursion)
CREATE POLICY "Users can read own record" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can read family members using a security definer function
-- First create a function that bypasses RLS to get the user's family_id
CREATE OR REPLACE FUNCTION get_my_family_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT family_id FROM users WHERE id = auth.uid()
$$;

-- Now create policy for reading family members
CREATE POLICY "Users can read family members" ON users
  FOR SELECT USING (
    family_id IS NOT NULL AND family_id = get_my_family_id()
  );

-- Users can update their own record
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own record
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Also fix the families policies (same recursion issue)
DROP POLICY IF EXISTS "Users can read own family" ON families;
DROP POLICY IF EXISTS "Users can update own family" ON families;

CREATE POLICY "Users can read own family" ON families
  FOR SELECT USING (id = get_my_family_id());

CREATE POLICY "Users can update own family" ON families
  FOR UPDATE USING (id = get_my_family_id());

-- Fix categories policies
DROP POLICY IF EXISTS "Users can read family categories" ON categories;
DROP POLICY IF EXISTS "Users can create family categories" ON categories;
DROP POLICY IF EXISTS "Users can update family categories" ON categories;
DROP POLICY IF EXISTS "Users can delete family categories" ON categories;

CREATE POLICY "Users can read family categories" ON categories
  FOR SELECT USING (family_id = get_my_family_id());

CREATE POLICY "Users can create family categories" ON categories
  FOR INSERT WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "Users can update family categories" ON categories
  FOR UPDATE USING (family_id = get_my_family_id());

CREATE POLICY "Users can delete family categories" ON categories
  FOR DELETE USING (family_id = get_my_family_id());

-- Fix tasks policies
DROP POLICY IF EXISTS "Users can read family tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create family tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update family tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete family tasks" ON tasks;

CREATE POLICY "Users can read family tasks" ON tasks
  FOR SELECT USING (family_id = get_my_family_id());

CREATE POLICY "Users can create family tasks" ON tasks
  FOR INSERT WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "Users can update family tasks" ON tasks
  FOR UPDATE USING (family_id = get_my_family_id());

CREATE POLICY "Users can delete family tasks" ON tasks
  FOR DELETE USING (family_id = get_my_family_id());

-- Fix recurring_templates policies
DROP POLICY IF EXISTS "Users can read family templates" ON recurring_templates;
DROP POLICY IF EXISTS "Users can create family templates" ON recurring_templates;
DROP POLICY IF EXISTS "Users can update family templates" ON recurring_templates;
DROP POLICY IF EXISTS "Users can delete family templates" ON recurring_templates;

CREATE POLICY "Users can read family templates" ON recurring_templates
  FOR SELECT USING (family_id = get_my_family_id());

CREATE POLICY "Users can create family templates" ON recurring_templates
  FOR INSERT WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "Users can update family templates" ON recurring_templates
  FOR UPDATE USING (family_id = get_my_family_id());

CREATE POLICY "Users can delete family templates" ON recurring_templates
  FOR DELETE USING (family_id = get_my_family_id());
