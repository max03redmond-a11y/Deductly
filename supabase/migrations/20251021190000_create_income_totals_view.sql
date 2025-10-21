/*
  # Create Income Totals View for T2125 Part 3C

  1. Overview
    - Creates view v_income_totals_part3c for calculating T2125 Part 3C business income
    - Implements the formula: Gross business income = (Gross sales - GST/HST) + Other income

  2. T2125 Line Items Calculated
    - Line 3A: Gross sales including GST/HST
    - Line 3B: GST/HST collected/collectible
    - Line 3C: Net sales (3A - 3B)
    - Line 8230: Other income (tips, bonuses, referrals)
    - Line 8299: Gross business income (3C + 8230)

  3. Design Notes
    - All amounts stored in cents for precision
    - Calculations performed in cents, rounded to dollars only on export
    - Supports filtering by user_id and date range
    - Returns zero for empty result sets (no NaN)
*/

-- Drop view if it exists
DROP VIEW IF EXISTS v_income_totals_part3c;

-- Create the income totals view
CREATE VIEW v_income_totals_part3c AS
SELECT
  user_id,
  -- Line 3A: Gross sales (including GST/HST)
  ROUND((COALESCE(SUM(gross_income), 0) * 100)::numeric, 0)::bigint as sum_3a_cents,

  -- Line 3B: GST/HST collected/collectible
  ROUND((COALESCE(SUM(gst_collected), 0) * 100)::numeric, 0)::bigint as sum_3b_cents,

  -- Line 3C: Net sales (3A - 3B)
  ROUND(((COALESCE(SUM(gross_income), 0) - COALESCE(SUM(gst_collected), 0)) * 100)::numeric, 0)::bigint as sum_3c_cents,

  -- Line 8230: Other income (tips + bonuses + other_income)
  ROUND((COALESCE(SUM(tips + bonuses + other_income), 0) * 100)::numeric, 0)::bigint as sum_8230_cents,

  -- Line 8299: Gross business income (3C + 8230)
  ROUND((
    (COALESCE(SUM(gross_income), 0) - COALESCE(SUM(gst_collected), 0) + COALESCE(SUM(tips + bonuses + other_income), 0)) * 100
  )::numeric, 0)::bigint as sum_8299_cents,

  -- Metadata
  MIN(date) as period_start,
  MAX(date) as period_end,
  COUNT(*) as entry_count
FROM income_entries
GROUP BY user_id;

-- Add helpful comment
COMMENT ON VIEW v_income_totals_part3c IS 'T2125 Part 3C income calculations: Gross business income = (Gross sales - GST/HST) + Other income';

-- Create function to get income totals for a specific period
CREATE OR REPLACE FUNCTION get_income_totals_part3c(
  p_user_id uuid,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE (
  sum_3a_cents bigint,
  sum_3b_cents bigint,
  sum_3c_cents bigint,
  sum_8230_cents bigint,
  sum_8299_cents bigint,
  period_start date,
  period_end date,
  entry_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Line 3A: Gross sales (including GST/HST)
    ROUND((COALESCE(SUM(ie.gross_income), 0) * 100)::numeric, 0)::bigint,

    -- Line 3B: GST/HST collected/collectible
    ROUND((COALESCE(SUM(ie.gst_collected), 0) * 100)::numeric, 0)::bigint,

    -- Line 3C: Net sales (3A - 3B)
    ROUND(((COALESCE(SUM(ie.gross_income), 0) - COALESCE(SUM(ie.gst_collected), 0)) * 100)::numeric, 0)::bigint,

    -- Line 8230: Other income (tips + bonuses + other_income)
    ROUND((COALESCE(SUM(ie.tips + ie.bonuses + ie.other_income), 0) * 100)::numeric, 0)::bigint,

    -- Line 8299: Gross business income (3C + 8230)
    ROUND((
      (COALESCE(SUM(ie.gross_income), 0) - COALESCE(SUM(ie.gst_collected), 0) + COALESCE(SUM(ie.tips + ie.bonuses + ie.other_income), 0)) * 100
    )::numeric, 0)::bigint,

    -- Metadata
    MIN(ie.date)::date,
    MAX(ie.date)::date,
    COUNT(*)::bigint
  FROM income_entries ie
  WHERE ie.user_id = p_user_id
    AND (p_start_date IS NULL OR ie.date >= p_start_date)
    AND (p_end_date IS NULL OR ie.date <= p_end_date);
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION get_income_totals_part3c IS 'Get T2125 Part 3C income totals for a specific user and optional date range';
