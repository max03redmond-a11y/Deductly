import { Expense, IncomeRecord, MileageLog, Asset, Profile } from '@/types/database';
import { calculateDeductibleTotal, calculateMileageTotals, getYTDFilter } from '@/lib/calcs/summary';
import { calculateCCADeduction } from '@/lib/calcs/tax';

export interface ExpenseDetail {
  id: string;
  date: string;
  merchant: string;
  description: string;
  amount: number;
  businessPercentage: number;
  deductibleAmount: number;
  categoryCode: string;
  categoryLabel: string;
  lineNumber: string;
}

export interface T2125Data {
  identification: {
    yourName: string;
    sin: string;
    businessName: string;
    businessNumber: string;
    businessAddress: string;
    city: string;
    province: string;
    postalCode: string;
    fiscalPeriodStart: string;
    fiscalPeriodEnd: string;
    mainProductService: string;
    industryCode: string;
    accountingMethod: string;
    lastYearOfBusiness: boolean;
  };
  part2_internet: {
    numWebsites: number;
    website1: string;
    website2: string;
    website3: string;
    website4: string;
    website5: string;
    incomeFromWebPercent: number;
  };
  part3a_businessIncome: {
    line3A_grossSales: number;
    line3B_gstHstCollected: number;
    line3C_subtotal: number;
    line3G_adjustedGrossSales: number;
  };
  part3c_income: {
    line8000_adjustedGrossSales: number;
    line8290_reservesDeductedLastYear: number;
    line8230_otherIncome: number;
    line8299_grossBusinessIncome: number;
  };
  part4_expenses: {
    line8521_advertising: number;
    line8523_mealsEntertainment: number;
    line8590_badDebts: number;
    line8690_insurance: number;
    line8710_interestBankCharges: number;
    line8760_businessTaxesLicences: number;
    line8810_officeExpenses: number;
    line8811_officeStationery: number;
    line8860_professionalFees: number;
    line8871_managementFees: number;
    line8910_rent: number;
    line8960_repairsMaintenance: number;
    line9060_salariesWages: number;
    line9180_propertyTaxes: number;
    line9200_travelExpenses: number;
    line9220_utilities: number;
    line9224_fuelCosts: number;
    line9225_telephone: number;
    line9275_deliveryFreight: number;
    line9281_motorVehicleExpenses: number;
    line9936_cca: number;
    line9270_otherExpenses: number;
    line9368_totalExpenses: number;
  };
  chartA_motorVehicle: {
    line1_businessKm: number;
    line2_totalKm: number;
    line3_fuelOil: number;
    line4_interest: number;
    line5_insurance: number;
    line6_licenceRegistration: number;
    line7_maintenance: number;
    line8_leasing: number;
    line9_electricity: number;
    line10_otherExpenses: number;
    line11_subcontractCosts: number;
    line12_totalExpenses: number;
    line13_businessPortion: number;
    line14_businessParkingFees: number;
    line15_supplementaryInsurance: number;
    line16_allowableExpenses: number;
    businessUsePercent: number;
  };
  part5_netIncome: {
    line9369_netIncomeBeforeAdjustments: number;
    line5A_yourShare: number;
    line5B_canadianJournalismCredit: number;
    line9974_gstHstRebate: number;
    line5C_total: number;
    line9943_otherDeductions: number;
    line5D_netIncomeAfterAdjustments: number;
    line9945_businessUseOfHome: number;
    line9946_yourNetIncome: number;
  };
  part7_homeOffice: {
    line7A_heat: number;
    line7B_electricity: number;
    line7C_insurance: number;
    line7D_maintenance: number;
    line7E_mortgageInterest: number;
    line7F_propertyTaxes: number;
    line7G_otherExpenses: number;
    line7H_subtotal: number;
    line7I_personalUsePart: number;
    line7J_businessPart: number;
    line7K_cca: number;
    line7L_carriedForward: number;
    line7M_totalAvailable: number;
    line7N_netIncomeLimit: number;
    line7O_carryForwardNext: number;
    line7P_allowableClaim: number;
  };
  expenseDetails: ExpenseDetail[];
}

