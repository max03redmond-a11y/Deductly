/*
  # Bypass RLS for Initial Profile Creation

  1. Problem
    - RLS policies blocking profile creation even with proper policies
    - auth.uid() might not be available during the signup trigger

  2. Solution
    - Use service role to insert profiles via trigger
    - Grant the trigger function permission to bypass RLS
    - Keep RLS active for all user-initiated operations

  3. Security
    - Only the trigger function can bypass RLS
    - All direct user operations still enforced by RLS
    - Function only inserts profiles for new auth.users entries
*/

-- Recreate the trigger function with explicit RLS bypass
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profile - SECURITY DEFINER allows bypassing RLS
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
    COALESCE(NEW.email, ''),
    'ON',
    'Rideshare Driver',
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = COALESCE(NEW.email, profiles.email),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log but don't fail
    RAISE WARNING 'Profile creation warning: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

-- Ensure trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also add a policy that allows service role to always insert
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);
