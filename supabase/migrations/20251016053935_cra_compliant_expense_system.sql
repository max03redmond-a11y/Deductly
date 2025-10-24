/*
  # CRA-Compliant Expense Tracking System

  1. Schema Changes
    - Enhance `expenses` table to support new CRA category codes with T2125 line mapping
    - Add `income_entries` table for platform income tracking (Uber/Lyft/DoorDash)
    - Add `year_totals` table for fast tax year summaries
    - Add `assets` table for CCA (Capital Cost Allowance) tracking
    - Add `audit_trail` table for compliance and data integrity
    - Add `cra_categories` table for category definitions and rules

  2. New Tables
    - `income_entries` - Platform income with fees, tips, bonuses
    - `year_totals` - Cached year-end calculations for quick reporting
    - `assets` - Vehicle and equipment with CCA calculations
    - `audit_trail` - Complete audit log for all data changes
    - `cra_categories` - Category metadata with T2125 lines and ITC eligibility

  3. Enhanced Columns
    - `expenses` gets: category_code, category_label, vendor, amount_before_tax,
      tax_paid_hst, total_amount, deductible_amount (computed), itc_eligible
    - All amounts tracked separately for accurate GST/HST calculations

  4. Security
    - Enable RLS on all new tables
    - Users can only access their own data
    - Audit trail is append-only
*/

-- =====================================================
-- 1. CREATE CRA CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS cra_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  t2125_line text,
  itc_eligible boolean DEFAULT false,
  explanation_short text NOT NULL,
  explanation_rules text,
  default_business_use_target integer DEFAULT 100,
  apply_business_use boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cra_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view CRA categories"
  ON cra_categories FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 2. SEED CRA CATEGORIES
-- =====================================================

