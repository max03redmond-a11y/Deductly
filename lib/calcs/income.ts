import { supabase } from '@/lib/supabase';

export interface IncomeTotalsPart3C {
  sum_3a_cents: number;
  sum_3b_cents: number;
  sum_3c_cents: number;
  sum_8230_cents: number;
  sum_8299_cents: number;
  period_start: string | null;
  period_end: string | null;
  entry_count: number;
}

export interface IncomeTotalsDisplay {
  line3A: number;
  line3B: number;
  line3C: number;
  line8230: number;
  line8299: number;
  hasWarning: boolean;
  warningMessage: string | null;
}

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export function centsToDisplay(cents: number): number {
  return cents / 100;
}

export function centsToDollars(cents: number): number {
  return Math.round(cents / 100);
}

export function displayToCents(amount: number): number {
  return Math.round(amount * 100);
}

export async function getIncomeTotalsPart3C(
  userId: string = DEFAULT_USER_ID,
  startDate?: string,
  endDate?: string
): Promise<IncomeTotalsPart3C> {
  const { data, error } = await supabase.rpc('get_income_totals_part3c', {
    p_user_id: userId,
    p_start_date: startDate || null,
    p_end_date: endDate || null,
  });

  if (error) {
    console.error('Error fetching income totals:', error);
    return {
      sum_3a_cents: 0,
      sum_3b_cents: 0,
      sum_3c_cents: 0,
      sum_8230_cents: 0,
      sum_8299_cents: 0,
      period_start: null,
      period_end: null,
      entry_count: 0,
    };
  }

  const result = data?.[0];
  if (!result) {
    return {
      sum_3a_cents: 0,
      sum_3b_cents: 0,
      sum_3c_cents: 0,
      sum_8230_cents: 0,
      sum_8299_cents: 0,
      period_start: null,
      period_end: null,
      entry_count: 0,
    };
  }

  return result;
}

export function calculateIncomeTotalsDisplay(
  totals: IncomeTotalsPart3C
): IncomeTotalsDisplay {
  const line3A = centsToDisplay(totals.sum_3a_cents);
  const line3B = centsToDisplay(totals.sum_3b_cents);
  const line3C = centsToDisplay(totals.sum_3c_cents);
  const line8230 = centsToDisplay(totals.sum_8230_cents);
  const line8299 = centsToDisplay(totals.sum_8299_cents);

  let hasWarning = false;
  let warningMessage = null;

  if (line3B > line3A && line3A > 0) {
    hasWarning = true;
    warningMessage = 'GST/HST exceeds gross sales—check entries.';
  }

  return {
    line3A,
    line3B,
    line3C,
    line8230,
    line8299,
    hasWarning,
    warningMessage,
  };
}

export function getIncomeTotalsForExport(
  totals: IncomeTotalsPart3C
): {
  line3A: number;
  line3B: number;
  line3C: number;
  line8230: number;
  line8299: number;
} {
  return {
    line3A: centsToDollars(totals.sum_3a_cents),
    line3B: centsToDollars(totals.sum_3b_cents),
    line3C: centsToDollars(totals.sum_3c_cents),
    line8230: centsToDollars(totals.sum_8230_cents),
    line8299: centsToDollars(totals.sum_8299_cents),
  };
}

export function validateIncomeTotals(
  totals: IncomeTotalsPart3C
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (totals.sum_3b_cents > totals.sum_3a_cents && totals.sum_3a_cents > 0) {
    warnings.push('GST/HST exceeds gross sales—check entries.');
  }

  if (totals.sum_8230_cents < 0) {
    warnings.push(
      'Other income is negative—verify adjustments are intentional.'
    );
  }

  if (totals.sum_8299_cents < 0) {
    warnings.push('Total gross business income is negative—verify all entries.');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
