-- PART 2: Triggers and Functions
-- Run this AFTER Part 1 succeeds

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tasks table (drop first if exists)
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
