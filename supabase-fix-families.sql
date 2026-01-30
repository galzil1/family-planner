-- Fix for creating families - add missing INSERT policy

-- Drop if exists and recreate
DROP POLICY IF EXISTS "Users can create families" ON families;

-- Allow any authenticated user to create a family
CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow reading families by invite code (for joining)
DROP POLICY IF EXISTS "Anyone can read family by invite code" ON families;

CREATE POLICY "Anyone can read family by invite code" ON families
  FOR SELECT USING (true);
