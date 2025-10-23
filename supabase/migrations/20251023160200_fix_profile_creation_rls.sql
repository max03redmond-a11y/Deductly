/*
  # Fix Profile Creation for New Users

  1. Issue
    - RLS policies are blocking the trigger function from creating profiles
    - The handle_new_user() function needs to bypass RLS

  2. Solution
    - Update the trigger function to use service role privileges
    - Ensure it can insert profiles regardless of RLS policies
    - Function already has SECURITY DEFINER but needs proper grants

  3. Changes
    - Grant necessary permissions to the function
    - Ensure the function can bypass RLS for profile creation
*/

-- Drop and recreate the function with proper security context
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new profile with default values
  -- SECURITY DEFINER allows this to bypass RLS
  INSERT INTO public.profiles (
    id, 
    email, 
    province,
    business_type,
    profile_completed,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    'ON',
    'Rideshare Driver',
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
