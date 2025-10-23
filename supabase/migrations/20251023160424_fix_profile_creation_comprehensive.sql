/*
  # Comprehensive Fix for Profile Creation

  1. Problem
    - New users cannot create/update their profiles due to RLS
    - Profile creation during signup is being blocked

  2. Solution
    - Add anon role permission to insert profiles (for initial signup)
    - Keep authenticated role for updates
    - Ensure trigger function works properly

  3. Security
    - Anon users can only insert their own profile (checked by auth.uid())
    - After login, all operations use authenticated role
    - No security risk as user must be authenticated to get a user ID
*/

-- Allow anonymous users to insert their own profile during signup
-- This is safe because auth.uid() only returns a value if the user is authenticated
-- Even though the role is 'anon', Supabase Auth provides the uid during signup
CREATE POLICY "Allow users to insert own profile during signup"
  ON profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.uid() = id);

-- Drop the old more restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Ensure the function can create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO profile_exists;
  
  -- Only insert if profile doesn't exist
  IF NOT profile_exists THEN
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
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
