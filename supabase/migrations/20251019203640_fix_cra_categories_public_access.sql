/*
  # Fix CRA Categories Public Access

  1. Changes
    - Drop the existing authenticated-only policy for cra_categories
    - Create a new policy that allows public read access to cra_categories
    - This enables the category selector to work without authentication

  2. Security
    - Categories are read-only reference data
    - No user-specific information is stored in this table
    - Safe to allow public read access
*/

-- Drop the existing policy that requires authentication
DROP POLICY IF EXISTS "Anyone can view CRA categories" ON cra_categories;

-- Create a new policy that allows public access
CREATE POLICY "Public read access to CRA categories"
  ON cra_categories FOR SELECT
  TO anon, authenticated
  USING (true);