export function mapExpenseToT2125Line(categoryCode: string): keyof T2125Data['part4_expenses'] | null {
  const mapping: Record<string, keyof T2125Data['part4_expenses']> = {
    'ADVERTISING_PROMOS': 'line8521_advertising',
    '8521': 'line8521_advertising',
    'MEALS_CLIENT': 'line8523_mealsEntertainment',
    '8523': 'line8523_mealsEntertainment',
    '8590': 'line8590_badDebts',
    '8690': 'line8690_insurance',
    'BANK_FEES_INTEREST': 'line8710_interestBankCharges',
    'LOAN_INTEREST': 'line8710_interestBankCharges',
    '8710': 'line8710_interestBankCharges',
    '8760': 'line8760_businessTaxesLicences',
    '8810': 'line8810_officeExpenses',
    'SUPPLIES': 'line8811_officeStationery',
    'CLEANING_SUPPLIES': 'line8811_officeStationery',
    '8811': 'line8811_officeStationery',
    'ACCOUNTING_SOFTWARE': 'line8860_professionalFees',
    '8860': 'line8860_professionalFees',
    'UBER_FEES': 'line8871_managementFees',
    '8871': 'line8871_managementFees',
    '8910': 'line8910_rent',
    '8960': 'line8960_repairsMaintenance',
    '9060': 'line9060_salariesWages',
    '9180': 'line9180_propertyTaxes',
    '9200': 'line9200_travelExpenses',
    'PHONE_PLAN_DATA': 'line9225_telephone',
    'INTERNET_BUSINESS': 'line9225_telephone',
    '9225': 'line9225_telephone',
    '9220': 'line9220_utilities',
    '9224': 'line9224_fuelCosts',
    'TRAINING_EDU': 'line9270_otherExpenses',
    '9270': 'line9270_otherExpenses',
    '9275': 'line9275_deliveryFreight',
    'GAS_FUEL': 'line9281_motorVehicleExpenses',
    'REPAIRS_MAINT': 'line9281_motorVehicleExpenses',
    'INSURANCE_AUTO': 'line9281_motorVehicleExpenses',
    'LIC_REG': 'line9281_motorVehicleExpenses',
    'CAR_WASH': 'line9281_motorVehicleExpenses',
    'PARKING_TOLLS': 'line9281_motorVehicleExpenses',
    'LEASE_PAYMENTS': 'line9281_motorVehicleExpenses',
    '9281': 'line9281_motorVehicleExpenses',
    'VEHICLE_DEPRECIATION_CCA': 'line9936_cca',
    '9936': 'line9936_cca',
  };

  return mapping[categoryCode] || null;
}

