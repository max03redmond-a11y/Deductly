import { Expense, IncomeRecord, MileageLog } from '@/types/database';

export interface PeriodFilter {
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
}

export interface CategoryTotal {
  category: string;
  categoryLabel: string;
  total: number;
  deductible: number;
  count: number;
}

export interface SummaryTotals {
  totalIncome: number;
  totalExpenses: number;
  totalDeductible: number;
  totalMileage: number;
  businessMileage: number;
  netIncome: number;
}

export function filterByPeriod<T extends { date: string }>(
  items: T[],
  filter?: PeriodFilter
): T[] {
  if (!filter) return items;

  return items.filter((item) => {
    const itemDate = new Date(item.date);

    if (filter.year && itemDate.getFullYear() !== filter.year) {
      return false;
    }

    if (filter.month !== undefined && itemDate.getMonth() !== filter.month) {
      return false;
    }

    if (filter.startDate && item.date < filter.startDate) {
      return false;
    }

    if (filter.endDate && item.date > filter.endDate) {
      return false;
    }

    return true;
  });
}

export function calculateExpenseTotals(
  expenses: Expense[],
  filter?: PeriodFilter
): SummaryTotals['totalExpenses'] {
  const filtered = filterByPeriod(expenses, filter);
  return filtered.reduce((sum, expense) => sum + (expense.total_amount || expense.amount), 0);
}

export function calculateDeductibleTotal(
  expenses: Expense[],
  filter?: PeriodFilter
): number {
  const filtered = filterByPeriod(expenses, filter);
  return filtered.reduce(
    (sum, expense) => sum + (expense.deductible_amount || expense.amount * (expense.business_percentage / 100)),
    0
  );
}

export function calculateIncomeTotals(
  income: IncomeRecord[],
  filter?: PeriodFilter
): SummaryTotals['totalIncome'] {
  const filtered = filterByPeriod(income, filter);
  return filtered.reduce((sum, record) => sum + record.amount, 0);
}

export function calculateMileageTotals(
  mileage: MileageLog[],
  filter?: PeriodFilter
): { total: number; business: number } {
  const filtered = filterByPeriod(mileage, filter);

  const total = filtered.reduce((sum, log) => sum + log.distance_km, 0);
  const business = filtered.reduce(
    (sum, log) => sum + (log.is_business ? log.distance_km : 0),
    0
  );

  return { total, business };
}

export function calculateCategoryTotals(
  expenses: Expense[],
  filter?: PeriodFilter
): CategoryTotal[] {
  const filtered = filterByPeriod(expenses, filter);

  const categoryMap = new Map<string, CategoryTotal>();

  filtered.forEach((expense) => {
    const category = expense.category_code || expense.category;
    const label = expense.category_label || expense.category;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        categoryLabel: label,
        total: 0,
        deductible: 0,
        count: 0,
      });
    }

    const categoryTotal = categoryMap.get(category)!;
    categoryTotal.total += expense.total_amount || expense.amount;
    categoryTotal.deductible += expense.deductible_amount || expense.amount * (expense.business_percentage / 100);
    categoryTotal.count += 1;
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.deductible - a.deductible);
}

export function calculateSummaryTotals(
  expenses: Expense[],
  income: IncomeRecord[],
  mileage: MileageLog[],
  filter?: PeriodFilter
): SummaryTotals {
  const totalIncome = calculateIncomeTotals(income, filter);
  const totalExpenses = calculateExpenseTotals(expenses, filter);
  const totalDeductible = calculateDeductibleTotal(expenses, filter);
  const mileageTotals = calculateMileageTotals(mileage, filter);

  return {
    totalIncome,
    totalExpenses,
    totalDeductible,
    totalMileage: mileageTotals.total,
    businessMileage: mileageTotals.business,
    netIncome: totalIncome - totalDeductible,
  };
}

export function getCurrentYearFilter(): PeriodFilter {
  return {
    year: new Date().getFullYear(),
  };
}

export function getYTDFilter(): PeriodFilter {
  const now = new Date();
  return {
    startDate: `${now.getFullYear()}-01-01`,
    endDate: now.toISOString().split('T')[0],
  };
}

export function getMonthFilter(year: number, month: number): PeriodFilter {
  return {
    year,
    month,
  };
}
