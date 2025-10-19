import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { T2125Data, formatCurrency } from './mapper';

export interface T2125PDFData {
  part1_identification: {
    your_name: string;
    sin: string;
    business_name: string;
    business_number: string;
    business_address: string;
    city: string;
    province: string;
    postal_code: string;
    fiscal_period_from: string;
    fiscal_period_to: string;
    industry_code: string;
    accounting_method: string;
  };
  part2_internet: {
    num_websites: number;
    website_1: string;
    income_from_web_percent: number;
  };
  part3_income: {
    line3A_gross_sales_incl_gst: number;
    line3B_gst_collected: number;
    line3C_subtotal: number;
    line8000_adjusted_gross_sales: number;
    line8230_other_income: number;
    line8299_total_gross_income: number;
  };
  part4_expenses: {
    line8521_advertising: number;
    line8523_meals_entertainment: number;
    line8590_bad_debts: number;
    line8690_insurance: number;
    line8710_interest_bank_charges: number;
    line8760_business_taxes_licences: number;
    line8810_office_expenses: number;
    line8811_office_supplies: number;
    line8860_professional_fees: number;
    line8871_management_fees: number;
    line8910_rent: number;
    line8960_repairs_maintenance: number;
    line9060_salaries_wages: number;
    line9180_property_taxes: number;
    line9200_travel: number;
    line9225_telephone_utilities: number;
    line9220_utilities: number;
    line9224_fuel_costs: number;
    line9270_other_expenses: number;
    line9275_delivery_freight: number;
    line9281_motor_vehicle: number;
    line9936_cca: number;
    line9945_home_office: number;
    line9368_total_expenses: number;
    line9369_net_income: number;
  };
  chartA_vehicle: {
    line1_business_km: number;
    line2_total_km: number;
    line3_fuel_oil: number;
    line4_interest: number;
    line5_insurance: number;
    line6_licence_registration: number;
    line7_maintenance_repairs: number;
    line8_leasing: number;
    line9_electricity: number;
    line10_other: number;
    line11_total_before_adjustments: number;
    line12_total_expenses: number;
    line13_business_use_percent: number;
    line14_parking: number;
    line15_supplementary_insurance: number;
    line16_allowable_expenses: number;
  };
  part7_home_office?: {
    line7A_heat: number;
    line7B_electricity: number;
    line7C_insurance: number;
    line7D_maintenance: number;
    line7E_mortgage_interest: number;
    line7F_property_taxes: number;
    line7G_other: number;
    total_home_expenses: number;
    business_area_sqft: number;
    total_home_area_sqft: number;
    business_use_percent: number;
    allowable_home_expenses: number;
  };
  summary: {
    gross_income: number;
    total_expenses: number;
    net_income: number;
    vehicle_business_use_percent: number;
    home_business_use_percent: number;
  };
}

