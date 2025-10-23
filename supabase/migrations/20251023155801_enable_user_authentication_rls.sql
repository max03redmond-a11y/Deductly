/*
  # Enable User Authentication and Row Level Security

  1. Purpose
    - Implement secure multi-user authentication system
    - Enable Row Level Security (RLS) on all user-specific tables
    - Create restrictive policies for complete user data isolation
    - Ensure each user can only access their own data across devices

  2. Changes
    - Drop all existing permissive public access policies
    - Enable RLS on user data tables (profiles, expenses, income, mileage)
    - Create secure policies requiring authentication
    - Add auto-profile creation trigger for new signups
    - Keep referrals as public reference data

  3. Security
    - All user data requires authentication
    - Users can only read/write their own records
    - Policies verify auth.uid() = user_id for all operations
    - No cross-user data access possible
*/

-- Drop ALL existing overly permissive policies on user tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('profiles', 'expenses', 'income_entries', 'mileage_logs', 'mileage_settings', 'mileage_year')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Enable RLS on all user data tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_year ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- EXPENSES POLICIES
-- ============================================
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- INCOME ENTRIES POLICIES
-- ============================================
CREATE POLICY "Users can view own income"
  ON income_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income"
  ON income_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income"
  ON income_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income"
  ON income_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- MILEAGE LOGS POLICIES
-- ============================================
CREATE POLICY "Users can view own mileage"
  ON mileage_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mileage"
  ON mileage_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mileage"
  ON mileage_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mileage"
  ON mileage_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- MILEAGE SETTINGS POLICIES
-- ============================================
CREATE POLICY "Users can view own settings"
  ON mileage_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON mileage_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON mileage_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON mileage_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- MILEAGE YEAR POLICIES
-- ============================================
CREATE POLICY "Users can view own year data"
  ON mileage_year FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own year data"
  ON mileage_year FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own year data"
  ON mileage_year FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own year data"
  ON mileage_year FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    province,
    business_type,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    'ON',
    'Rideshare Driver',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