export function generateT2125Data(
  profile: Profile | null,
  expenses: Expense[],
  income: IncomeRecord[],
  mileage: MileageLog[],
  assets: Asset[]
): T2125Data {
  const filter = getYTDFilter();
  const currentYear = new Date().getFullYear();

  // Calculate income totals
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const gstHstCollected = 0; // GST/HST not tracked in current income_records schema
  const tipsAndBonuses = 0; // Tips/bonuses not tracked in current income_records schema

  const expensesByLine: Partial<Record<keyof T2125Data['part4_expenses'], number>> = {};

  expenses.forEach((expense) => {
    const lineKey = mapExpenseToT2125Line(expense.category_code || expense.category);
    if (lineKey && lineKey !== 'line9936_cca' && lineKey !== 'line9281_motorVehicleExpenses') {
      const deductible = expense.deductible_amount || (expense.amount * (expense.business_percentage / 100));
      expensesByLine[lineKey] = (expensesByLine[lineKey] || 0) + deductible;
    }
  });

  // Apply 50% meal rule
  const mealsTotal = expensesByLine.line8523_mealsEntertainment || 0;
  expensesByLine.line8523_mealsEntertainment = mealsTotal * 0.5;

  const mileageTotals = calculateMileageTotals(mileage, filter);
  const businessUsePercent = mileageTotals.total > 0
    ? (mileageTotals.business / mileageTotals.total) * 100
    : 0;

  const vehicleFuel = expenses
    .filter((e) => e.category_code === 'GAS_FUEL')
    .reduce((sum, e) => sum + (e.deductible_amount || (e.amount * (e.business_percentage / 100))), 0);

  const vehicleInsurance = expenses
    .filter((e) => e.category_code === 'INSURANCE_AUTO')
    .reduce((sum, e) => sum + (e.deductible_amount || (e.amount * (e.business_percentage / 100))), 0);

  const vehicleMaintenance = expenses
    .filter((e) => ['REPAIRS_MAINT', 'CAR_WASH'].includes(e.category_code || ''))
    .reduce((sum, e) => sum + (e.deductible_amount || (e.amount * (e.business_percentage / 100))), 0);

  const vehicleLicence = expenses
    .filter((e) => e.category_code === 'LIC_REG')
    .reduce((sum, e) => sum + (e.deductible_amount || (e.amount * (e.business_percentage / 100))), 0);

  const vehicleParking = expenses
    .filter((e) => e.category_code === 'PARKING_TOLLS')
    .reduce((sum, e) => sum + (e.deductible_amount || (e.amount * (e.business_percentage / 100))), 0);

  const vehicleLease = expenses
    .filter((e) => e.category_code === 'LEASE_PAYMENTS')
    .reduce((sum, e) => sum + (e.deductible_amount || (e.amount * (e.business_percentage / 100))), 0);

  const totalVehicleExpenses = vehicleFuel + vehicleInsurance + vehicleMaintenance + vehicleLicence + vehicleParking + vehicleLease;

  const ccaDeduction = calculateCCADeduction(assets, filter);
  expensesByLine.line9936_cca = ccaDeduction;

  // Calculate Chart A motor vehicle totals
  const vehicleOtherExpenses = expenses
    .filter((e) => e.category === 'Other' && e.notes?.toLowerCase().includes('vehicle'))
    .reduce((sum, e) => sum + (e.deductible_amount || (e.amount * (e.business_percentage / 100))), 0);

  const chartA_line12 = vehicleFuel + vehicleInsurance + vehicleLicence + vehicleMaintenance + vehicleLease + vehicleOtherExpenses;
  const chartA_line13 = chartA_line12 * (businessUsePercent / 100);
  const chartA_line16 = chartA_line13 + vehicleParking;

  // Calculate total expenses INCLUDING motor vehicle expenses
  const nonVehicleExpenses = Object.values(expensesByLine).reduce((sum, val) => sum + (val || 0), 0);
  const totalExpenses = nonVehicleExpenses + chartA_line16;

  const netIncomeBeforeAdjustments = totalIncome - totalExpenses;

  const expenseDetails: ExpenseDetail[] = expenses
    .filter((e) => e.category_code !== 'VEHICLE_DEPRECIATION_CCA')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((expense) => {
      const categoryCode = expense.category_code || expense.category;
      const lineKey = mapExpenseToT2125Line(categoryCode);
      const lineNumber = expense.category_code?.match(/^\d{4}$/)
        ? expense.category_code
        : lineKey?.replace('line', '').replace(/_.*/, '') || 'N/A';

      return {
        id: expense.id,
        date: expense.date,
        merchant: expense.merchant_name || expense.vendor || 'Unknown',
        description: expense.description || expense.notes || '',
        amount: expense.amount,
        businessPercentage: expense.business_percentage,
        deductibleAmount: expense.deductible_amount || (expense.amount * expense.business_percentage / 100),
        categoryCode: categoryCode,
        categoryLabel: expense.category_label || expense.category || 'Other',
        lineNumber: lineNumber,
      };
    });

  const businessTypes: Record<string, string> = {
    rideshare: 'Rideshare Driver (Uber/Lyft)',
    delivery: 'Delivery Driver (DoorDash/Skip)',
    courier: 'Courier Service',
    freelance: 'Freelance/Contractor',
    other: 'Self-Employed',
  };

  const mainService = businessTypes[profile?.business_type || ''] || 'Rideshare Driver';

  const formatAddress = () => {
    if (!profile?.mailing_address_line1) return '—';
    const parts = [profile.mailing_address_line1];
    if (profile.mailing_address_line2) parts.push(profile.mailing_address_line2);
    return parts.join(', ');
  };

  // Part 7 - Home Office (if applicable)
  // Home office expenses should be calculated separately
  // For now, we set it to 0 as it's not tracked in the current schema
  const homeOfficeExpenses = 0;

  return {
    identification: {
      yourName: profile?.legal_name || profile?.full_name || '—',
      sin: '—',
      businessName: profile?.business_name || '—',
      businessNumber: profile?.business_number || '—',
      businessAddress: formatAddress(),
      city: profile?.mailing_city || '—',
      province: profile?.province || 'ON',
      postalCode: profile?.mailing_postal_code || '—',
      fiscalPeriodStart: profile?.fiscal_year_start || `${currentYear}-01-01`,
      fiscalPeriodEnd: profile?.fiscal_year_end_date || `${currentYear}-12-31`,
      mainProductService: mainService,
      industryCode: profile?.naics_code || '485310',
      accountingMethod: 'Cash',
      lastYearOfBusiness: false,
    },
    part2_internet: {
      // Only applicable for businesses with their own websites/online sales
      // Not for platform-based gig workers (Uber, DoorDash, etc.)
      numWebsites: 0,
      website1: '',
      website2: '',
      website3: '',
      website4: '',
      website5: '',
      incomeFromWebPercent: 0,
    },
    part3a_businessIncome: {
      line3A_grossSales: totalIncome + gstHstCollected,
      line3B_gstHstCollected: gstHstCollected,
      line3C_subtotal: totalIncome,
      line3G_adjustedGrossSales: totalIncome,
    },
    part3c_income: {
      line8000_adjustedGrossSales: totalIncome,
      line8290_reservesDeductedLastYear: 0,
      line8230_otherIncome: tipsAndBonuses,
      line8299_grossBusinessIncome: totalIncome + tipsAndBonuses,
    },
    part4_expenses: {
      line8521_advertising: expensesByLine.line8521_advertising || 0,
      line8523_mealsEntertainment: expensesByLine.line8523_mealsEntertainment || 0,
      line8590_badDebts: expensesByLine.line8590_badDebts || 0,
      line8690_insurance: expensesByLine.line8690_insurance || 0,
      line8710_interestBankCharges: expensesByLine.line8710_interestBankCharges || 0,
      line8760_businessTaxesLicences: expensesByLine.line8760_businessTaxesLicences || 0,
      line8810_officeExpenses: expensesByLine.line8810_officeExpenses || 0,
      line8811_officeStationery: expensesByLine.line8811_officeStationery || 0,
      line8860_professionalFees: expensesByLine.line8860_professionalFees || 0,
      line8871_managementFees: expensesByLine.line8871_managementFees || 0,
      line8910_rent: expensesByLine.line8910_rent || 0,
      line8960_repairsMaintenance: expensesByLine.line8960_repairsMaintenance || 0,
      line9060_salariesWages: expensesByLine.line9060_salariesWages || 0,
      line9180_propertyTaxes: expensesByLine.line9180_propertyTaxes || 0,
      line9200_travelExpenses: expensesByLine.line9200_travelExpenses || 0,
      line9220_utilities: expensesByLine.line9220_utilities || 0,
      line9224_fuelCosts: expensesByLine.line9224_fuelCosts || 0,
      line9225_telephone: expensesByLine.line9225_telephone || 0,
      line9275_deliveryFreight: expensesByLine.line9275_deliveryFreight || 0,
      line9281_motorVehicleExpenses: chartA_line16,
      line9936_cca: expensesByLine.line9936_cca || 0,
      line9270_otherExpenses: expensesByLine.line9270_otherExpenses || 0,
      line9368_totalExpenses: totalExpenses,
    },
    chartA_motorVehicle: {
      line1_businessKm: mileageTotals.business,
      line2_totalKm: mileageTotals.total,
      line3_fuelOil: vehicleFuel,
      line4_interest: 0,
      line5_insurance: vehicleInsurance,
      line6_licenceRegistration: vehicleLicence,
      line7_maintenance: vehicleMaintenance,
      line8_leasing: vehicleLease,
      line9_electricity: 0,
      line10_otherExpenses: vehicleOtherExpenses,
      line11_subcontractCosts: 0,
      line12_totalExpenses: chartA_line12,
      line13_businessPortion: chartA_line13,
      line14_businessParkingFees: vehicleParking,
      line15_supplementaryInsurance: 0,
      line16_allowableExpenses: chartA_line16,
      businessUsePercent: businessUsePercent,
    },
    part5_netIncome: {
      line9369_netIncomeBeforeAdjustments: netIncomeBeforeAdjustments,
      line5A_yourShare: netIncomeBeforeAdjustments,
      line5B_canadianJournalismCredit: 0,
      line9974_gstHstRebate: 0,
      line5C_total: netIncomeBeforeAdjustments,
      line9943_otherDeductions: 0,
      line5D_netIncomeAfterAdjustments: netIncomeBeforeAdjustments,
      line9945_businessUseOfHome: homeOfficeExpenses,
      line9946_yourNetIncome: netIncomeBeforeAdjustments - homeOfficeExpenses,
    },
    part7_homeOffice: {
      line7A_heat: 0,
      line7B_electricity: 0,
      line7C_insurance: 0,
      line7D_maintenance: 0,
      line7E_mortgageInterest: 0,
      line7F_propertyTaxes: 0,
      line7G_otherExpenses: 0,
      line7H_subtotal: 0,
      line7I_personalUsePart: 0,
      line7J_businessPart: 0,
      line7K_cca: 0,
      line7L_carriedForward: 0,
      line7M_totalAvailable: 0,
      line7N_netIncomeLimit: netIncomeBeforeAdjustments,
      line7O_carryForwardNext: 0,
      line7P_allowableClaim: homeOfficeExpenses,
    },
    expenseDetails,
  };
}

export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

export function formatPercent(percent: number): string {
  return percent.toFixed(1);
}
