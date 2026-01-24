-- PART 3: Row Level Security (RLS) Policies
-- Run this AFTER Part 2 succeeds

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES

-- Users can read their own user record
CREATE POLICY "Users can read own record" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own record
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can read family members (separate policy to avoid recursion)
CREATE POLICY "Users can read family members" ON users
  FOR SELECT USING (
    family_id IS NOT NULL AND family_id IN (
      SELECT u.family_id FROM users u WHERE u.id = auth.uid() AND u.family_id IS NOT NULL
    )
  );

-- FAMILIES TABLE POLICIES

-- Users can read their own family
CREATE POLICY "Users can read own family" ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

-- Anyone authenticated can create families
CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (true);

-- Users can update their own family
CREATE POLICY "Users can update own family" ON families
  FOR UPDATE USING (
    id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

-- Users can read families by invite code (for joining)
CREATE POLICY "Users can read family by invite code" ON families
  FOR SELECT USING (true);

-- CATEGORIES TABLE POLICIES

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

-- TASKS TABLE POLICIES

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

-- RECURRING TEMPLATES TABLE POLICIES

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
