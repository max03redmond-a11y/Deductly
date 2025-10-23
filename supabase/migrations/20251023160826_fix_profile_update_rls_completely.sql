/*
  # Comprehensive Profile RLS Fix

  1. Problem
    - Profile updates during onboarding are being blocked
    - Users need to be able to update their profile after signup

  2. Solution
    - Ensure INSERT policy works for initial profile creation
    - Ensure UPDATE policy allows users to update their own profiles
    - Add better error handling in trigger

  3. Testing approach
    - Profile creation happens via trigger (bypass RLS)
    - Profile updates use authenticated user policies
*/

-- First, let's ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies and start fresh
DROP POLICY IF EXISTS "Allow users to insert own profile during signup" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- CREATE COMPREHENSIVE POLICIES

-- 1. SELECT: Authenticated users can view their own profile
CREATE POLICY "authenticated_users_select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. INSERT: Allow both trigger (via service role) and authenticated users
CREATE POLICY "authenticated_users_insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (auth.uid() = id);

-- 3. UPDATE: Authenticated users can update their own profile
CREATE POLICY "authenticated_users_update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Service role bypass for trigger
CREATE POLICY "service_role_all_access"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enhance the trigger function with better logging
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
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE NOTICE 'Profile already exists for user %', NEW.id;
    RETURN NEW;
  END IF;

  -- Insert new profile
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
  );
  
  RAISE NOTICE 'Successfully created profile for user %', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'Profile already exists (unique violation) for user %', NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Test the policies by checking they exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'profiles';
  
  RAISE NOTICE 'Total RLS policies on profiles table: %', policy_count;
END $$;
