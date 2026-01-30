-- Fix for profile creation during signup when email confirmation is required
-- This creates a function that bypasses RLS to create the user profile

-- Create a function to create user profile (bypasses RLS)
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_display_name TEXT,
  user_avatar_color TEXT DEFAULT '#3B82F6'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO users (id, email, display_name, avatar_color)
  VALUES (user_id, user_email, user_display_name, user_avatar_color)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile TO anon;
