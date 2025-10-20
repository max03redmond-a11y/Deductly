/*
  # Update Vehicle Expense Categories - Strict CRA Chart A Compliance

  ## Changes Made
  
  This migration updates the vehicle expense categories to strictly match
  CRA requirements for Chart A (Motor Vehicle Expenses).

  ### Vehicle Expenses (apply_business_use = true)
  Only these 7 categories should have apply_business_use = true:
  1. Gas and Oil (GAS_FUEL)
  2. Interest on Car Loan (LOAN_INTEREST)
  3. Vehicle Insurance (INSURANCE_AUTO)
  4. License and Registration (LIC_REG)
  5. Maintenance and Repairs (REPAIRS_MAINT)
  6. Vehicle Lease Payments (LEASE_PAYMENTS)
  7. Electricity for Zero-Emission Vehicles (VEHICLE_ELECTRICITY) - NEW

  ### Operating Expenses (apply_business_use = false)
  All other expenses including:
  - Phone and Data Plan → Line 9225 (Telephone and utilities)
  - Internet Service → Line 9225 (Telephone and utilities)
  - Home Office Expenses → Line 9945 (Workspace-in-home)
  - Capital Cost Allowance → Line 9936 (CCA)
  - Car Washes → Line 9270 (Other expenses)
  - All other categories remain on their assigned lines
*/

-- Add electricity for zero-emission vehicles category if it doesn't exist
INSERT INTO cra_categories (
  code,
  label,
  explanation_short,
  explanation_rules,
  t2125_line,
  default_business_use_target,
  apply_business_use,
  itc_eligible
) VALUES (
  'VEHICLE_ELECTRICITY',
  'Electricity (Zero-Emission)',
  'Electricity costs for charging your electric vehicle.',
  'Track electricity costs for charging your zero-emission vehicle. Apply business-use percentage. Keep receipts for public charging stations. For home charging, calculate the portion used for vehicle charging separately.',
  '9281',
  100,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  explanation_short = EXCLUDED.explanation_short,
  explanation_rules = EXCLUDED.explanation_rules,
  t2125_line = EXCLUDED.t2125_line,
  apply_business_use = EXCLUDED.apply_business_use,
  itc_eligible = EXCLUDED.itc_eligible;

-- Update Phone and Data Plan to be an operating expense
UPDATE cra_categories
SET 
  apply_business_use = false,
  explanation_rules = 'Track your monthly phone and data plan costs. Deduct the business portion based on business usage. Keep billing statements showing plan details and costs.'
WHERE code = 'PHONE_PLAN_DATA';

-- Update Internet Service to be an operating expense
UPDATE cra_categories
SET 
  apply_business_use = false,
  explanation_rules = 'Track your monthly internet service costs. Deduct the business portion based on business usage. Keep billing statements and usage records.'
WHERE code = 'INTERNET_BUSINESS';

-- Update Home Office to be an operating expense
UPDATE cra_categories
SET 
  apply_business_use = true,
  explanation_rules = 'Track expenses for the workspace in your home including utilities, rent, insurance, and property taxes. Calculate the business-use percentage based on workspace area and time used for business. Must meet CRA workspace-in-home requirements.'
WHERE code = 'HOME_OFFICE';

-- Update CCA to keep apply_business_use but note it's special
UPDATE cra_categories
SET 
  apply_business_use = true,
  explanation_rules = 'Capital Cost Allowance for your vehicle. The depreciation amount is calculated based on CRA Class 10 or 10.1 rates and your business-use percentage. This is auto-calculated based on your vehicle details and mileage.'
WHERE code = 'VEHICLE_DEPRECIATION_CCA';

-- Ensure ONLY these 7 categories have apply_business_use = true for vehicle expenses
-- GAS_FUEL, LOAN_INTEREST, INSURANCE_AUTO, LIC_REG, REPAIRS_MAINT, LEASE_PAYMENTS, VEHICLE_ELECTRICITY
UPDATE cra_categories
SET apply_business_use = true
WHERE code IN (
  'GAS_FUEL',
  'LOAN_INTEREST', 
  'INSURANCE_AUTO',
  'LIC_REG',
  'REPAIRS_MAINT',
  'LEASE_PAYMENTS',
  'VEHICLE_ELECTRICITY'
);

-- Ensure all other categories have apply_business_use = false
-- EXCEPT HOME_OFFICE and VEHICLE_DEPRECIATION_CCA which have special handling
UPDATE cra_categories
SET apply_business_use = false
WHERE code NOT IN (
  'GAS_FUEL',
  'LOAN_INTEREST',
  'INSURANCE_AUTO',
  'LIC_REG',
  'REPAIRS_MAINT',
  'LEASE_PAYMENTS',
  'VEHICLE_ELECTRICITY',
  'HOME_OFFICE',
  'VEHICLE_DEPRECIATION_CCA'
);