/**
 * Income Part 3C Calculation Tests
 *
 * Tests for T2125 Part 3C business income calculations
 * Formula: Gross business income = (Gross sales - GST/HST) + Other income
 */

import {
  centsToDisplay,
  centsToDollars,
  displayToCents,
  calculateIncomeTotalsDisplay,
  validateIncomeTotals,
  IncomeTotalsPart3C,
} from '../income';

describe('Income Part 3C Calculations', () => {
  describe('Currency conversion functions', () => {
    test('centsToDisplay converts cents to dollars with decimals', () => {
      expect(centsToDisplay(12345)).toBe(123.45);
      expect(centsToDisplay(100)).toBe(1.00);
      expect(centsToDisplay(0)).toBe(0);
    });

    test('centsToDollars rounds cents to nearest dollar', () => {
      expect(centsToDollars(12345)).toBe(123);
      expect(centsToDollars(12350)).toBe(124);
      expect(centsToDollars(12349)).toBe(123);
      expect(centsToDollars(100)).toBe(1);
      expect(centsToDollars(0)).toBe(0);
    });

    test('displayToCents converts dollars to cents', () => {
      expect(displayToCents(123.45)).toBe(12345);
      expect(displayToCents(1.00)).toBe(100);
      expect(displayToCents(0)).toBe(0);
    });
  });

  describe('Part 3C calculation formulas', () => {
    test('Line 3C = Line 3A - Line 3B', () => {
      const totals: IncomeTotalsPart3C = {
        sum_3a_cents: 100000, // $1000 gross sales
        sum_3b_cents: 13000,  // $130 GST/HST
        sum_3c_cents: 87000,  // $870 net sales
        sum_8230_cents: 0,
        sum_8299_cents: 87000,
        period_start: '2025-01-01',
        period_end: '2025-12-31',
        entry_count: 10,
      };

      const display = calculateIncomeTotalsDisplay(totals);
      expect(display.line3C).toBe(870);
      expect(display.line3C).toBe(display.line3A - display.line3B);
    });

    test('Line 8299 = Line 3C + Line 8230', () => {
      const totals: IncomeTotalsPart3C = {
        sum_3a_cents: 100000, // $1000 gross sales
        sum_3b_cents: 13000,  // $130 GST/HST
        sum_3c_cents: 87000,  // $870 net sales
        sum_8230_cents: 15000, // $150 other income
        sum_8299_cents: 102000, // $1020 total
        period_start: '2025-01-01',
        period_end: '2025-12-31',
        entry_count: 10,
      };

      const display = calculateIncomeTotalsDisplay(totals);
      expect(display.line8299).toBe(1020);
      expect(display.line8299).toBe(display.line3C + display.line8230);
    });

    test('Full formula: 8299 = (3A - 3B) + 8230', () => {
      const totals: IncomeTotalsPart3C = {
        sum_3a_cents: 500000, // $5000 gross sales
        sum_3b_cents: 65000,  // $650 GST/HST
        sum_3c_cents: 435000, // $4350 net sales
        sum_8230_cents: 50000, // $500 other income
        sum_8299_cents: 485000, // $4850 total
        period_start: '2025-01-01',
        period_end: '2025-12-31',
        entry_count: 50,
      };

      const display = calculateIncomeTotalsDisplay(totals);

      // Verify individual components
      expect(display.line3A).toBe(5000);
      expect(display.line3B).toBe(650);
      expect(display.line3C).toBe(4350);
      expect(display.line8230).toBe(500);
      expect(display.line8299).toBe(4850);

      // Verify formula
      const calculatedGrossIncome = (display.line3A - display.line3B) + display.line8230;
      expect(display.line8299).toBe(calculatedGrossIncome);
    });
  });

  describe('Validation and warnings', () => {
    test('Warns when GST/HST exceeds gross sales', () => {
      const totals: IncomeTotalsPart3C = {
        sum_3a_cents: 100000,
        sum_3b_cents: 150000, // GST/HST higher than gross sales!
        sum_3c_cents: -50000,
        sum_8230_cents: 0,
        sum_8299_cents: -50000,
        period_start: '2025-01-01',
        period_end: '2025-12-31',
        entry_count: 1,
      };

      const display = calculateIncomeTotalsDisplay(totals);
      expect(display.hasWarning).toBe(true);
      expect(display.warningMessage).toBe('GST/HST exceeds gross sales—check entries.');
    });

    test('No warning when values are correct', () => {
      const totals: IncomeTotalsPart3C = {
        sum_3a_cents: 100000,
        sum_3b_cents: 13000,
        sum_3c_cents: 87000,
        sum_8230_cents: 10000,
        sum_8299_cents: 97000,
        period_start: '2025-01-01',
        period_end: '2025-12-31',
        entry_count: 5,
      };

      const display = calculateIncomeTotalsDisplay(totals);
      expect(display.hasWarning).toBe(false);
      expect(display.warningMessage).toBeNull();
    });

    test('Validates negative other income', () => {
      const totals: IncomeTotalsPart3C = {
        sum_3a_cents: 100000,
        sum_3b_cents: 13000,
        sum_3c_cents: 87000,
        sum_8230_cents: -5000, // Negative other income
        sum_8299_cents: 82000,
        period_start: '2025-01-01',
        period_end: '2025-12-31',
        entry_count: 5,
      };

      const validation = validateIncomeTotals(totals);
      expect(validation.isValid).toBe(false);
      expect(validation.warnings).toContain('Other income is negative—verify adjustments are intentional.');
    });
  });

  describe('Rounding behavior', () => {
    test('Storage in cents preserves precision', () => {
      const totals: IncomeTotalsPart3C = {
        sum_3a_cents: 123456, // $1234.56
        sum_3b_cents: 16049,  // $160.49
        sum_3c_cents: 107407, // $1074.07
        sum_8230_cents: 5678,  // $56.78
        sum_8299_cents: 113085, // $1130.85
        period_start: '2025-01-01',
        period_end: '2025-12-31',
        entry_count: 10,
      };

      const display = calculateIncomeTotalsDisplay(totals);

      // Display shows cents
      expect(display.line3A).toBe(1234.56);
      expect(display.line3B).toBe(160.49);
      expect(display.line8230).toBe(56.78);

      // Export would round to dollars
      expect(centsToDollars(totals.sum_3a_cents)).toBe(1235);
      expect(centsToDollars(totals.sum_3b_cents)).toBe(160);
      expect(centsToDollars(totals.sum_8230_cents)).toBe(57);
    });
  });

  describe('Edge cases', () => {
    test('Handles zero income entries', () => {
      const totals: IncomeTotalsPart3C = {
        sum_3a_cents: 0,
        sum_3b_cents: 0,
        sum_3c_cents: 0,
        sum_8230_cents: 0,
        sum_8299_cents: 0,
        period_start: null,
        period_end: null,
        entry_count: 0,
      };

      const display = calculateIncomeTotalsDisplay(totals);
      expect(display.line3A).toBe(0);
      expect(display.line3B).toBe(0);
      expect(display.line3C).toBe(0);
      expect(display.line8230).toBe(0);
      expect(display.line8299).toBe(0);
      expect(display.hasWarning).toBe(false);
    });

    test('Handles only other income (no gross sales)', () => {
      const totals: IncomeTotalsPart3C = {
        sum_3a_cents: 0,
        sum_3b_cents: 0,
        sum_3c_cents: 0,
        sum_8230_cents: 50000, // $500 tips only
        sum_8299_cents: 50000,
        period_start: '2025-01-01',
        period_end: '2025-12-31',
        entry_count: 5,
      };

      const display = calculateIncomeTotalsDisplay(totals);
      expect(display.line8299).toBe(500);
      expect(display.line8230).toBe(500);
    });
  });
});
