/*
  # Remove All Foreign Key Constraints

  1. Changes
    - Drop all foreign key constraints from all tables
    - This allows the app to work without strict referential integrity
    - Tables can still reference IDs but won't enforce relationships

  2. Purpose
    - Simplifies database usage for anonymous/demo mode
    - Prevents cascading delete issues
    - Allows more flexible data management
*/

-- Remove foreign keys from expenses table
ALTER TABLE expenses 
  DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;

-- Remove foreign keys from mileage_logs table
ALTER TABLE mileage_logs 
  DROP CONSTRAINT IF EXISTS mileage_logs_user_id_fkey;

-- Remove foreign keys from income_records table
ALTER TABLE income_records 
  DROP CONSTRAINT IF EXISTS income_records_user_id_fkey;

-- Remove foreign keys from vehicle_info table
ALTER TABLE vehicle_info 
  DROP CONSTRAINT IF EXISTS vehicle_info_user_id_fkey;

-- Remove foreign keys from user_referrals table
ALTER TABLE user_referrals 
  DROP CONSTRAINT IF EXISTS user_referrals_user_id_fkey,
  DROP CONSTRAINT IF EXISTS user_referrals_partner_id_fkey,
  DROP CONSTRAINT IF EXISTS user_referrals_referred_user_id_fkey;

-- Remove foreign keys from income_entries table
ALTER TABLE income_entries 
  DROP CONSTRAINT IF EXISTS income_entries_user_id_fkey;

-- Remove foreign keys from year_totals table
ALTER TABLE year_totals 
  DROP CONSTRAINT IF EXISTS year_totals_user_id_fkey;

-- Remove foreign keys from assets table
ALTER TABLE assets 
  DROP CONSTRAINT IF EXISTS assets_user_id_fkey;

-- Remove foreign keys from audit_trail table
ALTER TABLE audit_trail 
  DROP CONSTRAINT IF EXISTS audit_trail_user_id_fkey;

-- Remove foreign keys from mileage_settings table
ALTER TABLE mileage_settings 
  DROP CONSTRAINT IF EXISTS mileage_settings_user_id_fkey;

-- Remove foreign keys from mileage_year table
ALTER TABLE mileage_year 
  DROP CONSTRAINT IF EXISTS mileage_year_user_id_fkey;
