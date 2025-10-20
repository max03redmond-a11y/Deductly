export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  business_name: string | null;
  province: string;
  business_type: string;
  gst_hst_registered: boolean;
  gst_hst_number: string | null;
  fiscal_year_end: string;
  vehicle_ownership_type: string | null;
  legal_name: string | null;
  sin_encrypted: string | null;
  mailing_address_line1: string | null;
  mailing_address_line2: string | null;
  mailing_city: string | null;
  mailing_postal_code: string | null;
  business_name: string | null;
  business_number: string | null;
  business_address_line1: string | null;
  business_address_line2: string | null;
  business_city: string | null;
  business_province: string | null;
  business_postal_code: string | null;
  main_product_service: string | null;
  industry_code: string | null;
  naics_code: string | null;
  last_year_of_business: boolean;
  accounting_method: 'cash' | 'accrual' | null;
  fiscal_year_start: string | null;
  fiscal_year_end_date: string | null;
  tax_shelter_id: string | null;
  partnership_business_number: string | null;
  partnership_percentage: number | null;
  gst_hst_method: 'regular' | 'quick' | null;
  internet_business_urls: string[] | null;
  internet_income_percentage: number | null;
  profile_completed: boolean;
  profile_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  date: string;
  merchant_name: string;
  amount: number;
  tax_amount: number | null;
  category: string;
  subcategory: string | null;
  description: string | null;
  is_business: boolean;
  business_percentage: number;
  receipt_url: string | null;
  is_recurring: boolean;
  imported_from: string | null;
  category_code: string | null;
  category_label: string | null;
  vendor: string | null;
  amount_before_tax: number | null;
  tax_paid_hst: number;
  total_amount: number | null;
  deductible_amount: number | null;
  itc_eligible: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MileageLog = {
  id: string;
  user_id: string;
  date: string;
  start_odometer: number | null;
  end_odometer: number | null;
  distance_km: number;
  business_km: number;
  purpose: string | null;
  is_business: boolean;
  created_at: string;
  updated_at: string;
};

export type MileageSettings = {
  id: string;
  user_id: string;
  year: number;
  jan1_odometer_km: number;
  current_odometer_km: number;
  manual_total_km_ytd: number | null;
  created_at: string;
  updated_at: string;
};

export type MileageYear = {
  id: string;
  user_id: string;
  tax_year: number;
  start_odo_km: number;
  end_odo_km: number;
  total_km_ytd: number;
  business_km_ytd: number;
  business_use_pct: number;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
};

export type IncomeRecord = {
  id: string;
  user_id: string;
  date: string;
  source: string;
  amount: number;
  trips_completed: number | null;
  description: string | null;
  imported_from: string | null;
  created_at: string;
  updated_at: string;
};

