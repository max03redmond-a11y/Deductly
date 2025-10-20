/*
  # Update Operating Expense Categories for Uber Drivers

  1. Changes
    - Remove unused operating expense categories
    - Update category descriptions to match CRA T2125 guidance
    - Keep only relevant operating expenses for rideshare drivers
    - Vehicle expenses remain unchanged (they use business-use %)

  2. Operating Expenses Included
    - 8521: Advertising
    - 8523: Meals and entertainment (50% limit)
    - 8690: Insurance
    - 8710: Interest and bank charges
    - 8760: Business taxes, licences and memberships
    - 8810: Office expenses
    - 8811: Office stationery and supplies
    - 8860: Professional fees
    - 8871: Management and administration fees
    - 8910: Rent
    - 8960: Repairs and maintenance
    - 9180: Property taxes
    - 9220: Utilities (phone/internet)
    - 9275: Delivery, freight and express
    - 9281: Other expenses (catch-all)
*/

-- Delete old operating expense categories (keep vehicle expenses)
DELETE FROM cra_categories
WHERE code IN (
  'UBER_FEES',
  'PHONE_PLAN_DATA',
  'SUPPLIES',
  'BANK_FEES_INTEREST',
  'ACCOUNTING_SOFTWARE',
  'ADVERTISING_PROMOS',
  'MEALS_CLIENT',
  'TRAINING_EDU',
  'CLEANING_SUPPLIES',
  'INTERNET_BUSINESS',
  'HOME_OFFICE'
);

