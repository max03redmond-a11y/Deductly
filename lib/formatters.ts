/**
 * Format category codes into user-friendly labels
 * Converts codes like "REPAIRS_MAINT", "8871_MANAGEMENT", etc. into readable labels
 */
export function formatCategoryLabel(categoryCode: string | null | undefined): string {
  if (!categoryCode) return 'Other';

  // Mapping of specific category codes to user-friendly labels
  const categoryMap: Record<string, string> = {
    // Vehicle expenses
    'GAS_FUEL': 'Gas & Fuel',
    'REPAIRS_MAINT': 'Repairs & Maintenance',
    'INSURANCE_AUTO': 'Vehicle Insurance',
    'LIC_REG': 'License & Registration',
    'CAR_WASH': 'Car Washes',
    'PARKING_TOLLS': 'Parking & Tolls',
    'LEASE_PAYMENTS': 'Lease Payments',
    'VEHICLE_ELECTRICITY': 'Vehicle Electricity',
    'VEHICLE_DEPRECIATION_CCA': 'Vehicle CCA',

    // Operating expenses with codes
    '8521_ADVERTISING': 'Advertising',
    '8523_MEALS': 'Meals & Entertainment',
    '8590_BAD_DEBTS': 'Bad Debts',
    '8690_INSURANCE': 'Insurance',
    '8710_INTEREST': 'Interest & Bank Charges',
    '8760_LICENCES': 'Business Taxes & Licences',
    '8810_OFFICE': 'Office Expenses',
    '8811_STATIONERY': 'Office Stationery & Supplies',
    '8860_PROFESSIONAL': 'Professional Fees',
    '8871_MANAGEMENT': 'Management Fees',
    '8910_RENT': 'Rent',
    '8960_REPAIRS': 'Repairs & Maintenance',
    '9060_SALARIES': 'Salaries & Wages',
    '9180_PROPERTY_TAX': 'Property Taxes',
    '9200_TRAVEL': 'Travel Expenses',
    '9220_UTILITIES': 'Utilities',
    '9224_FUEL': 'Fuel Costs',
    '9225_TELEPHONE': 'Phone & Internet',
    '9275_DELIVERY': 'Delivery & Freight',
    '9281_OTHER': 'Other Motor Vehicle',
    '9270_OTHER': 'Other Expenses',
    '9936_CCA': 'Capital Cost Allowance',

    // Legacy category codes
    'ADVERTISING_PROMOS': 'Advertising & Promotions',
    'MEALS_CLIENT': 'Meals & Entertainment',
    'BANK_FEES_INTEREST': 'Bank Fees & Interest',
    'LOAN_INTEREST': 'Loan Interest',
    'SUPPLIES': 'Supplies',
    'CLEANING_SUPPLIES': 'Cleaning Supplies',
    'ACCOUNTING_SOFTWARE': 'Accounting Software',
    'UBER_FEES': 'Platform Fees',
    'PHONE_PLAN_DATA': 'Phone & Data Plan',
    'INTERNET_BUSINESS': 'Internet Service',
    'TRAINING_EDU': 'Training & Education',

    // Simple category names (lowercase)
    'fuel': 'Gas & Oil',
    'maintenance': 'Maintenance & Repairs',
    'insurance': 'Insurance',
    'license': 'License & Registration',
    'carwash': 'Car Washes',
    'lease': 'Lease Payments',
    'cca': 'Capital Cost Allowance',
    'advertising': 'Advertising',
    'meals': 'Meals & Entertainment',
    'office': 'Office Expenses',
    'supplies': 'Supplies',
    'professional': 'Professional Fees',
    'rent': 'Rent',
    'utilities': 'Utilities',
    'phone': 'Phone & Internet',
    'internet': 'Internet Service',
    'travel': 'Travel',
    'parking': 'Parking',
    'other': 'Other',
  };

  // Check if we have a direct mapping
  if (categoryMap[categoryCode]) {
    return categoryMap[categoryCode];
  }

  // Try to format the code automatically
  // Remove numeric prefixes like "8521_", "9936_"
  let formatted = categoryCode.replace(/^\d+_/, '');

  // Replace underscores with spaces
  formatted = formatted.replace(/_/g, ' ');

  // Convert to title case
  formatted = formatted
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Special replacements for common abbreviations
  formatted = formatted
    .replace(/\bCca\b/g, 'CCA')
    .replace(/\bGst\b/g, 'GST')
    .replace(/\bHst\b/g, 'HST')
    .replace(/\bItc\b/g, 'ITC')
    .replace(/\bReg\b/g, 'Registration')
    .replace(/\bLic\b/g, 'License')
    .replace(/\bMaint\b/g, 'Maintenance')
    .replace(/\bAuto\b/g, 'Vehicle')
    .replace(/\bMgmt\b/g, 'Management')
    .replace(/\bProf\b/g, 'Professional')
    .replace(/\bAdv\b/g, 'Advertising');

  return formatted;
}
