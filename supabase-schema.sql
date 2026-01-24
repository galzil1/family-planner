-- Family Weekly Planner Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Families table
CREATE TABLE families (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  invite_code VARCHAR(8) UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  avatar_color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  icon VARCHAR(10) DEFAULT '📌',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  notes TEXT,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  week_start DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  reminder_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring task templates
CREATE TABLE recurring_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  notes TEXT,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  reminder_time TIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasks_family_week ON tasks(family_id, week_start);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_categories_family ON categories(family_id);
CREATE INDEX idx_recurring_family ON recurring_templates(family_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tasks table
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;

-- Users can read their own user record
CREATE POLICY "Users can read own record" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own record
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can read family members
CREATE POLICY "Users can read family members" ON users
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

-- Families: users can read their own family
CREATE POLICY "Users can read own family" ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

-- Families: users can create families
CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (true);

-- Families: users can update their own family
CREATE POLICY "Users can update own family" ON families
  FOR UPDATE USING (
    id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

-- Categories: users can CRUD categories in their family
CREATE POLICY "Users can read family categories" ON categories
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create family categories" ON categories
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update family categories" ON categories
  FOR UPDATE USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete family categories" ON categories
  FOR DELETE USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

-- Tasks: users can CRUD tasks in their family
CREATE POLICY "Users can read family tasks" ON tasks
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create family tasks" ON tasks
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update family tasks" ON tasks
  FOR UPDATE USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete family tasks" ON tasks
  FOR DELETE USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

-- Recurring templates: users can CRUD templates in their family
CREATE POLICY "Users can read family templates" ON recurring_templates
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create family templates" ON recurring_templates
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update family templates" ON recurring_templates
  FOR UPDATE USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete family templates" ON recurring_templates
  FOR DELETE USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

-- Function to create default categories for a family
CREATE OR REPLACE FUNCTION create_default_categories(p_family_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO categories (family_id, name, color, icon) VALUES
    (p_family_id, 'Cleaning', '#10B981', '🧹'),
    (p_family_id, 'Shopping', '#F59E0B', '🛒'),
    (p_family_id, 'Cooking', '#EF4444', '🍳'),
    (p_family_id, 'Kids', '#8B5CF6', '👶'),
    (p_family_id, 'Work', '#3B82F6', '💼'),
    (p_family_id, 'Health', '#EC4899', '💪'),
    (p_family_id, 'Finance', '#14B8A6', '💰'),
    (p_family_id, 'Other', '#6B7280', '📌');
END;
$$ LANGUAGE plpgsql;

-- Function to generate recurring tasks for a week
CREATE OR REPLACE FUNCTION generate_recurring_tasks(p_family_id UUID, p_week_start DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO tasks (family_id, assigned_to, category_id, title, notes, day_of_week, week_start, is_recurring, reminder_time)
  SELECT 
    family_id,
    assigned_to,
    category_id,
    title,
    notes,
    day_of_week,
    p_week_start,
    TRUE,
    reminder_time
  FROM recurring_templates
  WHERE family_id = p_family_id
    AND is_active = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.family_id = recurring_templates.family_id
        AND tasks.week_start = p_week_start
        AND tasks.title = recurring_templates.title
        AND tasks.day_of_week = recurring_templates.day_of_week
        AND tasks.is_recurring = TRUE
    );
END;
$$ LANGUAGE plpgsql;