INSERT INTO cra_categories (code, label, t2125_line, itc_eligible, explanation_short, explanation_rules, default_business_use_target, apply_business_use)
VALUES
  -- Vehicle expenses (apply business-use %)
  ('GAS_FUEL', 'Gas and Oil', '9281', true, 'Fuel used while driving for fares.', 'Only deduct fuel used for business driving. Track all trips in your mileage log. Keep all receipts for 6 years.', 100, true),
  ('REPAIRS_MAINT', 'Repairs and Maintenance', '9281', true, 'Oil, tires, brake work to keep car operating.', 'Deduct only the business portion. Regular maintenance like oil changes, tire rotations, and brake repairs qualify. Major repairs to keep vehicle roadworthy are included.', 100, true),
  ('INSURANCE_AUTO', 'Vehicle Insurance', '9281', false, 'Auto policy premiums for your vehicle.', 'Insurance premiums are not subject to HST, so no ITC. Deduct business-use % only. Commercial rideshare coverage is fully deductible if 100% business vehicle.', 100, true),
  ('LIC_REG', 'License and Registration', '9281', false, 'Annual licence/registration fees.', 'Annual vehicle registration and licence plate fees. Deduct business portion only. Not subject to HST.', 100, true),
  ('CAR_WASH', 'Car Washes', '9281', true, 'Wash/detail to keep car client-ready.', 'Keep your vehicle clean for passengers. Deduct business-use % only. Save receipts for automatic and hand-wash services.', 100, true),
  ('PARKING_TOLLS', 'Parking and Tolls', '9281', true, 'On-trip parking and tolls.', 'Parking while picking up/dropping off passengers and highway tolls during trips are deductible. Personal parking is not.', 100, false),
  ('LEASE_PAYMENTS', 'Vehicle Lease Payments', '9281', true, 'Vehicle lease payments (CRA monthly cap).', 'Lease payments are capped at approx. $900 + tax per month (2025 limit). We apply the cap automatically. Deduct business-use % of capped amount.', 100, true),
  ('LOAN_INTEREST', 'Interest on Car Loan', '8710', false, 'Interest on car loan (CRA monthly cap).', 'Only the interest portion of loan payments is deductible, not principal. Monthly cap of ~$300 applies. Deduct business-use % only.', 100, true),
  ('VEHICLE_DEPRECIATION_CCA', 'Capital Cost Allowance (CCA)', '9936', false, 'Depreciation using CCA (Class 10/10.1/54).', 'Vehicle depreciation at 30% declining balance for all vehicle classes (Class 10/10.1/54). 50% rule applies in year 1. Luxury vehicle cap enforced automatically.', 100, true),

  -- Operating/Admin expenses
  ('UBER_FEES', 'Platform Service Fees', '8871', false, 'Platform/service fees deducted by Uber/Lyft.', 'Fees charged by Uber, Lyft, DoorDash, etc. are fully deductible. These reduce your net income and are reported separately from gross earnings.', 100, false),
  ('PHONE_PLAN_DATA', 'Phone and Data Plan', '9225', true, 'Mobile plan for the driver app.', 'Business portion of your phone plan. Apply business-use % from mileage. Must be necessary for earning income.', 100, true),
  ('SUPPLIES', 'Supplies', '8811', true, 'Mounts, chargers, wipes, air fresheners.', 'Items needed to operate your business: phone mounts, chargers, cleaning wipes, air fresheners, sanitizer, masks, bottled water for passengers.', 100, false),
  ('BANK_FEES_INTEREST', 'Bank Fees and Interest', '8710', false, 'Business account fees & permissible interest.', 'Fees for a business bank account or transaction fees related to business income. Interest paid on business loans or lines of credit (not credit cards).', 100, false),
  ('ACCOUNTING_SOFTWARE', 'Accounting and Tax Services', '8860', true, 'Tax software or accountant fees.', 'Cost of tax software, bookkeeping apps, or professional accounting services used to prepare your business taxes.', 100, false),
  ('ADVERTISING_PROMOS', 'Advertising', '8521', true, 'Promo cards, decals, referral promos.', 'Business cards, vehicle decals, promotional materials to attract riders. Referral bonuses paid to customers to promote your service.', 100, false),
  ('MEALS_CLIENT', 'Meals (Client)', '8523', true, 'Coffee/water for riders only (50% limit).', 'Meals provided to clients/riders. CRA allows 50% deduction only. Personal meals are never deductible.', 50, false),
  ('TRAINING_EDU', 'Training and Education', '9270', true, 'Driver safety or business courses.', 'Courses to improve driving skills, business management, or maintain required certifications for your rideshare/delivery business.', 100, false),
  ('CLEANING_SUPPLIES', 'Cleaning Supplies', '8811', true, 'Wipes, gloves, trash bags for rides.', 'Cleaning supplies to sanitize your vehicle between passengers: wipes, gloves, trash bags, disinfectant.', 100, false),
  ('INTERNET_BUSINESS', 'Internet Service', '9225', true, 'Portion of home internet used for work.', 'Business portion of home internet used for trip management, invoicing, recordkeeping. Apply business-use %.', 100, true),
  ('HOME_OFFICE', 'Home Office Expenses', '9945', true, 'Workspace to run the business (CRA rules).', 'Deduct a portion of rent/mortgage, utilities, insurance, property tax if you have a dedicated workspace for your business. Must meet CRA principal place of business test or regular meeting place for clients.', 100, true),

  -- Tracking only (not deductible but important for cash flow)
  ('CRA_INSTALLMENTS', 'CRA Tax Installments', null, false, 'Quarterly tax payments (cash-flow only).', 'Track installment payments for cash flow and tax planning. Not a business deduction. Helps you monitor if you are setting aside enough tax throughout the year.', 100, false),
  ('GST_HST_COLLECTED', 'GST/HST Collected', null, false, 'Tax on fares (if registered).', 'If you are GST/HST registered, track tax collected on fares. This is a liability you remit to CRA, not income.', 100, false),
  ('GST_HST_PAID_ITC', 'GST/HST Paid (ITC)', null, false, 'HST paid on inputs you can claim back.', 'Track HST paid on business expenses. If registered, you can claim Input Tax Credits to reduce your GST/HST remittance.', 100, false)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 3. CREATE INCOME ENTRIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS income_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  platform text NOT NULL,
  gross_income decimal(10,2) NOT NULL DEFAULT 0,
  tips decimal(10,2) NOT NULL DEFAULT 0,
  bonuses decimal(10,2) NOT NULL DEFAULT 0,
  other_income decimal(10,2) NOT NULL DEFAULT 0,
  platform_fees decimal(10,2) NOT NULL DEFAULT 0,
  net_payout decimal(10,2) GENERATED ALWAYS AS (gross_income + tips + bonuses + other_income - platform_fees) STORED,
  source_ref text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT income_entries_amounts_positive CHECK (
    gross_income >= 0 AND tips >= 0 AND bonuses >= 0 AND
    other_income >= 0 AND platform_fees >= 0
  )
);

ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income entries"
  ON income_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income entries"
  ON income_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income entries"
  ON income_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income entries"
  ON income_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_income_entries_user_date ON income_entries(user_id, date DESC);

-- =====================================================
-- 4. CREATE YEAR TOTALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS year_totals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tax_year integer NOT NULL,
  total_km decimal(10,2) DEFAULT 0,
  business_km decimal(10,2) DEFAULT 0,
  business_use_pct decimal(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN total_km > 0 THEN ROUND((business_km / total_km * 100)::numeric, 2)
      ELSE 0
    END
  ) STORED,
  gst_collected decimal(10,2) DEFAULT 0,
  gst_itcs decimal(10,2) DEFAULT 0,
  gst_net_owed decimal(10,2) GENERATED ALWAYS AS (gst_collected - gst_itcs) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT year_totals_unique_user_year UNIQUE(user_id, tax_year),
  CONSTRAINT year_totals_km_positive CHECK (total_km >= 0 AND business_km >= 0),
  CONSTRAINT year_totals_gst_positive CHECK (gst_collected >= 0 AND gst_itcs >= 0)
);

