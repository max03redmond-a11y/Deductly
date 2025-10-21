/*
  # Split GST and HST tracking in income entries

  1. Changes
    - Add `gst_amount` column for GST (5%)
    - Add `hst_amount` column for HST (13% or 15%)
    - Keep `gst_collected` for backward compatibility (will be sum of gst_amount + hst_amount)
  
  2. Notes
    - GST is 5% federal tax
    - HST varies by province (13% or 15%)
    - Users can now enter GST and HST separately
*/

-- Add separate GST and HST columns
ALTER TABLE income_entries 
ADD COLUMN IF NOT EXISTS gst_amount numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS hst_amount numeric DEFAULT 0 NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN income_entries.gst_amount IS 'GST amount (5% federal)';
COMMENT ON COLUMN income_entries.hst_amount IS 'HST amount (varies by province: 13% or 15%)';
COMMENT ON COLUMN income_entries.gst_collected IS 'Total tax collected (gst_amount + hst_amount for backward compatibility)';
