/*
  # Remove Authentication Constraints and Create Default User

  1. Changes
    - Drop foreign key constraint from profiles to auth.users
    - This allows creating profiles without authentication
    - Insert a default profile for anonymous usage

  2. Purpose
    - Enables the app to work fully without authentication
    - All features can be used without login
    - Satisfies foreign key constraints from other tables
*/

-- Drop the foreign key constraint from profiles to auth.users
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Insert default profile if it doesn't exist
INSERT INTO profiles (
  id, 
  email, 
  full_name, 
  business_name, 
  province, 
  business_type,
  gst_hst_registered,
  fiscal_year_end,
  profile_completed,
  created_at, 
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'anonymous@example.com',
  'Anonymous User',
  'My Business',
  'ON',
  'Rideshare Driver',
  false,
  '12-31',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
