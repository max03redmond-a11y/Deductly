/*
  # Auto-Update Expense Business Use Percentage

  ## Purpose
  When the year-end business use percentage is finalized in `mileage_year`,
  automatically update all expenses for that year to use the correct business
  percentage for categories that require it.

  ## Tables Modified
  - `expenses` - Will be updated when mileage_year.business_use_pct changes

  ## New Functions
  1. `update_expenses_business_use()` - Trigger function that updates expenses
     when mileage_year business_use_pct is updated or inserted
  2. `recalculate_expense_deductible()` - Helper function to recalculate
     deductible_amount based on business_percentage

  ## Behavior
  - When a mileage_year record is created or updated with business_use_pct
  - Find all expenses for that user and year where the category has apply_business_use = true
  - Update their business_percentage to match the mileage_year.business_use_pct
  - Recalculate deductible_amount = amount * (business_percentage / 100)

  ## Security
  - Functions run with security definer to allow updates
  - Only affects expenses owned by the same user
  - Respects RLS policies
*/

-- =====================================================
-- 1. CREATE HELPER FUNCTION TO RECALCULATE DEDUCTIBLE AMOUNT
-- =====================================================

CREATE OR REPLACE FUNCTION recalculate_expense_deductible()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate deductible amount based on business percentage
  NEW.deductible_amount := NEW.amount * (NEW.business_percentage / 100.0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate deductible_amount on insert/update
DROP TRIGGER IF EXISTS trigger_recalculate_expense_deductible ON expenses;
CREATE TRIGGER trigger_recalculate_expense_deductible
  BEFORE INSERT OR UPDATE OF amount, business_percentage
  ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_expense_deductible();

-- =====================================================
-- 2. CREATE FUNCTION TO UPDATE EXPENSES WHEN BUSINESS USE % CHANGES
-- =====================================================

CREATE OR REPLACE FUNCTION update_expenses_business_use()
RETURNS TRIGGER AS $$
DECLARE
  expense_year integer;
BEGIN
  -- Only proceed if business_use_pct actually changed
  IF (TG_OP = 'UPDATE' AND OLD.business_use_pct = NEW.business_use_pct) THEN
    RETURN NEW;
  END IF;

  -- Update all expenses for this user and year where the category applies business use
  UPDATE expenses e
  SET
    business_percentage = NEW.business_use_pct,
    updated_at = now()
  FROM cra_categories cc
  WHERE
    e.user_id = NEW.user_id
    AND EXTRACT(YEAR FROM e.date::date) = NEW.tax_year
    AND e.category_code = cc.code
    AND cc.apply_business_use = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on mileage_year table
DROP TRIGGER IF EXISTS trigger_update_expenses_on_business_use_change ON mileage_year;
CREATE TRIGGER trigger_update_expenses_on_business_use_change
  AFTER INSERT OR UPDATE OF business_use_pct
  ON mileage_year
  FOR EACH ROW
  EXECUTE FUNCTION update_expenses_business_use();

-- =====================================================
-- 3. BACKFILL EXISTING EXPENSES
-- =====================================================

-- Update deductible_amount for all existing expenses
UPDATE expenses
SET deductible_amount = amount * (business_percentage / 100.0)
WHERE deductible_amount IS NULL OR deductible_amount != amount * (business_percentage / 100.0);

-- For expenses where there's already a finalized mileage_year,
-- update their business_percentage to match
UPDATE expenses e
SET
  business_percentage = my.business_use_pct,
  updated_at = now()
FROM mileage_year my, cra_categories cc
WHERE
  e.user_id = my.user_id
  AND EXTRACT(YEAR FROM e.date::date) = my.tax_year
  AND e.category_code = cc.code
  AND cc.apply_business_use = true
  AND e.business_percentage != my.business_use_pct;
