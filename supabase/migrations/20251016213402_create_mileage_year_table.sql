-- Create Mileage Year Finalization Table
-- 
-- 1. New Table: mileage_year
--    - Stores finalized year-end data with business-use % locked
-- 
-- 2. Security: RLS enabled with policies for authenticated users
-- 
-- 3. Behavior: Once finalized_at is set, values are locked until reopened

CREATE TABLE IF NOT EXISTS mileage_year (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tax_year integer NOT NULL,
  start_odo_km numeric NOT NULL CHECK (start_odo_km >= 0),
  end_odo_km numeric NOT NULL CHECK (end_odo_km >= 0),
  total_km_ytd numeric NOT NULL CHECK (total_km_ytd >= 0),
  business_km_ytd numeric NOT NULL CHECK (business_km_ytd >= 0),
  business_use_pct numeric NOT NULL CHECK (business_use_pct >= 0 AND business_use_pct <= 100),
  finalized_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tax_year),
  CONSTRAINT end_after_start CHECK (end_odo_km >= start_odo_km),
  CONSTRAINT business_km_not_exceed_total CHECK (business_km_ytd <= total_km_ytd)
);

ALTER TABLE mileage_year ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mileage year data"
  ON mileage_year FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mileage year data"
  ON mileage_year FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mileage year data"
  ON mileage_year FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mileage year data"
  ON mileage_year FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mileage_year_user_year ON mileage_year(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_mileage_year_finalized ON mileage_year(user_id, finalized_at);