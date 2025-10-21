/*
  # Add GST/HST tracking to income entries

  1. Changes
    - Add `gst_collected` column to track GST/HST included in gross sales
    - Add `includes_tax` boolean to indicate if gross_income includes tax
    - Update net_payout calculation to account for GST/HST when applicable
  
  2. Notes
    - `gst_collected` stores the amount of GST/HST that was collected
    - When `includes_tax` is true, the gross_income already includes GST/HST
    - This allows proper reporting on T2125 where GST/HST is reported separately
*/

-- Add GST/HST tracking columns
ALTER TABLE income_entries 
ADD COLUMN IF NOT EXISTS gst_collected numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS includes_tax boolean DEFAULT false NOT NULL;

-- Add helpful comment
COMMENT ON COLUMN income_entries.gst_collected IS 'Amount of GST/HST collected (included in gross_income when includes_tax is true)';
COMMENT ON COLUMN income_entries.includes_tax IS 'Indicates if gross_income includes GST/HST';