-- Insert updated operating expense categories
INSERT INTO cra_categories (code, label, t2125_line, itc_eligible, explanation_short, explanation_rules, default_business_use_target, apply_business_use)
VALUES
  -- 8521: Advertising
  ('8521_ADVERTISING', 'Advertising', '8521', true,
   'Expenses to promote your driving services',
   'Expenses to promote your driving services — for example, printing business cards, creating a personal website, or paying for social media ads to attract clients for private driving or delivery. Most Uber drivers don''t need this since Uber provides the marketing, but it can apply if you promote your own side work.',
   100, false),

  -- 8523: Meals and entertainment (50% deductible)
  ('8523_MEALS', 'Meals and Entertainment', '8523', true,
   'Business meals (50% deductible)',
   'You can only claim 50% of the cost of meals or beverages related to your business. This applies only if you have business meetings (for example, discussing your car lease, partnership, or tax planning) — not for food or drinks while driving.',
   50, false),

  -- 8690: Insurance (non-vehicle)
  ('8690_INSURANCE', 'Insurance', '8690', false,
   'Business insurance (non-vehicle)',
   'You can deduct the business portion of your auto insurance premiums if you have rideshare or commercial coverage. If your insurance combines personal and business use, only the percentage used for Uber trips is deductible. Keep copies of your policy and payment receipts.',
   100, true),

  -- 8710: Interest and bank charges
  ('8710_INTEREST', 'Interest and Bank Charges', '8710', false,
   'Interest on car loan, credit card, or bank fees',
   'You can deduct interest paid on: (1) A car loan or lease financing used for your Uber vehicle, (2) A credit card used for business purchases. Also includes bank fees for your business account. Only claim the business-use portion based on your mileage log.',
   100, true),

  -- 8760: Business taxes, licences and memberships
  ('8760_LICENCES', 'Business Taxes, Licences and Memberships', '8760', true,
   'Required fees to operate',
   'Covers fees required to operate, such as: (1) Vehicle registration, (2) Rideshare business licence (from your city), (3) Airport permit fees, (4) Taxi or transportation network membership fees. These are all fully deductible.',
   100, false),

  -- 8810: Office expenses
  ('8810_OFFICE', 'Office Expenses', '8810', true,
   'Small office supplies (not major electronics)',
   'Covers small office supplies used to manage your business — like pens, folders, printer paper, or ink for receipts. Do not include major electronics like laptops or phones here (those go under Capital Cost Allowance if purchased for business).',
   100, false),

  -- 8811: Office stationery and supplies
  ('8811_STATIONERY', 'Office Stationery and Supplies', '8811', true,
   'Logbooks, notebooks, recordkeeping items',
   'Small stationery and recordkeeping items such as logbooks, notebooks, envelopes, paper, or mileage tracking books. Useful for staying organized and maintaining accurate expense records.',
   100, false),

  -- 8860: Professional fees
  ('8860_PROFESSIONAL', 'Professional Fees', '8860', true,
   'Tax filing, accounting, legal services',
   'Includes: (1) Tax filing or bookkeeping services, (2) Accounting software subscriptions (e.g., QuickBooks, Deductly, Wave), (3) CRA consultation fees or professional tax advice. These are fully deductible and often overlooked by new drivers.',
   100, false),

  -- 8871: Management and administration fees
  ('8871_MANAGEMENT', 'Management and Administration Fees', '8871', false,
   'Fees for business management (not Uber fees)',
   'This applies only if you pay someone else to manage or administer your business, such as a dispatcher or fleet manager. Uber''s service fees are not entered here — they''re subtracted from your gross income before reporting.',
   100, false),

  -- 8910: Rent
  ('8910_RENT', 'Rent', '8910', true,
   'Garage, storage, or parking space rental',
   'You can only claim rent if you rent space specifically for business, such as a garage, storage unit, or parking space used to store your vehicle or equipment. Rent for your personal home or apartment doesn''t qualify unless you claim a home office used mainly for managing your Uber operations.',
   100, true),

  -- 8960: Repairs and maintenance (non-vehicle)
  ('8960_REPAIRS', 'Repairs and Maintenance', '8960', true,
   'Non-vehicle repairs and maintenance',
   'A major deductible category. Includes: (1) Oil changes, (2) Brake work, (3) Tire replacements, (4) Car washes & detailing, (5) Windshield wipers or fluids. Only the business-use % of these costs can be claimed.',
   100, true),

  -- 9180: Property taxes
  ('9180_PROPERTY_TAX', 'Property Taxes', '9180', false,
   'Home office property tax portion',
   'Usually not applicable unless you claim a home office where you manage your business (e.g., tracking mileage, storing receipts). If so, you can claim a portion of home property taxes equal to the space used for business.',
   100, true),

  -- 9220: Utilities (phone and internet)
  ('9220_UTILITIES', 'Utilities', '9220', true,
   'Phone and internet bills',
   'Mostly applies to phone and internet bills. You can deduct the business-use portion of your cell phone plan, since you use your phone to accept rides, navigate, and communicate with passengers.',
   100, true),

  -- 9275: Delivery, freight and express
  ('9275_DELIVERY', 'Delivery, Freight and Express', '9275', true,
   'Courier costs (Uber Eats/delivery only)',
   'Applicable for Uber Eats or package delivery. Includes courier, postage, or delivery service costs you pay to transport items or documents for your business. For rideshare-only drivers, this is rarely used.',
   100, false),

  -- 9281: Other expenses (catch-all)
  ('9281_OTHER', 'Other Expenses', '9270', true,
   'Costs not listed elsewhere',
   'A "catch-all" for costs not listed elsewhere, including: (1) Uber service fees or commissions, (2) Parking and tolls, (3) Car washes (if not claimed in 8960), (4) Phone mounts, chargers, cables, (5) Subscription to mileage apps, (6) Bottled water or small amenities for passengers. Always keep receipts and list each expense type clearly.',
   100, false)

ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  t2125_line = EXCLUDED.t2125_line,
  itc_eligible = EXCLUDED.itc_eligible,
  explanation_short = EXCLUDED.explanation_short,
  explanation_rules = EXCLUDED.explanation_rules,
  default_business_use_target = EXCLUDED.default_business_use_target,
  apply_business_use = EXCLUDED.apply_business_use,
  updated_at = now();
