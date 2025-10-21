# Income Workflow Implementation - T2125 Part 3C

## Overview

Implemented complete Income workflow for T2125 Part 3C business income calculations with consistent totals across Income page, Dashboard, and T2125 exports.

**Final Formula:**
```
Gross business income (8299) = (Gross sales - GST/HST) + Other income
```

## Implementation Details

### 1. Database Layer

**Migration:** `20251021190000_create_income_totals_view.sql`

- Created view `v_income_totals_part3c` for aggregating income data
- Created function `get_income_totals_part3c()` for period-based queries
- All amounts stored in cents for precision
- Returns totals for T2125 lines: 3A, 3B, 3C, 8230, 8299

**Database View Returns:**
- `sum_3a_cents`: Line 3A - Gross sales (including GST/HST)
- `sum_3b_cents`: Line 3B - GST/HST collected/collectible
- `sum_3c_cents`: Line 3C - Net sales (3A - 3B)
- `sum_8230_cents`: Line 8230 - Other income (tips + bonuses + referrals)
- `sum_8299_cents`: Line 8299 - Gross business income (3C + 8230)

### 2. Calculation Library

**File:** `lib/calcs/income.ts`

**Functions:**
- `getIncomeTotalsPart3C()` - Fetches income totals from database
- `calculateIncomeTotalsDisplay()` - Converts cents to display format ($)
- `getIncomeTotalsForExport()` - Converts cents to dollars (rounded) for export
- `validateIncomeTotals()` - Validates data integrity and returns warnings
- `centsToDisplay()`, `centsToDollars()`, `displayToCents()` - Currency conversions

**Validation Rules:**
- Warns if GST/HST exceeds gross sales
- Flags negative other income (requires confirmation)
- Flags negative total gross business income
- Never displays NaN (defaults to 0)

### 3. UI Components

**Component:** `components/IncomePart3CCard.tsx`

Reusable card component displaying T2125 Part 3C breakdown:
- Line 3A: Gross sales (incl. GST/HST)
- Line 3B: GST/HST collected
- Line 3C: Net sales (calculated)
- Line 8230: Other income (tips, bonuses, referrals)
- Line 8299: Gross business income (total)
- Warning indicator for validation issues
- Formula helper text
- Supports read-only mode for reports

### 4. Income Page Updates

**File:** `app/(tabs)/income.tsx`

**Changes:**
- Added Part 3C breakdown card at top of page
- Shows live totals calculated from database
- Displays validation warnings
- Updates totals when entries added/edited/deleted
- Shows other income (tips, bonuses, referrals) in entry cards
- Refreshes totals on pull-to-refresh

**Income Modal Updates:**
- Added fields for Tips, Bonuses, Other Income
- These are separate from gross sales
- All values optional
- Saved to existing database columns

### 5. Dashboard/Reports Updates

**File:** `app/(tabs)/dashboard.tsx`

**Changes:**
- Replaced old summary cards with Part 3C card
- Shows same totals as Income page (read-only)
- Totals automatically refresh with data changes
- Consistent calculations across all views

### 6. T2125 Export Integration

**File:** `lib/t2125/mapper.ts`

**Changes:**
- Updated income calculation to include `other_income` field
- Changed variable names for clarity:
  - `totalIncome` → `netSales` (Line 3C)
  - `tipsAndBonuses` → `otherIncome` (Line 8230)
  - Added `grossBusinessIncome` (Line 8299)
- All export values rounded to nearest dollar (CRA convention)
- Formula verified: `8299 = (3A - 3B) + 8230`

**Export Fields:**
- `part3a_businessIncome.line3A_grossSales` - Rounded dollars
- `part3a_businessIncome.line3B_gstHstCollected` - Rounded dollars
- `part3a_businessIncome.line3C_subtotal` - Rounded dollars
- `part3c_income.line8230_otherIncome` - Rounded dollars
- `part3c_income.line8299_grossBusinessIncome` - Rounded dollars

### 7. Rounding Rules

**Storage:** All amounts stored and computed in cents (integers)
**Display:** Shows two decimal places ($1,234.56)
**Export:** Rounds to nearest dollar using `Math.round()` ($1,235)

