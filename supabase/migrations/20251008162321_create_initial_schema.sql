/*
  # Create Deductly Initial Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `business_name` (text, nullable)
      - `province` (text) - user's Canadian province/territory
      - `business_type` (text) - rideshare, delivery, freelance, etc.
      - `gst_hst_registered` (boolean) - whether user is registered for GST/HST
      - `gst_hst_number` (text, nullable)
      - `fiscal_year_end` (text, nullable) - format: MM-DD
      - `vehicle_ownership_type` (text, nullable) - own, lease, etc.
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `date` (date) - transaction date
      - `merchant_name` (text)
      - `amount` (decimal) - total amount
      - `tax_amount` (decimal, nullable) - GST/HST portion
      - `category` (text) - fuel, maintenance, insurance, etc.
      - `subcategory` (text, nullable)
      - `description` (text, nullable)
      - `is_business` (boolean) - whether expense is business-related
      - `business_percentage` (decimal) - % of expense that's business use (0-100)
      - `receipt_url` (text, nullable) - path to uploaded receipt
      - `is_recurring` (boolean) - for insurance, lease payments, etc.
      - `imported_from` (text, nullable) - bank, manual, etc.
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `mileage_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `date` (date)
      - `start_odometer` (decimal, nullable)
      - `end_odometer` (decimal, nullable)
      - `distance_km` (decimal) - total distance for this log
      - `business_km` (decimal) - business portion
      - `purpose` (text, nullable) - trip purpose/description
      - `is_business` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `income_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `date` (date)
      - `source` (text) - Uber, DoorDash, cash, etc.
      - `amount` (decimal)
      - `trips_completed` (integer, nullable)
      - `description` (text, nullable)
      - `imported_from` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `vehicle_info`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles, unique)
      - `make` (text)
      - `model` (text)
      - `year` (integer)
      - `purchase_price` (decimal, nullable) - for CCA calculation
      - `purchase_date` (date, nullable)
      - `ownership_type` (text) - own, lease
      - `lease_start_date` (date, nullable)
      - `lease_end_date` (date, nullable)
      - `lease_monthly_payment` (decimal, nullable)
      - `loan_interest_annual` (decimal, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `referral_partners`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text) - tax_filing, insurance, investment, etc.
      - `description` (text)
      - `logo_url` (text, nullable)
      - `offer_text` (text)
      - `referral_url` (text)
      - `commission_amount` (decimal, nullable)
      - `is_active` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_referrals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `partner_id` (uuid, references referral_partners, nullable)
      - `referral_code` (text, unique) - user's personal referral code
      - `referred_user_id` (uuid, references profiles, nullable)
      - `referral_type` (text) - partner, user_to_user
      - `status` (text) - pending, completed, credited
      - `commission_earned` (decimal, default 0)
      - `clicked_at` (timestamptz, nullable)
      - `converted_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Admin policies for referral_partners table
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  business_name text,
  province text NOT NULL,
  business_type text NOT NULL,
  gst_hst_registered boolean DEFAULT false,
  gst_hst_number text,
  fiscal_year_end text DEFAULT '12-31',
  vehicle_ownership_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  merchant_name text NOT NULL,
  amount decimal(10,2) NOT NULL,
  tax_amount decimal(10,2),
  category text NOT NULL,
  subcategory text,
  description text,
  is_business boolean DEFAULT true,
  business_percentage decimal(5,2) DEFAULT 100.00,
  receipt_url text,
  is_recurring boolean DEFAULT false,
  imported_from text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

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

-- Create mileage_logs table
CREATE TABLE IF NOT EXISTS mileage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_odometer decimal(10,1),
  end_odometer decimal(10,1),
  distance_km decimal(10,2) NOT NULL,
  business_km decimal(10,2) NOT NULL,
  purpose text,
  is_business boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mileage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mileage logs"
  ON mileage_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mileage logs"
  ON mileage_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mileage logs"
  ON mileage_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mileage logs"
  ON mileage_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create income_records table
CREATE TABLE IF NOT EXISTS income_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  source text NOT NULL,
  amount decimal(10,2) NOT NULL,
  trips_completed integer,
  description text,
  imported_from text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income records"
  ON income_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income records"
  ON income_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income records"
  ON income_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income records"
  ON income_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create vehicle_info table
CREATE TABLE IF NOT EXISTS vehicle_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  purchase_price decimal(10,2),
  purchase_date date,
  ownership_type text NOT NULL,
  lease_start_date date,
  lease_end_date date,
  lease_monthly_payment decimal(10,2),
  loan_interest_annual decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicle info"
  ON vehicle_info FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicle info"
  ON vehicle_info FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicle info"
  ON vehicle_info FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicle info"
  ON vehicle_info FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create referral_partners table
CREATE TABLE IF NOT EXISTS referral_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  logo_url text,
  offer_text text NOT NULL,
  referral_url text NOT NULL,
  commission_amount decimal(10,2),
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE referral_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active referral partners"
  ON referral_partners FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create user_referrals table
CREATE TABLE IF NOT EXISTS user_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES referral_partners(id) ON DELETE SET NULL,
  referral_code text UNIQUE,
  referred_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  referral_type text NOT NULL,
  status text DEFAULT 'pending',
  commission_earned decimal(10,2) DEFAULT 0,
  clicked_at timestamptz,
  converted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON user_referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referrals"
  ON user_referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referrals"
  ON user_referrals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_mileage_logs_user_id ON mileage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mileage_logs_date ON mileage_logs(date);
CREATE INDEX IF NOT EXISTS idx_income_records_user_id ON income_records(user_id);
CREATE INDEX IF NOT EXISTS idx_income_records_date ON income_records(date);
CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON user_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referral_code ON user_referrals(referral_code);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mileage_logs_updated_at BEFORE UPDATE ON mileage_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_records_updated_at BEFORE UPDATE ON income_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_info_updated_at BEFORE UPDATE ON vehicle_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_partners_updated_at BEFORE UPDATE ON referral_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_referrals_updated_at BEFORE UPDATE ON user_referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
