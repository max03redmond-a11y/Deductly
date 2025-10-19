import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { T2125Data, formatCurrency, formatPercent } from './mapper';

export function generateT2125HTML(data: T2125Data): string {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>T2125 Statement of Business Activities - ${currentYear}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-size: 12px;
      line-height: 1.4;
    }
    h1 {
      text-align: center;
      font-size: 18px;
      margin-bottom: 5px;
    }
    h2 {
      font-size: 14px;
      margin-top: 20px;
      margin-bottom: 10px;
      border-bottom: 2px solid #000;
      padding-bottom: 5px;
    }
    .section {
      margin-bottom: 20px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid #eee;
    }
    .row.header {
      font-weight: bold;
      border-bottom: 2px solid #000;
      background: #f5f5f5;
      padding: 8px 0;
    }
    .row.total {
      font-weight: bold;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      margin-top: 5px;
      padding: 8px 0;
      background: #f0f0f0;
    }
    .line-number {
      font-weight: bold;
      min-width: 50px;
    }
    .description {
      flex: 1;
      padding: 0 10px;
    }
    .amount {
      text-align: right;
      min-width: 100px;
      font-family: monospace;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 8px;
      margin-bottom: 15px;
    }
    .info-label {
      font-weight: bold;
    }
    .notice {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .notice-title {
      font-weight: bold;
      margin-bottom: 8px;
    }
    @media print {
      body {
        padding: 10px;
      }
      .notice {
        page-break-before: avoid;
      }
    }
  </style>
</head>
<body>
  <h1>CRA Form T2125 - Statement of Business or Professional Activities</h1>
  <p style="text-align: center; font-size: 11px; color: #666;">Tax Year ${currentYear} - Export from Deductly</p>

  <div class="notice">
    <div class="notice-title">⚠️ IMPORTANT NOTICE</div>
    <p>This is a <strong>reference document only</strong> and is NOT an official CRA form. Use this information to fill out the official T2125 form available at canada.ca or through tax software.</p>
    <p>All calculations have been done automatically based on your Deductly data. Please review all values for accuracy before submitting to CRA.</p>
  </div>

  <div class="section">
    <h2>Part 1 - Identification</h2>
    <div class="info-grid">
      <div class="info-label">Your name:</div>
      <div>${data.identification.yourName || 'Not provided'}</div>

      <div class="info-label">Social Insurance Number:</div>
      <div>${data.identification.sin || 'Not provided'}</div>

      <div class="info-label">Business name:</div>
      <div>${data.identification.businessName || 'Not provided'}</div>

      <div class="info-label">Business number:</div>
      <div>${data.identification.businessNumber || 'Not provided'}</div>

      <div class="info-label">Business address:</div>
      <div>${data.identification.businessAddress || 'Not provided'}</div>

      <div class="info-label">City:</div>
      <div>${data.identification.city || 'Not provided'}</div>

      <div class="info-label">Province:</div>
      <div>${data.identification.province}</div>

      <div class="info-label">Postal code:</div>
      <div>${data.identification.postalCode || 'Not provided'}</div>

      <div class="info-label">Fiscal period:</div>
      <div>${data.identification.fiscalPeriodStart} to ${data.identification.fiscalPeriodEnd}</div>

      <div class="info-label">Main product/service:</div>
      <div>${data.identification.mainProductService}</div>

      <div class="info-label">Industry code:</div>
      <div>${data.identification.industryCode || 'Not provided'}</div>
    </div>
  </div>

  <div class="section">
    <h2>Part 3C - Gross Business Income</h2>
    <div class="row">
      <div class="line-number">8000</div>
      <div class="description">Adjusted gross sales</div>
      <div class="amount">$${formatCurrency(data.part3c_income.line8000_adjustedGrossSales)}</div>
    </div>
    <div class="row total">
      <div class="line-number">8299</div>
      <div class="description">Gross business or professional income</div>
      <div class="amount">$${formatCurrency(data.part3c_income.line8299_grossBusinessIncome)}</div>
    </div>
  </div>

  <div class="section">
    <h2>Part 4 - Expenses</h2>
    <div class="row header">
      <div class="line-number">Line</div>
      <div class="description">Description</div>
      <div class="amount">Amount</div>
    </div>

    ${data.part4_expenses.line8521_advertising > 0 ? `
    <div class="row">
      <div class="line-number">8521</div>
      <div class="description">Advertising</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8521_advertising)}</div>
    </div>` : ''}

    ${data.part4_expenses.line8523_mealsEntertainment > 0 ? `
    <div class="row">
      <div class="line-number">8523</div>
      <div class="description">Meals and entertainment (50% deductible)</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8523_mealsEntertainment)}</div>
    </div>` : ''}

    ${data.part4_expenses.line8590_badDebts > 0 ? `
    <div class="row">
      <div class="line-number">8590</div>
      <div class="description">Bad debts</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8590_badDebts)}</div>
    </div>` : ''}

    ${data.part4_expenses.line8690_insurance > 0 ? `
    <div class="row">
      <div class="line-number">8690</div>
      <div class="description">Insurance</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8690_insurance)}</div>
    </div>` : ''}

    ${data.part4_expenses.line8710_interestBankCharges > 0 ? `
    <div class="row">
      <div class="line-number">8710</div>
      <div class="description">Interest and bank charges</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8710_interestBankCharges)}</div>
    </div>` : ''}

    ${data.part4_expenses.line8760_businessTaxesLicences > 0 ? `
    <div class="row">
      <div class="line-number">8760</div>
      <div class="description">Business taxes, licences and memberships</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8760_businessTaxesLicences)}</div>
    </div>` : ''}

    ${data.part4_expenses.line8810_officeExpenses > 0 ? `
    <div class="row">
      <div class="line-number">8810</div>
      <div class="description">Office expenses</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8810_officeExpenses)}</div>
    </div>` : ''}

    ${data.part4_expenses.line8811_officeStationery > 0 ? `
    <div class="row">
      <div class="line-number">8811</div>
      <div class="description">Office stationery and supplies</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8811_officeStationery)}</div>
    </div>` : ''}

    ${data.part4_expenses.line8860_professionalFees > 0 ? `
    <div class="row">
      <div class="line-number">8860</div>
      <div class="description">Professional fees</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8860_professionalFees)}</div>
    </div>` : ''}

    ${data.part4_expenses.line8871_managementFees > 0 ? `
    <div class="row">
      <div class="line-number">8871</div>
      <div class="description">Management and administration fees</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8871_managementFees)}</div>
    </div>` : ''}

    ${data.part4_expenses.line8910_rent > 0 ? `
    <div class="row">
      <div class="line-number">8910</div>
      <div class="description">Rent</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8910_rent)}</div>
    </div>` : ''}

    ${data.part4_expenses.line8960_repairsMaintenance > 0 ? `
    <div class="row">
      <div class="line-number">8960</div>
      <div class="description">Repairs and maintenance</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line8960_repairsMaintenance)}</div>
    </div>` : ''}

    ${data.part4_expenses.line9060_salariesWages > 0 ? `
    <div class="row">
      <div class="line-number">9060</div>
      <div class="description">Salaries, wages and benefits</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line9060_salariesWages)}</div>
    </div>` : ''}

    ${data.part4_expenses.line9180_propertyTaxes > 0 ? `
    <div class="row">
      <div class="line-number">9180</div>
      <div class="description">Property taxes</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line9180_propertyTaxes)}</div>
    </div>` : ''}

    ${data.part4_expenses.line9200_travelExpenses > 0 ? `
    <div class="row">
      <div class="line-number">9200</div>
      <div class="description">Travel expenses</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line9200_travelExpenses)}</div>
    </div>` : ''}

    ${data.part4_expenses.line9220_utilities > 0 ? `
    <div class="row">
      <div class="line-number">9220</div>
      <div class="description">Utilities</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line9220_utilities)}</div>
    </div>` : ''}

    ${data.part4_expenses.line9224_fuelCosts > 0 ? `
    <div class="row">
      <div class="line-number">9224</div>
      <div class="description">Fuel costs (except for motor vehicles)</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line9224_fuelCosts)}</div>
    </div>` : ''}

    ${data.part4_expenses.line9275_deliveryFreight > 0 ? `
    <div class="row">
      <div class="line-number">9275</div>
      <div class="description">Delivery, freight and express</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line9275_deliveryFreight)}</div>
    </div>` : ''}

    <div class="row">
      <div class="line-number">9281</div>
      <div class="description">Motor vehicle expenses (not including CCA)</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line9281_motorVehicleExpenses)}</div>
    </div>

    ${data.part4_expenses.line9936_cca > 0 ? `
    <div class="row">
      <div class="line-number">9936</div>
      <div class="description">Capital cost allowance (CCA)</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line9936_cca)}</div>
    </div>` : ''}

    <div class="row total">
      <div class="line-number">9368</div>
      <div class="description">Total expenses</div>
      <div class="amount">$${formatCurrency(data.part4_expenses.line9368_totalExpenses)}</div>
    </div>

    <div class="row total">
      <div class="line-number">9369</div>
      <div class="description">Net income (loss) before adjustments</div>
      <div class="amount">$${formatCurrency(data.part5_netIncome.line9369_netIncomeBeforeAdjustments)}</div>
    </div>
  </div>

  <div class="section">
    <h2>Chart A - Motor Vehicle Expenses</h2>
    <div class="info-grid">
      <div class="info-label">Business kilometres:</div>
      <div>${data.chartA_motorVehicle.line1_businessKm.toFixed(0)} km</div>

      <div class="info-label">Total kilometres:</div>
      <div>${data.chartA_motorVehicle.line2_totalKm.toFixed(0)} km</div>

      <div class="info-label">Business use percentage:</div>
      <div>${formatPercent(data.chartA_motorVehicle.businessUsePercent)}%</div>
    </div>

    <div class="row header">
      <div class="line-number">Line</div>
      <div class="description">Description</div>
      <div class="amount">Amount</div>
    </div>

    <div class="row">
      <div class="line-number">3</div>
      <div class="description">Fuel and oil</div>
      <div class="amount">$${formatCurrency(data.chartA_motorVehicle.line3_fuelOil)}</div>
    </div>

    <div class="row">
      <div class="line-number">5</div>
      <div class="description">Insurance</div>
      <div class="amount">$${formatCurrency(data.chartA_motorVehicle.line5_insurance)}</div>
    </div>

    <div class="row">
      <div class="line-number">7</div>
      <div class="description">Maintenance and repairs</div>
      <div class="amount">$${formatCurrency(data.chartA_motorVehicle.line7_maintenance)}</div>
    </div>

    <div class="row total">
      <div class="line-number">12</div>
      <div class="description">Total motor vehicle expenses</div>
      <div class="amount">$${formatCurrency(data.chartA_motorVehicle.line12_totalExpenses)}</div>
    </div>

    <div class="row total">
      <div class="line-number">13</div>
      <div class="description">Business use part</div>
      <div class="amount">$${formatCurrency(data.chartA_motorVehicle.line13_businessPortion)}</div>
    </div>
  </div>

  <div class="section">
    <h2>Part 5 - Your Net Income</h2>
    <div class="row total">
      <div class="line-number">9946</div>
      <div class="description">Your net income (loss)</div>
      <div class="amount">$${formatCurrency(data.part5_netIncome.line9946_yourNetIncome)}</div>
    </div>
  </div>

  <div class="section" style="page-break-before: always;">
    <h2>Detailed Expense Breakdown</h2>
    <p style="margin-bottom: 20px; color: #6B7280; font-size: 13px;">
      Complete list of all ${data.expenseDetails.length} business expenses for the tax year
    </p>

    <div class="row header">
      <div style="min-width: 90px; font-weight: bold;">Date</div>
      <div style="min-width: 60px; font-weight: bold;">Line</div>
      <div style="flex: 1; font-weight: bold; padding: 0 10px;">Merchant / Description</div>
      <div style="min-width: 100px; font-weight: bold; text-align: right;">Deductible</div>
    </div>

    ${data.expenseDetails.map(expense => `
      <div class="row">
        <div style="min-width: 90px; font-size: 13px;">${expense.date}</div>
        <div style="min-width: 60px; font-size: 13px; font-weight: bold;">${expense.lineNumber}</div>
        <div style="flex: 1; padding: 0 10px;">
          <div style="font-weight: 500; font-size: 14px;">${expense.merchant}</div>
          ${expense.description ? `<div style="font-size: 12px; color: #6B7280;">${expense.description}</div>` : ''}
          <div style="font-size: 11px; color: #9CA3AF; margin-top: 2px;">${expense.categoryLabel}${expense.businessPercentage < 100 ? ` • ${expense.businessPercentage}% business use` : ''}</div>
        </div>
        <div style="min-width: 100px; text-align: right; font-family: monospace; font-size: 14px;">$${formatCurrency(expense.deductibleAmount)}</div>
      </div>
    `).join('')}

    <div class="row total" style="margin-top: 20px;">
      <div style="min-width: 90px;"></div>
      <div style="min-width: 60px;"></div>
      <div style="flex: 1; padding: 0 10px; font-weight: bold;">Total Deductible Expenses</div>
      <div style="min-width: 100px; text-align: right; font-family: monospace; font-size: 16px;">$${formatCurrency(data.expenseDetails.reduce((sum, e) => sum + e.deductibleAmount, 0))}</div>
    </div>
  </div>

  <div class="notice" style="margin-top: 40px;">
    <div class="notice-title">📋 Next Steps</div>
    <p><strong>1.</strong> Download the official CRA T2125 form from canada.ca</p>
    <p><strong>2.</strong> Transfer these values to the corresponding line numbers on the official form</p>
    <p><strong>3.</strong> Review all amounts for accuracy</p>
    <p><strong>4.</strong> Include this form with your T1 General income tax return</p>
    <p><strong>5.</strong> Keep this export and all receipts for at least 6 years</p>
  </div>

  <p style="text-align: center; margin-top: 40px; font-size: 10px; color: #666;">
    Generated by Deductly on ${new Date().toLocaleDateString()}<br>
    Total of ${data.expenseDetails.length} expense transactions included
  </p>
</body>
</html>
  `;
}

export async function downloadHTML(htmlContent: string, filename: string = 't2125_report.html') {
  if (Platform.OS === 'web') {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const fileUri = FileSystem.documentDirectory + filename;
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