export type IncomeEntry = {
  id: string;
  user_id: string;
  date: string;
  platform: string;
  gross_income: number;
  tips: number;
  bonuses: number;
  other_income: number;
  platform_fees: number;
  net_payout: number;
  trips_completed: number | null;
  source_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CRACategory = {
  id: string;
  code: string;
  label: string;
  t2125_line: string | null;
  itc_eligible: boolean;
  explanation_short: string;
  explanation_rules: string | null;
  default_business_use_target: number;
  apply_business_use: boolean;
  created_at: string;
  updated_at: string;
};

export type YearTotal = {
  id: string;
  user_id: string;
  tax_year: number;
  total_km: number;
  business_km: number;
  business_use_pct: number;
  gst_collected: number;
  gst_itcs: number;
  gst_net_owed: number;
  created_at: string;
  updated_at: string;
};

export type Referral = {
  id: string;
  title: string;
  description: string;
  reward_text: string | null;
  logo_url: string;
  link_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Asset = {
  id: string;
  user_id: string;
  asset_name: string;
  asset_class: '10' | '10.1' | '54';
  cost_before_tax: number;
  purchase_date: string;
  business_use_pct: number;
  ucc_opening: number;
  cca_rate: number;
  cca_current: number;
  ucc_closing: number;
  is_luxury_vehicle: boolean;
  is_zero_emission: boolean;
  first_year_100pct_elected: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditTrail = {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  diff_json: any;
  timestamp: string;
};

export type VehicleInfo = {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  purchase_price: number | null;
  purchase_date: string | null;
  ownership_type: string;
  lease_start_date: string | null;
  lease_end_date: string | null;
  lease_monthly_payment: number | null;
  loan_interest_annual: number | null;
  created_at: string;
  updated_at: string;
};

export type ReferralPartner = {
  id: string;
  name: string;
  category: string;
  description: string;
  logo_url: string | null;
  offer_text: string;
  referral_url: string;
  commission_amount: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type UserReferral = {
  id: string;
  user_id: string;
  partner_id: string | null;
  referral_code: string | null;
  referred_user_id: string | null;
  referral_type: string;
  status: string;
  commission_earned: number;
  clicked_at: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
};

export const CANADIAN_PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
];

export const BUSINESS_TYPES = [
  { value: 'rideshare', label: 'Rideshare Driver (Uber/Lyft)' },
  { value: 'delivery', label: 'Delivery Driver (DoorDash/Skip)' },
  { value: 'courier', label: 'Courier Service' },
  { value: 'freelance', label: 'Freelance/Contractor' },
  { value: 'other', label: 'Other Self-Employed' },
];

export const CRA_CATEGORY_CODES = {
  GAS_FUEL: 'GAS_FUEL',
  REPAIRS_MAINT: 'REPAIRS_MAINT',
  INSURANCE_AUTO: 'INSURANCE_AUTO',
  LIC_REG: 'LIC_REG',
  CAR_WASH: 'CAR_WASH',
  PARKING_TOLLS: 'PARKING_TOLLS',
  LEASE_PAYMENTS: 'LEASE_PAYMENTS',
  LOAN_INTEREST: 'LOAN_INTEREST',
  VEHICLE_DEPRECIATION_CCA: 'VEHICLE_DEPRECIATION_CCA',
  UBER_FEES: 'UBER_FEES',
  PHONE_PLAN_DATA: 'PHONE_PLAN_DATA',
  SUPPLIES: 'SUPPLIES',
  BANK_FEES_INTEREST: 'BANK_FEES_INTEREST',
  ACCOUNTING_SOFTWARE: 'ACCOUNTING_SOFTWARE',
  ADVERTISING_PROMOS: 'ADVERTISING_PROMOS',
  MEALS_CLIENT: 'MEALS_CLIENT',
  TRAINING_EDU: 'TRAINING_EDU',
  CLEANING_SUPPLIES: 'CLEANING_SUPPLIES',
  INTERNET_BUSINESS: 'INTERNET_BUSINESS',
  HOME_OFFICE: 'HOME_OFFICE',
  CRA_INSTALLMENTS: 'CRA_INSTALLMENTS',
  GST_HST_COLLECTED: 'GST_HST_COLLECTED',
  GST_HST_PAID_ITC: 'GST_HST_PAID_ITC',
} as const;

export const EXPENSE_CATEGORIES = [
  {
    value: 'fuel',
    label: 'Gas and Oil',
    icon: 'fuel',
    description: 'Fuel and lubricants used to operate a motor vehicle for business purposes. Only the business-use percentage of these costs is deductible.',
    craReference: 'T2125 – line 9281, Motor vehicle expenses'
  },
  {
    value: 'maintenance',
    label: 'Maintenance and Repairs',
    icon: 'wrench',
    description: 'Reasonable costs to maintain or repair a vehicle or equipment used to earn business income (e.g., oil changes, tires, brake service). Personal-use portion must be excluded.',
    craReference: 'T2125 – line 9281'
  },
  {
    value: 'insurance',
    label: 'Insurance',
    icon: 'shield',
    description: 'Premiums paid for insurance on a business vehicle or equipment. You may claim only the part that relates to business use.',
    craReference: 'T2125 – line 9281'
  },
  {
    value: 'license',
    label: 'License and Registration',
    icon: 'file-text',
    description: 'Annual fees to register or license a motor vehicle used in business operations. Deduct only the business portion.',
    craReference: 'T2125 – line 9281'
  },
  {
    value: 'carwash',
    label: 'Car Washes',
    icon: 'droplet',
    description: 'Vehicle-cleaning costs incurred to maintain a vehicle used to earn business income (e.g., rideshare or delivery). Business portion only.',
    craReference: 'T2125 – line 9281, Motor vehicle expenses'
  },
  {
    value: 'lease',
    label: 'Lease Payments',
    icon: 'calendar',
    description: 'Lease charges for a vehicle used in business are deductible up to CRA\'s monthly cap (currently ≈ $900 + tax per month, 2025). Claim only the business-use %.',
    craReference: 'T2125 – line 9281 and IT521R'
  },
  {
    value: 'cca',
    label: 'Capital Cost Allowance (CCA)',
    icon: 'percent',
    description: 'Depreciation expense on a business vehicle you own. Claim each year using the prescribed CCA Class 10 or 10.1 rate (30%) and business-use %.',
    craReference: 'T2125 – Area A of CCA schedule'
  },
  {
    value: 'loan_interest',
    label: 'Interest on Car Loan',
    icon: 'percent',
    description: 'Interest paid on money borrowed to buy a business vehicle. Deduct the business-use % of the yearly interest portion (not the principal).',
    craReference: 'T2125 – line 8710, Interest and bank charges'
  },
  {
    value: 'phone',
    label: 'Phone and Data',
    icon: 'smartphone',
    description: 'Mobile phone and data plan for business use'
  },
  {
    value: 'parking',
    label: 'Parking',
    icon: 'square',
    description: 'Parking fees, tolls, and related charges'
  },
  {
    value: 'meals',
    label: 'Meals',
    icon: 'utensils',
    description: 'Meals while on business trips (50% deductible)'
  },
  {
    value: 'other',
    label: 'Other',
    icon: 'more-horizontal',
    description: 'Other business-related vehicle expenses'
  },
];

export const REFERRAL_CATEGORIES = [
  { value: 'tax_filing', label: 'Tax Filing & Accounting' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'investment', label: 'Investments' },
  { value: 'banking', label: 'Banking & Credit' },
  { value: 'business', label: 'Business Services' },
  { value: 'perks', label: 'Perks & Discounts' },
];
