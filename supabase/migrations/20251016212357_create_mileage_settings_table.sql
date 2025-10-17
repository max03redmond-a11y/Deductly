-- Create Mileage Settings Table
-- 
-- 1. New Table: mileage_settings
--    - Stores Jan 1 odometer, current odometer, and manual overrides per user per year
-- 
-- 2. Security: RLS enabled with policies for authenticated users
-- 
-- 3. Constraints: Unique per user/year, non-negative values

CREATE TABLE IF NOT EXISTS mileage_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year integer NOT NULL,
  jan1_odometer_km numeric DEFAULT 0 CHECK (jan1_odometer_km >= 0),
  current_odometer_km numeric DEFAULT 0 CHECK (current_odometer_km >= 0),
  manual_total_km_ytd numeric CHECK (manual_total_km_ytd IS NULL OR manual_total_km_ytd >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year)
);

ALTER TABLE mileage_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mileage settings"
  ON mileage_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mileage settings"
  ON mileage_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mileage settings"
  ON mileage_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mileage settings"
  ON mileage_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);