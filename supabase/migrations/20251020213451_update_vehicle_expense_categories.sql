/*
  # Update Vehicle Expense Categories for Chart A

  This migration updates the CRA category definitions to ensure only specific
  vehicle expenses are mapped to Chart A (Motor Vehicle Expenses - Line 9281).
  All other expenses are mapped to their appropriate operating expense lines.

  Chart A Vehicle Expenses (Line 9281):
  - Fuel and oil
  - Interest on car loan
  - Insurance
  - Licence and registration
  - Maintenance and repairs
  - Leasing
  - Electricity for zero-emission vehicles

  Operating Expenses (moved from vehicle to their own lines):
  - Parking and tolls → Line 9281 (but not Chart A calculation)
  - Car washes → Line 9270 (Other expenses)
  - Platform fees → Line 8871 (Management fees)
  - Phone plan → Line 9225 (Telephone and utilities)
  - Supplies → Line 8811 (Office stationery and supplies)
  - Bank fees → Line 8710 (Interest and bank charges)
  - Other categories remain on their assigned lines
*/

-- Update car washes to be an operating expense (Line 9270 - Other expenses)
UPDATE cra_categories
SET 
  t2125_line = '9270',
  apply_business_use = true,
  explanation_rules = 'Keep your vehicle clean for passengers. Deduct business-use % only. Save receipts for automatic and hand-wash services. Categorized as other operating expense.'
WHERE code = 'CAR_WASH';

-- Update parking and tolls to remain on 9281 but NOT part of Chart A calculation
-- (These are added separately on Chart A line 14)
UPDATE cra_categories
SET 
  apply_business_use = false,
  explanation_rules = 'Parking while picking up/dropping off passengers and highway tolls during trips are deductible. Personal parking is not. These are added separately on Chart A line 14, not part of the Chart A calculation.'
WHERE code = 'PARKING_TOLLS';

-- Ensure only these categories apply to Chart A vehicle calculation:
-- GAS_FUEL, REPAIRS_MAINT, INSURANCE_AUTO, LIC_REG, LEASE_PAYMENTS, LOAN_INTEREST, VEHICLE_DEPRECIATION_CCA

-- Verify the correct categories have apply_business_use = true for Chart A
UPDATE cra_categories
SET apply_business_use = true
WHERE code IN ('GAS_FUEL', 'REPAIRS_MAINT', 'INSURANCE_AUTO', 'LIC_REG', 'LEASE_PAYMENTS', 'LOAN_INTEREST', 'VEHICLE_DEPRECIATION_CCA');

-- All other categories should have apply_business_use = false or use their own business % logic
UPDATE cra_categories
SET apply_business_use = false
WHERE code NOT IN ('GAS_FUEL', 'REPAIRS_MAINT', 'INSURANCE_AUTO', 'LIC_REG', 'LEASE_PAYMENTS', 'LOAN_INTEREST', 'VEHICLE_DEPRECIATION_CCA', 'PHONE_PLAN_DATA', 'INTERNET_BUSINESS', 'HOME_OFFICE')
AND apply_business_use = true;
