/*
  # Add T2125 Part 1 Identification Fields

  ## New Fields Added to profiles table
  
  ### Business Identification (T2125 Part 1)
  - `business_name` (text) - Operating name of business
  - `business_address_line1` (text) - Business street address
  - `business_address_line2` (text) - Business suite/unit (optional)
  - `business_city` (text) - Business city
  - `business_province` (text) - 2-letter province code
  - `business_postal_code` (text) - Business postal code
  - `main_product_service` (text) - Description of main business activity
  - `industry_code` (text) - 6-digit industry code from Guide T4002
  - `last_year_of_business` (boolean) - Whether this is the last year operating
  - `tax_shelter_id` (text) - Tax shelter identification number (if applicable)
  - `partnership_business_number` (text) - Partnership business number (if applicable)
  - `partnership_percentage` (numeric) - Percentage of partnership ownership (0-100)

  ## Notes
  - Business address separate from mailing address
  - Province stored as 2-letter code (ON, BC, AB, etc.)
  - Partnership fields nullable (only for partnerships)
  - Industry code references Guide T4002 Chapter 2
*/

-- Add business identification fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_name text,
ADD COLUMN IF NOT EXISTS business_address_line1 text,
ADD COLUMN IF NOT EXISTS business_address_line2 text,
ADD COLUMN IF NOT EXISTS business_city text,
ADD COLUMN IF NOT EXISTS business_province text CHECK (length(business_province) = 2),
ADD COLUMN IF NOT EXISTS business_postal_code text,
ADD COLUMN IF NOT EXISTS main_product_service text,
ADD COLUMN IF NOT EXISTS industry_code text,
ADD COLUMN IF NOT EXISTS last_year_of_business boolean DEFAULT false;

-- Add partnership fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tax_shelter_id text,
ADD COLUMN IF NOT EXISTS partnership_business_number text,
ADD COLUMN IF NOT EXISTS partnership_percentage numeric(5,2) CHECK (partnership_percentage >= 0 AND partnership_percentage <= 100);

-- Add comments
COMMENT ON COLUMN profiles.business_name IS 'Operating name of business (may differ from legal name)';
COMMENT ON COLUMN profiles.industry_code IS '6-digit industry code from Guide T4002 Chapter 2';
COMMENT ON COLUMN profiles.business_province IS '2-letter province code (ON, BC, AB, etc.)';
COMMENT ON COLUMN profiles.partnership_percentage IS 'Percentage of partnership ownership if applicable';