ALTER TABLE year_totals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own year totals"
  ON year_totals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own year totals"
  ON year_totals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own year totals"
  ON year_totals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_year_totals_user_year ON year_totals(user_id, tax_year);

-- =====================================================
-- 5. CREATE ASSETS TABLE (for CCA tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_name text NOT NULL,
  asset_class text NOT NULL,
  cost_before_tax decimal(10,2) NOT NULL,
  purchase_date date NOT NULL,
  business_use_pct decimal(5,2) NOT NULL DEFAULT 100.00,
  ucc_opening decimal(10,2) NOT NULL DEFAULT 0,
  cca_rate decimal(5,2) NOT NULL,
  cca_current decimal(10,2) DEFAULT 0,
  ucc_closing decimal(10,2) DEFAULT 0,
  is_luxury_vehicle boolean DEFAULT false,
  is_zero_emission boolean DEFAULT false,
  first_year_100pct_elected boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT assets_valid_class CHECK (asset_class IN ('10', '10.1', '54')),
  CONSTRAINT assets_amounts_positive CHECK (
    cost_before_tax >= 0 AND business_use_pct >= 0 AND business_use_pct <= 100 AND
    ucc_opening >= 0 AND cca_current >= 0 AND ucc_closing >= 0
  )
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assets"
  ON assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);

-- =====================================================
-- 6. CREATE AUDIT TRAIL TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  diff_json jsonb,
  timestamp timestamptz DEFAULT now(),

  CONSTRAINT audit_trail_valid_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit trail"
  ON audit_trail FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id);

-- =====================================================
-- 7. ENHANCE EXPENSES TABLE
-- =====================================================

-- Add new columns to expenses table
DO $$
BEGIN
  -- Add category_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'category_code'
  ) THEN
    ALTER TABLE expenses ADD COLUMN category_code text;
  END IF;

  -- Add category_label column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'category_label'
  ) THEN
    ALTER TABLE expenses ADD COLUMN category_label text;
  END IF;

  -- Add vendor column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'vendor'
  ) THEN
    ALTER TABLE expenses ADD COLUMN vendor text;
  END IF;

  -- Add amount_before_tax column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'amount_before_tax'
  ) THEN
    ALTER TABLE expenses ADD COLUMN amount_before_tax decimal(10,2);
  END IF;

  -- Add tax_paid_hst column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'tax_paid_hst'
  ) THEN
    ALTER TABLE expenses ADD COLUMN tax_paid_hst decimal(10,2) DEFAULT 0;
  END IF;

  -- Add total_amount column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE expenses ADD COLUMN total_amount decimal(10,2);
  END IF;

  -- Add deductible_amount column (computed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'deductible_amount'
  ) THEN
    ALTER TABLE expenses ADD COLUMN deductible_amount decimal(10,2);
  END IF;

  -- Add itc_eligible column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'itc_eligible'
  ) THEN
    ALTER TABLE expenses ADD COLUMN itc_eligible boolean DEFAULT false;
  END IF;

  -- Add notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'notes'
  ) THEN
    ALTER TABLE expenses ADD COLUMN notes text;
  END IF;
END $$;

-- Migrate existing data to new structure
UPDATE expenses
SET
  vendor = merchant_name,
  amount_before_tax = amount - COALESCE(tax_amount, 0),
  tax_paid_hst = COALESCE(tax_amount, 0),
  total_amount = amount,
  deductible_amount = amount * (business_percentage / 100),
  category_code = category,
  category_label = category
WHERE vendor IS NULL;

-- =====================================================
-- 8. CREATE TRIGGERS FOR updated_at
-- =====================================================

CREATE TRIGGER update_cra_categories_updated_at BEFORE UPDATE ON cra_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_entries_updated_at BEFORE UPDATE ON income_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_year_totals_updated_at BEFORE UPDATE ON year_totals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to compute business use percentage for a user and year
CREATE OR REPLACE FUNCTION compute_business_use_pct(p_user_id uuid, p_year integer)
RETURNS decimal AS $$
DECLARE
  v_total_km decimal;
  v_business_km decimal;
BEGIN
  SELECT
    COALESCE(SUM(distance_km), 0),
    COALESCE(SUM(CASE WHEN is_business THEN distance_km ELSE 0 END), 0)
  INTO v_total_km, v_business_km
  FROM mileage_logs
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM date) = p_year;

  IF v_total_km > 0 THEN
    RETURN ROUND((v_business_km / v_total_km * 100)::numeric, 2);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate ITC for an expense
CREATE OR REPLACE FUNCTION calculate_itc(
  p_tax_paid_hst decimal,
  p_business_pct decimal,
  p_itc_eligible boolean
)
RETURNS decimal AS $$
BEGIN
  IF p_itc_eligible THEN
    RETURN ROUND((p_tax_paid_hst * p_business_pct / 100)::numeric, 2);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;