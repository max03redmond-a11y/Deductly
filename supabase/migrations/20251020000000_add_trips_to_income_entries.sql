/*
  # Add trips_completed field to income_entries table

  1. Changes
    - Add `trips_completed` column to `income_entries` table
      - Type: integer
      - Default: null (optional field)
      - Allows tracking number of trips/deliveries for each payout

  2. Notes
    - This field is optional and can be null for non-trip-based income
    - Useful for Uber, Lyft, DoorDash drivers to track trip counts
    - Does not affect existing records (defaults to null)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'income_entries' AND column_name = 'trips_completed'
  ) THEN
    ALTER TABLE income_entries ADD COLUMN trips_completed integer DEFAULT null;
  END IF;
END $$;
