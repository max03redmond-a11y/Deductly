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
      line3A_gross_sales_incl_gst: data.part3a_businessIncome.line3A_grossSales,
      line3B_gst_collected: data.part3a_businessIncome.line3B_gstHstCollected,
      line3C_subtotal: data.part3a_businessIncome.line3C_subtotal,
      line8000_adjusted_gross_sales: data.part3c_income.line8000_adjustedGrossSales,
      line8230_other_income: data.part3c_income.line8230_otherIncome,
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
    <div class="section-title">Part 4 – Net income (loss) before adjustments</div>

    <div style="margin: 20px 0;">
      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 2px solid #000; background: #f0f9ff; font-weight: bold;">
        <div></div>
        <div style="font-weight: bold;">4A</div>
        <div></div>
      </div>
      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div></div>
        <div>Gross business or professional income (line 8299 of Part 3C) or Gross profit (line 8519 of Part 3D). . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace; font-weight: bold;">$${formatCurrency(pdfData.part3_income.line8299_total_gross_income)}</div>
      </div>

      <div style="margin: 15px 0; padding: 10px; background: #f5f5f5; font-weight: bold;">
        Expenses (enter only the business part)
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8521</div>
        <div style="font-weight: bold;">4B</div>
        <div>Advertising . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8521_advertising)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8523</div>
        <div style="font-weight: bold;">4C</div>
        <div>Meals and entertainment. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8523_meals_entertainment)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8590</div>
        <div style="font-weight: bold;">4D</div>
        <div>Bad debts . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8590_bad_debts)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8690</div>
        <div style="font-weight: bold;">4E</div>
        <div>Insurance . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8690_insurance)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8710</div>
        <div style="font-weight: bold;">4F</div>
        <div>Interest and bank charges. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8710_interest_bank_charges)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8760</div>
        <div style="font-weight: bold;">4G</div>
        <div>Business taxes, licences and memberships . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8760_business_taxes_licences)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8810</div>
        <div style="font-weight: bold;">4H</div>
        <div>Office expenses . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8810_office_expenses)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8811</div>
        <div style="font-weight: bold;">4I</div>
        <div>Office stationery and supplies . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8811_office_supplies)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8860</div>
        <div style="font-weight: bold;">4J</div>
        <div>Professional fees (includes legal and accounting fees). . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8860_professional_fees)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8871</div>
        <div style="font-weight: bold;">4K</div>
        <div>Management and administration fees . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8871_management_fees)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8910</div>
        <div style="font-weight: bold;">4L</div>
        <div>Rent . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8910_rent)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8960</div>
        <div style="font-weight: bold;">4M</div>
        <div>Repairs and maintenance . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line8960_repairs_maintenance)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9060</div>
        <div style="font-weight: bold;">4N</div>
        <div>Salaries, wages and benefits (including employer's contributions) . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9060_salaries_wages)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9180</div>
        <div style="font-weight: bold;">4O</div>
        <div>Property taxes. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9180_property_taxes)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9200</div>
        <div style="font-weight: bold;">4P</div>
        <div>Travel expenses . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9200_travel)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9220</div>
        <div style="font-weight: bold;">4Q</div>
        <div>Utilities . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9220_utilities)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9224</div>
        <div style="font-weight: bold;">4R</div>
        <div>Fuel costs (except for motor vehicles). . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9224_fuel_costs)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9275</div>
        <div style="font-weight: bold;">4S</div>
        <div>Delivery, freight and express. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9275_delivery_freight)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9281</div>
        <div style="font-weight: bold;">4T</div>
        <div>Motor vehicle expenses (not including CCA) (amount 16 of Chart A) . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9281_motor_vehicle)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9936</div>
        <div style="font-weight: bold;">4U</div>
        <div>Capital cost allowance (CCA). Enter amount ii of Area A minus any personal part and any<br>CCA for business-use-of-home expenses . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9936_cca)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9270</div>
        <div style="font-weight: bold;">4V</div>
        <div>Other expenses (specify):</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9270_other_expenses)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 2px solid #000; background: #f5f5f5; font-weight: bold;">
        <div>9368</div>
        <div></div>
        <div>Total expenses: Total of amounts 4B to 4V ►</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9368_total_expenses)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 30px 1fr 150px; gap: 10px; padding: 12px 5px; border-bottom: 2px solid #000; background: #e8f4f8; font-weight: bold;">
        <div>9369</div>
        <div></div>
        <div>Net income (loss) before adjustments: Amount 4A minus line 9368 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9369_net_income)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Part 5 – Your net income (loss)</div>

    <div style="margin: 20px 0;">
      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div></div>
        <div style="font-weight: bold;">5A</div>
        <div></div>
      </div>
      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div></div>
        <div>Your share of line 9369 or the amount from your T5013 slip, Statement of Partnership Income. . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace; font-weight: bold;">$${formatCurrency(pdfData.part4_expenses.line9369_net_income)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div></div>
        <div style="font-weight: bold;">5B</div>
        <div></div>
      </div>
      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div></div>
        <div>Canadian journalism labour tax credit allocated to you in the year (box 236 of your T5013 slip) . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$0.00</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9974</div>
        <div>GST/HST rebate for partners received in the year . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$0.00</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd; background: #f5f5f5;">
        <div></div>
        <div style="font-weight: bold;">5C</div>
        <div></div>
      </div>
      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 2px solid #000; background: #f5f5f5; font-weight: bold;">
        <div></div>
        <div>Total: Amount 5A plus amount 5B plus line 9974 ►</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9369_net_income)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9943</div>
        <div>Other amounts deductible from your share of net partnership income (loss) (amount 6F). . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$0.00</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div></div>
        <div style="font-weight: bold;">5D</div>
        <div></div>
      </div>
      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 2px solid #000; background: #f0f9ff; font-weight: bold;">
        <div></div>
        <div>Net income (loss) after adjustments: Amount 5C minus line 9943 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9369_net_income)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9945</div>
        <div>Business-use-of-home expenses (amount 7P) . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.part4_expenses.line9945_home_office)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 60px 1fr 150px; gap: 10px; padding: 12px 5px; border-bottom: 3px solid #000; background: #e8f4f8; font-weight: bold; font-size: 11pt;">
        <div>9946</div>
        <div>Your net income (loss): Amount 5D minus line 9945 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.summary.net_income)}</div>
      </div>

      <div style="margin-top: 20px; padding: 15px; background: #fffbea; border-left: 4px solid #f59e0b;">
        <p style="margin: 0 0 10px 0; font-weight: bold;">Report the net income amount from line 9946 on the applicable line of your income tax and benefit return as indicated below:</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li style="margin: 5px 0;">business income on line 13500</li>
          <li style="margin: 5px 0;">professional income on line 13700</li>
          <li style="margin: 5px 0;">commission income on line 13900</li>
        </ul>
        <p style="margin: 10px 0 0 0; font-size: 9pt;"><strong>Note:</strong> Do not report a loss resulting from the disposition of a flipped property on your income tax and benefit return, but include the details on this form.</p>
        <p style="margin: 5px 0 0 0; font-size: 9pt;">Any loss resulting from the disposition of a flipped property is deemed to be nil. For more information, read Chapter 1 of Guide T4002</p>
      </div>
    </div>
  </div>

  <div class="section" style="page-break-before: always;">
    <div class="section-title">Chart A – Motor vehicle expenses</div>

    <div style="margin: 20px 0;">
      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">1</div>
        <div>Kilometres you drove in the fiscal period that was part of earning business income . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">${pdfData.chartA_vehicle.line1_business_km.toFixed(0)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">2</div>
        <div>Total kilometres you drove in the fiscal period . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">${pdfData.chartA_vehicle.line2_total_km.toFixed(0)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">3</div>
        <div>Fuel and oil . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line3_fuel_oil)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">4</div>
        <div>Interest (use Chart B below) . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line4_interest)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">5</div>
        <div>Insurance . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line5_insurance)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">6</div>
        <div>Licence and registration . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line6_licence_registration)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">7</div>
        <div>Maintenance and repairs . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line7_maintenance_repairs)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">8</div>
        <div>Leasing (use Chart C below) . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line8_leasing)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">9</div>
        <div>Electricity for zero-emission vehicles . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line9_electricity)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">10</div>
        <div>Other expenses (specify):</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line10_other)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">11</div>
        <div></div>
        <div style="text-align: right; font-family: 'Courier New', monospace;"></div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 2px solid #000; background: #f5f5f5; font-weight: bold;">
        <div>12</div>
        <div>Total motor vehicle expenses: Add amounts 3 to 11.</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line12_total_expenses)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd; background: #fffbea;">
        <div style="font-weight: bold;">13</div>
        <div>Business use part: amount 1: <strong>${pdfData.chartA_vehicle.line1_business_km.toFixed(0)}</strong> ÷ amount 2: <strong>${pdfData.chartA_vehicle.line2_total_km.toFixed(0)}</strong> × amount 12: <strong>$${formatCurrency(pdfData.chartA_vehicle.line12_total_expenses)}</strong> = </div>
        <div style="text-align: right; font-family: 'Courier New', monospace; font-weight: bold;">$${formatCurrency(pdfData.chartA_vehicle.line13_business_use_percent * pdfData.chartA_vehicle.line12_total_expenses / 100)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">14</div>
        <div>Business parking fees . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line14_parking)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 8px 5px; border-bottom: 1px solid #ddd;">
        <div style="font-weight: bold;">15</div>
        <div>Supplementary business insurance . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line15_supplementary_insurance)}</div>
      </div>

      <div style="display: grid; grid-template-columns: 30px 1fr 150px; gap: 10px; padding: 12px 5px; border-bottom: 2px solid #000; background: #e8f4f8; font-weight: bold;">
        <div>16</div>
        <div>Allowable motor vehicle expenses: Add amounts 13 to 15 (enter this total on line 9281 of Part 4) . . . . . . . . . . . . . . . . . . . . . . . . . . . .</div>
        <div style="text-align: right; font-family: 'Courier New', monospace;">$${formatCurrency(pdfData.chartA_vehicle.line16_allowable_expenses)}</div>
      </div>

      <div style="margin-top: 10px; padding: 10px; background: #f9fafb; border-left: 3px solid #3b82f6;">
        <strong>Note:</strong> You can claim capital cost allowance on motor vehicles in Area A.
      </div>
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
