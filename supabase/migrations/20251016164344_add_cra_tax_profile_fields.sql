/*
  # Add CRA Tax Profile Fields for T2125 Export

  ## New Fields Added to profiles table
  
  ### Personal Information
  - `legal_name` (text) - Legal name for tax purposes
  - `sin_encrypted` (text) - Encrypted Social Insurance Number
  - `mailing_address_line1` (text) - Street address
  - `mailing_address_line2` (text) - Apt/Suite number (optional)
  - `mailing_city` (text) - City
  - `mailing_postal_code` (text) - Postal code (format: A1A 1A1)
  
  ### Business Information
  - `business_number` (text) - 9-digit CRA business number
  - `naics_code` (text) - 6-digit NAICS classification code
  - `accounting_method` (text) - 'cash' or 'accrual'
  - `fiscal_year_start` (date) - Fiscal year start date
  - `fiscal_year_end_date` (date) - Fiscal year end date (renamed from fiscal_year_end)
  
  ### GST/HST Registration
  - `gst_hst_method` (text) - 'regular' or 'quick' method
  
  ### Internet Business Activities
  - `internet_business_urls` (text[]) - Array of business website URLs
  - `internet_income_percentage` (numeric) - % of gross income from internet (0-100)
  
  ### Metadata
  - `profile_completed` (boolean) - Whether profile is complete
  - `profile_completed_at` (timestamptz) - When profile was completed

  ## Notes
  - SIN is stored encrypted for security
  - All personal data is protected by RLS
  - Fields are nullable to allow progressive completion
*/

-- Add personal information fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS legal_name text,
ADD COLUMN IF NOT EXISTS sin_encrypted text,
ADD COLUMN IF NOT EXISTS mailing_address_line1 text,
ADD COLUMN IF NOT EXISTS mailing_address_line2 text,
ADD COLUMN IF NOT EXISTS mailing_city text,
ADD COLUMN IF NOT EXISTS mailing_postal_code text;

-- Add business information fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_number text,
ADD COLUMN IF NOT EXISTS naics_code text,
ADD COLUMN IF NOT EXISTS accounting_method text CHECK (accounting_method IN ('cash', 'accrual')),
ADD COLUMN IF NOT EXISTS fiscal_year_start date,
ADD COLUMN IF NOT EXISTS fiscal_year_end_date date;

-- Add GST/HST method
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gst_hst_method text CHECK (gst_hst_method IN ('regular', 'quick'));

-- Add internet business fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS internet_business_urls text[],
ADD COLUMN IF NOT EXISTS internet_income_percentage numeric(5,2) CHECK (internet_income_percentage >= 0 AND internet_income_percentage <= 100);

-- Add profile completion tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completed_at timestamptz;

-- Create index on profile completion for quick queries
CREATE INDEX IF NOT EXISTS idx_profiles_completed ON profiles(profile_completed);

-- Add comment explaining SIN encryption expectation
COMMENT ON COLUMN profiles.sin_encrypted IS 'Encrypted SIN - should be encrypted client-side before storage';