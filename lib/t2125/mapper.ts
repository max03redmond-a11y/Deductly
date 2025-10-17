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
  };
  income: {
    line8000_grossIncome: number;
    line8299_grossBusinessIncome: number;
  };
  expenses: {
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
    line9275_deliveryFreight: number;
    line9281_motorVehicleExpenses: number;
    line9936_cca: number;
    line9368_totalExpenses: number;
  };
  expenseDetails: ExpenseDetail[];
  motorVehicle: {
    businessKm: number;
    totalKm: number;
    businessUsePercent: number;
    fuelOil: number;
    insurance: number;
    licence: number;
    maintenance: number;
    electricity: number;
    totalExpenses: number;
    businessPortion: number;
  };
  netIncome: {
    line9369_netIncomeBeforeAdjustments: number;
    line9946_yourNetIncome: number;
  };
}

export function mapExpenseToT2125Line(categoryCode: string): keyof T2125Data['expenses'] | null {
  const mapping: Record<string, keyof T2125Data['expenses']> = {
    '8521': 'line8521_advertising',
    '8523': 'line8523_mealsEntertainment',
    '8590': 'line8590_badDebts',
    '8690': 'line8690_insurance',
    '8710': 'line8710_interestBankCharges',
    '8760': 'line8760_businessTaxesLicences',
    '8810': 'line8810_officeExpenses',
    '8811': 'line8811_officeStationery',
    '8860': 'line8860_professionalFees',
    '8871': 'line8871_managementFees',
    '8910': 'line8910_rent',
    '8960': 'line8960_repairsMaintenance',
    '9060': 'line9060_salariesWages',
    '9180': 'line9180_propertyTaxes',
    '9200': 'line9200_travelExpenses',
    '9220': 'line9220_utilities',
    '9224': 'line9224_fuelCosts',
    '9275': 'line9275_deliveryFreight',
    '9281': 'line9281_motorVehicleExpenses',
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

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);

  const expensesByLine: Partial<Record<keyof T2125Data['expenses'], number>> = {};

  expenses.forEach((expense) => {
    const lineKey = mapExpenseToT2125Line(expense.category_code || expense.category);
    if (lineKey) {
      expensesByLine[lineKey] = (expensesByLine[lineKey] || 0) + (expense.deductible_amount || 0);
    }
  });

  const mealsTotal = expensesByLine.line8523_mealsEntertainment || 0;
  expensesByLine.line8523_mealsEntertainment = mealsTotal * 0.5;

  const mileageTotals = calculateMileageTotals(mileage, filter);
  const businessUsePercent = mileageTotals.total > 0
    ? (mileageTotals.business / mileageTotals.total) * 100
    : 0;

  const vehicleExpenses = expenses.filter((e) =>
    ['9210', '9220', '9275'].includes(e.category_code || e.category)
  );

  const vehicleFuel = expenses
    .filter((e) => e.category_code === '9210')
    .reduce((sum, e) => sum + (e.deductible_amount || 0), 0);

  const vehicleInsurance = expenses
    .filter((e) => e.category_code === '9220')
    .reduce((sum, e) => sum + (e.deductible_amount || 0), 0);

  const vehicleMaintenance = expenses
    .filter((e) => e.category_code === '9275')
    .reduce((sum, e) => sum + (e.deductible_amount || 0), 0);

  const totalVehicleExpenses = vehicleFuel + vehicleInsurance + vehicleMaintenance;
  const businessVehicleExpenses = totalVehicleExpenses * (businessUsePercent / 100);

  expensesByLine.line9281_motorVehicleExpenses = businessVehicleExpenses;

  const ccaDeduction = calculateCCADeduction(assets, filter);
  expensesByLine.line9936_cca = ccaDeduction;

  const totalExpenses = Object.values(expensesByLine).reduce((sum, val) => sum + (val || 0), 0);

  const netIncomeBeforeAdjustments = totalIncome - totalExpenses;

  const expenseDetails: ExpenseDetail[] = expenses
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((expense) => {
      const categoryCode = expense.category_code || expense.category;
      const lineNumber = categoryCode || 'N/A';

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

  return {
    identification: {
      yourName: profile?.full_name || '',
      sin: profile?.sin || '',
      businessName: profile?.business_name || '',
      businessNumber: profile?.business_number || '',
      businessAddress: profile?.business_address || '',
      city: profile?.city || '',
      province: profile?.province || 'ON',
      postalCode: profile?.postal_code || '',
      fiscalPeriodStart: `${currentYear}0101`,
      fiscalPeriodEnd: `${currentYear}1231`,
      mainProductService: profile?.main_business_activity || 'Rideshare Driver',
      industryCode: profile?.industry_code || '',
    },
    income: {
      line8000_grossIncome: totalIncome,
      line8299_grossBusinessIncome: totalIncome,
    },
    expenses: {
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
      line9275_deliveryFreight: expensesByLine.line9275_deliveryFreight || 0,
      line9281_motorVehicleExpenses: expensesByLine.line9281_motorVehicleExpenses || 0,
      line9936_cca: expensesByLine.line9936_cca || 0,
      line9368_totalExpenses: totalExpenses,
    },
    expenseDetails,
    motorVehicle: {
      businessKm: mileageTotals.business,
      totalKm: mileageTotals.total,
      businessUsePercent: businessUsePercent,
      fuelOil: vehicleFuel,
      insurance: vehicleInsurance,
      licence: 0,
      maintenance: vehicleMaintenance,
      electricity: 0,
      totalExpenses: totalVehicleExpenses,
      businessPortion: businessVehicleExpenses,
    },
    netIncome: {
      line9369_netIncomeBeforeAdjustments: netIncomeBeforeAdjustments,
      line9946_yourNetIncome: netIncomeBeforeAdjustments,
    },
  };
}

export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

export function formatPercent(percent: number): string {
  return percent.toFixed(1);
}