export function convertToT2125PDFData(data: T2125Data): T2125PDFData {
  const totalVehicleExpenses =
    data.chartA_motorVehicle.line3_fuelOil +
    data.chartA_motorVehicle.line5_insurance +
    data.chartA_motorVehicle.line6_licenceRegistration +
    data.chartA_motorVehicle.line7_maintenance;

  const businessUsePercent = data.chartA_motorVehicle.businessUsePercent;

  return {
    part1_identification: {
      your_name: data.identification.yourName,
      sin: data.identification.sin,
      business_name: data.identification.businessName,
      business_number: data.identification.businessNumber,
      business_address: data.identification.businessAddress,
      city: data.identification.city,
      province: data.identification.province,
      postal_code: data.identification.postalCode,
      fiscal_period_from: data.identification.fiscalPeriodStart,
      fiscal_period_to: data.identification.fiscalPeriodEnd,
      industry_code: data.identification.industryCode,
      accounting_method: 'Cash',
    },
    part2_internet: {
      num_websites: 1,
      website_1: 'https://www.uber.com',
      income_from_web_percent: 100,
    },
    part3_income: {
      line3A_gross_sales_incl_gst: data.part3c_income.line8000_adjustedGrossSales,
      line3B_gst_collected: 0,
      line3C_subtotal: data.part3c_income.line8000_adjustedGrossSales,
      line8000_adjusted_gross_sales: data.part3c_income.line8000_adjustedGrossSales,
      line8230_other_income: 0,
      line8299_total_gross_income: data.part3c_income.line8299_grossBusinessIncome,
    },
    part4_expenses: {
      line8521_advertising: data.part4_expenses.line8521_advertising,
      line8523_meals_entertainment: data.part4_expenses.line8523_mealsEntertainment,
      line8590_bad_debts: data.part4_expenses.line8590_badDebts,
      line8690_insurance: data.part4_expenses.line8690_insurance,
      line8710_interest_bank_charges: data.part4_expenses.line8710_interestBankCharges,
      line8760_business_taxes_licences: data.part4_expenses.line8760_businessTaxesLicences,
      line8810_office_expenses: data.part4_expenses.line8810_officeExpenses,
      line8811_office_supplies: data.part4_expenses.line8811_officeStationery,
      line8860_professional_fees: data.part4_expenses.line8860_professionalFees,
      line8871_management_fees: data.part4_expenses.line8871_managementFees,
      line8910_rent: data.part4_expenses.line8910_rent,
      line8960_repairs_maintenance: data.part4_expenses.line8960_repairsMaintenance,
      line9060_salaries_wages: data.part4_expenses.line9060_salariesWages,
      line9180_property_taxes: data.part4_expenses.line9180_propertyTaxes,
      line9200_travel: data.part4_expenses.line9200_travelExpenses,
      line9225_telephone_utilities: data.part4_expenses.line9225_telephone,
      line9220_utilities: data.part4_expenses.line9220_utilities,
      line9224_fuel_costs: data.part4_expenses.line9224_fuelCosts,
      line9270_other_expenses: data.part4_expenses.line9270_otherExpenses,
      line9275_delivery_freight: data.part4_expenses.line9275_deliveryFreight,
      line9281_motor_vehicle: data.part4_expenses.line9281_motorVehicleExpenses,
      line9936_cca: data.part4_expenses.line9936_cca,
      line9945_home_office: data.part5_netIncome.line9945_businessUseOfHome,
      line9368_total_expenses: data.part4_expenses.line9368_totalExpenses,
      line9369_net_income: data.part5_netIncome.line9369_netIncomeBeforeAdjustments,
    },
    chartA_vehicle: {
      line1_business_km: data.chartA_motorVehicle.line1_businessKm,
      line2_total_km: data.chartA_motorVehicle.line2_totalKm,
      line3_fuel_oil: data.chartA_motorVehicle.line3_fuelOil,
      line4_interest: 0,
      line5_insurance: data.chartA_motorVehicle.line5_insurance,
      line6_licence_registration: data.chartA_motorVehicle.line6_licenceRegistration,
      line7_maintenance_repairs: data.chartA_motorVehicle.line7_maintenance,
      line8_leasing: 0,
      line9_electricity: data.chartA_motorVehicle.line9_electricity,
      line10_other: 0,
      line11_total_before_adjustments: totalVehicleExpenses,
      line12_total_expenses: totalVehicleExpenses,
      line13_business_use_percent: businessUsePercent,
      line14_parking: 0,
      line15_supplementary_insurance: 0,
      line16_allowable_expenses: data.chartA_motorVehicle.line16_allowableExpenses,
    },
    summary: {
      gross_income: data.part3c_income.line8299_grossBusinessIncome,
      total_expenses: data.part4_expenses.line9368_totalExpenses,
      net_income: data.part5_netIncome.line9946_yourNetIncome,
      vehicle_business_use_percent: businessUsePercent,
      home_business_use_percent: 0,
    },
  };
}

