/*
  # Enable Public Access to All Tables

  1. Changes
    - Allow anonymous (public) users to perform all operations on all tables
    - This enables the app to work without authentication
    - Users can create, read, update, and delete data without logging in

  2. Security Note
    - This is intentionally permissive for a demo/personal use app
    - All users share the same database space
    - Appropriate for single-user or demo applications
*/

-- =====================================================
-- PROFILES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Public full access to profiles"
  ON profiles FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- EXPENSES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

CREATE POLICY "Public full access to expenses"
  ON expenses FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- MILEAGE_LOGS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own mileage logs" ON mileage_logs;
DROP POLICY IF EXISTS "Users can insert own mileage logs" ON mileage_logs;
DROP POLICY IF EXISTS "Users can update own mileage logs" ON mileage_logs;
DROP POLICY IF EXISTS "Users can delete own mileage logs" ON mileage_logs;

CREATE POLICY "Public full access to mileage_logs"
  ON mileage_logs FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- INCOME_RECORDS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own income records" ON income_records;
DROP POLICY IF EXISTS "Users can insert own income records" ON income_records;
DROP POLICY IF EXISTS "Users can update own income records" ON income_records;
DROP POLICY IF EXISTS "Users can delete own income records" ON income_records;

CREATE POLICY "Public full access to income_records"
  ON income_records FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- VEHICLE_INFO TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own vehicle info" ON vehicle_info;
DROP POLICY IF EXISTS "Users can insert own vehicle info" ON vehicle_info;
DROP POLICY IF EXISTS "Users can update own vehicle info" ON vehicle_info;
DROP POLICY IF EXISTS "Users can delete own vehicle info" ON vehicle_info;

CREATE POLICY "Public full access to vehicle_info"
  ON vehicle_info FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- USER_REFERRALS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own referrals" ON user_referrals;
DROP POLICY IF EXISTS "Users can insert own referrals" ON user_referrals;
DROP POLICY IF EXISTS "Users can update own referrals" ON user_referrals;

CREATE POLICY "Public full access to user_referrals"
  ON user_referrals FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- MILEAGE_SETTINGS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own mileage settings" ON mileage_settings;
DROP POLICY IF EXISTS "Users can insert own mileage settings" ON mileage_settings;
DROP POLICY IF EXISTS "Users can update own mileage settings" ON mileage_settings;

CREATE POLICY "Public full access to mileage_settings"
  ON mileage_settings FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- INCOME_ENTRIES TABLE (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'income_entries') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own income entries" ON income_entries';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own income entries" ON income_entries';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own income entries" ON income_entries';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete own income entries" ON income_entries';

    EXECUTE 'CREATE POLICY "Public full access to income_entries"
      ON income_entries FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;

-- =====================================================
-- ASSETS TABLE (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'assets') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own assets" ON assets';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own assets" ON assets';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own assets" ON assets';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete own assets" ON assets';

    EXECUTE 'CREATE POLICY "Public full access to assets"
      ON assets FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;

-- =====================================================
-- YEAR_TOTALS TABLE (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'year_totals') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own year totals" ON year_totals';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own year totals" ON year_totals';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own year totals" ON year_totals';

    EXECUTE 'CREATE POLICY "Public full access to year_totals"
      ON year_totals FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;

-- =====================================================
-- REFERRAL_PARTNERS TABLE (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'referral_partners') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public can view active referral partners" ON referral_partners';

    EXECUTE 'CREATE POLICY "Public full access to referral_partners"
      ON referral_partners FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;