**Example:**
```typescript
// Storage
sum_3a_cents: 123456  // $1234.56

// Display
line3A: 1234.56

// Export
line3A_grossSales: 1235  // Rounded to nearest dollar
```

### 8. Testing

**File:** `lib/calcs/__tests__/income.test.ts`

Comprehensive test suite covering:
- Currency conversion functions
- Part 3C calculation formulas (3C = 3A - 3B, 8299 = 3C + 8230)
- Validation warnings
- Rounding behavior (cents → display → dollars)
- Edge cases (zero income, only tips, etc.)
- Formula verification across all paths

## Data Flow

```
Income Entries (Database)
    ↓
get_income_totals_part3c() [Database Function]
    ↓
IncomeTotalsPart3C (cents) [Calculation Layer]
    ↓
    ├─→ calculateIncomeTotalsDisplay() [UI Layer]
    │       ↓
    │   IncomeTotalsDisplay ($) [Components]
    │       ↓
    │   IncomePart3CCard [Income Page, Dashboard]
    │
    └─→ getIncomeTotalsForExport() [Export Layer]
            ↓
        T2125 Export (dollars) [PDF, CSV, HTML]
```

## Formula Verification

**T2125 Part 3C Calculation:**

1. **Line 3A:** Gross sales including GST/HST
2. **Line 3B:** GST/HST collected/collectible
3. **Line 3C:** Net sales = 3A - 3B
4. **Line 8230:** Other income (tips, bonuses, referrals)
5. **Line 8299:** Gross business income = 3C + 8230

**Simplified:**
```
Line 8299 = (Line 3A - Line 3B) + Line 8230
```

## Validation & Edge Cases

### Non-Blocking Warnings

1. **GST/HST exceeds gross sales**
   - Condition: `3B > 3A && 3A > 0`
   - Message: "GST/HST exceeds gross sales—check entries."
   - Action: Display warning, allow save

2. **Negative other income**
   - Condition: `8230 < 0`
   - Message: "Other income is negative—verify adjustments are intentional."
   - Action: Display warning, allow save with confirmation

3. **Negative total income**
   - Condition: `8299 < 0`
   - Message: "Total gross business income is negative—verify all entries."
   - Action: Display warning, allow save

### Handled Edge Cases

- **Zero income entries:** All lines display $0.00
- **No gross sales, only tips:** 8299 = 8230
- **Missing data:** Defaults to 0, never NaN
- **Precision loss:** Stored in cents, prevents rounding errors

## User Experience

### Income Page
- Clear breakdown of T2125 Part 3C lines
- Live updates as entries are added
- Visual warnings for data issues
- Helper text explains formula
- Separate section for other income (tips, bonuses, referrals)

### Dashboard
- Same calculations as Income page (consistency)
- Read-only view
- Part of year-to-date overview
- Feeds into net profit calculations

### Income Entry Modal
- New optional fields: Tips, Bonuses, Other Income
- Clear separation from gross sales
- Inline help text
- Summary shows total income breakdown

## CRA Compliance

- Follows T2125 form structure exactly
- Uses official line numbers (3A, 3B, 3C, 8230, 8299)
- Rounds to dollars for official export (CRA requirement)
- Maintains audit trail (cents stored)
- Supports cash and accrual accounting methods
- GST/HST tracking for compliance

## Future Enhancements

Potential additions (not implemented):

1. **Period Selection**
   - Filter by date range
   - Compare periods
   - Year-over-year analysis

2. **Income Categories**
   - Separate platform income
   - Track income sources
   - Category-based reporting

3. **Advanced Validation**
   - Industry benchmarks
   - Anomaly detection
   - Smart suggestions

4. **Export Options**
   - Detailed income report
   - Month-by-month breakdown
   - Custom date ranges

## Summary

Complete implementation of T2125 Part 3C income workflow with:
- ✅ Database view and calculation functions
- ✅ Consistent totals across all pages
- ✅ Validation warnings
- ✅ Cents storage, dollar export
- ✅ T2125 PDF/CSV/HTML integration
- ✅ Comprehensive test coverage
- ✅ CRA-compliant calculations
- ✅ User-friendly UI components

All calculations follow the formula:
**Gross business income = (Gross sales − GST/HST) + Other income**