export function generateT2125PDF(data: T2125Data): string {
  const pdfData = convertToT2125PDFData(data);
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CRA T2125 - Statement of Business Activities ${currentYear}</title>
  <style>
    @page {
      size: letter;
      margin: 0.5in;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 10pt;
      line-height: 1.3;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .header h1 {
      font-size: 16pt;
      margin: 5px 0;
    }
    .header p {
      margin: 3px 0;
      font-size: 9pt;
      color: #666;
    }
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .section-title {
      background: #000;
      color: #fff;
      padding: 5px 10px;
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 10px;
    }
    .field-grid {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 8px 15px;
      margin-bottom: 10px;
    }
    .field-label {
      font-weight: bold;
      font-size: 9pt;
    }
    .field-value {
      border-bottom: 1px solid #ccc;
      padding: 2px 5px;
      font-size: 10pt;
    }
    .line-item {
      display: grid;
      grid-template-columns: 60px 1fr 120px;
      gap: 10px;
      padding: 6px 5px;
      border-bottom: 1px solid #eee;
    }
    .line-item.header {
      font-weight: bold;
      background: #f5f5f5;
      border-bottom: 2px solid #000;
    }
    .line-item.total {
      font-weight: bold;
      background: #f0f0f0;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      margin-top: 5px;
    }
    .line-number {
      font-weight: bold;
    }
    .amount {
      text-align: right;
      font-family: 'Courier New', monospace;
    }
    .notice {
      background: #fffbea;
      border: 2px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .notice-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 8px;
    }
    .summary-box {
      background: #f0f9ff;
      border: 2px solid #0369a1;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 11pt;
    }
    .summary-line.total {
      font-weight: bold;
      font-size: 13pt;
      border-top: 2px solid #0369a1;
      margin-top: 5px;
      padding-top: 10px;
    }
    @media print {
      body { margin: 0; padding: 0; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CRA Form T2125</h1>
    <p>Statement of Business or Professional Activities</p>
    <p>Tax Year ${currentYear}</p>
  </div>

  <div class="notice">
    <div class="notice-title">⚠️ IMPORTANT - CRA FILING INSTRUCTIONS</div>
    <p><strong>This is a REFERENCE DOCUMENT for your records.</strong></p>
    <p>To file with CRA, use NETFILE-certified tax software (TurboTax, Wealthsimple Tax, SimpleTax) or the official T2125 PDF from canada.ca</p>
    <p><strong>Transfer these values to the official form using the line numbers provided.</strong></p>
  </div>

  <div class="section">
    <div class="section-title">PART 1 — IDENTIFICATION</div>
    <div class="field-grid">
      <div class="field-label">Your name:</div>
      <div class="field-value">${pdfData.part1_identification.your_name}</div>

      <div class="field-label">Social Insurance Number:</div>
      <div class="field-value">${pdfData.part1_identification.sin}</div>

      <div class="field-label">Business name:</div>
      <div class="field-value">${pdfData.part1_identification.business_name}</div>

      <div class="field-label">Business number (BN):</div>
      <div class="field-value">${pdfData.part1_identification.business_number}</div>

      <div class="field-label">Business address:</div>
      <div class="field-value">${pdfData.part1_identification.business_address}</div>

      <div class="field-label">City:</div>
      <div class="field-value">${pdfData.part1_identification.city}</div>

      <div class="field-label">Province:</div>
      <div class="field-value">${pdfData.part1_identification.province}</div>

      <div class="field-label">Postal code:</div>
      <div class="field-value">${pdfData.part1_identification.postal_code}</div>

      <div class="field-label">Fiscal period:</div>
      <div class="field-value">${pdfData.part1_identification.fiscal_period_from} to ${pdfData.part1_identification.fiscal_period_to}</div>

      <div class="field-label">Industry code (NAICS):</div>
      <div class="field-value">${pdfData.part1_identification.industry_code}</div>

      <div class="field-label">Accounting method:</div>
      <div class="field-value">${pdfData.part1_identification.accounting_method}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">PART 2 — INTERNET BUSINESS ACTIVITIES</div>
    <div class="field-grid">
      <div class="field-label">Number of websites:</div>
      <div class="field-value">${pdfData.part2_internet.num_websites}</div>

      <div class="field-label">Website #1:</div>
      <div class="field-value">${pdfData.part2_internet.website_1}</div>

      <div class="field-label">Income from internet (%):</div>
      <div class="field-value">${pdfData.part2_internet.income_from_web_percent}%</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">PART 3 — INCOME</div>
    <div class="line-item header">
      <div>Line</div>
      <div>Description</div>
      <div>Amount</div>
    </div>
    <div class="line-item">
      <div class="line-number">3A</div>
      <div>Gross sales (including GST/HST)</div>
      <div class="amount">$${formatCurrency(pdfData.part3_income.line3A_gross_sales_incl_gst)}</div>
    </div>
    <div class="line-item">
      <div class="line-number">3B</div>
      <div>GST/HST collected</div>
      <div class="amount">$${formatCurrency(pdfData.part3_income.line3B_gst_collected)}</div>
    </div>
    <div class="line-item">
      <div class="line-number">3C</div>
      <div>Subtotal (3A - 3B)</div>
      <div class="amount">$${formatCurrency(pdfData.part3_income.line3C_subtotal)}</div>
    </div>
    <div class="line-item">
      <div class="line-number">8000</div>
      <div>Adjusted gross sales</div>
      <div class="amount">$${formatCurrency(pdfData.part3_income.line8000_adjusted_gross_sales)}</div>
    </div>
    <div class="line-item">
      <div class="line-number">8230</div>
      <div>Other income (tips, bonuses, referrals)</div>
      <div class="amount">$${formatCurrency(pdfData.part3_income.line8230_other_income)}</div>
    </div>
    <div class="line-item total">
      <div class="line-number">8299</div>
      <div>TOTAL GROSS INCOME</div>
      <div class="amount">$${formatCurrency(pdfData.part3_income.line8299_total_gross_income)}</div>
    </div>
  </div>

  <div class="section" style="page-break-before: always;">
    <div class="section-title">PART 4 — EXPENSES</div>
    <div class="line-item header">
      <div>Line</div>
      <div>Description</div>
      <div>Amount</div>
    </div>
    ${pdfData.part4_expenses.line8521_advertising > 0 ? `
    <div class="line-item">
      <div class="line-number">8521</div>
      <div>Advertising</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line8521_advertising)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line8523_meals_entertainment > 0 ? `
    <div class="line-item">
      <div class="line-number">8523</div>
      <div>Meals and entertainment (50% limit applied)</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line8523_meals_entertainment)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line8690_insurance > 0 ? `
    <div class="line-item">
      <div class="line-number">8690</div>
      <div>Insurance</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line8690_insurance)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line8710_interest_bank_charges > 0 ? `
    <div class="line-item">
      <div class="line-number">8710</div>
      <div>Interest and bank charges</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line8710_interest_bank_charges)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line8760_business_taxes_licences > 0 ? `
    <div class="line-item">
      <div class="line-number">8760</div>
      <div>Business taxes, fees, licences, and memberships</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line8760_business_taxes_licences)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line8810_office_expenses > 0 ? `
    <div class="line-item">
      <div class="line-number">8810</div>
      <div>Office expenses</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line8810_office_expenses)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line8811_office_supplies > 0 ? `
    <div class="line-item">
      <div class="line-number">8811</div>
      <div>Supplies</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line8811_office_supplies)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line8860_professional_fees > 0 ? `
    <div class="line-item">
      <div class="line-number">8860</div>
      <div>Professional fees</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line8860_professional_fees)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line8871_management_fees > 0 ? `
    <div class="line-item">
      <div class="line-number">8871</div>
      <div>Management and administration fees</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line8871_management_fees)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line8910_rent > 0 ? `
    <div class="line-item">
      <div class="line-number">8910</div>
      <div>Rent</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line8910_rent)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line8960_repairs_maintenance > 0 ? `
    <div class="line-item">
      <div class="line-number">8960</div>
      <div>Repairs and maintenance</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line8960_repairs_maintenance)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line9200_travel > 0 ? `
    <div class="line-item">
      <div class="line-number">9200</div>
      <div>Travel</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line9200_travel)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line9225_telephone_utilities > 0 ? `
    <div class="line-item">
      <div class="line-number">9225</div>
      <div>Telephone and utilities</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line9225_telephone_utilities)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line9270_other_expenses > 0 ? `
    <div class="line-item">
      <div class="line-number">9270</div>
      <div>Other expenses</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line9270_other_expenses)}</div>
    </div>` : ''}
    <div class="line-item">
      <div class="line-number">9281</div>
      <div>Motor vehicle expenses (not including CCA)</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line9281_motor_vehicle)}</div>
    </div>
    ${pdfData.part4_expenses.line9936_cca > 0 ? `
    <div class="line-item">
      <div class="line-number">9936</div>
      <div>Capital cost allowance (CCA)</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line9936_cca)}</div>
    </div>` : ''}
    ${pdfData.part4_expenses.line9945_home_office > 0 ? `
    <div class="line-item">
      <div class="line-number">9945</div>
      <div>Business-use-of-home expenses</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line9945_home_office)}</div>
    </div>` : ''}
    <div class="line-item total">
      <div class="line-number">9368</div>
      <div>TOTAL EXPENSES</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line9368_total_expenses)}</div>
    </div>
    <div class="line-item total">
      <div class="line-number">9369</div>
      <div>NET INCOME (LOSS) BEFORE ADJUSTMENTS</div>
      <div class="amount">$${formatCurrency(pdfData.part4_expenses.line9369_net_income)}</div>
    </div>
  </div>

  <div class="section" style="page-break-before: always;">
    <div class="section-title">CHART A — MOTOR VEHICLE EXPENSES</div>
    <div class="field-grid" style="margin-bottom: 15px;">
      <div class="field-label">Business kilometres (Line 1):</div>
      <div class="field-value">${pdfData.chartA_vehicle.line1_business_km.toFixed(0)} km</div>

      <div class="field-label">Total kilometres (Line 2):</div>
      <div class="field-value">${pdfData.chartA_vehicle.line2_total_km.toFixed(0)} km</div>

      <div class="field-label">Business use % (Line 13):</div>
      <div class="field-value">${pdfData.chartA_vehicle.line13_business_use_percent.toFixed(2)}%</div>
    </div>

    <div class="line-item header">
      <div>Line</div>
      <div>Description</div>
      <div>Amount</div>
    </div>
    <div class="line-item">
      <div class="line-number">3</div>
      <div>Fuel and oil</div>
      <div class="amount">$${formatCurrency(pdfData.chartA_vehicle.line3_fuel_oil)}</div>
    </div>
    ${pdfData.chartA_vehicle.line4_interest > 0 ? `
    <div class="line-item">
      <div class="line-number">4</div>
      <div>Interest</div>
      <div class="amount">$${formatCurrency(pdfData.chartA_vehicle.line4_interest)}</div>
    </div>` : ''}
    <div class="line-item">
      <div class="line-number">5</div>
      <div>Insurance</div>
      <div class="amount">$${formatCurrency(pdfData.chartA_vehicle.line5_insurance)}</div>
    </div>
    ${pdfData.chartA_vehicle.line6_licence_registration > 0 ? `
    <div class="line-item">
      <div class="line-number">6</div>
      <div>Licence and registration</div>
      <div class="amount">$${formatCurrency(pdfData.chartA_vehicle.line6_licence_registration)}</div>
    </div>` : ''}
    <div class="line-item">
      <div class="line-number">7</div>
      <div>Maintenance and repairs</div>
      <div class="amount">$${formatCurrency(pdfData.chartA_vehicle.line7_maintenance_repairs)}</div>
    </div>
    ${pdfData.chartA_vehicle.line8_leasing > 0 ? `
    <div class="line-item">
      <div class="line-number">8</div>
      <div>Leasing costs</div>
      <div class="amount">$${formatCurrency(pdfData.chartA_vehicle.line8_leasing)}</div>
    </div>` : ''}
    ${pdfData.chartA_vehicle.line9_electricity > 0 ? `
    <div class="line-item">
      <div class="line-number">9</div>
      <div>Electricity for electric vehicle</div>
      <div class="amount">$${formatCurrency(pdfData.chartA_vehicle.line9_electricity)}</div>
    </div>` : ''}
    <div class="line-item total">
      <div class="line-number">12</div>
      <div>Total motor vehicle expenses</div>
      <div class="amount">$${formatCurrency(pdfData.chartA_vehicle.line12_total_expenses)}</div>
    </div>
    <div class="line-item total">
      <div class="line-number">16</div>
      <div>Allowable motor vehicle expenses (business portion)</div>
      <div class="amount">$${formatCurrency(pdfData.chartA_vehicle.line16_allowable_expenses)}</div>
    </div>
  </div>

  <div class="summary-box">
    <h3 style="margin-top: 0;">INCOME & EXPENSE SUMMARY</h3>
    <div class="summary-line">
      <span>Total Gross Income (Line 8299):</span>
      <span class="amount">$${formatCurrency(pdfData.summary.gross_income)}</span>
    </div>
    <div class="summary-line">
      <span>Total Expenses (Line 9368):</span>
      <span class="amount">$${formatCurrency(pdfData.summary.total_expenses)}</span>
    </div>
    <div class="summary-line total">
      <span>Net Income / Loss (Line 9369):</span>
      <span class="amount">$${formatCurrency(pdfData.summary.net_income)}</span>
    </div>
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #0369a1;">
      <div class="summary-line">
        <span>Vehicle Business Use:</span>
        <span>${pdfData.summary.vehicle_business_use_percent.toFixed(2)}%</span>
      </div>
    </div>
  </div>

  <div class="notice" style="margin-top: 30px;">
    <div class="notice-title">📋 NEXT STEPS TO FILE WITH CRA</div>
    <p><strong>1.</strong> Use NETFILE-certified tax software (TurboTax, Wealthsimple Tax, etc.) OR download the official T2125 PDF from canada.ca</p>
    <p><strong>2.</strong> Transfer these values to the corresponding line numbers</p>
    <p><strong>3.</strong> Attach this report to your T1 General Income Tax Return</p>
    <p><strong>4.</strong> Keep all receipts and this report for 6 years</p>
    <p><strong>5.</strong> Report line 9946 (your net income) on line 13500 or 14300 of your T1</p>
  </div>

  <p style="text-align: center; margin-top: 40px; font-size: 9pt; color: #666;">
    Generated by Deductly on ${new Date().toLocaleString()}<br>
    This document contains ${data.expenseDetails.length} expense transactions
  </p>
</body>
</html>
  `;
}

export async function exportT2125AsPDF(htmlContent: string, filename: string = 't2125_report.pdf') {
  if (Platform.OS === 'web') {
    // Download as HTML file - user can then print or view in browser
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename.replace('.pdf', '.html'));
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } else {
    const fileUri = FileSystem.documentDirectory + filename.replace('.pdf', '.html');
    await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/html',
        dialogTitle: 'Export T2125 Report',
        UTI: 'public.html',
      });
    }
  }
}
