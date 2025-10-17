import { Expense, MileageLog, Asset, Profile } from '@/types/database';
import { calculateDeductibleTotal, calculateMileageTotals, PeriodFilter } from './summary';

export interface TaxEstimate {
  totalDeductions: number;
  meals50Percent: number;
  motorVehicleExpenses: number;
  homeOfficeDeduction: number;
  ccaDeduction: number;
  otherDeductions: number;
  businessUsePercent: number;
  estimatedTaxSavings: number;
}

const MEALS_DEDUCTION_RATE = 0.5;
const MOTOR_VEHICLE_CATEGORIES = ['9210', '9220', '9275'];
const MEALS_CATEGORIES = ['8523'];
const HOME_OFFICE_CATEGORIES = [];

export function calculateMeals50Percent(
  expenses: Expense[],
  filter?: PeriodFilter
): number {
  const mealsExpenses = expenses.filter((e) =>
    MEALS_CATEGORIES.includes(e.category_code || e.category)
  );

  const total = calculateDeductibleTotal(mealsExpenses, filter);
  return total * MEALS_DEDUCTION_RATE;
}

export function calculateMotorVehicleExpenses(
  expenses: Expense[],
  mileage: MileageLog[],
  filter?: PeriodFilter
): number {
  const vehicleExpenses = expenses.filter((e) =>
    MOTOR_VEHICLE_CATEGORIES.includes(e.category_code || e.category)
  );

  const mileageTotals = calculateMileageTotals(mileage, filter);
  const businessUsePercent =
    mileageTotals.total > 0 ? mileageTotals.business / mileageTotals.total : 0;

  return calculateDeductibleTotal(vehicleExpenses, filter);
}

export function calculateHomeOfficePercent(profile: Profile | null): number {
  if (!profile) return 0;
  return 0;
}

export function calculateHomeOfficeDeduction(
  expenses: Expense[],
  profile: Profile | null,
  filter?: PeriodFilter
): number {
  const homeOfficePercent = calculateHomeOfficePercent(profile);
  if (homeOfficePercent === 0) return 0;

  const eligibleExpenses = expenses.filter(
    (e) => e.category_code === '8810' || e.category_code === '9200'
  );

  const total = calculateDeductibleTotal(eligibleExpenses, filter);
  return total * homeOfficePercent;
}

export function calculateCCADeduction(
  assets: Asset[],
  filter?: PeriodFilter
): number {
  if (!filter?.year) {
    return assets.reduce((sum, asset) => sum + asset.cca_current, 0);
  }

  return assets.reduce((sum, asset) => sum + asset.cca_current, 0);
}

export function calculateBusinessUsePercent(
  mileage: MileageLog[],
  filter?: PeriodFilter
): number {
  const mileageTotals = calculateMileageTotals(mileage, filter);

  if (mileageTotals.total === 0) return 0;

  return (mileageTotals.business / mileageTotals.total) * 100;
}

export function calculateTaxEstimate(
  expenses: Expense[],
  income: number,
  mileage: MileageLog[],
  assets: Asset[],
  profile: Profile | null,
  filter?: PeriodFilter
): TaxEstimate {
  const meals50 = calculateMeals50Percent(expenses, filter);
  const motorVehicle = calculateMotorVehicleExpenses(expenses, mileage, filter);
  const homeOffice = calculateHomeOfficeDeduction(expenses, profile, filter);
  const cca = calculateCCADeduction(assets, filter);

  const totalDeductible = calculateDeductibleTotal(expenses, filter);

  const mealsAdjustment = expenses
    .filter((e) => MEALS_CATEGORIES.includes(e.category_code || e.category))
    .reduce((sum, e) => sum + (e.deductible_amount || 0), 0);

  const otherDeductions =
    totalDeductible - mealsAdjustment - motorVehicle - homeOffice;

  const totalDeductions = meals50 + motorVehicle + homeOffice + cca + otherDeductions;

  const businessUsePercent = calculateBusinessUsePercent(mileage, filter);

  const estimatedTaxRate = income > 50000 ? 0.3 : income > 25000 ? 0.25 : 0.2;
  const estimatedTaxSavings = totalDeductions * estimatedTaxRate;

  return {
    totalDeductions,
    meals50Percent: meals50,
    motorVehicleExpenses: motorVehicle,
    homeOfficeDeduction: homeOffice,
    ccaDeduction: cca,
    otherDeductions,
    businessUsePercent,
    estimatedTaxSavings,
  };
}

export function calculateQuarterlyTaxPayment(
  income: number,
  deductions: number,
  taxRate: number = 0.25
): number {
  const taxableIncome = Math.max(0, income - deductions);
  const annualTax = taxableIncome * taxRate;
  return annualTax / 4;
}

export function getGSTHSTCollected(income: number, rate: number = 0.13): number {
  return income * rate;
}

export function getGSTHSTITCs(
  expenses: Expense[],
  filter?: PeriodFilter
): number {
  const eligibleExpenses = expenses.filter((e) => e.itc_eligible === true);
  const total = eligibleExpenses.reduce((sum, e) => sum + (e.tax_paid_hst || 0), 0);
  return total;
}

export function calculateGSTHSTOwing(
  income: number,
  expenses: Expense[],
  gstRate: number = 0.13,
  filter?: PeriodFilter
): number {
  const collected = getGSTHSTCollected(income, gstRate);
  const itcs = getGSTHSTITCs(expenses, filter);
  return Math.max(0, collected - itcs);
}
